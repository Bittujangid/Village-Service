const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const upload = require('../middleware/upload');

// @route   POST /api/complaints
// @desc    Submit a new complaint with optional image
// @access  Public
router.post('/', upload.single('image'), complaintController.createComplaint);

// @route   GET /api/complaints/public-stats
// @desc    Get public statistics (resolved count, total wards, total complaints)
// @access  Public
router.get('/public-stats', complaintController.getPublicStats);

// @route   GET /api/complaints/track/:identifier
// @desc    Track complaint status by tracking ID or phone number
// @access  Public
router.get('/track/:identifier', complaintController.trackComplaint);

module.exports = router;
