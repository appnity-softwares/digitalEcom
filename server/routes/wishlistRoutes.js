const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    removeByProductId,
    clearWishlist,
    checkInWishlist
} = require('../controllers/wishlistController');

// All routes require authentication
router.use(protect);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/clear', clearWishlist);
router.delete('/product/:productId', removeByProductId);
router.delete('/:itemId', removeFromWishlist);
router.get('/check/:productId', checkInWishlist);

module.exports = router;
