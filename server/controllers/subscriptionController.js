const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

// Subscription plan details
const PLANS = {
    FREE: {
        name: 'FREE',
        price_monthly: 0,
        price_yearly: 0,
        features: ['Access to free products', 'Community support']
    },
    PRO: {
        name: 'PRO',
        price_monthly: 19.99,
        price_yearly: 199,
        features: [
            'Unlimited templates',
            'All UI kits',
            'Access to SaaS tools',
            'Premium Docs',
            'Priority support',
            'Early releases'
        ]
    },
    ENTERPRISE: {
        name: 'ENTERPRISE',
        price_monthly: 49.99,
        price_yearly: 499,
        features: [
            'Everything in Pro',
            'Extended licenses',
            'Custom integrations',
            'Dedicated support',
            'White-label options',
            'API access'
        ]
    }
};

// @desc    Get available subscription plans
// @route   GET /api/subscriptions/plans
// @access  Public
const getPlans = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        plans: PLANS
    });
});

// @desc    Get current user's subscription
// @route   GET /api/subscriptions/my
// @access  Private
const getMySubscription = asyncHandler(async (req, res) => {
    let subscription = await prisma.subscription.findUnique({
        where: { userId: req.user.id }
    });

    if (!subscription) {
        // Create a free subscription if none exists
        subscription = await prisma.subscription.create({
            data: {
                userId: req.user.id,
                planName: 'FREE',
                status: 'ACTIVE',
                features: PLANS.FREE.features
            }
        });
    }

    const isActive = subscription.status === 'ACTIVE' || subscription.status === 'TRIALING';
    const hasProAccess = isActive && (subscription.planName === 'PRO' || subscription.planName === 'ENTERPRISE');

    res.json({
        success: true,
        subscription,
        is_active: isActive,
        has_pro_access: hasProAccess
    });
});

// @desc    Create/upgrade subscription
// @route   POST /api/subscriptions/create
// @access  Private
const createSubscription = asyncHandler(async (req, res) => {
    const { plan_name, billing_cycle, payment_id, payment_provider } = req.body;

    const planKey = plan_name?.toUpperCase();
    if (!planKey || !PLANS[planKey]) {
        res.status(400);
        throw new Error('Invalid plan name');
    }

    const plan = PLANS[planKey];
    const price = billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly;

    const endDate = new Date();
    if (billing_cycle === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
        endDate.setMonth(endDate.getMonth() + 1);
    }

    // Upsert subscription
    const subscription = await prisma.subscription.upsert({
        where: { userId: req.user.id },
        update: {
            planName: planKey,
            billingCycle: billing_cycle?.toUpperCase() || 'MONTHLY',
            status: 'ACTIVE',
            startDate: new Date(),
            endDate,
            pricePaid: price,
            features: plan.features,
            stripeSubscriptionId: payment_provider === 'stripe' ? payment_id : undefined,
            razorpaySubscriptionId: payment_provider === 'razorpay' ? payment_id : undefined
        },
        create: {
            userId: req.user.id,
            planName: planKey,
            billingCycle: billing_cycle?.toUpperCase() || 'MONTHLY',
            startDate: new Date(),
            endDate,
            status: 'ACTIVE',
            pricePaid: price,
            features: plan.features,
            stripeSubscriptionId: payment_provider === 'stripe' ? payment_id : null,
            razorpaySubscriptionId: payment_provider === 'razorpay' ? payment_id : null
        }
    });

    res.status(201).json({
        success: true,
        subscription,
        message: `Successfully subscribed to ${planKey} plan`
    });
});

// @desc    Cancel subscription
// @route   POST /api/subscriptions/cancel
// @access  Private
const cancelSubscription = asyncHandler(async (req, res) => {
    const { reason } = req.body;

    const subscription = await prisma.subscription.findUnique({
        where: { userId: req.user.id }
    });

    if (!subscription) {
        res.status(404);
        throw new Error('No subscription found');
    }

    if (subscription.planName === 'FREE') {
        res.status(400);
        throw new Error('Cannot cancel free plan');
    }

    const updatedSubscription = await prisma.subscription.update({
        where: { userId: req.user.id },
        data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            cancelReason: reason || 'User requested cancellation',
            autoRenew: false
        }
    });

    res.json({
        success: true,
        message: 'Subscription cancelled. You will retain access until the end of your billing period.',
        subscription: updatedSubscription
    });
});

// @desc    Pause subscription
// @route   POST /api/subscriptions/pause
// @access  Private
const pauseSubscription = asyncHandler(async (req, res) => {
    const subscription = await prisma.subscription.update({
        where: { userId: req.user.id },
        data: { status: 'PAUSED' }
    });

    res.json({
        success: true,
        message: 'Subscription paused',
        subscription
    });
});

// @desc    Resume subscription
// @route   POST /api/subscriptions/resume
// @access  Private
const resumeSubscription = asyncHandler(async (req, res) => {
    const subscription = await prisma.subscription.findUnique({
        where: { userId: req.user.id }
    });

    if (!subscription) {
        res.status(404);
        throw new Error('No subscription found');
    }

    if (subscription.status !== 'PAUSED') {
        res.status(400);
        throw new Error('Subscription is not paused');
    }

    const updatedSubscription = await prisma.subscription.update({
        where: { userId: req.user.id },
        data: { status: 'ACTIVE' }
    });

    res.json({
        success: true,
        message: 'Subscription resumed',
        subscription: updatedSubscription
    });
});

module.exports = {
    getPlans,
    getMySubscription,
    createSubscription,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription
};
