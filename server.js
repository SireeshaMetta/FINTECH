require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Connect to MongoDB
connectDB();

const app = express();

// Security Headers
app.use(helmet());

// Body Parser with payload limit
app.use(express.json({ limit: '10kb' }));

// Sanitize MongoDB inputs (NoSQL Injection Protection)
app.use(mongoSanitize());

// HTTP Parameter Pollution Protection
app.use(hpp());

// Response compression
app.use(compression());

// CORS config - allow client connections
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*', // Adjust in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api/', limiter);

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/fraud', require('./routes/fraudRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/savings', require('./routes/savingsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/ocr', require('./routes/ocrRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Root test route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FinGuard AI API Server is running...',
    version: '1.0.0',
  });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

