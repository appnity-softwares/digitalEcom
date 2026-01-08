// Load env vars
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const passport = require('./config/passport');
const logger = require('./config/logger');

const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Compression middleware (gzip)
app.use(compression());

// Security Headers
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000, // limit each IP to 1000 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
    skip: (req) => req.path === '/', // Skip health check
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100, // Limit to 100 requests per 1 minute
    message: 'Too many login attempts, please try again later.',
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport.initialize());

// HTTP request logging (in development)
if (process.env.NODE_ENV !== 'production') {
    const morgan = require('morgan');
    app.use(morgan('dev'));
}

// Health check (no rate limit)
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'CodeStudio API is running',
        version: '2.0.0',
        database: 'PostgreSQL with Prisma',
        environment: process.env.NODE_ENV || 'development'
    });
});

// API status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        uptime: process.uptime(),
        timestamp: Date.now(),
        memory: process.memoryUsage(),
    });
});

// Routes
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/docs', require('./routes/docsRoutes'));
app.use('/api/saas', require('./routes/saasRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/download', require('./routes/downloadRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// New feature routes
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/webhooks', require('./routes/webhookRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/refunds', require('./routes/refundRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/r2', require('./routes/r2Routes'));
app.use('/api/tools', require('./routes/toolsRoutes'));
app.use('/api/tool-categories', require('./routes/toolCategoryRoutes'));
app.use('/api/razorpay', require('./routes/razorpayRoutes'));
app.use('/api/components', require('./routes/componentRoutes'));
app.use('/api/templates', require('./routes/templateRoutes'));
// app.use('/api/docs', require('./routes/docRoutes')); // Duplicate - Use docsRoutes instead
app.use('/api/apitools', require('./routes/toolRoutes'));
app.use('/api/apps', require('./routes/appRoutes'));
app.use('/api/template-requests', require('./routes/templateRequestRoutes'));

// Error handler middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Log error
    logger.error('API Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    res.status(statusCode);
    res.json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📦 Database: PostgreSQL with Prisma`);
    logger.info(`🔐 OAuth: Google + GitHub`);
    logger.info(`🛡️  Security: Helmet + Rate Limiting enabled`);
    logger.info(`⚡ Compression: enabled`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

