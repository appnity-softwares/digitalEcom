const express = require('express');
const router = express.Router();
const {
    getCategories,
    getTemplates,
    getTemplate,
    trackDownload,
    createTemplate,
    updateTemplate,
    deleteTemplate
} = require('../controllers/templateController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/categories', getCategories);
router.get('/', getTemplates);
router.get('/:id', getTemplate);
router.post('/:id/download', trackDownload);

// Admin routes
router.post('/', protect, admin, createTemplate);
router.put('/:id', protect, admin, updateTemplate);
router.delete('/:id', protect, admin, deleteTemplate);

module.exports = router;
