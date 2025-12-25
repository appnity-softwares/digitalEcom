const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
    let wishlist = await prisma.wishlist.findUnique({
        where: { userId: req.user.id },
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            image: true,
                            price: true,
                            discountPrice: true,
                            rating: true,
                            category: true
                        }
                    },
                    premiumDoc: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            thumbnail: true,
                            price: true,
                            category: true
                        }
                    }
                },
                orderBy: { addedAt: 'desc' }
            }
        }
    });

    if (!wishlist) {
        wishlist = await prisma.wishlist.create({
            data: { userId: req.user.id },
            include: { items: true }
        });
    }

    res.json({
        success: true,
        wishlist: {
            id: wishlist.id,
            items: wishlist.items.map(item => ({
                id: item.id,
                addedAt: item.addedAt,
                ...(item.product ? { product: item.product } : {}),
                ...(item.premiumDoc ? { premiumDoc: item.premiumDoc } : {})
            })),
            totalItems: wishlist.items.length
        }
    });
});

// @desc    Add item to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
    const { productId, premiumDocId } = req.body;

    if (!productId && !premiumDocId) {
        res.status(400);
        throw new Error('Must provide either productId or premiumDocId');
    }

    // Get or create wishlist
    let wishlist = await prisma.wishlist.findUnique({
        where: { userId: req.user.id }
    });

    if (!wishlist) {
        wishlist = await prisma.wishlist.create({
            data: { userId: req.user.id }
        });
    }

    // Check if item already in wishlist
    const existingItem = await prisma.wishlistItem.findFirst({
        where: {
            wishlistId: wishlist.id,
            ...(productId ? { productId } : { premiumDocId })
        }
    });

    if (existingItem) {
        res.status(400);
        throw new Error('Item already in wishlist');
    }

    // Add item
    const item = await prisma.wishlistItem.create({
        data: {
            wishlistId: wishlist.id,
            productId: productId || null,
            premiumDocId: premiumDocId || null
        },
        include: {
            product: {
                select: { id: true, title: true, slug: true, image: true, price: true }
            },
            premiumDoc: {
                select: { id: true, title: true, slug: true, thumbnail: true, price: true }
            }
        }
    });

    res.status(201).json({
        success: true,
        item
    });
});

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:itemId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    const item = await prisma.wishlistItem.findUnique({
        where: { id: itemId },
        include: { wishlist: true }
    });

    if (!item) {
        res.status(404);
        throw new Error('Item not found');
    }

    if (item.wishlist.userId !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized');
    }

    await prisma.wishlistItem.delete({
        where: { id: itemId }
    });

    res.json({
        success: true,
        message: 'Item removed from wishlist'
    });
});

// @desc    Remove by product/doc ID
// @route   DELETE /api/wishlist/product/:productId or /api/wishlist/doc/:docId
// @access  Private
const removeByProductId = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const wishlist = await prisma.wishlist.findUnique({
        where: { userId: req.user.id }
    });

    if (!wishlist) {
        res.status(404);
        throw new Error('Wishlist not found');
    }

    await prisma.wishlistItem.deleteMany({
        where: {
            wishlistId: wishlist.id,
            productId
        }
    });

    res.json({
        success: true,
        message: 'Item removed from wishlist'
    });
});

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
const clearWishlist = asyncHandler(async (req, res) => {
    const wishlist = await prisma.wishlist.findUnique({
        where: { userId: req.user.id }
    });

    if (wishlist) {
        await prisma.wishlistItem.deleteMany({
            where: { wishlistId: wishlist.id }
        });
    }

    res.json({
        success: true,
        message: 'Wishlist cleared'
    });
});

// @desc    Check if item is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
const checkInWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const wishlist = await prisma.wishlist.findUnique({
        where: { userId: req.user.id }
    });

    let inWishlist = false;
    if (wishlist) {
        const item = await prisma.wishlistItem.findFirst({
            where: {
                wishlistId: wishlist.id,
                productId
            }
        });
        inWishlist = !!item;
    }

    res.json({
        success: true,
        inWishlist
    });
});

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    removeByProductId,
    clearWishlist,
    checkInWishlist
};
