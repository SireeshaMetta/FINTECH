const { cloudinary, configureCloudinary } = require('../config/cloudinary');

// @desc    Upload Receipt image to Cloudinary
// @route   POST /api/ocr/upload
// @access  Private
exports.uploadReceiptImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload',
      });
    }

    const isCloudinaryActive = configureCloudinary();
    if (!isCloudinaryActive) {
      // Graceful fallback for mock configurations
      return res.status(200).json({
        success: true,
        message: 'Image uploaded successfully (Simulated)',
        url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80',
      });
    }

    // Upload buffer stream to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'finguard_receipts' },
      (error, result) => {
        if (error) {
          return res.status(500).json({
            success: false,
            message: 'Failed to upload receipt image to Cloudinary',
            error: error.message,
          });
        }
        res.status(200).json({
          success: true,
          message: 'Receipt image uploaded successfully',
          url: result.secure_url,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    next(error);
  }
};
