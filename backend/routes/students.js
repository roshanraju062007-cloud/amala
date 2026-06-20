/* EduSphere LMS — Students API Routes */
const express  = require('express');
const bcrypt   = require('bcryptjs');
const { query, queryOne, queryAll } = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/students — list all (admin/teacher) or own record (student)
router.get('/', async (req, res) => {
  try {
    let rows;
    if (req.user.role === 'admin' || req.user.role === 'teacher') {
      const { class_name, section, search } = req.query;
      let sql = `SELECT s.*, u.email FROM students s LEFT JOIN users u ON s.user_id = u.id WHERE 1=1`;
      const params = [];
      if (class_name) { params.push(class_name); sql += ` AND s.class_name = $${params.length}`; }
      if (section)    { params.push(section);    sql += ` AND s.section = $${params.length}`; }
      if (search)     { params.push(`%${search}%`); sql += ` AND (s.name ILIKE $${params.length} OR s.student_id ILIKE $${params.length})`; }
      sql += ' ORDER BY s.student_id';
      rows = await queryAll(sql, params);
    } else if (req.user.role === 'student') {
      rows = await queryAll(`SELECT s.*, u.email FROM students s LEFT JOIN users u ON s.user_id = u.id WHERE s.student_id = $1`, [req.user.userId]);
    } else if (req.user.role === 'parent') {
      // Parent sees their child
      rows = await queryAll(`
        SELECT s.*, u.email FROM students s
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN parents p ON p.student_id = s.id
        WHERE p.user_id = $1`, [req.user.dbId]);
    }
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch students.' });
  }
});

// GET /api/students/:id
router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne(`SELECT s.*, u.email FROM students s LEFT JOIN users u ON s.user_id = u.id WHERE s.student_id = $1`, [req.params.id]);
    if (!row) return res.status(404).json({ success: false, message: 'Student not found.' });
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching student.' });
  }
});

// POST /api/students — add new student (admin only)
router.post('/', requireRole('admin'), async (req, res) => {
  try {
    const { name, class_name, section, phone, fee_status, parent_name } = req.body;
    if (!name || !class_name) return res.status(400).json({ success: false, message: 'Name and class are required.' });

    // Generate IDs
    const countRes = await queryOne(`SELECT COUNT(*) as cnt FROM students`);
    const count    = parseInt(countRes.cnt) + 1;
    const studentId = 'STU' + String(count).padStart(3, '0');
    const parentId  = 'PAR' + String(count).padStart(3, '0');

    // Create student user
    const hash = await bcrypt.hash('stud123', 10);
    const uRes = await query(
      `INSERT INTO users (user_id, password, role, name) VALUES ($1, $2, 'student', $3) RETURNING id`,
      [studentId, hash, name]
    );
    const uId = uRes.rows[0].id;

    // Create student record
    const sRes = await query(
      `INSERT INTO students (student_id, user_id, name, class_name, section, phone, fee_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [studentId, uId, name, class_name, section || 'A', phone || '', fee_status || 'Unpaid']
    );
    const sDbId = sRes.rows[0].id;

    // Create parent user
    const parentName = parent_name || `Parent of ${name}`;
    const pHash = await bcrypt.hash('par123', 10);
    const puRes = await query(
      `INSERT INTO users (user_id, password, role, name) VALUES ($1, $2, 'parent', $3) RETURNING id`,
      [parentId, pHash, parentName]
    );
    const puId = puRes.rows[0].id;

    // Create parent record
    await query(
      `INSERT INTO parents (parent_id, user_id, student_id, name, phone, email)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [parentId, puId, sDbId, parentName, phone || '', `${parentId.toLowerCase()}@example.com`]
    );

    // Create fee record
    await query(
      `INSERT INTO fees (student_id, academic_year, term, amount_due, amount_paid, status)
       VALUES ($1, '2026-2027', 'Annual', 25000, 0, 'Unpaid')`,
      [sDbId]
    );

    res.json({ success: true, message: `Student ${studentId} and Parent ${parentId} registered. Default passwords: stud123 / par123`, data: sRes.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add student.' });
  }
});

// PUT /api/students/:id — update student
router.put('/:id', requireRole('admin'), async (req, res) => {
  try {
    const { name, class_name, section, phone, fee_status } = req.body;
    await query(
      `UPDATE students SET name=$1, class_name=$2, section=$3, phone=$4, fee_status=$5 WHERE student_id=$6`,
      [name, class_name, section, phone, fee_status, req.params.id]
    );
    res.json({ success: true, message: 'Student updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update.' });
  }
});

// DELETE /api/students/:id
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const stu = await queryOne(`SELECT id, user_id FROM students WHERE student_id = $1`, [req.params.id]);
    if (!stu) return res.status(404).json({ success: false, message: 'Student not found.' });

    // Find parent user_id associated with this student
    const parent = await queryOne(`SELECT user_id FROM parents WHERE student_id = $1`, [stu.id]);

    // Delete student record (which will cascade delete parent record in parents table)
    await query(`DELETE FROM students WHERE student_id = $1`, [req.params.id]);
    
    // Delete student user in users table
    await query(`DELETE FROM users WHERE id = $1`, [stu.user_id]);

    // Delete parent user in users table if exists
    if (parent && parent.user_id) {
      await query(`DELETE FROM users WHERE id = $1`, [parent.user_id]);
    }

    res.json({ success: true, message: 'Student and associated parent deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete.' });
  }
});

module.exports = router;