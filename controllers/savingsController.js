const SavingsGoal = require('../models/SavingsGoal');
const Notification = require('../models/Notification');

// @desc    Create new savings goal
// @route   POST /api/savings
// @access  Private
exports.createGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, deadline, currentAmount } = req.body;

    const goal = await SavingsGoal.create({
      userId: req.user.id,
      title,
      targetAmount,
      deadline,
      currentAmount: currentAmount || 0,
    });

    res.status(201).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user savings goals
// @route   GET /api/savings
// @access  Private
exports.getGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user.id }).sort({ deadline: 1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a savings goal (add savings progress)
// @route   PUT /api/savings/:id
// @access  Private
exports.updateGoal = async (req, res, next) => {
  try {
    let goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found',
      });
    }

    if (goal.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this goal',
      });
    }

    const { title, targetAmount, currentAmount, deadline, status } = req.body;

    // Check if target is met
    let finalStatus = status || goal.status;
    const finalCurrent = currentAmount !== undefined ? parseFloat(currentAmount) : goal.currentAmount;
    const finalTarget = targetAmount !== undefined ? parseFloat(targetAmount) : goal.targetAmount;

    if (finalCurrent >= finalTarget && goal.status !== 'completed') {
      finalStatus = 'completed';

      // Log notification
      await Notification.create({
        userId: req.user.id,
        type: 'goal_completed',
        title: `Savings Goal Completed! 🎉`,
        message: `Congratulations! You have reached your savings goal of $${finalTarget.toFixed(2)} for "${title || goal.title}".`,
      });
    }

    goal = await SavingsGoal.findByIdAndUpdate(
      req.params.id,
      {
        title,
        targetAmount: finalTarget,
        currentAmount: finalCurrent,
        deadline,
        status: finalStatus,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete savings goal
// @route   DELETE /api/savings/:id
// @access  Private
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found',
      });
    }

    if (goal.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this goal',
      });
    }

    await goal.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Savings goal deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
