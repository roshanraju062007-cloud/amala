/* EduSphere LMS — Auth Routes (Real PostgreSQL + bcrypt + JWT) */
const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { queryOne, authStorage } = require('../db');

const router = express.Router();
const JWT_SECRET  = process.env.JWT_SECRET  || 'edusphere_secret_key';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { user_id, password, role, rememberMe } = req.body;

    if (!user_id || !password || !role) {
      return res.status(400).json({ success: false, message: 'User ID, password, and role are required.' });
    }

    // Find user in database
    const user = await queryOne(
      `SELECT id, user_id, password, role, name, email, avatar FROM users WHERE user_id = $1 AND is_active = TRUE`,
      [user_id.trim()]
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid User ID or Password.' });
    }

    // Check role matches
    if (user.role !== role) {
      return res.status(401).json({ success: false, message: `This User ID is registered as "${user.role}", not "${role}". Please select the correct role tab.` });
    }

    // Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid User ID or Password.' });
    }

    // For parent role: get child student ID
    let childId = null;
    if (role === 'parent') {
      const parent = await authStorage.run({ userId: user.user_id, role: user.role, dbId: user.id }, () =>
        queryOne(
          `SELECT p.student_id, s.student_id AS student_code
           FROM parents p
           JOIN students s ON p.student_id = s.id
           WHERE p.user_id = $1`,
          [user.id]
        )
      );
      if (parent) childId = parent.student_code;
    }

    // Generate JWT token
    const payload = { userId: user.user_id, dbId: user.id, role: user.role, name: user.name };
    const token   = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

    // Set HTTP-only cookie
    res.cookie('edusphere_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   cookieMaxAge,
    });

    return res.json({
      success: true,
      user: {
        userId: user.user_id,
        name:   user.name,
        role:   user.role,
        email:  user.email,
        avatar: user.avatar || null,
        childId,
      },
      token, // also send in body for localStorage fallback
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('edusphere_token');
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// GET /api/auth/me — verify current session
router.get('/me', async (req, res) => {
  const token =
    req.cookies?.edusphere_token ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await queryOne(`SELECT user_id, name, role, email, avatar FROM users WHERE user_id = $1`, [decoded.userId]);
    if (!user) return res.status(401).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, user });
  } catch {
    return res.status(401).json({ success: false, message: 'Session expired.' });
  }
});

// POST /api/auth/change-password — secure password change for logged-in user
const { authMiddleware, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { query } = require('../db');

router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Old and new passwords are required.' });
    }

    // Retrieve user password hash
    const user = await queryOne(`SELECT password FROM users WHERE user_id = $1`, [req.user.userId]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Save new password
    await query(`UPDATE users SET password = $1 WHERE user_id = $2`, [hashedPassword, req.user.userId]);

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Password update failed:', err);
    res.status(500).json({ success: false, message: 'Failed to change password. Server error.' });
  }
});

// PUT /api/auth/admin/update-credentials — admin edits credentials for teachers, students, parents
router.put('/admin/update-credentials', authMiddleware, requireRole('admin'), async (req, res) => {
  const { role, old_id, new_username, new_password } = req.body;
  if (!role || !old_id || !new_username) {
    return res.status(400).json({ success: false, message: 'Role, current ID, and new username are required.' });
  }

  try {
    let targetUserId = null;
    let oldUsername = null;

    if (role === 'teacher') {
      const tch = await queryOne('SELECT user_id, teacher_id FROM teachers WHERE teacher_id = $1', [old_id]);
      if (tch) {
        targetUserId = tch.user_id;
        oldUsername = tch.teacher_id;
      }
    } else if (role === 'student') {
      const stu = await queryOne('SELECT user_id, student_id FROM students WHERE student_id = $1', [old_id]);
      if (stu) {
        targetUserId = stu.user_id;
        oldUsername = stu.student_id;
      }
    } else if (role === 'parent') {
      const par = await queryOne('SELECT user_id, parent_id FROM parents WHERE parent_id = $1', [old_id]);
      if (par) {
        targetUserId = par.user_id;
        oldUsername = par.parent_id;
      }
    }

    if (!targetUserId) {
      return res.status(404).json({ success: false, message: `${role} with ID ${old_id} not found.` });
    }

    // Check if new_username is taken by someone else
    const taken = await queryOne('SELECT id FROM users WHERE user_id = $1 AND id <> $2', [new_username.trim(), targetUserId]);
    if (taken) {
      return res.status(400).json({ success: false, message: `Username "${new_username}" is already taken.` });
    }

    await query('BEGIN');

    if (new_password) {
      const hash = await bcrypt.hash(new_password.trim(), 10);
      await query(
        'UPDATE users SET user_id = $1, password = $2, raw_password = $3, updated_at = NOW() WHERE id = $4',
        [new_username.trim(), hash, new_password.trim(), targetUserId]
      );
    } else {
      await query(
        'UPDATE users SET user_id = $1, updated_at = NOW() WHERE id = $2',
        [new_username.trim(), targetUserId]
      );
    }

    if (oldUsername !== new_username.trim()) {
      const newU = new_username.trim();
      if (role === 'teacher') {
        await query('UPDATE teachers SET teacher_id = $1 WHERE user_id = $2', [newU, targetUserId]);
        await query('UPDATE subjects SET teacher_id = $1 WHERE teacher_id = $2', [newU, oldUsername]);
        await query('UPDATE timetable SET teacher_id = $1 WHERE teacher_id = $2', [newU, oldUsername]);
        await query('UPDATE materials SET teacher_id = $1 WHERE teacher_id = $2', [newU, oldUsername]);
        await query('UPDATE assignments SET teacher_id = $1 WHERE teacher_id = $2', [newU, oldUsername]);
        await query('UPDATE exams SET teacher_id = $1 WHERE teacher_id = $2', [newU, oldUsername]);
      } else if (role === 'student') {
        await query('UPDATE students SET student_id = $1 WHERE user_id = $2', [newU, targetUserId]);
        await query('UPDATE library_issues SET student_id = $1 WHERE student_id = $2', [newU, oldUsername]);
        await query('UPDATE transport_assignments SET student_id = $1 WHERE student_id = $2', [newU, oldUsername]);
      } else if (role === 'parent') {
        await query('UPDATE parents SET parent_id = $1 WHERE user_id = $2', [newU, targetUserId]);
      }
    }

    await query('COMMIT');
    res.json({ success: true, message: 'Credentials updated successfully.' });
  } catch (err) {
    await query('ROLLBACK');
    console.error('Update credentials failed:', err);
    res.status(500).json({ success: false, message: 'Server error. Failed to update credentials.' });
  }
});

// POST /api/auth/upload-avatar — upload profile photo
router.post('/upload-avatar', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const avatarPath = '/uploads/' + req.file.filename;
    await query('UPDATE users SET avatar = $1 WHERE user_id = $2', [avatarPath, req.user.userId]);
    res.json({ success: true, avatarUrl: avatarPath, message: 'Profile picture updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to upload profile photo.' });
  }
});

module.exports = router;
