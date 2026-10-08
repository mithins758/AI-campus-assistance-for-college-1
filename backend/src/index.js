// Express app configuration (no HTTP listening here — see server.js).
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const locationRoutes = require('./routes/locationRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const aiRoutes = require('./routes/aiRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// JSON body parsing.
app.use(express.json());

// CORS restricted to the configured frontend origin.
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(
  cors({
    origin: clientUrl,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health endpoint.
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Campus Management API is running' });
});

// Route mounting.
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api', aiRoutes);

// 404 + global error handler (must be last).
app.use(notFound);
app.use(errorHandler);

module.exports = app;
