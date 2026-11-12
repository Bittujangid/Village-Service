const express = require('express');
const router = express.Router();
const multer = require('multer');
const { generateDescription } = require('../controllers/aiController');

// Memory storage for optional multipart file uploads (up to 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

/**
 * @route   POST /api/ai/generate-description
 * @desc    Generate complaint description using Vision AI from uploaded image, ward, category
 * @access  Public
 */
router.post('/generate-description', upload.single('image'), generateDescription);

module.exports = router;
