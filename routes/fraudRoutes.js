const express = require('express');
const { scanForFraud, getAlerts, updateAlertStatus } = require('../controllers/fraudController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/scan', scanForFraud);
router.get('/alerts', getAlerts);
router.put('/alerts/:id', updateAlertStatus);

module.exports = router;
