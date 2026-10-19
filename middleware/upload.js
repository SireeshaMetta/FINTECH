const multer = require('multer');

// Multer Memory Storage Configuration
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow image formats only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Please upload an image file'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB Limit
  },
});

module.exports = upload;
