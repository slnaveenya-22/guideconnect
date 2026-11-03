const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary automatically reads process.env.CLOUDINARY_URL!

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'guideconnect_docs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };