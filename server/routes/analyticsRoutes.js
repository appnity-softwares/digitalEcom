const express = require('express');
const router = express.Router();
const { protect, admin, optionalAuth } = require('../middleware/authMiddleware');
const {
    getApiKeyStats,
    getToolAnalytics,
    getProductAnalytics,
    trackProductView,
    getAllProductAnalytics
} = require('../controllers/analyticsController');

// Public tracking
router.post('/track/product-view', optionalAuth, trackProductView);

// Private routes
router.get('/api-key/:keyId', protect, getApiKeyStats);

// Admin routes
router.get('/tool/:toolId', protect, admin, getToolAnalytics);
router.get('/product/:productId', protect, admin, getProductAnalytics);
router.get('/products', protect, admin, getAllProductAnalytics);

module.exports = router;
