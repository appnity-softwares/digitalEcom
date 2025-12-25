const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    initiateRefund,
    getRefundStatus,
    getOrderRefunds,
    getMyRefunds
} = require('../controllers/refundController');

// All routes require authentication
router.use(protect);

router.post('/:orderId', initiateRefund);
router.get('/my-refunds', getMyRefunds);
router.get('/:refundId/status', getRefundStatus);
router.get('/order/:orderId', getOrderRefunds);

module.exports = router;
