const express = require('express');
const router = express.Router();
const {
    getCategories,
    getTools,
    getTool,
    trackAPICall,
    createTool,
    updateTool,
    deleteTool,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/toolController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/categories', getCategories);
router.get('/', getTools);
router.get('/:id', getTool);
router.post('/:id/call', trackAPICall);
router.post('/', protect, admin, createTool);
router.put('/:id', protect, admin, updateTool);
router.delete('/:id', protect, admin, deleteTool);

router.post('/categories', protect, admin, createCategory);
router.put('/categories/:id', protect, admin, updateCategory);
router.delete('/categories/:id', protect, admin, deleteCategory);

module.exports = router;
