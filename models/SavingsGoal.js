const mongoose = require('mongoose');

const SavingsGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a savings goal title'],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please set a target savings amount'],
      min: [0.01, 'Target savings amount must be greater than 0'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Savings amount cannot be negative'],
    },
    deadline: {
      type: Date,
      required: [true, 'Please select a target deadline'],
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'failed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

SavingsGoalSchema.index({ userId: 1, deadline: 1 });

module.exports = mongoose.model('SavingsGoal', SavingsGoalSchema);
