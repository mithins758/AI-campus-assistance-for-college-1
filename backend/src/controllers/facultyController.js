// Faculty controller: status listing + status updates with Socket.io.
const pool = require('../config/db');
const { validateFacultyStatus, isUUID } = require('../utils/validators');

// GET /api/faculty/status — join users + faculty_status + locations.
async function getFacultyStatus(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT
         u.id AS faculty_id,
         u.name,
         u.department,
         fs.status,
         fs.updated_at,
         l.id AS location_id,
         l.code AS location_code,
         l.name AS location_name,
         l.floor AS location_floor
       FROM users u
       JOIN faculty_status fs ON fs.faculty_id = u.id
       LEFT JOIN locations l ON l.id = fs.current_location_id
       WHERE u.role = 'faculty'
       ORDER BY u.name ASC`
    );

    const data = result.rows.map((row) => ({
      faculty_id: row.faculty_id,
      name: row.name,
      department: row.department,
      status: row.status,
      location: row.location_id
        ? {
            code: row.location_code,
            name: row.location_name,
            floor: row.location_floor,
          }
        : null,
      updated_at: row.updated_at,
    }));

    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

// PATCH /api/faculty/:id/status — faculty (own only) or admin.
async function updateFacultyStatus(req, res, next) {
  try {
    const targetId = req.params.id;

    if (!isUUID(targetId)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid faculty id' });
    }

    const errors = validateFacultyStatus(req.body);
    if (errors.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: errors[0], errors });
    }

    // Prevent faculty impersonation: faculty can only update themselves.
    if (req.user.role === 'faculty' && req.user.id !== targetId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own status',
      });
    }

    // Verify target user exists and is faculty.
    const userResult = await pool.query(
      'SELECT id, role FROM users WHERE id = $1',
      [targetId]
    );
    if (userResult.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Faculty member not found' });
    }
    if (userResult.rows[0].role !== 'faculty') {
      return res.status(400).json({
        success: false,
        message: 'Target user is not a faculty member',
      });
    }

    // Validate location if supplied.
    const locationId = req.body.current_location_id || null;
    if (locationId) {
      const locResult = await pool.query(
        'SELECT id FROM locations WHERE id = $1',
        [locationId]
      );
      if (locResult.rowCount === 0) {
        return res
          .status(404)
          .json({ success: false, message: 'Location not found' });
      }
    }

    const { status } = req.body;

    // Upsert atomically, then read back the row.
    const upsert = await pool.query(
      `INSERT INTO faculty_status (faculty_id, status, current_location_id, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (faculty_id)
       DO UPDATE SET status = EXCLUDED.status,
                     current_location_id = EXCLUDED.current_location_id,
                     updated_at = NOW()
       RETURNING faculty_id, status, current_location_id, updated_at`,
      [targetId, status, locationId]
    );
    const updated = upsert.rows[0];

    // Emit Socket.io ONLY after the database update succeeded.
    const io = req.app.get('io');
    if (io) {
      io.emit('faculty_status_update', {
        faculty_id: updated.faculty_id,
        status: updated.status,
        current_location_id: updated.current_location_id,
        updated_at: updated.updated_at,
      });
    }

    return res.json({
      success: true,
      message: 'Faculty status updated',
      data: updated,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getFacultyStatus, updateFacultyStatus };
