/* EduSphere LMS — Teachers API Routes */
const express = require('express');
const bcrypt  = require('bcryptjs');
const { query, queryOne, queryAll } = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/teachers
router.get('/', async (req, res) => {
  try {
    const rows = await queryAll(
      `SELECT t.*, u.email FROM teachers t LEFT JOIN users u ON t.user_id = u.id ORDER BY t.teacher_id`
    );
    const mapped = rows.map(t => ({
      ...t,
      id: t.teacher_id,
      db_id: t.id,
      classAssigned: t.class_assigned,
      dept: t.department,
      password: 'teach123'
    }));
    res.json({ success: true, data: mapped });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch teachers.' });
  }
});

// GET /api/teachers/:id
router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne(
      `SELECT t.*, u.email FROM teachers t LEFT JOIN users u ON t.user_id = u.id WHERE t.teacher_id = $1`,
      [req.params.id]
    );
    if (!row) return res.status(404).json({ success: false, message: 'Teacher not found.' });
    const mapped = {
      ...row,
      id: row.teacher_id,
      db_id: row.id,
      classAssigned: row.class_assigned,
      dept: row.department,
      password: 'teach123'
    };
    res.json({ success: true, data: mapped });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching teacher.' });
  }
});

// POST /api/teachers — admin only
router.post('/', requireRole('admin'), async (req, res) => {
  try {
    const { name, department, subjects, phone, class_assigned, status, custom_id, password } = req.body;
    if (!name || !department) return res.status(400).json({ success: false, message: 'Name and department are required.' });

    const countRes = await queryOne(`SELECT COUNT(*) as cnt FROM teachers`);
    const count    = parseInt(countRes.cnt) + 1;
    const teacherId = custom_id || ('TCH' + String(count).padStart(3, '0'));

    const tchPass = (password || 'teach123').trim();
    const hash = await bcrypt.hash(tchPass, 10);
    const uRes = await query(
      `INSERT INTO users (user_id, password, role, name) VALUES ($1, $2, 'teacher', $3) RETURNING id`,
      [teacherId, hash, name]
    );
    const tRes = await query(
      `INSERT INTO teachers (teacher_id, user_id, name, department, subjects, phone, class_assigned, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [teacherId, uRes.rows[0].id, name, department, subjects, phone, class_assigned || null, status || 'Full-Time']
    );
    res.json({ success: true, message: `Teacher ${teacherId} registered. Default password: teach123`, data: tRes.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add teacher.' });
  }
});

// PUT /api/teachers/:id
router.put('/:id', requireRole('admin'), async (req, res) => {
  try {
    const { name, department, subjects, phone, class_assigned, status } = req.body;
    await query(
      `UPDATE teachers SET name=$1, department=$2, subjects=$3, phone=$4, class_assigned=$5, status=$6 WHERE teacher_id=$7`,
      [name, department, subjects, phone, class_assigned, status, req.params.id]
    );
    res.json({ success: true, message: 'Teacher updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update.' });
  }
});

// DELETE /api/teachers/:id
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const tch = await queryOne(`SELECT user_id FROM teachers WHERE teacher_id = $1`, [req.params.id]);
    if (!tch) return res.status(404).json({ success: false, message: 'Teacher not found.' });
    await query(`DELETE FROM teachers WHERE teacher_id = $1`, [req.params.id]);
    await query(`DELETE FROM users WHERE id = $1`, [tch.user_id]);
    res.json({ success: true, message: 'Teacher deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete.' });
  }
});

module.exports = router;