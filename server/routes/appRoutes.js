const express = require('express');
const router = express.Router();
const { getCategories, getApps, getApp, trackDownload, createApp, updateApp, deleteApp } = require('../controllers/appController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/categories', getCategories);
router.get('/', getApps);
router.get('/:id', getApp);
router.post('/:id/download', trackDownload);
router.post('/', protect, admin, createApp);
router.put('/:id', protect, admin, updateApp);
router.delete('/:id', protect, admin, deleteApp);

module.exports = router;
