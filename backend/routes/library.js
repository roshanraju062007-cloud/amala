/* EduSphere LMS — Library API Routes */
const express = require('express');
const { query, queryOne, queryAll } = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /books — list all books
router.get('/books', async (req, res) => {
  try {
    const rows = await queryAll(`SELECT * FROM library_books ORDER BY title`);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch books.' });
  }
});

// POST /books — add book (admin only)
router.post('/books', requireRole('admin'), async (req, res) => {
  try {
    const { isbn, title, author, total_copies } = req.body;
    if (!isbn || !title) {
      return res.status(400).json({ success: false, message: 'ISBN and Title are required.' });
    }
    const copies = parseInt(total_copies) || 1;
    const row = await query(
      `INSERT INTO library_books (isbn, title, author, total_copies, available_copies)
       VALUES ($1, $2, $3, $4, $4)
       ON CONFLICT (isbn) DO UPDATE SET 
         title = EXCLUDED.title,
         author = EXCLUDED.author,
         total_copies = library_books.total_copies + EXCLUDED.total_copies,
         available_copies = library_books.available_copies + EXCLUDED.available_copies
       RETURNING *`,
      [isbn.trim(), title.trim(), (author || '').trim(), copies]
    );
    res.json({ success: true, message: 'Book added to catalog.', data: row.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add book.' });
  }
});

// POST /issue — issue book (admin only)
router.post('/issue', requireRole('admin'), async (req, res) => {
  try {
    const { isbn, student_id, due_date } = req.body;
    if (!isbn || !student_id) {
      return res.status(400).json({ success: false, message: 'ISBN and Student ID are required.' });
    }

    // 1. Verify student exists
    const student = await queryOne(`SELECT id, name FROM students WHERE student_id = $1`, [student_id.trim().toUpperCase()]);
    if (!student) {
      return res.status(404).json({ success: false, message: `Student ID "${student_id}" does not exist.` });
    }

    // 2. Verify book exists and has available copies
    const book = await queryOne(`SELECT available_copies, title FROM library_books WHERE isbn = $1`, [isbn.trim()]);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found in catalogue.' });
    }
    if (book.available_copies <= 0) {
      return res.status(400).json({ success: false, message: `No available copies for "${book.title}".` });
    }

    // 3. Issue book & decrement copies
    await query(
      `INSERT INTO library_issues (isbn, student_id, due_date, status)
       VALUES ($1, $2, $3, 'issued')`,
      [isbn.trim(), student_id.trim().toUpperCase(), due_date || null]
    );

    await query(
      `UPDATE library_books SET available_copies = available_copies - 1 WHERE isbn = $1`,
      [isbn.trim()]
    );

    res.json({ success: true, message: `Book "${book.title}" successfully issued to ${student.name}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to issue book.' });
  }
});

// POST /return/:issueId — mark returned (admin only)
router.post('/return/:issueId', requireRole('admin'), async (req, res) => {
  try {
    const issueId = req.params.issueId;
    const issue = await queryOne(`SELECT * FROM library_issues WHERE id = $1`, [issueId]);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue record not found.' });
    }
    if (issue.status === 'returned') {
      return res.status(400).json({ success: false, message: 'This book is already marked as returned.' });
    }

    // Update issue state
    await query(
      `UPDATE library_issues SET status = 'returned', return_date = CURRENT_DATE WHERE id = $1`,
      [issueId]
    );

    // Increment available copies
    await query(
      `UPDATE library_books SET available_copies = available_copies + 1 WHERE isbn = $1`,
      [issue.isbn]
    );

    res.json({ success: true, message: 'Book marked as returned successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to return book.' });
  }
});

// GET /issues — list current issues
router.get('/issues', async (req, res) => {
  try {
    let sql = `
      SELECT li.*, lb.title as book_title, lb.author as book_author, s.name as student_name, s.class_name, s.section
      FROM library_issues li
      JOIN library_books lb ON li.isbn = lb.isbn
      JOIN students s ON li.student_id = s.student_id
    `;
    const params = [];

    // If student, they only see their own issues
    if (req.user.role === 'student') {
      params.push(req.user.userId);
      sql += ` WHERE li.student_id = $1`;
    } else if (req.user.role === 'parent') {
      // Parents see their child's issues
      const child = await queryOne(
        `SELECT student_id FROM parents p JOIN students s ON p.student_id = s.id WHERE p.user_id = $1`,
        [req.user.dbId]
      );
      if (child) {
        params.push(child.student_id);
        sql += ` WHERE li.student_id = $1`;
      } else {
        return res.json({ success: true, data: [] });
      }
    }

    sql += ` ORDER BY li.issue_date DESC`;
    const rows = await queryAll(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch issues.' });
  }
});

module.exports = router;
