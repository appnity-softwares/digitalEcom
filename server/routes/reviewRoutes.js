const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getProductReviews,
    getDocReviews,
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    getMyReviews
} = require('../controllers/reviewController');

// Public routes
router.get('/product/:productId', getProductReviews);
router.get('/doc/:docId', getDocReviews);
router.post('/:id/helpful', markHelpful);

// Private routes
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.get('/my-reviews', protect, getMyReviews);

module.exports = router;
