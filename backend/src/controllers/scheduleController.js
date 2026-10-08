// Schedule controller — always scoped to the authenticated user.
const pool = require('../config/db');

// GET /api/schedule — returns only req.user.id schedules.
async function getMySchedule(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT
         s.id,
         s.subject_name,
         s.start_time,
         s.end_time,
         s.day_of_week,
         l.code AS location_code,
         l.name AS location_name,
         l.floor AS location_floor
       FROM schedules s
       JOIN locations l ON l.id = s.location_id
       WHERE s.user_id = $1
       ORDER BY s.day_of_week ASC, s.start_time ASC`,
      [req.user.id]
    );

    const data = result.rows.map((row) => ({
      id: row.id,
      subject_name: row.subject_name,
      start_time: row.start_time,
      end_time: row.end_time,
      day_of_week: row.day_of_week,
      location: {
        code: row.location_code,
        name: row.location_name,
        floor: row.location_floor,
      },
    }));

    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getMySchedule };
