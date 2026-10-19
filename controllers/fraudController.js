const Expense = require('../models/Expense');
const FraudAlert = require('../models/FraudAlert');
const Notification = require('../models/Notification');

// @desc    Scan and identify fraud signals in expenses ledger
// @route   POST /api/fraud/scan
// @access  Private
exports.scanForFraud = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Get all user expenses
    const expenses = await Expense.find({ userId }).sort({ date: -1 });

    const alertsCreated = [];

    for (let i = 0; i < expenses.length; i++) {
      const exp = expenses[i];

      // Check 1: High value transaction
      if (exp.amount > 1000) {
        // Check if alert already exists
        const exists = await FraudAlert.findOne({ userId, expenseId: exp._id, type: 'High Value Transaction' });
        if (!exists) {
          const alert = await FraudAlert.create({
            userId,
            expenseId: exp._id,
            title: `High value transaction: "${exp.title}"`,
            amount: exp.amount,
            category: exp.category,
            type: 'High Value Transaction',
            description: `The expense amount of $${exp.amount.toFixed(2)} exceeds the single-charge limit benchmark of $1,000.00.`,
            riskScore: 75,
            date: exp.date,
          });

          // Register in notifications
          await Notification.create({
            userId,
            type: 'fraud_alert',
            title: 'High Amount Fraud Alert!',
            message: `A charge of $${exp.amount} for "${exp.title}" triggered a high value warning.`,
          });

          alertsCreated.push(alert);
        }
      }

      // Check 2: Duplicate transaction (same amount, category, title within 15 minutes)
      const fifteenMins = 15 * 60 * 1000;
      const duplicates = expenses.filter((other) => {
        if (other._id.toString() === exp._id.toString()) return false;
        const timeDiff = Math.abs(new Date(other.date).getTime() - new Date(exp.date).getTime());
        return (
          other.amount === exp.amount &&
          other.category === exp.category &&
          other.title.toLowerCase().trim() === exp.title.toLowerCase().trim() &&
          timeDiff <= fifteenMins
        );
      });

      if (duplicates.length > 0) {
        const exists = await FraudAlert.findOne({ userId, expenseId: exp._id, type: 'Duplicate Record Detected' });
        if (!exists) {
          const alert = await FraudAlert.create({
            userId,
            expenseId: exp._id,
            title: `Duplicate charge warning: "${exp.title}"`,
            amount: exp.amount,
            category: exp.category,
            type: 'Duplicate Record Detected',
            description: `Identical transaction matching $${exp.amount.toFixed(2)} detected within 15 minutes of an existing ledger entry.`,
            riskScore: 60,
            date: exp.date,
          });

          await Notification.create({
            userId,
            type: 'fraud_alert',
            title: 'Duplicate Charge Alert',
            message: `Double transaction detected for "${exp.title}" matching $${exp.amount}.`,
          });

          alertsCreated.push(alert);
        }
      }

      // Check 3: Suspicious category spending limit
      if (['Entertainment', 'Other', 'Shopping'].includes(exp.category) && exp.amount > 300) {
        const exists = await FraudAlert.findOne({ userId, expenseId: exp._id, type: 'Suspicious Spending Category' });
        if (!exists) {
          const alert = await FraudAlert.create({
            userId,
            expenseId: exp._id,
            title: `Unusual category spend: "${exp.title}"`,
            amount: exp.amount,
            category: exp.category,
            type: 'Suspicious Spending Category',
            description: `A large amount ($${exp.amount.toFixed(2)}) was classified under "${exp.category}". This is anomalous for non-utility categories.`,
            riskScore: 45,
            date: exp.date,
          });

          alertsCreated.push(alert);
        }
      }
    }

    res.status(200).json({
      success: true,
      count: alertsCreated.length,
      data: alertsCreated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user fraud alerts
// @route   GET /api/fraud/alerts
// @access  Private
exports.getAlerts = async (req, res, next) => {
  try {
    const alerts = await FraudAlert.find({ userId: req.user.id }).sort({ date: -1 });

    // Calculate dynamic user risk score
    // Take weighted average of active alerts. If no alerts, risk is 0
    const activeAlerts = alerts.filter(a => a.status === 'active');
    let cumulativeRisk = 0;
    if (activeAlerts.length > 0) {
      const maxScore = Math.max(...activeAlerts.map(a => a.riskScore));
      cumulativeRisk = Math.min(maxScore + (activeAlerts.length - 1) * 8, 100);
    }

    res.status(200).json({
      success: true,
      riskScore: Math.round(cumulativeRisk),
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update alert status (dismiss / resolve)
// @route   PUT /api/fraud/alerts/:id
// @access  Private
exports.updateAlertStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // active, dismissed, resolved
    let alert = await FraudAlert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Fraud alert record not found',
      });
    }

    if (alert.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to change this alert status',
      });
    }

    alert = await FraudAlert.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};
