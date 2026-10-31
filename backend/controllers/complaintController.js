const Complaint = require('../models/Complaint');
const generateTrackingId = require('../utils/generateTrackingId');

/**
 * @desc    Submit a new complaint
 * @route   POST /api/complaints
 * @access  Public
 */
const createComplaint = async (req, res, next) => {
  try {
    const { citizenName, phone, wardNumber, category, description } = req.body;

    // Validate required fields
    if (!citizenName || !phone || !wardNumber || !category || !description) {
      return res.status(400).json({
        success: false,
        message: 'सभी आवश्यक विवरण भरें (All required fields must be provided: citizenName, phone, wardNumber, category, description)'
      });
    }

    // Validate 10-digit Indian phone
    const cleanPhone = phone.toString().trim();
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'कृपया एक मान्य 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें (Please provide a valid 10-digit Indian phone number)'
      });
    }

    // Validate ward number
    const parsedWard = parseInt(wardNumber, 10);
    if (isNaN(parsedWard) || parsedWard < 1 || parsedWard > 20) {
      return res.status(400).json({
        success: false,
        message: 'वार्ड नंबर 1 से 20 के बीच होना चाहिए (Ward number must be between 1 and 20)'
      });
    }

    // Validate description length
    if (description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'शिकायत का विवरण कम से कम 10 अक्षरों का होना चाहिए (Description must be at least 10 characters long)'
      });
    }

    // Extract image URL if file uploaded via Multer Cloudinary
    let imageUrl = '';
    if (req.file) {
      imageUrl = req.file.path || req.file.secure_url || req.file.url || '';
    }

    // Generate unique tracking ID
    let trackingId = '';
    let isUnique = false;
    while (!isUnique) {
      trackingId = generateTrackingId();
      const existing = await Complaint.findOne({ trackingId });
      if (!existing) {
        isUnique = true;
      }
    }

    // Create complaint
    const complaint = new Complaint({
      trackingId,
      citizenName: citizenName.trim(),
      phone: cleanPhone,
      wardNumber: parsedWard,
      category: category.trim(),
      description: description.trim(),
      imageUrl,
      status: 'Pending',
      adminRemarks: 'शिकायत दर्ज कर ली गई है।'
    });

    const savedComplaint = await complaint.save();

    return res.status(201).json({
      success: true,
      message: 'शिकायत सफलतापूर्वक दर्ज कर ली गई है। (Complaint registered successfully)',
      trackingId: savedComplaint.trackingId,
      data: savedComplaint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Track complaint status by tracking ID or citizen phone number
 * @route   GET /api/complaints/track/:identifier
 * @access  Public
 */
const trackComplaint = async (req, res, next) => {
  try {
    const raw = decodeURIComponent(req.params.identifier || '');
    const cleaned = raw.replace(/#/g, '').replace(/\s+/g, '').trim();

    if (!cleaned) {
      return res.status(400).json({
        success: false,
        message: 'कृपया ट्रैकिंग आईडी या मोबाइल नंबर प्रदान करें (Tracking ID or Phone is required)'
      });
    }

    const isPhoneSearch = /^[6-9]\d{9}$/.test(cleaned);

    // If searching by 10-digit mobile number, return all associated complaints
    if (isPhoneSearch) {
      const complaints = await Complaint.find({ phone: cleaned }).sort({ createdAt: -1 });

      if (!complaints || complaints.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'शिकायत नहीं मिली। कृपया ट्रैकिंग आईडी या फ़ोन नंबर जांचें।'
        });
      }

      return res.status(200).json({
        success: true,
        type: 'phone',
        count: complaints.length,
        complaints,
        data: complaints
      });
    }

    // Escape regex characters in trackingId for safety
    const escapedCleaned = cleaned.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Search by trackingId (case-insensitive with optional leading #) or phone
    const complaint = await Complaint.findOne({
      $or: [
        { trackingId: new RegExp(`^#?${escapedCleaned}$`, 'i') },
        { phone: cleaned }
      ]
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'शिकायत नहीं मिली। कृपया ट्रैकिंग आईडी या फ़ोन नंबर जांचें।'
      });
    }

    return res.status(200).json({
      success: true,
      type: 'trackingId',
      trackingId: complaint.trackingId,
      complaint,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get public statistics (resolved complaint count, total wards, total complaints)
 * @route   GET /api/complaints/public-stats
 * @access  Public
 */
const getPublicStats = async (req, res, next) => {
  try {
    const resolvedCount = await Complaint.countDocuments({
      status: { $in: ['Resolved', 'resolved', 'समाधान पूर्ण', 'निस्तारित', 'समाधान'] }
    });
    const totalComplaints = await Complaint.countDocuments({});

    return res.status(200).json({
      success: true,
      resolvedCount,
      totalWards: 7,
      totalComplaints,
      data: {
        resolvedCount,
        totalWards: 7,
        totalComplaints
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  trackComplaint,
  getPublicStats
};
