const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const prisma = require('../config/prisma');
const { sendEmail } = require('../config/email');

// Lazy initialize Razorpay
let razorpay = null;
const getRazorpay = () => {
    if (!razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    }
    return razorpay;
};

// @desc    Initiate refund for an order
// @route   POST /api/refunds/:orderId
// @access  Private
const initiateRefund = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { reason, amount } = req.body;

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

    if (!order.isPaid || order.orderStatus === 'REFUNDED') {
        res.status(400);
        throw new Error('Order cannot be refunded');
    }

    if (!order.paymentId) {
        res.status(400);
        throw new Error('No payment ID found for this order');
    }

    const razorpayClient = getRazorpay();
    if (!razorpayClient) {
        res.status(500);
        throw new Error('Payment gateway not configured');
    }

    // Calculate refund amount (full or partial)
    const refundAmount = amount || order.totalPrice;

    try {
        // Create refund via Razorpay
        const refund = await razorpayClient.payments.refund(order.paymentId, {
            amount: Math.round(refundAmount * 100), // Convert to paise
            notes: {
                order_id: orderId,
                reason: reason || 'Customer requested refund',
                initiated_by: req.user.id
            }
        });

        // Update order status
        await prisma.order.update({
            where: { id: orderId },
            data: {
                orderStatus: refundAmount >= order.totalPrice ? 'REFUNDED' : 'PENDING',
                paymentStatus: 'refund_initiated'
            }
        });

        // Send email notification
        if (order.user?.email) {
            sendEmail({
                to: order.user.email,
                subject: 'Refund Initiated - CodeStudio',
                html: `
                    <h2>Refund Request Received</h2>
                    <p>Hi ${order.user.name},</p>
                    <p>We've initiated a refund of ₹${refundAmount} for your order #${orderId.substring(0, 8)}.</p>
                    <p><strong>Refund ID:</strong> ${refund.id}</p>
                    <p><strong>Reason:</strong> ${reason || 'Customer request'}</p>
                    <p>The amount will be credited to your account within 5-7 business days.</p>
                `
            }).catch(err => console.error('Refund email error:', err));
        }

        res.json({
            success: true,
            refund: {
                id: refund.id,
                amount: refundAmount,
                status: refund.status,
                createdAt: new Date()
            },
            message: 'Refund initiated successfully'
        });

    } catch (error) {
        console.error('Razorpay refund error:', error);
        res.status(500);
        throw new Error(`Refund failed: ${error.error?.description || error.message}`);
    }
});

// @desc    Get refund status
// @route   GET /api/refunds/:refundId/status
// @access  Private
const getRefundStatus = asyncHandler(async (req, res) => {
    const { refundId } = req.params;

    const razorpayClient = getRazorpay();
    if (!razorpayClient) {
        res.status(500);
        throw new Error('Payment gateway not configured');
    }

    try {
        const refund = await razorpayClient.refunds.fetch(refundId);

        res.json({
            success: true,
            refund: {
                id: refund.id,
                paymentId: refund.payment_id,
                amount: refund.amount / 100, // Convert from paise
                status: refund.status,
                createdAt: new Date(refund.created_at * 1000)
            }
        });
    } catch (error) {
        res.status(500);
        throw new Error(`Failed to fetch refund: ${error.message}`);
    }
});

// @desc    Get all refunds for an order
// @route   GET /api/refunds/order/:orderId
// @access  Private
const getOrderRefunds = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
        where: { id: orderId }
    });

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(403);
        throw new Error('Not authorized');
    }

    if (!order.paymentId) {
        return res.json({ success: true, refunds: [] });
    }

    const razorpayClient = getRazorpay();
    if (!razorpayClient) {
        res.status(500);
        throw new Error('Payment gateway not configured');
    }

    try {
        const refunds = await razorpayClient.payments.fetchMultipleRefund(order.paymentId);

        res.json({
            success: true,
            refunds: refunds.items.map(r => ({
                id: r.id,
                amount: r.amount / 100,
                status: r.status,
                createdAt: new Date(r.created_at * 1000)
            }))
        });
    } catch (error) {
        res.status(500);
        throw new Error(`Failed to fetch refunds: ${error.message}`);
    }
});

// @desc    Get user's refund history
// @route   GET /api/refunds/my-refunds
// @access  Private
const getMyRefunds = asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
        where: {
            userId: req.user.id,
            orderStatus: 'REFUNDED'
        },
        include: {
            items: {
                select: { title: true, price: true }
            }
        },
        orderBy: { updatedAt: 'desc' }
    });

    res.json({
        success: true,
        refundedOrders: orders
    });
});

module.exports = {
    initiateRefund,
    getRefundStatus,
    getOrderRefunds,
    getMyRefunds
};
