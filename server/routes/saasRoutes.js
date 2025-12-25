const express = require('express');
const router = express.Router();
const {
    getTools,
    getToolById,
    generateKey,
    getMyKeys,
    getKeyUsage,
    revokeKey,
    createTool,
    updateTool,
    deleteTool
} = require('../controllers/saasController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getTools);
router.get('/tool/:id', getToolById);

// Private routes
router.get('/my-keys', protect, getMyKeys);
router.post('/tool/:toolId/generate-key', protect, generateKey);
router.get('/keys/:keyId/usage', protect, getKeyUsage);
router.delete('/keys/:keyId', protect, revokeKey);

// Admin routes
router.post('/', protect, admin, createTool);
router.put('/:id', protect, admin, updateTool);
router.delete('/:id', protect, admin, deleteTool);

module.exports = router;
