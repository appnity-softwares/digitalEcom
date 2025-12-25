const express = require('express');
const router = express.Router();
const {
    getCategories,
    getComponents,
    getComponent,
    trackCopy,
    createComponent,
    updateComponent,
    deleteComponent
} = require('../controllers/componentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/categories', getCategories);
router.get('/', getComponents);
router.get('/:id', getComponent);
router.post('/:id/copy', trackCopy);

// Admin routes
router.post('/', protect, admin, createComponent);
router.put('/:id', protect, admin, updateComponent);
router.delete('/:id', protect, admin, deleteComponent);

module.exports = router;
