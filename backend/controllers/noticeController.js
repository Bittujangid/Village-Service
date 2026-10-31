const Notice = require('../models/Notice');

/**
 * @desc    Get active notices (public)
 * @route   GET /api/notices or /api/notices/public
 * @access  Public
 */
const getNotices = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10);
    const query = Notice.find({ isActive: { $ne: false } }).sort({ createdAt: -1 });
    if (limit && !isNaN(limit)) {
      query.limit(limit);
    }
    const notices = await query;

    return res.status(200).json({
      success: true,
      count: notices.length,
      notices,
      data: notices
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new notice
 * @route   POST /api/notices or /api/admin/notices
 * @access  Private (Admin)
 */
const createNotice = async (req, res, next) => {
  try {
    const { title, description, content, category, isImportant } = req.body;
    const desc = (description || content || '').trim();

    if (!title || !desc) {
      return res.status(400).json({
        success: false,
        message: 'सूचना का शीर्षक और विवरण आवश्यक हैं (Title and description are required)'
      });
    }

    const noticeData = {
      title: title.trim(),
      description: desc,
      category: (category || 'सामान्य').trim(),
      isImportant: isImportant === true || isImportant === 'true',
      isActive: true
    };

    const notice = new Notice(noticeData);
    const savedNotice = await notice.save();

    return res.status(201).json({
      success: true,
      message: 'सूचना सफलतापूर्वक प्रकाशित की गई (Notice created successfully)',
      data: savedNotice,
      notice: savedNotice
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a notice
 * @route   PUT/PATCH /api/notices/:id or /api/admin/notices/:id
 * @access  Private (Admin)
 */
const updateNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, content, category, isImportant, isActive } = req.body;

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'सूचना नहीं मिली (Notice not found)'
      });
    }

    if (title) notice.title = title.trim();
    if (description || content) notice.description = (description || content).trim();
    if (category) notice.category = category.trim();
    if (isImportant !== undefined) notice.isImportant = isImportant;
    if (isActive !== undefined) notice.isActive = isActive;

    const savedNotice = await notice.save();
    return res.status(200).json({
      success: true,
      message: 'सूचना अपडेट कर दी गई है (Notice updated successfully)',
      data: savedNotice,
      notice: savedNotice
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete or deactivate a notice
 * @route   DELETE /api/notices/:id or /api/admin/notices/:id
 * @access  Private (Admin)
 */
const deleteNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { hardDelete } = req.query;

    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'सूचना नहीं मिली (Notice not found)'
      });
    }

    if (hardDelete === 'true' || hardDelete === true) {
      await Notice.findByIdAndDelete(id);
      return res.status(200).json({
        success: true,
        message: 'सूचना को स्थायी रूप से हटा दिया गया है (Notice permanently deleted)'
      });
    }

    // Default: deactivate or delete
    await Notice.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'सूचना हटा दी गई है (Notice deleted successfully)'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotices,
  getPublicNotices: getNotices,
  createNotice,
  updateNotice,
  deleteNotice
};
