const cloudinary = require('cloudinary').v2;

const configureCloudinary = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  if (!name || name === 'mock_name' || !key || !secret) {
    console.log('Using simulated Cloudinary configuration (Mock values present).');
    return false;
  }

  try {
    cloudinary.config({
      cloud_name: name,
      api_key: key,
      api_secret: secret,
    });
    return true;
  } catch (err) {
    console.error('Failed to configure Cloudinary:', err.message);
    return false;
  }
};

module.exports = {
  cloudinary,
  configureCloudinary,
};
