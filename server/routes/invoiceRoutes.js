const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    generateInvoice,
    getInvoice,
    getMyInvoices,
    getAllInvoices
} = require('../controllers/invoiceController');

// All routes require authentication
router.use(protect);

router.get('/', getMyInvoices);
router.post('/:orderId', generateInvoice);
router.get('/all', admin, getAllInvoices);
router.get('/:orderId', getInvoice);

module.exports = router;
