const express = require('express');
const router = express.Router();
const {
    getDownloadUrl,
    checkDownloadAccess,
    uploadProductFile,
} = require('../controllers/downloadController');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
});

// @route   GET /api/downloads/:productId
router.get('/:productId', protect, getDownloadUrl);

// @route   GET /api/downloads/check/:productId
router.get('/check/:productId', protect, checkDownloadAccess);

// @route   POST /api/downloads/upload/:productId (admin only)
router.post('/upload/:productId', protect, admin, upload.single('file'), uploadProductFile);

module.exports = router;
