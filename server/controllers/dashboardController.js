const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

// @desc    Get dashboard overview stats
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get all stats in parallel
    const [
        totalUsers,
        newUsersThisMonth,
        newUsersLastMonth,
        totalOrders,
        ordersThisMonth,
        ordersLastMonth,
        revenueThisMonth,
        revenueLastMonth,
        totalProducts,
        totalDocs,
        totalSaasTools,
        activeSubscriptions,
        totalApiKeys
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.user.count({
            where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }
        }),
        prisma.order.count({ where: { isPaid: true } }),
        prisma.order.count({
            where: { isPaid: true, paidAt: { gte: startOfMonth } }
        }),
        prisma.order.count({
            where: { isPaid: true, paidAt: { gte: startOfLastMonth, lte: endOfLastMonth } }
        }),
        prisma.order.aggregate({
            where: { isPaid: true, paidAt: { gte: startOfMonth } },
            _sum: { totalPrice: true }
        }),
        prisma.order.aggregate({
            where: { isPaid: true, paidAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
            _sum: { totalPrice: true }
        }),
        prisma.product.count(),
        prisma.premiumDoc.count(),
        prisma.saasTool.count({ where: { isActive: true } }),
        prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        prisma.apiKey.count({ where: { isActive: true } })
    ]);

    // Calculate growth percentages
    const userGrowth = newUsersLastMonth > 0
        ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(1)
        : 100;

    const orderGrowth = ordersLastMonth > 0
        ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth * 100).toFixed(1)
        : 100;

    const revenueGrowth = (revenueLastMonth._sum.totalPrice || 0) > 0
        ? (((revenueThisMonth._sum.totalPrice || 0) - (revenueLastMonth._sum.totalPrice || 0)) /
            (revenueLastMonth._sum.totalPrice || 1) * 100).toFixed(1)
        : 100;

    res.json({
        success: true,
        stats: {
            users: {
                total: totalUsers,
                thisMonth: newUsersThisMonth,
                growth: parseFloat(userGrowth)
            },
            orders: {
                total: totalOrders,
                thisMonth: ordersThisMonth,
                growth: parseFloat(orderGrowth)
            },
            revenue: {
                thisMonth: revenueThisMonth._sum.totalPrice || 0,
                lastMonth: revenueLastMonth._sum.totalPrice || 0,
                growth: parseFloat(revenueGrowth)
            },
            content: {
                products: totalProducts,
                docs: totalDocs,
                saasTools: totalSaasTools
            },
            subscriptions: {
                active: activeSubscriptions,
                apiKeys: totalApiKeys
            }
        }
    });
});

// @desc    Get revenue chart data
// @route   GET /api/dashboard/revenue
// @access  Private/Admin
const getRevenueChart = asyncHandler(async (req, res) => {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily revenue
    const orders = await prisma.order.findMany({
        where: {
            isPaid: true,
            paidAt: { gte: startDate }
        },
        select: {
            paidAt: true,
            totalPrice: true
        },
        orderBy: { paidAt: 'asc' }
    });

    // Group by date
    const revenueByDate = {};
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const dateKey = date.toISOString().split('T')[0];
        revenueByDate[dateKey] = { date: dateKey, revenue: 0, orders: 0 };
    }

    orders.forEach(order => {
        if (order.paidAt) {
            const dateKey = order.paidAt.toISOString().split('T')[0];
            if (revenueByDate[dateKey]) {
                revenueByDate[dateKey].revenue += order.totalPrice;
                revenueByDate[dateKey].orders += 1;
            }
        }
    });

    res.json({
        success: true,
        data: Object.values(revenueByDate)
    });
});

// @desc    Get top products
// @route   GET /api/dashboard/top-products
// @access  Private/Admin
const getTopProducts = asyncHandler(async (req, res) => {
    const { limit = 10, period = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const products = await prisma.product.findMany({
        select: {
            id: true,
            title: true,
            slug: true,
            image: true,
            price: true,
            numSales: true,
            numViews: true,
            rating: true
        },
        orderBy: { numSales: 'desc' },
        take: parseInt(limit)
    });

    res.json({
        success: true,
        products
    });
});

// @desc    Get recent orders
// @route   GET /api/dashboard/recent-orders
// @access  Private/Admin
const getRecentOrders = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const orders = await prisma.order.findMany({
        include: {
            user: {
                select: { id: true, name: true, email: true, avatar: true }
            },
            items: {
                select: { title: true, price: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit)
    });

    res.json({
        success: true,
        orders
    });
});

// @desc    Get user growth chart
// @route   GET /api/dashboard/user-growth
// @access  Private/Admin
const getUserGrowth = asyncHandler(async (req, res) => {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const users = await prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' }
    });

    // Group by date
    const usersByDate = {};
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const dateKey = date.toISOString().split('T')[0];
        usersByDate[dateKey] = { date: dateKey, users: 0 };
    }

    users.forEach(user => {
        const dateKey = user.createdAt.toISOString().split('T')[0];
        if (usersByDate[dateKey]) {
            usersByDate[dateKey].users += 1;
        }
    });

    res.json({
        success: true,
        data: Object.values(usersByDate)
    });
});

// @desc    Get subscription stats
// @route   GET /api/dashboard/subscriptions
// @access  Private/Admin
const getSubscriptionStats = asyncHandler(async (req, res) => {
    const [planDistribution, recentCancellations, monthlyRecurring] = await Promise.all([
        prisma.subscription.groupBy({
            by: ['planName'],
            where: { status: 'ACTIVE' },
            _count: { planName: true }
        }),
        prisma.subscription.count({
            where: {
                status: 'CANCELLED',
                cancelledAt: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 30))
                }
            }
        }),
        prisma.subscription.aggregate({
            where: { status: 'ACTIVE', planName: { not: 'FREE' } },
            _sum: { pricePaid: true }
        })
    ]);

    res.json({
        success: true,
        stats: {
            planDistribution: planDistribution.map(p => ({
                plan: p.planName,
                count: p._count.planName
            })),
            recentCancellations,
            monthlyRecurringRevenue: monthlyRecurring._sum.pricePaid || 0
        }
    });
});

// @desc    Get API usage stats
// @route   GET /api/dashboard/api-usage
// @access  Private/Admin
const getApiUsageStats = asyncHandler(async (req, res) => {
    const [toolUsage, topUsers, totalRequests] = await Promise.all([
        prisma.saasTool.findMany({
            select: {
                id: true,
                name: true,
                activeUsers: true,
                totalRequests: true,
                avgResponseTimeMs: true
            },
            orderBy: { totalRequests: 'desc' },
            take: 10
        }),
        prisma.apiKey.findMany({
            select: {
                id: true,
                name: true,
                usageCount: true,
                user: { select: { name: true, email: true } },
                tool: { select: { name: true } }
            },
            orderBy: { usageCount: 'desc' },
            take: 10
        }),
        prisma.apiKey.aggregate({
            _sum: { usageCount: true }
        })
    ]);

    res.json({
        success: true,
        stats: {
            toolUsage,
            topUsers,
            totalApiRequests: totalRequests._sum.usageCount || 0
        }
    });
});

// @desc    Get category breakdown
// @route   GET /api/dashboard/categories
// @access  Private/Admin
const getCategoryBreakdown = asyncHandler(async (req, res) => {
    const [productsByCategory, docsByCategory] = await Promise.all([
        prisma.product.groupBy({
            by: ['category'],
            _count: { id: true },
            _sum: { numSales: true }
        }),
        prisma.premiumDoc.groupBy({
            by: ['category'],
            _count: { id: true },
            _sum: { purchases: true }
        })
    ]);

    res.json({
        success: true,
        products: productsByCategory.map(c => ({
            category: c.category,
            count: c._count.id,
            sales: c._sum.numSales || 0
        })),
        docs: docsByCategory.map(c => ({
            category: c.category,
            count: c._count.id,
            purchases: c._sum.purchases || 0
        }))
    });
});

module.exports = {
    getDashboardStats,
    getRevenueChart,
    getTopProducts,
    getRecentOrders,
    getUserGrowth,
    getSubscriptionStats,
    getApiUsageStats,
    getCategoryBreakdown
};
