const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  deleteAccount,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper middleware to handle express-validator results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg })),
    });
  }
  next();
};

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Please include a valid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6 or more characters'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please include a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post('/logout', logout);

router.post(
  '/forgotpassword',
  [body('email').isEmail().withMessage('Please include a valid email').normalizeEmail()],
  validate,
  forgotPassword
);

router.put(
  '/resetpassword/:resettoken',
  [body('password').isLength({ min: 6 }).withMessage('Password must be 6 or more characters')],
  validate,
  resetPassword
);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.delete('/deleteaccount', protect, deleteAccount);
router.put(
  '/updatepassword',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be 6 or more characters'),
  ],
  protect,
  validate,
  updatePassword
);

module.exports = router;
