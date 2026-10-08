const express = require('express');
const { chat } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Mounted at /api in index.js, so this serves POST /api/chat.
router.post('/chat', authMiddleware, chat);

module.exports = router;
