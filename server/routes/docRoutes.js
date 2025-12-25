const express = require('express');
const router = express.Router();
const { getCategories, getDocs, getDoc, trackLike, createDoc, updateDoc, deleteDoc } = require('../controllers/docController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/categories', getCategories);
router.get('/', getDocs);
router.get('/:id', getDoc);
router.post('/:id/like', trackLike);
router.post('/', protect, admin, createDoc);
router.put('/:id', protect, admin, updateDoc);
router.delete('/:id', protect, admin, deleteDoc);

module.exports = router;
