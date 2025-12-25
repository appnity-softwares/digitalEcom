const express = require('express');
const router = express.Router();
const {
    getDocs,
    getDocById,
    createDoc,
    updateDoc,
    deleteDoc,
    getCategories
} = require('../controllers/docsController');
const { protect, optionalAuth, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getDocs);
router.get('/categories', getCategories);
router.get('/:id', optionalAuth, getDocById);

// Admin routes  
router.post('/', protect, admin, createDoc);
router.put('/:id', protect, admin, updateDoc);
router.delete('/:id', protect, admin, deleteDoc);

module.exports = router;
