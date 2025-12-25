const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

// @desc    Add order items
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
    const { orderItems, paymentMethod, totalPrice, couponCode, discount } = req.body;

    if (!orderItems || orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    }

    // Create order with items
    const order = await prisma.order.create({
        data: {
            userId: req.user.id,
            paymentMethod: paymentMethod || 'Card',
            totalPrice: parseFloat(totalPrice),
            subtotal: parseFloat(totalPrice) + (parseFloat(discount) || 0),
            discount: parseFloat(discount) || 0,
            couponCode,
            items: {
                create: orderItems.map(item => ({
                    title: item.title,
                    qty: item.qty || 1,
                    image: item.image,
                    price: parseFloat(item.price),
                    productId: item.product || null,
                    premiumDocId: item.premiumDoc || null,
                    itemType: item.item_type?.toUpperCase() || 'PRODUCT',
                    licenseType: item.license_type?.toUpperCase() || 'PERSONAL'
                }))
            }
        },
        include: {
            items: true
        }
    });

    res.status(201).json({
        success: true,
        order
    });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
        where: { userId: req.user.id },
        include: {
            items: {
                include: {
                    product: {
                        select: { id: true, title: true, slug: true, image: true }
                    },
                    premiumDoc: {
                        select: { id: true, title: true, slug: true, thumbnail: true }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.json({
        success: true,
        orders
    });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({
        where: { id: req.params.id },
        include: {
            items: {
                include: {
                    product: true,
                    premiumDoc: true
                }
            },
            user: {
                select: { id: true, name: true, email: true }
            }
        }
    });

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Check if user owns this order or is admin
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(403);
        throw new Error('Not authorized to view this order');
    }

    res.json({
        success: true,
        order
    });
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const { paymentId, paymentStatus, paymentProvider } = req.body;

    const order = await prisma.order.findUnique({
        where: { id: req.params.id },
        include: { items: true }
    });

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Update order
    const updatedOrder = await prisma.order.update({
        where: { id: req.params.id },
        data: {
            isPaid: true,
            paidAt: new Date(),
            orderStatus: 'COMPLETED',
            paymentId,
            paymentStatus,
            paymentProvider,
            downloadExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
    });

    // Add products to user's purchased list
    const productIds = order.items
        .filter(item => item.productId)
        .map(item => item.productId);

    const docIds = order.items
        .filter(item => item.premiumDocId)
        .map(item => item.premiumDocId);

    if (productIds.length > 0) {
        await prisma.user.update({
            where: { id: order.userId },
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
            where: { id: order.userId },
            data: {
                purchasedDocs: {
                    connect: docIds.map(id => ({ id }))
                }
            }
        });

        // Increment purchases count
        await prisma.premiumDoc.updateMany({
            where: { id: { in: docIds } },
            data: { purchases: { increment: 1 } }
        });
    }

    res.json({
        success: true,
        order: updatedOrder
    });
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                },
                items: true
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit)
        }),
        prisma.order.count()
    ]);

    res.json({
        success: true,
        orders,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
});

module.exports = {
    addOrderItems,
    getMyOrders,
    getOrderById,
    updateOrderToPaid,
    getAllOrders
};
