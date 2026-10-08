// Location controller.
const pool = require('../config/db');
const { isValidLocationCode } = require('../utils/validators');

// GET /api/locations
async function getAllLocations(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT id, code, name, type, floor, created_at FROM locations ORDER BY code ASC'
    );
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    return next(err);
  }
}

// GET /api/locations/:code (e.g. LAB-201)
async function getLocationByCode(req, res, next) {
  try {
    const raw = req.params.code;
    if (!isValidLocationCode(raw)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid location code' });
    }
    const code = raw.trim().toUpperCase();
    const result = await pool.query(
      'SELECT id, code, name, type, floor, created_at FROM locations WHERE code = $1',
      [code]
    );
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Location not found' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getAllLocations, getLocationByCode };
