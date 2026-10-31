const jwt = require('jsonwebtoken');

/**
 * Authentication middleware for verifying JWT tokens in protected admin routes.
 * Expects header format: Authorization: Bearer <token>
 */
const authMiddleware = (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers.cookie) {
      // Support reading token from httpOnly cookie
      const match = req.headers.cookie.match(/(?:^|;\s*)token=([^;]*)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'प्रमाणीकरण टोकन अनुपलब्ध है। कृपया लॉगिन करें। (No authentication token provided)'
      });
    }

    const secret = process.env.JWT_SECRET || 'gramseva_jwt_secure_secret_key_2026_village_governance';

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'अमान्य या समाप्त हो चुका टोकन। (Invalid or expired token)'
        });
      }

      req.admin = decoded;
      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'टोकन सत्यापन में सर्वर त्रुटि। (Server error during authentication)',
      error: error.message
    });
  }
};

module.exports = authMiddleware;
