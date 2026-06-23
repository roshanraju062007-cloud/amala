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
      let sql = `
        SELECT 
          s.*, 
          su.user_id AS student_username, 
          su.raw_password AS student_raw_password, 
          su.email AS student_email,
          p.name AS parent_name,
          p.phone AS parent_phone,
          p.email AS parent_email,
          pu.user_id AS parent_username,
          pu.raw_password AS parent_raw_password
        FROM students s
        LEFT JOIN users su ON s.user_id = su.id
        LEFT JOIN parents p ON p.student_id = s.id
        LEFT JOIN users pu ON p.user_id = pu.id
        WHERE 1=1`;
      const params = [];
      if (class_name) { params.push(class_name); sql += ` AND s.class_name = $${params.length}`; }
      if (section)    { params.push(section);    sql += ` AND s.section = $${params.length}`; }
      if (search)     { params.push(`%${search}%`); sql += ` AND (s.name ILIKE $${params.length} OR s.student_id ILIKE $${params.length})`; }
      sql += ' ORDER BY s.student_id';
      rows = await queryAll(sql, params);
    } else if (req.user.role === 'student') {
      rows = await queryAll(`
        SELECT 
          s.*, 
          su.user_id AS student_username, 
          su.raw_password AS student_raw_password, 
          su.email AS student_email,
          p.name AS parent_name,
          p.phone AS parent_phone,
          p.email AS parent_email,
          pu.user_id AS parent_username,
          pu.raw_password AS parent_raw_password
        FROM students s
        LEFT JOIN users su ON s.user_id = su.id
        LEFT JOIN parents p ON p.student_id = s.id
        LEFT JOIN users pu ON p.user_id = pu.id
        WHERE s.student_id = $1`, [req.user.userId]);
    } else if (req.user.role === 'parent') {
      // Parent sees their child
      rows = await queryAll(`
        SELECT 
          s.*, 
          su.user_id AS student_username, 
          su.raw_password AS student_raw_password, 
          su.email AS student_email,
          p.name AS parent_name,
          p.phone AS parent_phone,
          p.email AS parent_email,
          pu.user_id AS parent_username,
          pu.raw_password AS parent_raw_password
        FROM students s
        LEFT JOIN users su ON s.user_id = su.id
        LEFT JOIN parents p ON p.student_id = s.id
        LEFT JOIN users pu ON p.user_id = pu.id
        WHERE p.user_id = $1`, [req.user.dbId]);
    }
    const mapped = rows.map(s => ({
      ...s,
      id: s.student_id,
      db_id: s.id,
      class: s.class_name,
      fee: s.fee_status,
      attendance: parseFloat(s.attendance_pct || 100),
      password: s.student_raw_password || '',
      parent: s.parent_name || 'Parent',
      parentUsername: s.parent_username || '',
      parentPassword: s.parent_raw_password || '',
      parentEmail: s.parent_email || ''
    }));
    res.json({ success: true, data: mapped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch students.' });
  }
});

// GET /api/students/:id
router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne(`
      SELECT 
        s.*, 
        su.user_id AS student_username, 
        su.raw_password AS student_raw_password, 
        su.email AS student_email,
        p.name AS parent_name,
        p.phone AS parent_phone,
        p.email AS parent_email,
        pu.user_id AS parent_username,
        pu.raw_password AS parent_raw_password
      FROM students s
      LEFT JOIN users su ON s.user_id = su.id
      LEFT JOIN parents p ON p.student_id = s.id
      LEFT JOIN users pu ON p.user_id = pu.id
      WHERE s.student_id = $1`, [req.params.id]);
    if (!row) return res.status(404).json({ success: false, message: 'Student not found.' });
    const mapped = {
      ...row,
      id: row.student_id,
      db_id: row.id,
      class: row.class_name,
      fee: row.fee_status,
      attendance: parseFloat(row.attendance_pct || 100),
      password: row.student_raw_password || '',
      parent: row.parent_name || 'Parent',
      parentUsername: row.parent_username || '',
      parentPassword: row.parent_raw_password || '',
      parentEmail: row.parent_email || ''
    };
    res.json({ success: true, data: mapped });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching student.' });
  }
});

// POST /api/students — add new student (admin only)
router.post('/', requireRole('admin'), async (req, res) => {
  try {
    const { name, class_name, section, phone, fee_status, parent_name, custom_student_id, student_password, parent_username, parent_password } = req.body;
    if (!name || !class_name) return res.status(400).json({ success: false, message: 'Name and class are required.' });

    const studentId = (custom_student_id || '').trim();
    const stuPass = (student_password || '').trim();
    const parentId = (parent_username || '').trim();
    const parPass = (parent_password || '').trim();

    if (!studentId || !stuPass || !parentId || !parPass) {
      return res.status(400).json({ success: false, message: 'Student ID, Student Password, Parent Username, and Parent Password are all required.' });
    }

    // Create student user
    const hash = await bcrypt.hash(stuPass, 10);
    const uRes = await query(
      `INSERT INTO users (user_id, password, raw_password, role, name) VALUES ($1, $2, $3, 'student', $4) RETURNING id`,
      [studentId, hash, stuPass, name]
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
    const pHash = await bcrypt.hash(parPass, 10);
    const puRes = await query(
      `INSERT INTO users (user_id, password, raw_password, role, name) VALUES ($1, $2, $3, 'parent', $4) RETURNING id`,
      [parentId, pHash, parPass, parentName]
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

    res.json({ success: true, message: `Student ${studentId} and Parent ${parentId} registered.`, data: sRes.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add student: ' + err.message });
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