const asyncHandler = require('express-async-handler');
const PDFDocument = require('pdfkit');
const prisma = require('../config/prisma');

// Generate unique invoice number
const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `INV-${year}${month}-${random}`;
};

// @desc    Generate invoice for an order
// @route   POST /api/invoices/:orderId
// @access  Private
const generateInvoice = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: { select: { id: true, name: true, email: true } },
            items: true
        }
    });

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(403);
        throw new Error('Not authorized');
    }

    if (!order.isPaid) {
        res.status(400);
        throw new Error('Cannot generate invoice for unpaid order');
    }

    // Check if invoice already exists
    let invoice = await prisma.invoice.findUnique({
        where: { orderId }
    });

    if (!invoice) {
        // Create invoice record
        invoice = await prisma.invoice.create({
            data: {
                orderId,
                userId: order.userId,
                invoiceNumber: generateInvoiceNumber(),
                subtotal: order.subtotal || order.totalPrice,
                discount: order.discount || 0,
                tax: 0, // Add tax calculation if needed
                total: order.totalPrice,
                billingName: order.user?.name,
                billingEmail: order.user?.email
            }
        });
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('CodeStudio', 50, 50);
    doc.fontSize(10).font('Helvetica').text('Developer Marketplace', 50, 80);

    // Invoice details (right side)
    doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', 400, 50);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 400, 80);
    doc.text(`Date: ${invoice.issuedAt.toLocaleDateString()}`, 400, 95);
    doc.text(`Order #: ${orderId.substring(0, 8)}`, 400, 110);

    // Divider
    doc.moveTo(50, 140).lineTo(550, 140).stroke();

    // Bill To
    doc.fontSize(12).font('Helvetica-Bold').text('Bill To:', 50, 160);
    doc.fontSize(10).font('Helvetica');
    doc.text(order.user?.name || 'Customer', 50, 180);
    doc.text(order.user?.email || '', 50, 195);

    // Items table header
    const tableTop = 250;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Item', 50, tableTop);
    doc.text('License', 280, tableTop);
    doc.text('Qty', 360, tableTop);
    doc.text('Price', 410, tableTop);
    doc.text('Total', 480, tableTop);

    // Divider
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Items
    let y = tableTop + 30;
    doc.font('Helvetica');

    order.items.forEach((item) => {
        doc.text(item.title.substring(0, 35), 50, y);
        doc.text(item.licenseType || 'Personal', 280, y);
        doc.text(item.qty.toString(), 360, y);
        doc.text(`$${item.price.toFixed(2)}`, 410, y);
        doc.text(`$${(item.price * item.qty).toFixed(2)}`, 480, y);
        y += 25;
    });

    // Totals
    y += 20;
    doc.moveTo(350, y).lineTo(550, y).stroke();
    y += 15;

    doc.text('Subtotal:', 350, y);
    doc.text(`$${invoice.subtotal.toFixed(2)}`, 480, y);
    y += 20;

    if (invoice.discount > 0) {
        doc.text('Discount:', 350, y);
        doc.text(`-$${invoice.discount.toFixed(2)}`, 480, y);
        y += 20;
    }

    if (invoice.tax > 0) {
        doc.text('Tax:', 350, y);
        doc.text(`$${invoice.tax.toFixed(2)}`, 480, y);
        y += 20;
    }

    doc.font('Helvetica-Bold');
    doc.text('Total:', 350, y);
    doc.text(`$${invoice.total.toFixed(2)}`, 480, y);

    // Footer
    doc.font('Helvetica').fontSize(8);
    doc.text('Thank you for your purchase!', 50, 700, { align: 'center', width: 500 });
    doc.text('For support, contact support@codestudio.dev', 50, 715, { align: 'center', width: 500 });

    doc.end();
});

// @desc    Get invoice details
// @route   GET /api/invoices/:orderId
// @access  Private
const getInvoice = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const invoice = await prisma.invoice.findUnique({
        where: { orderId }
    });

    if (!invoice) {
        res.status(404);
        throw new Error('Invoice not found');
    }

    if (invoice.userId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(403);
        throw new Error('Not authorized');
    }

    res.json({
        success: true,
        invoice
    });
});

// @desc    Get user's invoices
// @route   GET /api/invoices
// @access  Private
const getMyInvoices = asyncHandler(async (req, res) => {
    const invoices = await prisma.invoice.findMany({
        where: { userId: req.user.id },
        orderBy: { issuedAt: 'desc' }
    });

    res.json({
        success: true,
        invoices
    });
});

// @desc    Get all invoices (Admin)
// @route   GET /api/invoices/all
// @access  Private/Admin
const getAllInvoices = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
            orderBy: { issuedAt: 'desc' },
            skip,
            take: parseInt(limit)
        }),
        prisma.invoice.count()
    ]);

    res.json({
        success: true,
        invoices,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
});

module.exports = {
    generateInvoice,
    getInvoice,
    getMyInvoices,
    getAllInvoices
};
