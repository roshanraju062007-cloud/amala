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
    const { user_id, password, role } = req.body;

    if (!user_id || !password || !role) {
      return res.status(400).json({ success: false, message: 'User ID, password, and role are required.' });
    }

    // Find user in database
    const user = await queryOne(
      `SELECT id, user_id, password, role, name, email FROM users WHERE user_id = $1 AND is_active = TRUE`,
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

    // Set HTTP-only cookie
    res.cookie('edusphere_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      success: true,
      user: {
        userId: user.user_id,
        name:   user.name,
        role:   user.role,
        email:  user.email,
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
    const user = await queryOne(`SELECT user_id, name, role, email FROM users WHERE user_id = $1`, [decoded.userId]);
    if (!user) return res.status(401).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, user });
  } catch {
    return res.status(401).json({ success: false, message: 'Session expired.' });
  }
});

module.exports = router;
