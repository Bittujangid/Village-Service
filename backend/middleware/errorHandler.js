/**
 * Global Error Handling Middleware
 * Handles Mongoose Validation errors, Cast errors, Duplicate key errors, Multer errors, and internal server errors.
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.code = err.code;

  console.error('[Error Details]:', {
    name: err.name,
    message: err.message,
    code: err.code,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Mongoose Bad ObjectId / CastError
  if (err.name === 'CastError') {
    const message = `संसाधन नहीं मिला। अमान्य पहचानकर्ता: ${err.value} (Resource not found. Invalid ID)`;
    return res.status(400).json({
      success: false,
      message,
      field: err.path
    });
  }

  // Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    const message = `रिकॉर्ड पहले से मौजूद है: ${field} '${value}' पहले से पंजीकृत है। (Duplicate field value entered)`;
    return res.status(409).json({
      success: false,
      message,
      field
    });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'डेटा सत्यापन विफल (Validation failed)',
      errors: messages
    });
  }

  // Multer File Upload Errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'फाइल का आकार 5MB से अधिक नहीं होना चाहिए। (File size exceeds 5MB limit)'
      });
    }
    return res.status(400).json({
      success: false,
      message: `फाइल अपलोड त्रुटि: ${err.message}`
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'अमान्य टोकन। (Invalid authentication token)'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'टोकन की समय सीमा समाप्त हो गई है। कृपया पुनः लॉगिन करें। (Token has expired)'
    });
  }

  // Fallback to 500 Internal Server Error
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'आंतरिक सर्वर त्रुटि (Internal Server Error)',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
