const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getDashboardStats,
    getRevenueChart,
    getTopProducts,
    getRecentOrders,
    getUserGrowth,
    getSubscriptionStats,
    getApiUsageStats,
    getCategoryBreakdown
} = require('../controllers/dashboardController');

// All routes require admin access
router.use(protect, admin);

router.get('/stats', getDashboardStats);
router.get('/revenue', getRevenueChart);
router.get('/top-products', getTopProducts);
router.get('/recent-orders', getRecentOrders);
router.get('/user-growth', getUserGrowth);
router.get('/subscriptions', getSubscriptionStats);
router.get('/api-usage', getApiUsageStats);
router.get('/categories', getCategoryBreakdown);

module.exports = router;
