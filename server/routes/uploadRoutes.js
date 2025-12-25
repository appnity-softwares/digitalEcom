const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    getUploadStats
} = require('../controllers/uploadController');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 10 // Max 10 files
    }
});

// All routes require API key (validated in controller)
router.post('/image', upload.single('image'), uploadImage);
router.post('/images', upload.array('images', 10), uploadMultipleImages);
router.delete('/image/:key(*)', deleteImage);
router.get('/stats', getUploadStats);

module.exports = router;
