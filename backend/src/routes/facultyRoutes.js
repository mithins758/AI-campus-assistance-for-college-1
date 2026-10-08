const express = require('express');
const {
  getFacultyStatus,
  updateFacultyStatus,
} = require('../controllers/facultyController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/status', authMiddleware, getFacultyStatus);
router.patch(
  '/:id/status',
  authMiddleware,
  authorizeRoles('faculty', 'admin'),
  updateFacultyStatus
);

module.exports = router;
