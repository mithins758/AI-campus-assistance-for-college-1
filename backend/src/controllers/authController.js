// Auth controller: register, login, profile.
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { validateRegister, validateLogin } = require('../utils/validators');

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register — public, student/faculty only (no admin).
async function register(req, res, next) {
  try {
    const errors = validateRegister(req.body);
    if (errors.length > 0) {
      const isForbiddenAdmin =
        req.body && req.body.role === 'admin';
      return res.status(isForbiddenAdmin ? 403 : 400).json({
        success: false,
        message: errors[0],
        errors,
      });
    }

    const name = req.body.name.trim();
    const email = req.body.email.trim().toLowerCase();
    const role = req.body.role || 'student';
    const department = req.body.department
      ? String(req.body.department).trim() || null
      : null;

    // Reject duplicate email early with a clear 409.
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (existing.rowCount > 0) {
      return res
        .status(409)
        .json({ success: false, message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, department)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, department`,
      [name, email, passwordHash, role, department]
    );
    const user = result.rows[0];

    // Faculty members need a status row so they show up in listings.
    if (role === 'faculty') {
      await pool.query(
        `INSERT INTO faculty_status (faculty_id, status, current_location_id)
         VALUES ($1, 'in-cabin', NULL)
         ON CONFLICT (faculty_id) DO NOTHING`,
        [user.id]
      );
    }

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  } catch (err) {
    // Unique violation fallback (race condition).
    if (err && err.code === '23505') {
      return res
        .status(409)
        .json({ success: false, message: 'Email is already registered' });
    }
    return next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const errors = validateLogin(req.body);
    if (errors.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: errors[0], errors });
    }

    const email = req.body.email.trim().toLowerCase();

    const result = await pool.query(
      'SELECT id, name, email, password_hash, role, department FROM users WHERE email = $1',
      [email]
    );
    if (result.rowCount === 0) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(req.body.password, user.password_hash);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
}

// GET /api/auth/me — requires JWT.
async function me(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, department FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, me };
