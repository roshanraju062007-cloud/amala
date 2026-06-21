/* EduSphere LMS — Settings API Routes */
const express = require('express');
const { query, queryOne, queryAll } = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET / — retrieve all system settings
router.get('/', async (req, res) => {
  try {
    const rows = await queryAll(`SELECT key, value FROM settings`);
    const config = {};
    rows.forEach(row => {
      config[row.key] = row.value;
    });

    // Provide sensible defaults if empty
    const defaults = {
      school_name: 'AMALA HIGHER SECONDARY SCHOOL',
      school_code: 'HSS-CBSE-3701',
      board: 'CBSE Board',
      medium: 'English',
      academic_year: '2026-2027'
    };

    const finalConfig = { ...defaults, ...config };
    res.json({ success: true, data: finalConfig });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
});

// PUT / — update system settings (admin only)
const updateSettings = async (req, res) => {
  try {
    const settingsObj = req.body;
    if (!settingsObj || typeof settingsObj !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid payload.' });
    }

    for (const [key, value] of Object.entries(settingsObj)) {
      await query(
        `INSERT INTO settings (key, value)
         VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [key, String(value || '').trim()]
      );
    }

    res.json({ success: true, message: 'Configuration settings updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update configuration settings.' });
  }
};

router.post('/', requireRole('admin'), updateSettings);
router.put('/', requireRole('admin'), updateSettings);

module.exports = router;
