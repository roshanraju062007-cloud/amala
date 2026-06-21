/* EduSphere LMS — Transport API Routes */
const express = require('express');
const { query, queryOne, queryAll } = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /vehicles — list all vehicles
router.get('/vehicles', async (req, res) => {
  try {
    const rows = await queryAll(`SELECT * FROM transport_vehicles ORDER BY route_name`);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch vehicles.' });
  }
});

// POST /vehicles — add vehicle (admin only)
router.post('/vehicles', requireRole('admin'), async (req, res) => {
  try {
    const { vehicle_no, route_name, driver_name, driver_phone, capacity } = req.body;
    if (!vehicle_no || !route_name || !driver_name) {
      return res.status(400).json({ success: false, message: 'Vehicle number, Route designation, and Driver Name are required.' });
    }
    const cap = parseInt(capacity) || 40;
    const row = await query(
      `INSERT INTO transport_vehicles (vehicle_no, route_name, driver_name, driver_phone, capacity)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (vehicle_no) DO UPDATE SET
         route_name = EXCLUDED.route_name,
         driver_name = EXCLUDED.driver_name,
         driver_phone = EXCLUDED.driver_phone,
         capacity = EXCLUDED.capacity
       RETURNING *`,
      [vehicle_no.trim().toUpperCase(), route_name.trim(), driver_name.trim(), (driver_phone || '').trim(), cap]
    );
    res.json({ success: true, message: 'Vehicle and Route registered.', data: row.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add vehicle.' });
  }
});

// DELETE /vehicles/:id — delete vehicle (admin only)
router.delete('/vehicles/:id', requireRole('admin'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await query(`DELETE FROM transport_vehicles WHERE id = $1`, [id]);
    res.json({ success: true, message: 'Vehicle route deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete vehicle.' });
  }
});

// GET /assignments — list student-to-vehicle assignments
router.get('/assignments', async (req, res) => {
  try {
    let sql = `
      SELECT ta.*, s.name as student_name, s.class_name, s.section, tv.route_name, tv.vehicle_no, tv.driver_name, tv.driver_phone
      FROM transport_assignments ta
      JOIN students s ON ta.student_id = s.student_id
      JOIN transport_vehicles tv ON ta.vehicle_id = tv.id
    `;
    const params = [];

    // Students only see their own assignments
    if (req.user.role === 'student') {
      params.push(req.user.userId);
      sql += ` WHERE ta.student_id = $1`;
    } else if (req.user.role === 'parent') {
      // Parents see their child's assignments
      const child = await queryOne(
        `SELECT student_id FROM parents p JOIN students s ON p.student_id = s.id WHERE p.user_id = $1`,
        [req.user.dbId]
      );
      if (child) {
        params.push(child.student_id);
        sql += ` WHERE ta.student_id = $1`;
      } else {
        return res.json({ success: true, data: [] });
      }
    }

    sql += ` ORDER BY tv.route_name, s.name`;
    const rows = await queryAll(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch assignments.' });
  }
});

// POST /assignments — assign student to vehicle (admin only)
router.post('/assignments', requireRole('admin'), async (req, res) => {
  try {
    const { vehicle_id, student_id, pickup_point } = req.body;
    if (!vehicle_id || !student_id || !pickup_point) {
      return res.status(400).json({ success: false, message: 'Vehicle, Student, and Pickup Stop are required.' });
    }

    // 1. Verify student exists
    const student = await queryOne(`SELECT name FROM students WHERE student_id = $1`, [student_id.trim().toUpperCase()]);
    if (!student) {
      return res.status(404).json({ success: false, message: `Student ID "${student_id}" does not exist.` });
    }

    // 2. Verify vehicle exists
    const vehicle = await queryOne(`SELECT route_name FROM transport_vehicles WHERE id = $1`, [vehicle_id]);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    // 3. Prevent duplicate assignment (delete any prior vehicle assignment for this student)
    await query(`DELETE FROM transport_assignments WHERE student_id = $1`, [student_id.trim().toUpperCase()]);

    // 4. Create assignment
    const row = await query(
      `INSERT INTO transport_assignments (vehicle_id, student_id, pickup_point)
       VALUES ($1, $2, $3) RETURNING *`,
      [vehicle_id, student_id.trim().toUpperCase(), pickup_point.trim()]
    );

    res.json({ success: true, message: `Student ${student.name} assigned to ${vehicle.route_name}.`, data: row.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to assign student.' });
  }
});

// DELETE /assignments/:id — delete transport assignment (admin only)
router.delete('/assignments/:id', requireRole('admin'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await query(`DELETE FROM transport_assignments WHERE id = $1`, [id]);
    res.json({ success: true, message: 'Transport assignment cancelled successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete transport assignment.' });
  }
});

module.exports = router;
