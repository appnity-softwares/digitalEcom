const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = asyncHandler(async (req, res) => {
    const { code, cartTotal, productIds = [] } = req.body;

    if (!code) {
        res.status(400);
        throw new Error('Coupon code is required');
    }

    const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() }
    });

    if (!coupon) {
        res.status(404);
        throw new Error('Invalid coupon code');
    }

    // Check if coupon is active
    if (!coupon.isActive) {
        res.status(400);
        throw new Error('This coupon is no longer active');
    }

    // Check validity dates
    const now = new Date();
    if (coupon.validFrom > now) {
        res.status(400);
        throw new Error('This coupon is not yet valid');
    }

    if (coupon.validUntil && coupon.validUntil < now) {
        res.status(400);
        throw new Error('This coupon has expired');
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        res.status(400);
        throw new Error('This coupon has reached its usage limit');
    }

    // Check per-user limit if user is logged in
    if (req.user) {
        const userUsage = await prisma.couponUsage.count({
            where: {
                couponId: coupon.id,
                userId: req.user.id
            }
        });

        if (userUsage >= coupon.perUserLimit) {
            res.status(400);
            throw new Error('You have already used this coupon');
        }
    }

    // Check minimum order value
    if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
        res.status(400);
        throw new Error(`Minimum order value of $${coupon.minOrderValue} required`);
    }

    // Check if coupon is applicable to products
    if (coupon.applicableTo && coupon.applicableTo.length > 0) {
        const isApplicable = productIds.some(id => coupon.applicableTo.includes(id));
        if (!isApplicable) {
            res.status(400);
            throw new Error('This coupon is not applicable to your cart items');
        }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (cartTotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
        }
    } else {
        discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed cart total
    discountAmount = Math.min(discountAmount, cartTotal);

    res.json({
        success: true,
        coupon: {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            description: coupon.description
        },
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        finalTotal: parseFloat((cartTotal - discountAmount).toFixed(2))
    });
});

// @desc    Apply coupon (record usage)
// @route   POST /api/coupons/apply
// @access  Private
const applyCoupon = asyncHandler(async (req, res) => {
    const { code, orderId, discountApplied } = req.body;

    const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() }
    });

    if (!coupon) {
        res.status(404);
        throw new Error('Invalid coupon code');
    }

    // Record usage
    await prisma.couponUsage.create({
        data: {
            couponId: coupon.id,
            userId: req.user.id,
            orderId,
            discountApplied
        }
    });

    // Increment usage count
    await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usageCount: { increment: 1 } }
    });

    res.json({
        success: true,
        message: 'Coupon applied successfully'
    });
});

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
    const { active, expired, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    const now = new Date();

    if (active === 'true') {
        where.isActive = true;
        where.OR = [
            { validUntil: null },
            { validUntil: { gt: now } }
        ];
    }

    if (expired === 'true') {
        where.validUntil = { lt: now };
    }

    const [coupons, total] = await Promise.all([
        prisma.coupon.findMany({
            where,
            include: {
                _count: { select: { usages: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit)
        }),
        prisma.coupon.count({ where })
    ]);

    res.json({
        success: true,
        coupons,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
});

// @desc    Create a coupon (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
    const {
        code,
        description,
        discountType,
        discountValue,
        minOrderValue,
        maxDiscount,
        usageLimit,
        perUserLimit,
        validFrom,
        validUntil,
        applicableTo
    } = req.body;

    if (!code || !discountValue) {
        res.status(400);
        throw new Error('Code and discount value are required');
    }

    // Check if code already exists
    const existing = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() }
    });

    if (existing) {
        res.status(400);
        throw new Error('Coupon code already exists');
    }

    const coupon = await prisma.coupon.create({
        data: {
            code: code.toUpperCase(),
            description,
            discountType: discountType || 'PERCENTAGE',
            discountValue: parseFloat(discountValue),
            minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
            maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
            usageLimit: usageLimit ? parseInt(usageLimit) : null,
            perUserLimit: perUserLimit ? parseInt(perUserLimit) : 1,
            validFrom: validFrom ? new Date(validFrom) : new Date(),
            validUntil: validUntil ? new Date(validUntil) : null,
            applicableTo: applicableTo || []
        }
    });

    res.status(201).json({
        success: true,
        coupon
    });
});

// @desc    Update a coupon (Admin)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
    const coupon = await prisma.coupon.findUnique({
        where: { id: req.params.id }
    });

    if (!coupon) {
        res.status(404);
        throw new Error('Coupon not found');
    }

    const updatedCoupon = await prisma.coupon.update({
        where: { id: req.params.id },
        data: {
            ...req.body,
            ...(req.body.code && { code: req.body.code.toUpperCase() }),
            ...(req.body.validFrom && { validFrom: new Date(req.body.validFrom) }),
            ...(req.body.validUntil && { validUntil: new Date(req.body.validUntil) })
        }
    });

    res.json({
        success: true,
        coupon: updatedCoupon
    });
});

// @desc    Delete a coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
    const coupon = await prisma.coupon.findUnique({
        where: { id: req.params.id }
    });

    if (!coupon) {
        res.status(404);
        throw new Error('Coupon not found');
    }

    await prisma.coupon.delete({
        where: { id: req.params.id }
    });

    res.json({
        success: true,
        message: 'Coupon deleted'
    });
});

// @desc    Get coupon usage stats (Admin)
// @route   GET /api/coupons/:id/stats
// @access  Private/Admin
const getCouponStats = asyncHandler(async (req, res) => {
    const coupon = await prisma.coupon.findUnique({
        where: { id: req.params.id },
        include: {
            usages: {
                include: {
                    coupon: { select: { code: true } }
                },
                orderBy: { usedAt: 'desc' },
                take: 50
            }
        }
    });

    if (!coupon) {
        res.status(404);
        throw new Error('Coupon not found');
    }

    // Calculate total savings
    const totalSavings = await prisma.couponUsage.aggregate({
        where: { couponId: coupon.id },
        _sum: { discountApplied: true }
    });

    res.json({
        success: true,
        coupon: {
            ...coupon,
            totalSavings: totalSavings._sum.discountApplied || 0,
            usageRemaining: coupon.usageLimit ? coupon.usageLimit - coupon.usageCount : 'Unlimited'
        }
    });
});

module.exports = {
    validateCoupon,
    applyCoupon,
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getCouponStats
};
