const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const { sendEmail, emailTemplates } = require('../config/email');

// Verify Razorpay webhook signature
const verifyRazorpaySignature = (body, signature, secret) => {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(body))
        .digest('hex');
    return signature === expectedSignature;
};

// @desc    Handle Razorpay webhooks
// @route   POST /api/webhooks/razorpay
// @access  Public (with signature verification)
const handleRazorpayWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Log webhook receipt
    const webhookLog = await prisma.webhookLog.create({
        data: {
            provider: 'razorpay',
            eventType: req.body.event,
            eventId: req.body.payload?.payment?.entity?.id || null,
            payload: req.body,
            headers: {
                signature: signature?.substring(0, 20) + '...',
                contentType: req.headers['content-type']
            },
            status: 'RECEIVED'
        }
    });

    try {
        // Verify signature if secret is set
        if (webhookSecret && signature) {
            const isValid = verifyRazorpaySignature(req.body, signature, webhookSecret);
            if (!isValid) {
                await prisma.webhookLog.update({
                    where: { id: webhookLog.id },
                    data: {
                        status: 'FAILED',
                        errorMessage: 'Invalid signature'
                    }
                });
                res.status(400);
                throw new Error('Invalid webhook signature');
            }
        }

        await prisma.webhookLog.update({
            where: { id: webhookLog.id },
            data: { status: 'PROCESSING' }
        });

        const event = req.body.event;
        const payload = req.body.payload;

        switch (event) {
            case 'payment.captured':
                await handlePaymentCaptured(payload);
                break;

            case 'payment.failed':
                await handlePaymentFailed(payload);
                break;

            case 'refund.created':
            case 'refund.processed':
                await handleRefund(payload);
                break;

            case 'subscription.activated':
                await handleSubscriptionActivated(payload);
                break;

            case 'subscription.cancelled':
                await handleSubscriptionCancelled(payload);
                break;

            case 'subscription.charged':
                await handleSubscriptionCharged(payload);
                break;

            default:
                console.log(`Unhandled webhook event: ${event}`);
        }

        await prisma.webhookLog.update({
            where: { id: webhookLog.id },
            data: {
                status: 'SUCCESS',
                processedAt: new Date()
            }
        });

        res.json({ success: true, event });

    } catch (error) {
        await prisma.webhookLog.update({
            where: { id: webhookLog.id },
            data: {
                status: 'FAILED',
                errorMessage: error.message,
                processedAt: new Date()
            }
        });

        console.error('Webhook error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Handle successful payment capture
const handlePaymentCaptured = async (payload) => {
    const payment = payload.payment.entity;
    const orderId = payment.notes?.order_id;

    if (orderId) {
        // Update order status
        await prisma.order.update({
            where: { id: orderId },
            data: {
                isPaid: true,
                paidAt: new Date(),
                orderStatus: 'COMPLETED',
                paymentId: payment.id,
                paymentStatus: 'captured',
                paymentProvider: 'razorpay'
            }
        });

        // Get order with items for email
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: { select: { email: true, name: true } },
                items: true
            }
        });

        if (order?.user?.email) {
            // Send confirmation email
            sendEmail({
                to: order.user.email,
                subject: 'Payment Confirmed - CodeStudio',
                html: emailTemplates.orderConfirmation(order)
            }).catch(err => console.error('Email error:', err));
        }
    }
};

// Handle payment failure
const handlePaymentFailed = async (payload) => {
    const payment = payload.payment.entity;
    const orderId = payment.notes?.order_id;

    if (orderId) {
        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentStatus: 'failed',
                paymentId: payment.id
            }
        });
    }

    console.log('Payment failed:', payment.id, payment.error_description);
};

// Handle refund
const handleRefund = async (payload) => {
    const refund = payload.refund.entity;
    const paymentId = refund.payment_id;

    // Find order by payment ID
    const order = await prisma.order.findFirst({
        where: { paymentId },
        include: { user: { select: { email: true, name: true } } }
    });

    if (order) {
        await prisma.order.update({
            where: { id: order.id },
            data: {
                orderStatus: 'REFUNDED',
                paymentStatus: 'refunded'
            }
        });

        if (order.user?.email) {
            // Send refund notification email
            sendEmail({
                to: order.user.email,
                subject: 'Refund Processed - CodeStudio',
                html: `
                    <h2>Refund Confirmation</h2>
                    <p>Hi ${order.user.name},</p>
                    <p>Your refund of ₹${refund.amount / 100} has been processed successfully.</p>
                    <p>Refund ID: ${refund.id}</p>
                    <p>The amount will be credited to your account within 5-7 business days.</p>
                `
            }).catch(err => console.error('Refund email error:', err));
        }
    }
};

// Handle subscription activation
const handleSubscriptionActivated = async (payload) => {
    const subscription = payload.subscription.entity;
    const userId = subscription.notes?.user_id;

    if (userId) {
        await prisma.subscription.update({
            where: { userId },
            data: {
                status: 'ACTIVE',
                razorpaySubscriptionId: subscription.id,
                startDate: new Date(subscription.start_at * 1000)
            }
        });
    }
};

// Handle subscription cancellation
const handleSubscriptionCancelled = async (payload) => {
    const subscription = payload.subscription.entity;
    const userId = subscription.notes?.user_id;

    if (userId) {
        await prisma.subscription.update({
            where: { userId },
            data: {
                status: 'CANCELLED',
                cancelledAt: new Date()
            }
        });
    }
};

// Handle subscription charge
const handleSubscriptionCharged = async (payload) => {
    const subscription = payload.subscription.entity;
    const userId = subscription.notes?.user_id;

    if (userId) {
        // Extend subscription end date
        const endDate = new Date(subscription.current_end * 1000);
        await prisma.subscription.update({
            where: { userId },
            data: {
                endDate,
                status: 'ACTIVE'
            }
        });
    }
};

// @desc    Get webhook logs (Admin)
// @route   GET /api/webhooks/logs
// @access  Private/Admin
const getWebhookLogs = asyncHandler(async (req, res) => {
    const { provider, status, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (provider) where.provider = provider;
    if (status) where.status = status;

    const [logs, total] = await Promise.all([
        prisma.webhookLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit),
            select: {
                id: true,
                provider: true,
                eventType: true,
                eventId: true,
                status: true,
                errorMessage: true,
                processedAt: true,
                createdAt: true
            }
        }),
        prisma.webhookLog.count({ where })
    ]);

    res.json({
        success: true,
        logs,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
});

// @desc    Retry failed webhook
// @route   POST /api/webhooks/:id/retry
// @access  Private/Admin
const retryWebhook = asyncHandler(async (req, res) => {
    const log = await prisma.webhookLog.findUnique({
        where: { id: req.params.id }
    });

    if (!log) {
        res.status(404);
        throw new Error('Webhook log not found');
    }

    // Re-process the webhook
    const mockReq = {
        body: log.payload,
        headers: { 'x-razorpay-signature': null } // Skip signature check for retry
    };

    try {
        await handleRazorpayWebhook(mockReq, {
            json: () => { },
            status: () => ({ json: () => { } })
        });

        await prisma.webhookLog.update({
            where: { id: log.id },
            data: {
                status: 'SUCCESS',
                processedAt: new Date(),
                errorMessage: null
            }
        });

        res.json({ success: true, message: 'Webhook reprocessed successfully' });
    } catch (error) {
        res.status(500);
        throw new Error(`Retry failed: ${error.message}`);
    }
});

module.exports = {
    handleRazorpayWebhook,
    getWebhookLogs,
    retryWebhook
};
