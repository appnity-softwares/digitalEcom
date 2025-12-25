const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const { sendEmail, emailTemplates } = require('../config/email');

// Lazy initialize Razorpay (only when needed)
let razorpay = null;
const getRazorpay = () => {
    if (!razorpay) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay credentials not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env');
        }
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    }
    return razorpay;
};

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount) {
        res.status(400);
        throw new Error('Amount is required');
    }

    const options = {
        amount: Math.round(amount * 100), // Amount in paise
        currency,
        receipt: receipt || `order_${Date.now()}`,
        notes: notes || {}
    };

    try {
        const order = await getRazorpay().orders.create(options);

        res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt
            },
            key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Razorpay order error:', error);
        res.status(500);
        throw new Error('Failed to create payment order');
    }
});

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        order_data // { items, totalPrice, couponCode, discount }
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign)
        .digest('hex');

    if (razorpay_signature !== expectedSign) {
        res.status(400);
        throw new Error('Invalid payment signature');
    }

    // Payment verified, create order in database
    try {
        const order = await prisma.order.create({
            data: {
                userId: req.user.id,
                paymentMethod: 'Razorpay',
                paymentId: razorpay_payment_id,
                paymentStatus: 'completed',
                paymentProvider: 'razorpay',
                totalPrice: order_data.totalPrice,
                subtotal: order_data.totalPrice + (order_data.discount || 0),
                discount: order_data.discount || 0,
                couponCode: order_data.couponCode,
                isPaid: true,
                paidAt: new Date(),
                orderStatus: 'COMPLETED',
                downloadExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                items: {
                    create: order_data.items.map(item => ({
                        title: item.title,
                        qty: item.qty || 1,
                        image: item.image,
                        price: parseFloat(item.price),
                        productId: item.product || null,
                        premiumDocId: item.premiumDoc || null,
                        itemType: item.item_type?.toUpperCase() || 'PRODUCT',
                        licenseType: item.license_type?.toUpperCase() || 'PERSONAL',
                        licenseKey: generateLicenseKey()
                    }))
                }
            },
            include: {
                items: true,
                user: {
                    select: { name: true, email: true }
                }
            }
        });

        // Add products to user's purchased list
        const productIds = order_data.items
            .filter(item => item.product)
            .map(item => item.product);

        const docIds = order_data.items
            .filter(item => item.premiumDoc)
            .map(item => item.premiumDoc);

        if (productIds.length > 0) {
            await prisma.user.update({
                where: { id: req.user.id },
                data: {
                    purchasedProducts: {
                        connect: productIds.map(id => ({ id }))
                    }
                }
            });

            // Increment sales count
            await prisma.product.updateMany({
                where: { id: { in: productIds } },
                data: { numSales: { increment: 1 } }
            });
        }

        if (docIds.length > 0) {
            await prisma.user.update({
                where: { id: req.user.id },
                data: {
                    purchasedDocs: {
                        connect: docIds.map(id => ({ id }))
                    }
                }
            });
        }

        // Send confirmation email (non-blocking)
        sendEmail({
            to: order.user.email,
            subject: 'Order Confirmation - CodeStudio',
            html: emailTemplates.orderConfirmation(order)
        }).catch(err => console.error('Order email error:', err));

        res.json({
            success: true,
            message: 'Payment verified successfully',
            order: {
                id: order.id,
                totalPrice: order.totalPrice,
                items: order.items,
                paidAt: order.paidAt
            }
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500);
        throw new Error('Payment verified but order creation failed');
    }
});

// @desc    Create subscription order
// @route   POST /api/payment/subscription
// @access  Private
const createSubscriptionOrder = asyncHandler(async (req, res) => {
    const { plan_name, billing_cycle = 'monthly' } = req.body;

    const plans = {
        PRO: { monthly: 1999, yearly: 19900 },         // ₹1999/mo or ₹199/yr
        ENTERPRISE: { monthly: 4999, yearly: 49900 }   // ₹4999/mo or ₹499/yr
    };

    if (!plans[plan_name]) {
        res.status(400);
        throw new Error('Invalid plan');
    }

    const amount = plans[plan_name][billing_cycle];

    const options = {
        amount: amount * 100, // In paise
        currency: 'INR',
        receipt: `sub_${req.user.id}_${Date.now()}`,
        notes: {
            user_id: req.user.id,
            plan: plan_name,
            billing_cycle
        }
    };

    try {
        const order = await getRazorpay().orders.create(options);

        res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                plan: plan_name,
                billing_cycle
            },
            key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Subscription order error:', error);
        res.status(500);
        throw new Error('Failed to create subscription order');
    }
});

// @desc    Verify subscription payment
// @route   POST /api/payment/subscription/verify
// @access  Private
const verifySubscriptionPayment = asyncHandler(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        plan_name,
        billing_cycle
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign)
        .digest('hex');

    if (razorpay_signature !== expectedSign) {
        res.status(400);
        throw new Error('Invalid payment signature');
    }

    // Calculate end date
    const endDate = new Date();
    if (billing_cycle === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
        endDate.setMonth(endDate.getMonth() + 1);
    }

    const features = plan_name === 'ENTERPRISE'
        ? ['Everything in Pro', 'Extended licenses', 'Custom integrations', 'Dedicated support', 'White-label options', 'API access']
        : ['Unlimited templates', 'All UI kits', 'Access to SaaS tools', 'Premium Docs', 'Priority support', 'Early releases'];

    // Update subscription
    const subscription = await prisma.subscription.upsert({
        where: { userId: req.user.id },
        update: {
            planName: plan_name,
            billingCycle: billing_cycle.toUpperCase(),
            status: 'ACTIVE',
            startDate: new Date(),
            endDate,
            razorpaySubscriptionId: razorpay_payment_id,
            features
        },
        create: {
            userId: req.user.id,
            planName: plan_name,
            billingCycle: billing_cycle.toUpperCase(),
            startDate: new Date(),
            endDate,
            status: 'ACTIVE',
            razorpaySubscriptionId: razorpay_payment_id,
            features
        }
    });

    res.json({
        success: true,
        message: `Successfully subscribed to ${plan_name} plan`,
        subscription
    });
});

// Helper: Generate license key
function generateLicenseKey() {
    const segments = [];
    for (let i = 0; i < 4; i++) {
        segments.push(crypto.randomBytes(2).toString('hex').toUpperCase());
    }
    return segments.join('-');
}

module.exports = {
    createOrder,
    verifyPayment,
    createSubscriptionOrder,
    verifySubscriptionPayment
};
