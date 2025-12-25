const express = require('express');
const router = express.Router();
const {
    getTemplateRequests,
    getTemplateRequest,
    createTemplateRequest,
    voteOnRequest,
    updateTemplateRequest,
    deleteTemplateRequest,
    getMyRequests
} = require('../controllers/templateRequestController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getTemplateRequests);
router.get('/:id', getTemplateRequest);

// Private routes
router.post('/', protect, createTemplateRequest);
router.post('/:id/vote', protect, voteOnRequest);
router.put('/:id', protect, updateTemplateRequest);
router.delete('/:id', protect, deleteTemplateRequest);
router.get('/user/mine', protect, getMyRequests);

module.exports = router;
