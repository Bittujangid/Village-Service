const express = require('express');
const router = express.Router();
const directoryController = require('../controllers/directoryController');

// @route   GET /api/directory
// @desc    Get all village directory & emergency contacts
// @access  Public
router.get('/', directoryController.getDirectory);

module.exports = router;
