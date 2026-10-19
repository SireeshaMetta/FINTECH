const User = require('../models/User');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const Notification = require('../models/Notification');
const FraudAlert = require('../models/FraudAlert');

// @desc    Get all users with search, role filters, and pagination
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid role (user or admin)',
      });
    }

    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Do not allow self demotion
    if (user._id.toString() === req.user.id && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot demote yourself from admin',
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account and all associated data (Cascade)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account',
      });
    }

    const userId = user._id;

    // Delete all linked records cascade
    await Expense.deleteMany({ userId });
    await Budget.deleteMany({ userId });
    await SavingsGoal.deleteMany({ userId });
    await Notification.deleteMany({ userId });
    await FraudAlert.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: `User ${user.name} and all related expenses, budgets, savings, notifications, and fraud logs deleted.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all system-wide expenses
// @route   GET /api/admin/expenses
// @access  Private/Admin
exports.getAllExpenses = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .populate('userId', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: expenses.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all system-wide fraud alerts
// @route   GET /api/admin/fraud
// @access  Private/Admin
exports.getAllFraudAlerts = async (req, res, next) => {
  try {
    const alerts = await FraudAlert.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Broadcast notification to all users
// @route   POST /api/admin/notifications/broadcast
// @access  Private/Admin
exports.broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, type = 'ai_recommendation' } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required for broadcasting',
      });
    }

    const users = await User.find({});
    const notifications = users.map(user => ({
      userId: user._id,
      title,
      message,
      type,
    }));

    await Notification.insertMany(notifications);

    res.status(200).json({
      success: true,
      message: `Successfully broadcasted to ${users.length} users.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system-wide stats and aggregations
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getSystemStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const standardUsers = await User.countDocuments({ role: 'user' });

    const totalExpensesCount = await Expense.countDocuments();
    const expenseAggregate = await Expense.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
        },
      },
    ]);

    const totalExpenseAmount = expenseAggregate[0]?.totalAmount || 0;
    const avgExpenseAmount = expenseAggregate[0]?.avgAmount || 0;

    const totalBudgets = await Budget.countDocuments();
    const totalSavingsGoals = await SavingsGoal.countDocuments();

    const activeFraudCount = await FraudAlert.countDocuments({ status: 'active' });
    const resolvedFraudCount = await FraudAlert.countDocuments({ status: 'resolved' });
    const dismissedFraudCount = await FraudAlert.countDocuments({ status: 'dismissed' });

    // Fraud breakdown by type
    const fraudBreakdown = await FraudAlert.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    // Budget category limits vs spent average (aggregate across all budgets)
    const budgetCategories = await Budget.aggregate([
      {
        $group: {
          _id: '$category',
          avgLimit: { $avg: '$limit' },
          totalLimit: { $sum: '$limit' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admin: adminUsers,
          user: standardUsers,
        },
        expenses: {
          totalCount: totalExpensesCount,
          totalAmount: Math.round(totalExpenseAmount),
          avgAmount: Math.round(avgExpenseAmount),
        },
        budgets: {
          total: totalBudgets,
          categories: budgetCategories,
        },
        savings: {
          totalGoals: totalSavingsGoals,
        },
        fraud: {
          active: activeFraudCount,
          resolved: resolvedFraudCount,
          dismissed: dismissedFraudCount,
          breakdown: fraudBreakdown,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system diagnostic and execution logs
// @route   GET /api/admin/logs
// @access  Private/Admin
exports.getSystemLogs = async (req, res, next) => {
  try {
    const memory = process.memoryUsage();
    const stats = {
      cpuUsage: process.cpuUsage(),
      memory: {
        rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
      },
      uptime: `${Math.round(process.uptime())} seconds`,
      platform: process.platform,
      nodeVersion: process.version,
      databaseStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    };

    // Simulated logs from express router transactions and database updates
    const mockLogs = [
      { timestamp: new Date(Date.now() - 5000), level: 'info', service: 'API_GATEWAY', message: 'GET /api/admin/stats authorized admin success' },
      { timestamp: new Date(Date.now() - 15000), level: 'info', service: 'FRAUD_ENGINE', message: 'Fraud auto-scanning complete' },
      { timestamp: new Date(Date.now() - 45000), level: 'info', service: 'OCR_SERVICE', message: 'Tesseract OCR engine warm-up check: OK' },
      { timestamp: new Date(Date.now() - 120000), level: 'info', service: 'DB_ADAPTER', message: 'MongoDB connection pool stats: 10 connections active' },
      { timestamp: new Date(Date.now() - 300000), level: 'warn', service: 'AUTH_SERVICE', message: 'Failed login attempt for user account admin@finguard.ai (Incorrect password)' },
    ];

    res.status(200).json({
      success: true,
      data: {
        system: stats,
        logs: mockLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};
