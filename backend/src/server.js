// HTTP + Socket.io server entry point.
// Run with: npm run dev (nodemon) or npm start (node).
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./index');
const initFacultySocket = require('./sockets/facultySocket');

const PORT = process.env.PORT || 5000;

// Validate critical environment variables at startup (warn, don't crash
// for optional Gemini so the API can still run without AI).
const required = ['DATABASE_URL', 'JWT_SECRET'];
let missingCritical = false;
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    missingCritical = true;
  }
}
if (!process.env.GEMINI_API_KEY) {
  console.warn(
    'Warning: GEMINI_API_KEY is not set. /api/chat will return a controlled 503.'
  );
}
if (missingCritical) {
  console.error('Set the missing variables in your .env file. Exiting.');
  process.exit(1);
}

// Single HTTP server shared by Express and Socket.io.
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const io = new Server(server, {
  cors: {
    origin: clientUrl,
    methods: ['GET', 'POST'],
  },
});

// Make io available to controllers via req.app.get('io').
app.set('io', io);
initFacultySocket(io);

server.listen(PORT, () => {
  console.log(`Campus Management API listening on port ${PORT}`);
});
