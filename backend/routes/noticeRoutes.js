const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const auth = require('../middleware/auth');

// @route   GET /api/notices & /api/notices/public
// @desc    Get active notices (public)
// @access  Public
router.get('/', noticeController.getNotices);
router.get('/public', noticeController.getNotices);

// @route   POST /api/notices
// @desc    Create a new notice
// @access  Private (Admin)
router.post('/', auth, noticeController.createNotice);

// @route   PUT/PATCH /api/notices/:id
// @desc    Update a notice
// @access  Private (Admin)
router.patch('/:id', auth, noticeController.updateNotice);
router.put('/:id', auth, noticeController.updateNotice);

// @route   DELETE /api/notices/:id
// @desc    Delete or deactivate a notice
// @access  Private (Admin)
router.delete('/:id', auth, noticeController.deleteNotice);

module.exports = router;
