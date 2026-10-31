require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const complaintRoutes = require('./routes/complaintRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const directoryRoutes = require('./routes/directoryRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import error handler middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Database Connection
connectDB();

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    // In development, allow localhost origins
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    return callback(new Error('CORS नीति द्वारा अवरुद्ध (Blocked by CORS policy)'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body Parsing Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'GramSeva API',
    description: 'Indian Village Governance & Grievance Backend',
    timestamp: new Date().toISOString()
  });
});

// Mount Application Routes
app.use('/api/complaints', complaintRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/admin', adminRoutes);

// 404 Route Handler for undefined endpoints
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `अनुरोधित मार्ग '${req.originalUrl}' सर्वर पर नहीं मिला (Route not found on server)`
  });
});

// Centralized Global Error Handler Middleware
app.use(errorHandler);

// Server Activation
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  🌾 GramSeva Backend API Server running on port ${PORT}`);
  console.log(`  📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`  ⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection Error]:', err.message);
});

module.exports = app;
