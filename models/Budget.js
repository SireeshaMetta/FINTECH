const mongoose = require('mongoose');

const CategoryBudgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: [
      'Food',
      'Transport',
      'Shopping',
      'Medical',
      'Education',
      'Entertainment',
      'Bills',
      'Travel',
      'Other',
    ],
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Category budget limit must be positive'],
  },
});

const BudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    month: {
      type: String, // format "YYYY-MM"
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add total budget limit'],
      min: [0, 'Total budget limit must be positive'],
    },
    categoryBudgets: [CategoryBudgetSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one budget per user per month
BudgetSchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
