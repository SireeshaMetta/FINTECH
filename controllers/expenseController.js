const Expense = require('../models/Expense');
const mongoose = require('mongoose');

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res, next) => {
  try {
    const { title, amount, category, description, date, paymentMethod } = req.body;

    const expense = await Expense.create({
      userId: req.user.id,
      title,
      amount,
      category,
      description,
      date,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all expenses with filters, search, and pagination
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate, search, page = 1, limit = 10 } = req.query;

    // Build query object
    const query = { userId: req.user.id };

    // Filter by Category
    if (category) {
      query.category = category;
    }

    // Filter by Date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Search query on title/description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Executing pagination parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
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

// @desc    Get single expense by ID
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Check ownership
    if (expense.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource',
      });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Check ownership
    if (expense.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this resource',
      });
    }

    const { title, amount, category, description, date, paymentMethod } = req.body;

    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { title, amount, category, description, date, paymentMethod },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Check ownership
    if (expense.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this resource',
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense analytics & chart summaries
// @route   GET /api/expenses/analytics
// @access  Private
exports.getExpenseAnalytics = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // 1. Total expenses summary
    const totalSummary = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
        },
      },
    ]);

    // 2. Category breakdown
    const categoryData = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$category',
          value: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $project: { category: '$_id', value: 1, count: 1, _id: 0 } },
      { $sort: { value: -1 } },
    ]);

    // 3. Monthly expenses breakdown (Last 6 months)
    const startOfSixMonthsAgo = new Date();
    startOfSixMonthsAgo.setMonth(startOfSixMonthsAgo.getMonth() - 5);
    startOfSixMonthsAgo.setDate(1);
    startOfSixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyData = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfSixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Map month names
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const formattedMonthlyData = monthlyData.map((item) => {
      const monthIndex = item._id.month - 1;
      return {
        month: `${monthNames[monthIndex]} ${item._id.year}`,
        amount: item.total,
      };
    });

    // 4. Weekly spending breakdown (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyData = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formattedWeeklyData = weeklyData.map((item) => {
      const dayDate = new Date(item._id);
      const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
      return {
        day: dayName,
        date: item._id,
        amount: item.total,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        summary: totalSummary[0] || { totalAmount: 0, count: 0, avgAmount: 0 },
        categoryData,
        monthlyData: formattedMonthlyData,
        weeklyData: formattedWeeklyData,
      },
    });
  } catch (error) {
    next(error);
  }
};
