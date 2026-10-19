const mongoose = require('mongoose');

const FraudAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['High Value Transaction', 'Duplicate Record Detected', 'Suspicious Spending Category', 'Unusual Velocity'],
    },
    description: {
      type: String,
      default: '',
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'dismissed', 'resolved'],
      default: 'active',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

FraudAlertSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('FraudAlert', FraudAlertSchema);
