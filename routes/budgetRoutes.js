const express = require('express');
const { getBudget, setBudget, checkBudgetStatus } = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getBudget)
  .post(setBudget);

router.get('/status', checkBudgetStatus);

module.exports = router;
