const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    generatePresignedUrl,
    getSignedReadUrl,
    deleteFile
} = require('../controllers/r2Controller');

/**
 * Cloudflare R2 Upload Routes
 * 
 * All routes require JWT authentication to ensure:
 * - User accountability (files are scoped to users)
 * - Security (prevent anonymous uploads)
 * - Rate limiting (can track per-user usage)
 */

// @route   POST /api/r2/presigned-url
// @desc    Generate presigned URL for client-side upload to R2
// @access  Protected
router.post('/presigned-url', protect, generatePresignedUrl);

// @route   GET /api/r2/signed-url/:key
// @desc    Get signed URL for reading private files from R2
// @access  Protected
router.get('/signed-url/:key(*)', protect, getSignedReadUrl);

// @route   DELETE /api/r2/file/:key
// @desc    Delete file from R2
// @access  Protected
router.delete('/file/:key(*)', protect, deleteFile);

module.exports = router;
