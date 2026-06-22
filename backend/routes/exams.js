/* EduSphere LMS — Exams API Routes */
const express = require('express');
const { query, queryOne, queryAll } = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/exams — list exams (role-filtered)
router.get('/', async (req, res) => {
  try {
    const { class_name } = req.query;
    let sql = `SELECT * FROM exams WHERE 1=1`;
    const params = [];

    if (class_name) {
      params.push(class_name);
      sql += ` AND class_name = $${params.length}`;
    }

    // Teachers see their own exams only (unless admin)
    if (req.user.role === 'teacher') {
      params.push(req.user.userId);
      sql += ` AND teacher_id = $${params.length}`;
    }

    sql += ` ORDER BY exam_date ASC NULLS LAST, created_at DESC`;
    const rows = await queryAll(sql, params);

    const mapped = rows.map(e => ({
      ...e,
      id: e.exam_id,
      class: e.class_name,
      type: e.exam_type,
      date: e.exam_date,
      marks: e.max_marks,
      duration: e.duration_mins,
    }));

    res.json({ success: true, data: mapped });
  } catch (err) {
    console.error('GET /api/exams:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch exams.' });
  }
});

// GET /api/exams/:id — get single exam
router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne(`SELECT * FROM exams WHERE exam_id = $1`, [req.params.id]);
    if (!row) return res.status(404).json({ success: false, message: 'Exam not found.' });
    res.json({ success: true, data: { ...row, id: row.exam_id, class: row.class_name } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching exam.' });
  }
});

// POST /api/exams — schedule exam (admin or teacher)
router.post('/', requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const { title, class_name, section, subject, exam_type, exam_date, max_marks, duration_mins } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Exam title is required.' });

    const countRes = await queryOne(`SELECT COUNT(*) as cnt FROM exams`);
    const examId = 'EXM' + String(parseInt(countRes.cnt) + 1).padStart(3, '0');

    const row = await query(
      `INSERT INTO exams (exam_id, title, class_name, section, subject, exam_type, exam_date, max_marks, duration_mins, teacher_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'Scheduled') RETURNING *`,
      [
        examId,
        title.trim(),
        class_name || null,
        section || null,
        subject || null,
        exam_type || 'Quarterly',
        exam_date || null,
        parseInt(max_marks) || 100,
        parseInt(duration_mins) || 180,
        req.user.userId,
      ]
    );

    const e = row.rows[0];
    res.json({
      success: true,
      message: `Exam "${title}" scheduled successfully.`,
      data: { ...e, id: e.exam_id, class: e.class_name }
    });
  } catch (err) {
    console.error('POST /api/exams:', err.message);
    res.status(500).json({ success: false, message: 'Failed to schedule exam: ' + err.message });
  }
});

// PUT /api/exams/:id — update exam (admin or teacher)
router.put('/:id', requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const { title, class_name, section, subject, exam_type, exam_date, max_marks, duration_mins, status } = req.body;
    await query(
      `UPDATE exams SET
        title=$1, class_name=$2, section=$3, subject=$4, exam_type=$5,
        exam_date=$6, max_marks=$7, duration_mins=$8, status=$9
       WHERE exam_id=$10`,
      [title, class_name, section, subject, exam_type, exam_date, max_marks, duration_mins, status || 'Scheduled', req.params.id]
    );
    res.json({ success: true, message: 'Exam updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update exam.' });
  }
});

// DELETE /api/exams/:id — delete exam (admin only)
router.delete('/:id', requireRole('admin', 'teacher'), async (req, res) => {
  try {
    await query(`DELETE FROM exams WHERE exam_id = $1`, [req.params.id]);
    res.json({ success: true, message: 'Exam deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete exam.' });
  }
});

module.exports = router;