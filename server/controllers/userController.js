const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Admin
const getUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
        ];
    }

    if (role) {
        where.role = role;
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                googleId: true,
                githubId: true,
                createdAt: true,
                subscription: {
                    select: {
                        planName: true,
                        status: true
                    }
                },
                _count: {
                    select: {
                        orders: true,
                        apiKeys: true
                    }
                }
            }
        }),
        prisma.user.count({ where })
    ]);

    res.json({
        success: true,
        users,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
});

// @desc    Get user by ID (admin only)
// @route   GET /api/users/:id
// @access  Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
            googleId: true,
            githubId: true,
            createdAt: true,
            subscription: true,
            orders: {
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: { items: true }
            },
            apiKeys: {
                select: {
                    id: true,
                    prefix: true,
                    tier: true,
                    isActive: true,
                    createdAt: true
                }
            },
            purchasedProducts: {
                select: { id: true, title: true }
            },
            purchasedDocs: {
                select: { id: true, title: true }
            }
        }
    });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.json({ success: true, user });
});

// @desc    Update user role (admin only)
// @route   PUT /api/users/:id/role
// @access  Admin
const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
        res.status(400);
        throw new Error('Invalid role');
    }

    // Prevent admin from demoting themselves
    if (req.params.id === req.user.id && role !== 'ADMIN') {
        res.status(400);
        throw new Error('Cannot demote yourself');
    }

    const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { role },
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    });

    res.json({
        success: true,
        message: `User role updated to ${role}`,
        user
    });
});

// @desc    Update user subscription (admin only)
// @route   PUT /api/users/:id/subscription
// @access  Admin
const updateUserSubscription = asyncHandler(async (req, res) => {
    const { planName, status } = req.body;

    const endDate = new Date();
    if (planName !== 'FREE') {
        endDate.setMonth(endDate.getMonth() + 1);
    }

    const features = planName === 'ENTERPRISE'
        ? ['Everything in Pro', 'Extended licenses', 'Custom integrations', 'Dedicated support']
        : planName === 'PRO'
            ? ['Unlimited templates', 'All UI kits', 'Premium Docs', 'Priority support']
            : [];

    const subscription = await prisma.subscription.upsert({
        where: { userId: req.params.id },
        update: {
            planName,
            status: status || 'ACTIVE',
            startDate: new Date(),
            endDate: planName === 'FREE' ? null : endDate,
            features
        },
        create: {
            userId: req.params.id,
            planName,
            status: status || 'ACTIVE',
            startDate: new Date(),
            endDate: planName === 'FREE' ? null : endDate,
            features
        }
    });

    res.json({
        success: true,
        message: `Subscription updated to ${planName}`,
        subscription
    });
});

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = asyncHandler(async (req, res) => {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
        res.status(400);
        throw new Error('Cannot delete yourself');
    }

    const user = await prisma.user.findUnique({
        where: { id: req.params.id }
    });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Delete related data
    await prisma.$transaction([
        prisma.apiKey.deleteMany({ where: { userId: req.params.id } }),
        prisma.subscription.deleteMany({ where: { userId: req.params.id } }),
        prisma.order.deleteMany({ where: { userId: req.params.id } }),
        prisma.user.delete({ where: { id: req.params.id } })
    ]);

    res.json({
        success: true,
        message: 'User deleted successfully'
    });
});

// @desc    Get user stats (admin only)
// @route   GET /api/users/stats
// @access  Admin
const getUserStats = asyncHandler(async (req, res) => {
    const [totalUsers, activeSubscriptions, newUsersThisMonth, oauthUsers] = await Promise.all([
        prisma.user.count(),
        prisma.subscription.count({ where: { status: 'ACTIVE', planName: { not: 'FREE' } } }),
        prisma.user.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().setDate(1)) // First day of current month
                }
            }
        }),
        prisma.user.count({
            where: {
                OR: [
                    { googleId: { not: null } },
                    { githubId: { not: null } }
                ]
            }
        })
    ]);

    res.json({
        success: true,
        stats: {
            totalUsers,
            activeSubscriptions,
            newUsersThisMonth,
            oauthUsers
        }
    });
});

module.exports = {
    getUsers,
    getUserById,
    updateUserRole,
    updateUserSubscription,
    deleteUser,
    getUserStats
};
