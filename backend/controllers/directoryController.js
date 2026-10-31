const Directory = require('../models/Directory');

/**
 * @desc    Get all village directory / contact entries
 * @route   GET /api/directory
 * @access  Public
 */
const getDirectory = async (req, res, next) => {
  try {
    const entries = await Directory.find()
      .sort({ priority: 1, createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDirectory
};
