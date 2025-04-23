const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage for items
const itemStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'item-finder/items',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

// Configure storage for user avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'item-finder/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }]
  }
});

// Create multer upload instances
const uploadItem = multer({ storage: itemStorage });
const uploadAvatar = multer({ storage: avatarStorage });

module.exports = { 
  cloudinary, 
  uploadItem, 
  uploadAvatar 
};