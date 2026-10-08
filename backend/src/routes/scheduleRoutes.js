const express = require('express');
const { getMySchedule } = require('../controllers/scheduleController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getMySchedule);

module.exports = router;
