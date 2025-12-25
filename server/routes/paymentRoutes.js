const express = require('express');
const router = express.Router();
const {
    createOrder,
    verifyPayment,
    createSubscriptionOrder,
    verifySubscriptionPayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Product purchase
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

// Subscription purchase
router.post('/subscription', protect, createSubscriptionOrder);
router.post('/subscription/verify', protect, verifySubscriptionPayment);

module.exports = router;
