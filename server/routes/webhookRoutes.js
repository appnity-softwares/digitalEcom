const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    handleRazorpayWebhook,
    getWebhookLogs,
    retryWebhook
} = require('../controllers/webhookController');

// Webhook endpoints (no auth - uses signature verification)
router.post('/razorpay', express.raw({ type: 'application/json' }), handleRazorpayWebhook);

// Admin routes
router.get('/logs', protect, admin, getWebhookLogs);
router.post('/:id/retry', protect, admin, retryWebhook);

module.exports = router;
