const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const { loginLimiterMiddleware } = require('../middleware/loginLimiter');

// @route   POST /api/admin/login
// @desc    Admin login with 2FA Master PIN and rate limiting
// @access  Public
router.post('/login', loginLimiterMiddleware, adminController.login);

// @route   POST /api/admin/forgot-password
// @desc    Request password reset link via registered email
// @access  Public
router.post('/forgot-password', adminController.forgotPassword);

// @route   POST /api/admin/reset-password/:token
// @desc    Reset password using email token
// @access  Public
router.post('/reset-password/:token', adminController.resetPassword);

// @route   GET /api/admin/complaints
// @desc    Get paginated and filtered list of complaints
// @access  Private (Admin)
router.get('/complaints', auth, adminController.getComplaints);

// @route   PATCH /api/admin/complaints/:id/status
// @desc    Update complaint status and admin remarks
// @access  Private (Admin)
router.patch('/complaints/:id/status', auth, adminController.updateComplaintStatus);

const noticeController = require('../controllers/noticeController');

// @route   GET /api/admin/stats
// @desc    Get dashboard metrics & statistics
// @access  Private (Admin)
router.get('/stats', auth, adminController.getDashboardStats);

// @route   GET /api/admin/analytics/ward-insights
// @desc    Get ward-wise analytics and heatmap data across all 7 wards
// @access  Private (Admin)
router.get('/analytics/ward-insights', auth, adminController.getWardAnalytics);

// @route   GET /api/admin/notices
// @desc    Get notices (admin)
// @access  Private (Admin)
router.get('/notices', auth, noticeController.getNotices);

// @route   POST /api/admin/notices
// @desc    Create notice (admin)
// @access  Private (Admin)
router.post('/notices', auth, noticeController.createNotice);

// @route   PUT/PATCH /api/admin/notices/:id
// @desc    Update notice (admin)
// @access  Private (Admin)
router.patch('/notices/:id', auth, noticeController.updateNotice);
router.put('/notices/:id', auth, noticeController.updateNotice);

// @route   DELETE /api/admin/notices/:id
// @desc    Delete notice (admin)
// @access  Private (Admin)
router.delete('/notices/:id', auth, noticeController.deleteNotice);

module.exports = router;
