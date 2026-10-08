const express = require('express');
const {
  getAllLocations,
  getLocationByCode,
} = require('../controllers/locationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', getAllLocations);
router.get('/:code', getLocationByCode);

module.exports = router;
