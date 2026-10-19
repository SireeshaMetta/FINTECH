const express = require('express');
const {
  getUsers,
  updateUserRole,
  deleteUser,
  getAllExpenses,
  getAllFraudAlerts,
  broadcastNotification,
  getSystemStats,
  getSystemLogs,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Guard all endpoints under admin panel - authentication + authorization
router.use(protect);
router.use(authorize('admin'));

router.route('/users')
  .get(getUsers);

router.route('/users/:id')
  .delete(deleteUser);

router.put('/users/:id/role', updateUserRole);

router.get('/expenses', getAllExpenses);
router.get('/fraud', getAllFraudAlerts);
router.get('/stats', getSystemStats);
router.get('/logs', getSystemLogs);
router.post('/notifications/broadcast', broadcastNotification);

module.exports = router;
