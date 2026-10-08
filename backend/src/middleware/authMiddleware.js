// JWT authentication middleware.
// Reads "Authorization: Bearer <token>", verifies it, attaches req.user.
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Provide a Bearer token.',
    });
  }

  const token = header.slice(7).trim();
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Authentication token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Expected payload: { id, role }
    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
