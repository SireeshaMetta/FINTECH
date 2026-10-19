const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseAnalytics,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg })),
    });
  }
  next();
};

const expenseValidationRules = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number greater than 0'),
  body('category')
    .isIn(['Food', 'Transport', 'Shopping', 'Medical', 'Education', 'Entertainment', 'Bills', 'Travel', 'Other'])
    .withMessage('Please specify a valid category'),
  body('date').isISO8601().withMessage('Please include a valid date'),
  body('paymentMethod')
    .optional()
    .isIn(['Cash', 'Card', 'UPI', 'Net Banking', 'Other'])
    .withMessage('Please select a valid payment method'),
];

// Secure all expense endpoints
router.use(protect);

router.get('/analytics', getExpenseAnalytics);

router.route('/')
  .post(expenseValidationRules, validate, createExpense)
  .get(getExpenses);

router.route('/:id')
  .get(getExpenseById)
  .put(expenseValidationRules, validate, updateExpense)
  .delete(deleteExpense);

module.exports = router;
