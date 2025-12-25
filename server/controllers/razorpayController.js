const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const prisma = require('../config/prisma');

// @desc    Create Razorpay order
// @route   POST /api/razorpay/create-order
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { amount, currency = 'INR', orderId, type = 'product' } = req.body;

    if (!amount) {
        res.status(400);
        throw new Error('Amount is required');
    }

    const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
            userId: req.user.id,
            orderId: orderId || '',
            type
        }
    };

    try {
        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        console.error('Razorpay order creation error:', err);
        res.status(500);
        throw new Error('Failed to create payment order');
    }
});

// @desc    Verify Razorpay payment
// @route   POST /api/razorpay/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderId
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
        res.status(400);
        throw new Error('Payment verification failed');
    }

    // Update order in database
    if (orderId) {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: {
                isPaid: true,
                paidAt: new Date(),
                paymentId: razorpay_payment_id,
                paymentProvider: 'razorpay',
                paymentStatus: 'completed',
                orderStatus: 'COMPLETED'
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        // Add products to user's purchased list
        const productIds = order.items
            .filter(item => item.productId)
            .map(item => item.productId);

        if (productIds.length > 0) {
            await prisma.user.update({
                where: { id: req.user.id },
                data: {
                    purchasedProducts: {
                        connect: productIds.map(id => ({ id }))
                    }
                }
            });

            // Update product sales count
            await prisma.product.updateMany({
                where: { id: { in: productIds } },
                data: { numSales: { increment: 1 } }
            });
        }

        res.json({
            success: true,
            message: 'Payment verified successfully',
            order
        });
    } else {
        res.json({
            success: true,
            message: 'Payment verified (no order to update)'
        });
    }
});

// @desc    Handle Razorpay webhook
// @route   POST /api/razorpay/webhook
// @access  Public
const webhook = asyncHandler(async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret) {
        const shasum = crypto.createHmac('sha256', webhookSecret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (digest !== req.headers['x-razorpay-signature']) {
            res.status(400);
            throw new Error('Invalid webhook signature');
        }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    switch (event) {
        case 'payment.captured':
            const payment = payload.payment.entity;
            console.log('Payment captured:', payment.id);

            // Find and update order if exists
            if (payment.notes?.orderId) {
                await prisma.order.update({
                    where: { id: payment.notes.orderId },
                    data: {
                        isPaid: true,
                        paidAt: new Date(),
                        paymentId: payment.id,
                        paymentStatus: 'captured',
                        orderStatus: 'COMPLETED'
                    }
                });
            }
            break;

        case 'payment.failed':
            console.log('Payment failed:', payload.payment.entity.id);
            break;

        default:
            console.log('Unhandled webhook event:', event);
    }

    res.json({ received: true });
});

// @desc    Create subscription order
// @route   POST /api/razorpay/subscription
// @access  Private
const createSubscriptionOrder = asyncHandler(async (req, res) => {
    const { planId, billingCycle } = req.body;

    const prices = {
        pro: { monthly: 499, yearly: 4999 },
        enterprise: { monthly: 1999, yearly: 19999 }
    };

    const amount = prices[planId]?.[billingCycle];
    if (!amount) {
        res.status(400);
        throw new Error('Invalid plan');
    }

    const options = {
        amount: amount * 100,
        currency: 'INR',
        receipt: `sub_${Date.now()}`,
        notes: {
            userId: req.user.id,
            planId,
            billingCycle,
            type: 'subscription'
        }
    };

    const order = await razorpay.orders.create(options);

    res.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        planId,
        billingCycle
    });
});

// @desc    Verify subscription payment
// @route   POST /api/razorpay/verify-subscription
// @access  Private
const verifySubscriptionPayment = asyncHandler(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        planId,
        billingCycle
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        res.status(400);
        throw new Error('Payment verification failed');
    }

    const prices = {
        pro: { monthly: 499, yearly: 4999 },
        enterprise: { monthly: 1999, yearly: 19999 }
    };

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date();
    if (billingCycle === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
        endDate.setMonth(endDate.getMonth() + 1);
    }

    // Create or update subscription
    const subscription = await prisma.subscription.upsert({
        where: { userId: req.user.id },
        update: {
            planName: planId.toUpperCase(),
            status: 'ACTIVE',
            billingCycle: billingCycle.toUpperCase(),
            razorpaySubscriptionId: razorpay_order_id,
            startDate,
            endDate,
            pricePaid: prices[planId][billingCycle],
            currency: 'INR'
        },
        create: {
            userId: req.user.id,
            planName: planId.toUpperCase(),
            status: 'ACTIVE',
            billingCycle: billingCycle.toUpperCase(),
            razorpaySubscriptionId: razorpay_order_id,
            startDate,
            endDate,
            pricePaid: prices[planId][billingCycle],
            currency: 'INR'
        }
    });

    res.json({
        success: true,
        message: 'Subscription activated',
        subscription
    });
});

module.exports = {
    createOrder,
    verifyPayment,
    webhook,
    createSubscriptionOrder,
    verifySubscriptionPayment
};
