/* EduSphere LMS — Combined API Routes (classes, subjects, attendance, results, fees, notices, materials) */
const express = require('express');
const { query, queryOne, queryAll } = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ── CLASSES ──────────────────────────────────────────────────────────────────
const classRouter = express.Router();
classRouter.use(authMiddleware);

classRouter.get('/', async (req, res) => {
  try {
    const rows = await queryAll(`SELECT * FROM classes ORDER BY id`);
    const mapped = rows.map(c => ({
      ...c,
      studentsCount: c.students_count || 0
    }));
    res.json({ success: true, data: mapped });
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
    const mapped = rows.map(sub => ({
      ...sub,
      class: sub.class_name,
      teacherId: sub.teacher_id,
      periods: sub.periods_week
    }));
    res.json({ success: true, data: mapped });
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
    const mapped = rows.map(r => ({
      ...r,
      stuId: r.student_code,
      exam: r.exam_name,
      max: r.max_marks,
      obtained: r.obtained
    }));
    res.json({ success: true, data: mapped });
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

// POST fees — create new fee record (admin only)
feesRouter.post('/', requireRole('admin'), async (req, res) => {
  try {
    const { student_id, academic_year, term, amount_due } = req.body;
    const stu = await queryOne(`SELECT id FROM students WHERE student_id = $1`, [student_id]);
    if (!stu) return res.status(404).json({ success: false, message: 'Student not found.' });
    const row = await query(
      `INSERT INTO fees (student_id, academic_year, term, amount_due, amount_paid, status)
       VALUES ($1,$2,$3,$4,0,'Unpaid') RETURNING *`,
      [stu.id, academic_year || '2026-2027', term || 'Term 1', amount_due || 25000]
    );
    res.json({ success: true, data: row.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create fee record.' });
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
    const mapped = rows.map(a => ({
      ...a,
      id: a.asn_id,
      class: a.class_name,
      dueDate: a.due_date,
      due: a.due_date,
      maxMarks: a.max_marks,
      marks: a.max_marks,
      teacherId: a.teacher_id
    }));
    res.json({ success: true, data: mapped });
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

assignmentsRouter.get('/submissions', async (req, res) => {
  try {
    let sql = `
      SELECT s.*, a.asn_id, a.title as assignment_title, st.student_id as student_code, st.name as student_name
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN students st ON s.student_id = st.id
    `;
    const params = [];
    if (req.user.role === 'student') {
      params.push(req.user.userId);
      sql += ` WHERE st.student_id = $1`;
    }
    const rows = await queryAll(sql, params);
    const mapped = rows.map(r => ({
      id: r.id,
      assignmentId: r.asn_id,
      assignmentTitle: r.assignment_title,
      studentId: r.student_code,
      studentName: r.student_name,
      fileName: r.content ? r.content.split('/').pop() : '',
      fileData: r.content,
      submittedAt: r.submitted_at,
      status: r.status,
      marksObtained: r.marks_obtained,
      feedback: r.feedback
    }));
    res.json({ success: true, data: mapped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch submissions.' });
  }
});

// POST /api/assignments/:id/submit — submit assignment (student only)
assignmentsRouter.post('/:id/submit', requireRole('student'), upload.single('file'), async (req, res) => {
  try {
    const asnId = req.params.id;
    const { content } = req.body;
    let finalContent = content || '';
    if (req.file) {
      finalContent = '/uploads/' + req.file.filename;
    }

    // Resolve assignment serial ID from asn_id
    const assignment = await queryOne(`SELECT id FROM assignments WHERE asn_id = $1`, [asnId]);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    // Resolve student serial ID from student_id
    const student = await queryOne(`SELECT id FROM students WHERE student_id = $1`, [req.user.userId]);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    // Upsert submission
    const row = await query(
      `INSERT INTO submissions (assignment_id, student_id, content, status, submitted_at)
       VALUES ($1, $2, $3, 'Submitted', NOW())
       ON CONFLICT (assignment_id, student_id)
       DO UPDATE SET content = EXCLUDED.content, status = 'Submitted', submitted_at = NOW()
       RETURNING *`,
      [assignment.id, student.id, finalContent]
    );

    res.json({ success: true, message: 'Assignment submitted successfully.', data: row.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to submit assignment: ' + err.message });
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
    const mapped = rows.map(m => ({
      ...m,
      id: m.mat_id,
      class: m.class_name,
      teacherId: m.teacher_id
    }));
    res.json({ success: true, data: mapped });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch materials.' });
  }
});

materialsRouter.post('/', requireRole('admin','teacher'), upload.single('file'), async (req, res) => {
  try {
    const { title, type, subject, class_name, link } = req.body;
    let finalLink = link || '';
    if (req.file) {
      finalLink = '/uploads/' + req.file.filename;
    }
    const countRes = await queryOne(`SELECT COUNT(*) as cnt FROM materials`);
    const matId = 'MAT' + String(parseInt(countRes.cnt) + 1).padStart(3, '0');
    const row = await query(
      `INSERT INTO materials (mat_id, title, type, subject, class_name, link, teacher_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [matId, title, type, subject, class_name || 'All', finalLink, req.user.userId]
    );
    res.json({ success: true, data: row.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add material: ' + err.message });
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
    sql += ` ORDER BY CASE day WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
             WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 ELSE 6 END, period`;
    const rows = await queryAll(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch timetable.' });
  }
});

timetableRouter.post('/', requireRole('admin'), async (req, res) => {
  try {
    const { class_name, section, day, period, subject, teacher_id, start_time, end_time } = req.body;
    // Delete any existing entry first
    await query(
      `DELETE FROM timetable WHERE class_name = $1 AND section = $2 AND day = $3 AND period = $4`,
      [class_name, section || 'A', day, period]
    );

    let row;
    if (subject && subject !== '--') {
      row = await query(
        `INSERT INTO timetable (class_name, section, day, period, subject, teacher_id, start_time, end_time)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [class_name, section || 'A', day, period, subject, teacher_id || null, start_time || null, end_time || null]
      );
    }
    res.json({ success: true, data: row ? row.rows[0] : {}, message: 'Timetable entry saved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save timetable entry.' });
  }
});

timetableRouter.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    await query(`DELETE FROM timetable WHERE id = $1`, [req.params.id]);
    res.json({ success: true, message: 'Timetable entry deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete timetable entry.' });
  }
});

// -- PARENTS -------------------------------------------------------------
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

// GET /me -- parent own profile + child info
parentsRouter.get('/me', async (req, res) => {
  try {
    const row = await queryOne(
      `SELECT p.*, s.name as student_name, s.student_id as student_code, s.class_name, s.section
       FROM parents p JOIN students s ON p.student_id = s.id WHERE p.user_id = $1`,
      [req.user.dbId]
    );
    res.json({ success: true, data: row || {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch parent profile.' });
  }
});

// -- SUBMISSION GRADING --------------------------------------------------
// PUT /api/assignments/submissions/:id -- grade a submission
assignmentsRouter.put('/submissions/:id', requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const { marks_obtained, feedback, status } = req.body;
    await query(
      `UPDATE submissions SET marks_obtained=$1, feedback=$2, status=$3 WHERE id=$4`,
      [marks_obtained, feedback, status || 'Graded', req.params.id]
    );
    res.json({ success: true, message: 'Submission graded.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to grade submission.' });
  }
});

module.exports = {
  classRouter, subjectRouter, attendanceRouter, resultsRouter,
  feesRouter, noticesRouter, assignmentsRouter, materialsRouter,
  timetableRouter, parentsRouter
};
