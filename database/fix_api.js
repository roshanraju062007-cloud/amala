/**
 * Fix script: rewrites the end of api.js to correct ordering of parentsRouter
 */
const fs = require('fs');
const file = 'd:/amala/backend/routes/api.js';
const c = fs.readFileSync(file, 'utf8');
const lines = c.split('\n');
// Keep lines 1-506 (0-indexed: 0-505), then add correct ending
const kept = lines.slice(0, 506).join('\n');

const ending = `

// -- PARENTS -------------------------------------------------------------
const parentsRouter = express.Router();
parentsRouter.use(authMiddleware);

parentsRouter.get('/', requireRole('admin'), async (req, res) => {
  try {
    const rows = await queryAll(
      \`SELECT p.*, s.name as student_name, s.student_id as student_code, s.class_name
       FROM parents p JOIN students s ON p.student_id = s.id ORDER BY p.parent_id\`
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
      \`SELECT p.*, s.name as student_name, s.student_id as student_code, s.class_name, s.section
       FROM parents p JOIN students s ON p.student_id = s.id WHERE p.user_id = $1\`,
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
      \`UPDATE submissions SET marks_obtained=$1, feedback=$2, status=$3 WHERE id=$4\`,
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
`;

fs.writeFileSync(file, kept + ending, 'utf8');
const written = fs.readFileSync(file, 'utf8').split('\n').length;
console.log('Done. Total lines:', written);
