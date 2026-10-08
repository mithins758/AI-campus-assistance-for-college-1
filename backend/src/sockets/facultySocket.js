// Socket.io faculty status wiring.
// The REST API is the source of truth; sockets only broadcast updates.
const pool = require('../config/db');

function initFacultySocket(io) {
  io.on('connection', async (socket) => {
    console.log('Socket client connected:', socket.id);

    // Send a snapshot of current faculty status on connect (best effort).
    try {
      const result = await pool.query(
        `SELECT
           u.id AS faculty_id,
           u.name,
           fs.status,
           fs.current_location_id,
           fs.updated_at
         FROM users u
         JOIN faculty_status fs ON fs.faculty_id = u.id
         WHERE u.role = 'faculty'
         ORDER BY u.name ASC`
      );
      socket.emit('faculty_status_snapshot', result.rows);
    } catch (err) {
      console.error('Failed to send faculty snapshot:', err.message);
    }

    socket.on('disconnect', () => {
      console.log('Socket client disconnected:', socket.id);
    });
  });
}

module.exports = initFacultySocket;
