/* EduSphere LMS — Messages API Routes */
const express = require('express');
const { query, queryOne, queryAll } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

/**
 * Room ID convention: "teacher-TCH001-student-STU001"
 * or "teacher-TCH001-parent-PAR001"
 * Sorted so both parties resolve to the same room.
 */
function buildRoomId(idA, roleA, idB, roleB) {
  // Always put teacher first, then the other party
  if (roleA === 'teacher') return `teacher-${idA}-${roleB}-${idB}`;
  if (roleB === 'teacher') return `teacher-${idB}-${roleA}-${idA}`;
  // Admin can talk to anyone
  const pair = [idA, idB].sort();
  return `chat-${pair[0]}-${pair[1]}`;
}

// GET /api/messages/rooms — list all rooms (inbox) for current user
router.get('/rooms', async (req, res) => {
  try {
    const uid = req.user.userId;

    // Get all rooms this user participates in, with last message + unread count
    const sql = `
      SELECT
        m.room_id,
        MAX(m.sent_at) AS last_message_at,
        COUNT(*) FILTER (WHERE m.is_read = FALSE AND m.receiver_id = $1) AS unread_count,
        (SELECT content FROM messages WHERE room_id = m.room_id ORDER BY sent_at DESC LIMIT 1) AS last_message,
        (SELECT sender_id FROM messages WHERE room_id = m.room_id ORDER BY sent_at DESC LIMIT 1) AS last_sender,
        CASE
          WHEN m.sender_id = $1 THEN m.receiver_id
          ELSE m.sender_id
        END AS other_user_id
      FROM messages m
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      GROUP BY m.room_id, other_user_id
      ORDER BY last_message_at DESC
    `;
    const rows = await queryAll(sql, [uid]);

    // Enrich with user names
    const enriched = await Promise.all(rows.map(async (row) => {
      const otherUser = await queryOne(
        `SELECT name, role FROM users WHERE user_id = $1`,
        [row.other_user_id]
      );
      return {
        ...row,
        other_name: otherUser?.name || row.other_user_id,
        other_role: otherUser?.role || 'unknown',
      };
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    console.error('GET /api/messages/rooms:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch rooms.' });
  }
});

// GET /api/messages?room_id=... — fetch message history for a room
router.get('/', async (req, res) => {
  try {
    const { room_id, with: withUserId } = req.query;

    let targetRoomId = room_id;

    // If no room_id given but 'with' param is provided, build room_id dynamically
    if (!targetRoomId && withUserId) {
      const otherUser = await queryOne(`SELECT role FROM users WHERE user_id = $1`, [withUserId]);
      if (!otherUser) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      targetRoomId = buildRoomId(req.user.userId, req.user.role, withUserId, otherUser.role);
    }

    if (!targetRoomId) {
      return res.status(400).json({ success: false, message: 'room_id or with= param required.' });
    }

    // Verify this user is allowed to read this room
    const uid = req.user.userId;
    if (req.user.role !== 'admin' && !targetRoomId.includes(uid)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const rows = await queryAll(
      `SELECT m.*, u.name as sender_name, u.role as sender_role
       FROM messages m
       JOIN users u ON m.sender_id = u.user_id
       WHERE m.room_id = $1
       ORDER BY m.sent_at ASC`,
      [targetRoomId]
    );

    // Mark messages as read (where this user is receiver)
    await query(
      `UPDATE messages SET is_read = TRUE
       WHERE room_id = $1 AND receiver_id = $2 AND is_read = FALSE`,
      [targetRoomId, uid]
    );

    res.json({ success: true, data: rows, room_id: targetRoomId });
  } catch (err) {
    console.error('GET /api/messages:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
});

// POST /api/messages — send a message (REST fallback, Socket.IO is primary)
router.post('/', async (req, res) => {
  try {
    const { receiver_id, content, room_id } = req.body;
    if (!receiver_id || !content) {
      return res.status(400).json({ success: false, message: 'receiver_id and content are required.' });
    }

    const sender_id = req.user.userId;

    // Verify receiver exists
    const receiver = await queryOne(`SELECT role FROM users WHERE user_id = $1`, [receiver_id]);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Recipient not found.' });
    }

    // Build room_id if not provided
    let targetRoomId = room_id;
    if (!targetRoomId) {
      targetRoomId = buildRoomId(sender_id, req.user.role, receiver_id, receiver.role);
    }

    const row = await query(
      `INSERT INTO messages (sender_id, receiver_id, room_id, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [sender_id, receiver_id, targetRoomId, content.trim()]
    );

    const msg = row.rows[0];

    // Enrich with sender name
    const senderUser = await queryOne(`SELECT name FROM users WHERE user_id = $1`, [sender_id]);

    res.json({
      success: true,
      data: {
        ...msg,
        sender_name: senderUser?.name || sender_id,
        sender_role: req.user.role,
      }
    });
  } catch (err) {
    console.error('POST /api/messages:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send message: ' + err.message });
  }
});

// GET /api/messages/users — list all teachers/parents/students the current user can message
router.get('/users', async (req, res) => {
  try {
    const role = req.user.role;
    let rows = [];

    if (role === 'student') {
      // Students can message teachers
      rows = await queryAll(`SELECT u.user_id, u.name, u.role, t.department, t.subjects
        FROM teachers t JOIN users u ON t.user_id = u.id ORDER BY u.name`);
    } else if (role === 'parent') {
      // Parents can message teachers
      rows = await queryAll(`SELECT u.user_id, u.name, u.role, t.department, t.subjects
        FROM teachers t JOIN users u ON t.user_id = u.id ORDER BY u.name`);
    } else if (role === 'teacher') {
      // Teachers can message students and parents
      rows = await queryAll(`
        SELECT u.user_id, u.name, u.role, s.class_name, s.section, s.student_id
        FROM students s JOIN users u ON s.user_id = u.id
        ORDER BY s.class_name, s.section, u.name
      `);
    } else if (role === 'admin') {
      // Admin can message everyone
      rows = await queryAll(`SELECT user_id, name, role FROM users WHERE role != 'admin' ORDER BY role, name`);
    }

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('GET /api/messages/users:', err.message);
    res.status(500).json({ success: false, message: 'Failed to list users.' });
  }
});

module.exports = router;
