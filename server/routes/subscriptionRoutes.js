const express = require('express');
const router = express.Router();
const {
    getPlans,
    getMySubscription,
    createSubscription,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/plans', getPlans);

// Private
router.get('/my', protect, getMySubscription);
router.get('/current', protect, getMySubscription); // Alias for frontend
router.post('/create', protect, createSubscription);
router.post('/cancel', protect, cancelSubscription);
router.post('/pause', protect, pauseSubscription);
router.post('/resume', protect, resumeSubscription);

module.exports = router;
