/* EduSphere LMS — Combined API Routes (classes, subjects, attendance, results, fees, notices, materials) */
const express = require('express');
const { query, queryOne, queryAll } = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

// ── CLASSES ──────────────────────────────────────────────────────────────────
const classRouter = express.Router();
classRouter.use(authMiddleware);

classRouter.get('/', async (req, res) => {
  try {
    const rows = await queryAll(`SELECT * FROM classes ORDER BY id`);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch classes.' });
  }
});

classRouter.post('/', requireRole('admin'), async (req, res) => {
  try {
    const { name, sections } = req.body;
    const row = await query(`INSERT INTO classes (name, sections) VALUES ($1, $2) RETURNING *`, [name, sections]);
    res.json({ success: true, data: row.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add class.' });
  }
});

classRouter.delete('/:name', requireRole('admin'), async (req, res) => {
  try {
    await query(`DELETE FROM classes WHERE name = $1`, [req.params.name]);
    res.json({ success: true, message: 'Class deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete class.' });
  }
});

// ── SUBJECTS ─────────────────────────────────────────────────────────────────
const subjectRouter = express.Router();
subjectRouter.use(authMiddleware);

subjectRouter.get('/', async (req, res) => {
  try {
    const { class_name } = req.query;
    let sql = `SELECT * FROM subjects`;
    const params = [];
    if (class_name) { params.push(class_name); sql += ` WHERE class_name = $1`; }
    sql += ' ORDER BY class_name, name';
    const rows = await queryAll(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch subjects.' });
  }
});

subjectRouter.post('/', requireRole('admin'), async (req, res) => {
  try {
    const { code, name, class_name, teacher_id, periods_week, type } = req.body;
    const row = await query(
      `INSERT INTO subjects (code, name, class_name, teacher_id, periods_week, type)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (code) DO NOTHING RETURNING *`,
      [code, name, class_name, teacher_id, periods_week || 5, type || 'Core']
    );
    res.json({ success: true, data: row.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add subject.' });
  }
});

// ── ATTENDANCE ────────────────────────────────────────────────────────────────
const attendanceRouter = express.Router();
attendanceRouter.use(authMiddleware);

// GET attendance for a class+section+date
attendanceRouter.get('/', async (req, res) => {
  try {
    const { class_name, section, date, student_id } = req.query;
    let sql = `SELECT a.*, s.name as student_name, s.student_id as student_code
               FROM attendance a JOIN students s ON a.student_id = s.id WHERE 1=1`;
    const params = [];
    if (class_name) { params.push(class_name); sql += ` AND a.class_name = $${params.length}`; }
    if (section)    { params.push(section);    sql += ` AND a.section = $${params.length}`; }
    if (date)       { params.push(date);       sql += ` AND a.date = $${params.length}`; }
    if (student_id) {
      const stu = await queryOne(`SELECT id FROM students WHERE student_id = $1`, [student_id]);
      if (stu) { params.push(stu.id); sql += ` AND a.student_id = $${params.length}`; }
    }
    sql += ' ORDER BY s.student_id';
    const rows = await queryAll(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance.' });
  }
});

// POST attendance — bulk save for a class+section+date
attendanceRouter.post('/', requireRole('admin','teacher'), async (req, res) => {
  try {
    const { class_name, section, date, records } = req.body;
    // records = [{ student_id: 'STU001', status: 'P' }, ...]
    let saved = 0;
    for (const rec of records) {
      const stu = await queryOne(`SELECT id FROM students WHERE student_id = $1`, [rec.student_id]);
      if (!stu) continue;
      await query(
        `INSERT INTO attendance (student_id, class_name, section, date, status, marked_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (student_id, date) DO UPDATE SET status = EXCLUDED.status, marked_by = EXCLUDED.marked_by`,
        [stu.id, class_name, section, date, rec.status, req.user.userId]
      );
      saved++;
    }
    res.json({ success: true, message: `Attendance saved for ${saved} students.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to save attendance.' });
  }
});

// ── RESULTS ───────────────────────────────────────────────────────────────────
const resultsRouter = express.Router();
resultsRouter.use(authMiddleware);

resultsRouter.get('/', async (req, res) => {
  try {
    const { student_id, class_name } = req.query;
    let sql = `SELECT r.*, s.name as student_name, s.student_id as student_code, s.class_name
               FROM results r JOIN students s ON r.student_id = s.id WHERE 1=1`;
    const params = [];

    // Students only see their own
    if (req.user.role === 'student') {
      params.push(req.user.userId);
      sql += ` AND s.student_id = $${params.length}`;
    } else if (req.user.role === 'parent') {
      const child = await queryOne(
        `SELECT s.id FROM students s JOIN parents p ON p.student_id = s.id WHERE p.user_id = $1`,
        [req.user.dbId]
      );
      if (child) { params.push(child.id); sql += ` AND r.student_id = $${params.length}`; }
    } else {
      if (student_id) {
        const stu = await queryOne(`SELECT id FROM students WHERE student_id = $1`, [student_id]);
        if (stu) { params.push(stu.id); sql += ` AND r.student_id = $${params.length}`; }
      }
      if (class_name) { params.push(class_name); sql += ` AND s.class_name = $${params.length}`; }
    }
    sql += ' ORDER BY r.created_at DESC';
    const rows = await queryAll(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch results.' });
  }
});

// POST results — publish marks
resultsRouter.post('/', requireRole('admin','teacher'), async (req, res) => {
  try {
    const { records } = req.body;
    // records = [{ student_id, subject, exam_name, max_marks, obtained, grade, remarks }]
    let saved = 0;
    for (const r of records) {
      const stu = await queryOne(`SELECT id FROM students WHERE student_id = $1`, [r.student_id]);
      if (!stu || r.obtained === undefined) continue;
      await query(
        `INSERT INTO results (student_id, subject, exam_name, max_marks, obtained, grade, remarks, published_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [stu.id, r.subject, r.exam_name, r.max_marks, r.obtained, r.grade, r.remarks, req.user.userId]
      );
      saved++;
    }
    res.json({ success: true, message: `Results published for ${saved} students.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to publish results.' });
  }
});

// ── FEES ──────────────────────────────────────────────────────────────────────
const feesRouter = express.Router();
feesRouter.use(authMiddleware);

feesRouter.get('/', async (req, res) => {
  try {
    const { student_id } = req.query;
    let sql = `SELECT f.*, s.name, s.student_id as student_code, s.class_name
               FROM fees f JOIN students s ON f.student_id = s.id WHERE 1=1`;
    const params = [];

    if (req.user.role === 'student') {
      params.push(req.user.userId); sql += ` AND s.student_id = $${params.length}`;
    } else if (req.user.role === 'parent') {
      const child = await queryOne(
        `SELECT s.student_id FROM students s JOIN parents p ON p.student_id = s.id WHERE p.user_id = $1`,
        [req.user.dbId]
      );
      if (child) { params.push(child.student_id); sql += ` AND s.student_id = $${params.length}`; }
    } else if (student_id) {
      params.push(student_id); sql += ` AND s.student_id = $${params.length}`;
    }
    sql += ' ORDER BY f.created_at DESC';
    const rows = await queryAll(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch fees.' });
  }
});

feesRouter.put('/:id', requireRole('admin'), async (req, res) => {
  try {
    const { amount_paid, payment_mode, receipt_no, status } = req.body;
    await query(
      `UPDATE fees SET amount_paid=$1, payment_mode=$2, receipt_no=$3, status=$4, payment_date=CURRENT_DATE WHERE id=$5`,
      [amount_paid, payment_mode, receipt_no, status, req.params.id]
    );
    res.json({ success: true, message: 'Fee record updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update fee.' });
  }
});

// ── NOTICES ───────────────────────────────────────────────────────────────────
const noticesRouter = express.Router();
noticesRouter.use(authMiddleware);

noticesRouter.get('/', async (req, res) => {
  try {
    const rows = await queryAll(`SELECT * FROM notices WHERE is_active = TRUE ORDER BY posted_at DESC LIMIT 20`);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notices.' });
  }
});

noticesRouter.post('/', requireRole('admin'), async (req, res) => {
  try {
    const { message } = req.body;
    const row = await query(
      `INSERT INTO notices (message, posted_by) VALUES ($1, $2) RETURNING *`,
      [message, req.user.name]
    );
    res.json({ success: true, data: row.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to post notice.' });
  }
});

// ── ASSIGNMENTS ───────────────────────────────────────────────────────────────
const assignmentsRouter = express.Router();
assignmentsRouter.use(authMiddleware);

assignmentsRouter.get('/', async (req, res) => {
  try {
    const { class_name } = req.query;
    let sql = `SELECT * FROM assignments WHERE 1=1`;
    const params = [];
    if (class_name) { params.push(class_name); sql += ` AND class_name = $${params.length}`; }
    if (req.user.role === 'teacher') { params.push(req.user.userId); sql += ` AND teacher_id = $${params.length}`; }
    sql += ' ORDER BY created_at DESC';
    const rows = await queryAll(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch assignments.' });
  }
});

assignmentsRouter.post('/', requireRole('admin','teacher'), async (req, res) => {
  try {
    const { title, class_name, section, subject, due_date, max_marks, instructions } = req.body;
    const countRes = await queryOne(`SELECT COUNT(*) as cnt FROM assignments`);
    const asnId = 'ASN' + String(parseInt(countRes.cnt) + 1).padStart(3, '0');
    const row = await query(
      `INSERT INTO assignments (asn_id, title, class_name, section, subject, due_date, max_marks, instructions, teacher_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [asnId, title, class_name, section, subject, due_date, max_marks || 50, instructions, req.user.userId]
    );
    res.json({ success: true, data: row.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create assignment.' });
  }
});

assignmentsRouter.delete('/:id', requireRole('admin','teacher'), async (req, res) => {
  try {
    await query(`DELETE FROM assignments WHERE asn_id = $1`, [req.params.id]);
    res.json({ success: true, message: 'Assignment deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete.' });
  }
});

// ── MATERIALS ─────────────────────────────────────────────────────────────────
const materialsRouter = express.Router();
materialsRouter.use(authMiddleware);

materialsRouter.get('/', async (req, res) => {
  try {
    const { class_name } = req.query;
    let sql = `SELECT * FROM materials WHERE 1=1`;
    const params = [];
    if (class_name) { params.push(class_name); sql += ` AND (class_name = $${params.length} OR class_name = 'All')`; }
    sql += ' ORDER BY created_at DESC';
    const rows = await queryAll(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch materials.' });
  }
});

materialsRouter.post('/', requireRole('admin','teacher'), async (req, res) => {
  try {
    const { title, type, subject, class_name, link } = req.body;
    const countRes = await queryOne(`SELECT COUNT(*) as cnt FROM materials`);
    const matId = 'MAT' + String(parseInt(countRes.cnt) + 1).padStart(3, '0');
    const row = await query(
      `INSERT INTO materials (mat_id, title, type, subject, class_name, link, teacher_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [matId, title, type, subject, class_name || 'All', link, req.user.userId]
    );
    res.json({ success: true, data: row.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add material.' });
  }
});

materialsRouter.delete('/:id', requireRole('admin','teacher'), async (req, res) => {
  try {
    await query(`DELETE FROM materials WHERE mat_id = $1`, [req.params.id]);
    res.json({ success: true, message: 'Material deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete.' });
  }
});

// ── TIMETABLE ─────────────────────────────────────────────────────────────────
const timetableRouter = express.Router();
timetableRouter.use(authMiddleware);

timetableRouter.get('/', async (req, res) => {
  try {
    const { class_name, section } = req.query;
    let sql = `SELECT * FROM timetable WHERE 1=1`;
    const params = [];
    if (class_name) { params.push(class_name); sql += ` AND class_name = $${params.length}`; }
    if (section)    { params.push(section);    sql += ` AND section = $${params.length}`; }
    sql += ' ORDER BY CASE day WHEN \'Monday\' THEN 1 WHEN \'Tuesday\' THEN 2 WHEN \'Wednesday\' THEN 3 WHEN \'Thursday\' THEN 4 WHEN \'Friday\' THEN 5 ELSE 6 END, period';
    const rows = await queryAll(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch timetable.' });
  }
});

// ── PARENTS ───────────────────────────────────────────────────────────────────
const parentsRouter = express.Router();
parentsRouter.use(authMiddleware);

parentsRouter.get('/', requireRole('admin'), async (req, res) => {
  try {
    const rows = await queryAll(
      `SELECT p.*, s.name as student_name, s.student_id as student_code, s.class_name
       FROM parents p JOIN students s ON p.student_id = s.id ORDER BY p.parent_id`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch parents.' });
  }
});

module.exports = {
  classRouter, subjectRouter, attendanceRouter, resultsRouter,
  feesRouter, noticesRouter, assignmentsRouter, materialsRouter,
  timetableRouter, parentsRouter
};
