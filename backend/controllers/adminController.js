const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Complaint = require('../models/Complaint');
const { sendEmail, generateResetPasswordEmailHtml } = require('../utils/sendEmail');
const { recordFailedAttempt, resetFailedAttempts } = require('../middleware/loginLimiter');

/**
 * @desc    Admin authentication & token generation with 2FA Master PIN and Rate Limiting
 * @route   POST /api/admin/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { username, password, pin } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'कृपया उपयोगकर्ता नाम और पासवर्ड दोनों दर्ज करें (Username and password are required)'
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const admin = await Admin.findOne({ username: cleanUsername });

    if (!admin) {
      const failResult = recordFailedAttempt(req);
      if (failResult.isLocked) {
        return res.status(429).json({
          success: false,
          message: 'सुरक्षा कारणों से लॉगिन 15 मिनट के लिए लॉक कर दिया गया है। कृपया 15 मिनट बाद पुनः प्रयास करें। (Too many failed attempts. Account locked for 15 minutes.)',
          locked: true,
          remainingMinutes: 15
        });
      }
      return res.status(401).json({
        success: false,
        message: `अमान्य क्रेडेंशियल्स: उपयोगकर्ता नाम या पासवर्ड गलत है (${failResult.remainingAttempts} प्रयास शेष) (Invalid username or password)`
      });
    }

    // Check if admin account in database is locked
    if (admin.isLocked()) {
      const remainingMinutes = Math.max(1, Math.ceil((admin.lockUntil.getTime() - Date.now()) / 60000));
      return res.status(429).json({
        success: false,
        message: `सुरक्षा कारणों से लॉगिन 15 मिनट के लिए लॉक कर दिया गया है। कृपया ${remainingMinutes} मिनट बाद पुनः प्रयास करें। (Account locked for 15 minutes.)`,
        locked: true,
        remainingMinutes
      });
    }

    // Step 1: Validate Password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      admin.loginAttempts = (admin.loginAttempts || 0) + 1;
      const failResult = recordFailedAttempt(req);

      if (admin.loginAttempts >= 5 || failResult.isLocked) {
        admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        await admin.save();
        return res.status(429).json({
          success: false,
          message: 'सुरक्षा कारणों से लॉगिन 15 मिनट के लिए लॉक कर दिया गया है। कृपया 15 मिनट बाद पुनः प्रयास करें। (Too many failed attempts. Account locked for 15 minutes.)',
          locked: true,
          remainingMinutes: 15
        });
      }

      await admin.save();
      const remaining = Math.max(0, 5 - admin.loginAttempts);
      return res.status(401).json({
        success: false,
        message: `अमान्य क्रेडेंशियल्स: उपयोगकर्ता नाम या पासवर्ड गलत है (${remaining} प्रयास शेष) (Invalid username or password - ${remaining} attempts remaining)`
      });
    }

    // Step 2: Validate 6-Digit Security PIN
    // If PIN is not provided in request body, return requirePin prompt (Step 1 successful)
    if (pin === undefined || pin === null || pin === '') {
      return res.status(200).json({
        success: true,
        requirePin: true,
        message: 'क्रेडेंशियल्स सत्यापित। कृपया 6-अंकीय सुरक्षा पिन दर्ज करें (Credentials verified. Please enter 6-digit Security PIN)',
        user: {
          id: admin._id,
          username: admin.username
        }
      });
    }

    // Verify 6-digit format and validate against hashed security PIN
    const cleanPin = pin.toString().trim();
    const isFormatValid = /^\d{6}$/.test(cleanPin);
    const isPinMatch = isFormatValid && (await admin.comparePin(cleanPin));

    if (!isPinMatch) {
      admin.loginAttempts = (admin.loginAttempts || 0) + 1;
      const failResult = recordFailedAttempt(req);

      if (admin.loginAttempts >= 5 || failResult.isLocked) {
        admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        await admin.save();
        return res.status(429).json({
          success: false,
          message: 'सुरक्षा कारणों से लॉगिन 15 मिनट के लिए लॉक कर दिया गया है। कृपया 15 मिनट बाद पुनः प्रयास करें। (Too many failed attempts. Account locked for 15 minutes.)',
          locked: true,
          remainingMinutes: 15
        });
      }

      await admin.save();
      const remaining = Math.max(0, 5 - admin.loginAttempts);
      return res.status(401).json({
        success: false,
        message: `अमान्य सुरक्षा पिन (${remaining} प्रयास शेष) (Invalid Security PIN - ${remaining} attempts remaining)`
      });
    }

    // Authentication Successful! Reset failure counters
    admin.loginAttempts = 0;
    admin.lockUntil = null;
    await admin.save();
    resetFailedAttempts(req);

    // Issue JWT token with short expiration (8 hours)
    const secret = process.env.JWT_SECRET || 'gramseva_jwt_secure_secret_key_2026_village_governance';
    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        role: admin.role
      },
      secret,
      { expiresIn: '8h' }
    );

    // Set secure httpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 8 * 60 * 60 * 1000 // 8 hours
    });

    return res.status(200).json({
      success: true,
      message: 'सफलतापूर्वक लॉगिन किया गया (Login successful)',
      token,
      expiresIn: 28800, // 8 hours in seconds
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated and filtered complaints list
 * @route   GET /api/admin/complaints
 * @access  Private (Admin)
 */
const getComplaints = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const { status, wardNumber, ward, search } = req.query;

    const queryFilter = {};

    // Filter by status if provided (case-insensitive / Hindi alias support)
    if (status && status.trim()) {
      const lower = status.trim().toLowerCase();
      if (lower === 'pending' || status === 'लंबित') {
        queryFilter.status = 'Pending';
      } else if (
        ['in-progress', 'in_progress', 'in progress'].includes(lower) ||
        status === 'प्रगति पर'
      ) {
        queryFilter.status = 'In Progress';
      } else if (
        lower === 'resolved' ||
        status === 'समाधान पूर्ण' ||
        status === 'निस्तारित'
      ) {
        queryFilter.status = 'Resolved';
      } else {
        queryFilter.status = status;
      }
    }

    // Filter by wardNumber if provided (supports both wardNumber and ward params)
    const wardVal = wardNumber || ward;
    if (wardVal) {
      const parsedWard = parseInt(wardVal, 10);
      if (!isNaN(parsedWard)) {
        queryFilter.wardNumber = parsedWard;
      }
    }

    // Optional text search on trackingId, citizenName, or phone
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      queryFilter.$or = [
        { trackingId: searchRegex },
        { citizenName: searchRegex },
        { phone: searchRegex }
      ];
    }

    const total = await Complaint.countDocuments(queryFilter);
    const totalPages = Math.ceil(total / limit) || 1;

    const complaints = await Complaint.find(queryFilter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      total,
      complaints,
      data: complaints,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update complaint status and admin remarks
 * @route   PATCH /api/admin/complaints/:id/status
 * @access  Private (Admin)
 */
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body;

    let normalizedStatus = status;
    if (status) {
      const lower = status.trim().toLowerCase();
      if (lower === 'pending' || status === 'लंबित') {
        normalizedStatus = 'Pending';
      } else if (
        ['in-progress', 'in_progress', 'in progress'].includes(lower) ||
        status === 'प्रगति पर'
      ) {
        normalizedStatus = 'In Progress';
      } else if (
        lower === 'resolved' ||
        status === 'समाधान पूर्ण' ||
        status === 'निस्तारित'
      ) {
        normalizedStatus = 'Resolved';
      } else if (['Pending', 'In Progress', 'Resolved'].includes(status)) {
        normalizedStatus = status;
      } else {
        return res.status(400).json({
          success: false,
          message: 'अमान्य स्थिति। मान्य स्थितियां: Pending, In Progress, Resolved'
        });
      }
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'शिकायत नहीं मिली (Complaint not found)'
      });
    }

    if (normalizedStatus) {
      complaint.status = normalizedStatus;
    }

    if (adminRemarks !== undefined) {
      complaint.adminRemarks = adminRemarks.trim();
    }

    const updatedComplaint = await complaint.save();

    return res.status(200).json({
      success: true,
      message: 'शिकायत की स्थिति सफलतापूर्वक अपडेट की गई (Complaint status updated successfully)',
      data: updatedComplaint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard metrics & counts
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const total = await Complaint.countDocuments();

    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: { $toLower: "$status" },
          count: { $sum: 1 }
        }
      }
    ]);

    let pending = 0;
    let inProgress = 0;
    let resolved = 0;

    stats.forEach(item => {
      const statusKey = (item._id || '').trim().toLowerCase();
      if (statusKey === 'pending' || statusKey === 'लंबित') {
        pending += item.count;
      } else if (
        ['in-progress', 'in_progress', 'in progress'].includes(statusKey) ||
        statusKey === 'प्रगति पर'
      ) {
        inProgress += item.count;
      } else if (
        statusKey === 'resolved' ||
        statusKey === 'समाधान पूर्ण' ||
        statusKey === 'निस्तारित'
      ) {
        resolved += item.count;
      }
    });

    const result = {
      total,
      pending,
      inProgress,
      resolved
    };

    return res.status(200).json({
      success: true,
      ...result,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request password reset token via email
 * @route   POST /api/admin/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const rawIdentifier = req.body.emailOrUsername || req.body.username || req.body.email;
    if (!rawIdentifier || !rawIdentifier.trim()) {
      return res.status(400).json({
        success: false,
        message: 'कृपया अपना पंजीकृत उपयोगकर्ता नाम (Username) या ईमेल दर्ज करें'
      });
    }

    const identifier = rawIdentifier.trim().toLowerCase();

    // Find admin by either username or email
    const admin = await Admin.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'इस विवरण से कोई अधिकृत एडमिन खाता नहीं मिला (No authorized admin account found)'
      });
    }

    if (!admin.email) {
      return res.status(400).json({
        success: false,
        message: 'इस एडमिन खाते से कोई ईमेल पता संलग्न नहीं है। कृपया तकनीकी सहायता से संपर्क करें।'
      });
    }

    // Generate secure random hex token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expireMinutes = 15;
    const expires = new Date(Date.now() + expireMinutes * 60 * 1000); // 15 mins

    // Save hashed token and expiry to DB directly
    await Admin.collection.updateOne(
      { _id: admin._id },
      {
        $set: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: expires,
          updatedAt: new Date()
        }
      }
    );

    // Construct reset password URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const cleanFrontendUrl = frontendUrl.replace(/\/$/, '');
    const resetUrl = `${cleanFrontendUrl}/admin/reset-password/${token}`;

    // Render HTML email body
    const emailHtml = generateResetPasswordEmailHtml({
      resetUrl,
      username: admin.username,
      expireMinutes
    });

    // Send email
    await sendEmail({
      to: admin.email,
      subject: 'ग्राम पंचायत सहरी पोर्टल - पासवर्ड रीसेट अनुरोध (Password Reset Request)',
      html: emailHtml,
      text: `नमस्ते ${admin.username},\n\nग्राम पंचायत सहरी प्रशासन पोर्टल खाते के लिए पासवर्ड रीसेट अनुरोध प्राप्त हुआ है।\nपासवर्ड रीसेट करने के लिए नीचे दिए गए लिंक पर जाएं:\n${resetUrl}\n\nयह लिंक ${expireMinutes} मिनट तक ही मान्य है।\nयदि आपने यह अनुरोध नहीं किया था, तो इसे अनदेखा करें।`
    });

    // Masked email for display (e.g. ad***@gramseva.in)
    const maskedEmail = admin.email.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + '*'.repeat(Math.max(1, b.length)));

    return res.status(200).json({
      success: true,
      message: `पासवर्ड रीसेट लिंक आपके पंजीकृत ईमेल (${maskedEmail}) पर भेज दिया गया है।`,
      email: maskedEmail
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset admin password using token
 * @route   POST /api/admin/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const rawToken = req.params.token;
    if (!rawToken || !rawToken.trim()) {
      return res.status(400).json({
        success: false,
        message: 'अमान्य रीसेट टोकन (Invalid reset token)'
      });
    }

    const { password, confirmPassword } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए (Password must be at least 6 characters)'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'दोनों पासवर्ड मेल नहीं खाते हैं (Passwords do not match)'
      });
    }

    // Hash token with SHA-256 to compare with DB
    const hashedToken = crypto.createHash('sha256').update(rawToken.trim()).digest('hex');

    // Find admin with matching token that hasn't expired
    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'रीसेट लिंक अमान्य या समाप्त (expired) हो चुका है। कृपया दोबारा अनुरोध करें।'
      });
    }

    // Hash new password using 12 salt rounds
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear reset tokens
    await Admin.collection.updateOne(
      { _id: admin._id },
      {
        $set: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
          updatedAt: new Date()
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: 'पासवर्ड सफलतापूर्वक बदल दिया गया है। अब आप नए पासवर्ड के साथ लॉगिन कर सकते हैं।'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get ward-wise insights, heatmap data and analytics
 * @route   GET /api/admin/analytics/ward-insights
 * @access  Private (Admin)
 */
const getWardAnalytics = async (req, res, next) => {
  try {
    const allComplaints = await Complaint.find({}).lean();

    const TOTAL_WARDS = 7;
    const wardMap = {};
    for (let w = 1; w <= TOTAL_WARDS; w++) {
      wardMap[w] = {
        wardNumber: w,
        totalComplaints: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        rejected: 0,
        categoryCounts: {}
      };
    }

    const overallCategoryCounts = {};
    let totalAllComplaints = 0;
    let totalResolvedAll = 0;
    let totalResolutionDaysAll = 0;
    let resolvedCountWithDates = 0;

    allComplaints.forEach((c) => {
      totalAllComplaints++;
      const wardNum = Number(c.wardNumber);
      const status = (c.status || '').toLowerCase().trim();
      const category = (c.category || 'अन्य').trim();

      overallCategoryCounts[category] = (overallCategoryCounts[category] || 0) + 1;

      const isResolved =
        status === 'resolved' ||
        status === 'समाधान पूर्ण' ||
        status === 'निस्तारित' ||
        status === 'समाधान';

      if (isResolved) {
        totalResolvedAll++;
        if (c.createdAt && c.updatedAt && new Date(c.updatedAt) > new Date(c.createdAt)) {
          const days = (new Date(c.updatedAt) - new Date(c.createdAt)) / (1000 * 60 * 60 * 24);
          totalResolutionDaysAll += days;
          resolvedCountWithDates++;
        }
      }

      if (wardNum >= 1 && wardNum <= TOTAL_WARDS) {
        const targetWard = wardMap[wardNum];
        targetWard.totalComplaints++;

        if (status === 'pending' || status === 'लंबित') {
          targetWard.pending++;
        } else if (
          ['in-progress', 'in_progress', 'in progress'].includes(status) ||
          status === 'प्रगति पर'
        ) {
          targetWard.inProgress++;
        } else if (isResolved) {
          targetWard.resolved++;
        } else if (status === 'rejected' || status === 'अस्वीकृत') {
          targetWard.rejected++;
        } else {
          targetWard.pending++;
        }

        targetWard.categoryCounts[category] = (targetWard.categoryCounts[category] || 0) + 1;
      }
    });

    let highestSeverityScore = -1;
    let criticalWard = 1;

    const wardBreakdown = [];
    for (let w = 1; w <= TOTAL_WARDS; w++) {
      const data = wardMap[w];
      const total = data.totalComplaints;
      const pending = data.pending;
      const inProgress = data.inProgress;
      const resolved = data.resolved;
      const rejected = data.rejected;

      const rawScore = total > 0 ? ((pending * 2) + (inProgress * 1.5)) / total : 0;
      const severityScore = parseFloat(rawScore.toFixed(2));

      let topCategory = 'कोई नहीं';
      let maxCategoryCount = 0;
      Object.entries(data.categoryCounts).forEach(([cat, count]) => {
        if (count > maxCategoryCount) {
          maxCategoryCount = count;
          topCategory = cat;
        }
      });

      const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;
      const openCount = pending + inProgress;

      if (
        openCount > 0 &&
        (severityScore > highestSeverityScore ||
          (severityScore === highestSeverityScore &&
            openCount > (wardMap[criticalWard]?.pending + wardMap[criticalWard]?.inProgress)))
      ) {
        highestSeverityScore = severityScore;
        criticalWard = w;
      }

      wardBreakdown.push({
        wardNumber: w,
        totalComplaints: total,
        pending,
        inProgress,
        resolved,
        rejected,
        openCount,
        resolutionRate,
        severityScore,
        topCategory
      });
    }

    const categoryDistribution = Object.entries(overallCategoryCounts)
      .map(([category, count]) => ({
        category,
        count,
        percentage: totalAllComplaints > 0 ? Math.round((count / totalAllComplaints) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    const overallResolutionRate =
      totalAllComplaints > 0 ? Math.round((totalResolvedAll / totalAllComplaints) * 100) : 0;

    const averageResolutionDays =
      resolvedCountWithDates > 0
        ? parseFloat((totalResolutionDaysAll / resolvedCountWithDates).toFixed(1))
        : 2.4;

    return res.status(200).json({
      success: true,
      data: {
        wardBreakdown,
        categoryDistribution,
        resolutionMetrics: {
          overallResolutionRate,
          averageResolutionDays,
          totalAllComplaints,
          totalResolvedAll
        },
        criticalWard,
        panchayatName: 'ग्राम पंचायत सहरी',
        totalWards: TOTAL_WARDS,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getComplaints,
  updateComplaintStatus,
  getDashboardStats,
  forgotPassword,
  resetPassword,
  getWardAnalytics
};
