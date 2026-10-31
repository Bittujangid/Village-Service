const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Setup Cloudinary Storage for Multer
let storage;

try {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'gramseva/complaints',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
    }
  });
} catch (err) {
  console.warn('[Upload Middleware] CloudinaryStorage initialization fallback to memoryStorage:', err.message);
  storage = multer.memoryStorage();
}

// File filter to accept only image mimetypes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('केवल इमेज फाइलें (JPG, JPEG, PNG, WEBP) स्वीकार्य हैं! (Only image files are allowed)'), false);
  }
};

// Create Multer instance with 5MB file size limit
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  },
  fileFilter: fileFilter
});

// Single image upload middleware configured for 'image' field
const singleImageUpload = upload.single('image');

// Attach multer methods so the export can be used both as `upload.single('image')` or `upload` directly
singleImageUpload.single = (field) => upload.single(field);
singleImageUpload.array = (field, maxCount) => upload.array(field, maxCount);
singleImageUpload.fields = (fields) => upload.fields(fields);
singleImageUpload.multer = upload;

module.exports = singleImageUpload;
