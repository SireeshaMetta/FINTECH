const express = require('express');
const { createGoal, getGoals, updateGoal, deleteGoal } = require('../controllers/savingsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.route('/:id')
  .put(updateGoal)
  .delete(deleteGoal);

module.exports = router;
