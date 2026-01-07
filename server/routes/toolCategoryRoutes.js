const express = require('express');
const router = express.Router();
const {
    getToolCategories,
    createToolCategory,
    updateToolCategory,
    deleteToolCategory
} = require('../controllers/toolCategoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getToolCategories)
    .post(protect, admin, createToolCategory);

router.route('/:id')
    .put(protect, admin, updateToolCategory)
    .delete(protect, admin, deleteToolCategory);

module.exports = router;
