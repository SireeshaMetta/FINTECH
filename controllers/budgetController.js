const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const Notification = require('../models/Notification');

// @desc    Get user budget for a month (default current)
// @route   GET /api/budgets
// @access  Private
exports.getBudget = async (req, res, next) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7); // format "YYYY-MM"
    const userId = req.user.id;

    let budget = await Budget.findOne({ userId, month });

    // Auto-create default template budget if not found, to ensure the UI has starting points
    if (!budget) {
      budget = await Budget.create({
        userId,
        month,
        amount: 3500,
        categoryBudgets: [
          { category: 'Food', amount: 800 },
          { category: 'Transport', amount: 400 },
          { category: 'Shopping', amount: 600 },
          { category: 'Medical', amount: 300 },
          { category: 'Bills', amount: 800 },
        ],
      });
    }

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set or update a budget (upsert)
// @route   POST /api/budgets
// @access  Private
exports.setBudget = async (req, res, next) => {
  try {
    const { month, amount, categoryBudgets } = req.body;
    const userId = req.user.id;

    if (!month || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please include month (YYYY-MM) and total budget amount',
      });
    }

    // Find and update or create
    const budget = await Budget.findOneAndUpdate(
      { userId, month },
      { amount, categoryBudgets },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check current month budget progress
// @route   GET /api/budgets/check
// @access  Private
exports.checkBudgetStatus = async (req, res, next) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const userId = req.user.id;

    const budget = await Budget.findOne({ userId, month });
    if (!budget) {
      return res.status(200).json({
        success: true,
        message: 'No budget configured for this month',
        status: { isExceeded: false, totalBudget: 0, totalSpent: 0 },
      });
    }

    // Calculate actual expenses for the month
    const startOfMonth = new Date(`${month}-01T00:00:00.000Z`);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59, 999);

    const expenses = await Expense.find({
      userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const categorySpentMap = {};
    expenses.forEach((e) => {
      categorySpentMap[e.category] = (categorySpentMap[e.category] || 0) + e.amount;
    });

    // Check category budgets
    const categoryReports = budget.categoryBudgets.map((cb) => {
      const spent = categorySpentMap[cb.category] || 0;
      return {
        category: cb.category,
        budgetLimit: cb.amount,
        spentAmount: spent,
        percent: cb.amount > 0 ? Math.round((spent / cb.amount) * 100) : 0,
        isExceeded: spent > cb.amount,
      };
    });

    const isExceeded = totalSpent > budget.amount;

    // Trigger notification if exceeded and not notified recently
    if (isExceeded) {
      const exists = await Notification.findOne({
        userId,
        type: 'budget_exceeded',
        title: `Monthly Budget Exceeded (${month})`,
      });

      if (!exists) {
        await Notification.create({
          userId,
          type: 'budget_exceeded',
          title: `Monthly Budget Exceeded (${month})`,
          message: `Your total spending of $${totalSpent.toFixed(2)} has exceeded your monthly budget configuration of $${budget.amount.toFixed(2)}.`,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        month,
        totalBudget: budget.amount,
        totalSpent,
        isExceeded,
        percentSpent: budget.amount > 0 ? Math.round((totalSpent / budget.amount) * 100) : 0,
        categoryBudgets: categoryReports,
      },
    });
  } catch (error) {
    next(error);
  }
};
