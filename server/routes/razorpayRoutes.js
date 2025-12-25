const express = require('express');
const router = express.Router();
const {
    createOrder,
    verifyPayment,
    webhook,
    createSubscriptionOrder,
    verifySubscriptionPayment
} = require('../controllers/razorpayController');
const { protect } = require('../middleware/authMiddleware');

// Product payment
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

// Subscription payment
router.post('/subscription', protect, createSubscriptionOrder);
router.post('/verify-subscription', protect, verifySubscriptionPayment);

// Webhook (no auth - called by Razorpay)
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);

module.exports = router;
