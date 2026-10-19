const express = require('express');
const { uploadReceiptImage } = require('../controllers/ocrController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('receipt'), uploadReceiptImage);

module.exports = router;
