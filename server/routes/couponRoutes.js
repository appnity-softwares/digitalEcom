const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    validateCoupon,
    applyCoupon,
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getCouponStats
} = require('../controllers/couponController');

// Public routes
router.post('/validate', validateCoupon);

// Private routes
router.post('/apply', protect, applyCoupon);

// Admin routes
router.get('/', protect, admin, getCoupons);
router.post('/', protect, admin, createCoupon);
router.put('/:id', protect, admin, updateCoupon);
router.delete('/:id', protect, admin, deleteCoupon);
router.get('/:id/stats', protect, admin, getCouponStats);

module.exports = router;
