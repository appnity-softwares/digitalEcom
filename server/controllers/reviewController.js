const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total, stats] = await Promise.all([
        prisma.review.findMany({
            where: { productId, isApproved: true },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true }
                }
            },
            orderBy: { [sort]: order },
            skip,
            take: parseInt(limit)
        }),
        prisma.review.count({ where: { productId, isApproved: true } }),
        prisma.review.aggregate({
            where: { productId, isApproved: true },
            _avg: { rating: true },
            _count: { rating: true }
        })
    ]);

    // Calculate rating distribution
    const distribution = await prisma.review.groupBy({
        by: ['rating'],
        where: { productId, isApproved: true },
        _count: { rating: true }
    });

    const ratingDistribution = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    distribution.forEach(d => {
        ratingDistribution[d.rating] = d._count.rating;
    });

    res.json({
        success: true,
        reviews,
        stats: {
            averageRating: stats._avg.rating || 0,
            totalReviews: stats._count.rating,
            distribution: ratingDistribution
        },
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
});

// @desc    Get reviews for a doc
// @route   GET /api/reviews/doc/:docId
// @access  Public
const getDocReviews = asyncHandler(async (req, res) => {
    const { docId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total, stats] = await Promise.all([
        prisma.review.findMany({
            where: { premiumDocId: docId, isApproved: true },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit)
        }),
        prisma.review.count({ where: { premiumDocId: docId, isApproved: true } }),
        prisma.review.aggregate({
            where: { premiumDocId: docId, isApproved: true },
            _avg: { rating: true },
            _count: { rating: true }
        })
    ]);

    res.json({
        success: true,
        reviews,
        stats: {
            averageRating: stats._avg.rating || 0,
            totalReviews: stats._count.rating
        },
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
});

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
    const { productId, premiumDocId, rating, title, comment } = req.body;

    if (!productId && !premiumDocId) {
        res.status(400);
        throw new Error('Must provide either productId or premiumDocId');
    }

    if (!rating || rating < 1 || rating > 5) {
        res.status(400);
        throw new Error('Rating must be between 1 and 5');
    }

    if (!comment || comment.trim().length < 10) {
        res.status(400);
        throw new Error('Comment must be at least 10 characters');
    }

    // Check if user already reviewed this item
    const existingReview = await prisma.review.findFirst({
        where: {
            userId: req.user.id,
            ...(productId ? { productId } : { premiumDocId })
        }
    });

    if (existingReview) {
        res.status(400);
        throw new Error('You have already reviewed this item');
    }

    // Check if user has purchased this item (REQUIRED for review)
    let isVerifiedPurchase = false;

    if (productId) {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { purchasedProducts: { where: { id: productId } } }
        });
        isVerifiedPurchase = user.purchasedProducts.length > 0;
    } else if (premiumDocId) {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { purchasedDocs: { where: { id: premiumDocId } } }
        });
        isVerifiedPurchase = user.purchasedDocs.length > 0;
    }

    // Only purchasers can review
    if (!isVerifiedPurchase) {
        res.status(403);
        throw new Error('You must purchase this item before leaving a review');
    }

    const review = await prisma.review.create({
        data: {
            userId: req.user.id,
            productId: productId || null,
            premiumDocId: premiumDocId || null,
            rating: parseInt(rating),
            title: title?.trim() || null,
            comment: comment.trim(),
            isVerifiedPurchase
        },
        include: {
            user: {
                select: { id: true, name: true, avatar: true }
            }
        }
    });

    // Update product/doc average rating
    if (productId) {
        const stats = await prisma.review.aggregate({
            where: { productId, isApproved: true },
            _avg: { rating: true },
            _count: { rating: true }
        });
        await prisma.product.update({
            where: { id: productId },
            data: {
                rating: stats._avg.rating || 0,
                numReviews: stats._count.rating
            }
        });
    }

    res.status(201).json({
        success: true,
        review
    });
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
    const { rating, title, comment } = req.body;

    const review = await prisma.review.findUnique({
        where: { id: req.params.id }
    });

    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(403);
        throw new Error('Not authorized to update this review');
    }

    const updatedReview = await prisma.review.update({
        where: { id: req.params.id },
        data: {
            ...(rating && { rating: parseInt(rating) }),
            ...(title !== undefined && { title: title?.trim() || null }),
            ...(comment && { comment: comment.trim() })
        },
        include: {
            user: {
                select: { id: true, name: true, avatar: true }
            }
        }
    });

    // Recalculate average rating
    if (review.productId) {
        const stats = await prisma.review.aggregate({
            where: { productId: review.productId, isApproved: true },
            _avg: { rating: true },
            _count: { rating: true }
        });
        await prisma.product.update({
            where: { id: review.productId },
            data: {
                rating: stats._avg.rating || 0,
                numReviews: stats._count.rating
            }
        });
    }

    res.json({
        success: true,
        review: updatedReview
    });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
    const review = await prisma.review.findUnique({
        where: { id: req.params.id }
    });

    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(403);
        throw new Error('Not authorized to delete this review');
    }

    await prisma.review.delete({
        where: { id: req.params.id }
    });

    // Recalculate average rating
    if (review.productId) {
        const stats = await prisma.review.aggregate({
            where: { productId: review.productId, isApproved: true },
            _avg: { rating: true },
            _count: { rating: true }
        });
        await prisma.product.update({
            where: { id: review.productId },
            data: {
                rating: stats._avg.rating || 0,
                numReviews: stats._count.rating
            }
        });
    }

    res.json({
        success: true,
        message: 'Review deleted'
    });
});

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Public
const markHelpful = asyncHandler(async (req, res) => {
    const review = await prisma.review.update({
        where: { id: req.params.id },
        data: { helpfulCount: { increment: 1 } }
    });

    res.json({
        success: true,
        helpfulCount: review.helpfulCount
    });
});

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
const getMyReviews = asyncHandler(async (req, res) => {
    const reviews = await prisma.review.findMany({
        where: { userId: req.user.id },
        include: {
            product: {
                select: { id: true, title: true, slug: true, image: true }
            },
            premiumDoc: {
                select: { id: true, title: true, slug: true, thumbnail: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.json({
        success: true,
        reviews
    });
});

module.exports = {
    getProductReviews,
    getDocReviews,
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    getMyReviews
};
