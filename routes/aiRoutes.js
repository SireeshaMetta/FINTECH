const express = require('express');
const { getInsights, chatWithAssistant } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Guard all AI helper endpoints
router.use(protect);

router.get('/insights', getInsights);
router.post('/chat', chatWithAssistant);

module.exports = router;
