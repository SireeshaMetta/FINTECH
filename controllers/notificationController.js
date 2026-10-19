const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const unreadCount = await Notification.countDocuments({ userId: req.user.id, read: false });

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark specific or all notifications as read
// @route   PUT /api/notifications
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.body;
    const userId = req.user.id;

    if (id) {
      // Mark specific notification as read
      const notification = await Notification.findOneAndUpdate(
        { _id: id, userId },
        { read: true },
        { new: true }
      );
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }
      return res.status(200).json({
        success: true,
        data: notification,
      });
    }

    // Mark all as read
    await Notification.updateMany({ userId, read: false }, { read: true });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user.id });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notification removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
