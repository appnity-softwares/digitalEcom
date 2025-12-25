const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

// Middleware to log API calls
const logApiCall = async ({
    apiKeyId,
    toolId,
    endpoint,
    method,
    statusCode,
    requestBody,
    responseBody,
    responseTimeMs,
    ipAddress,
    userAgent
}) => {
    try {
        await prisma.apiCallLog.create({
            data: {
                apiKeyId,
                toolId,
                endpoint,
                method,
                statusCode,
                requestBody,
                responseBody,
                responseTimeMs,
                ipAddress,
                userAgent
            }
        });

        // Update API key usage count
        await prisma.apiKey.update({
            where: { id: apiKeyId },
            data: {
                usageCount: { increment: 1 },
                lastUsedAt: new Date()
            }
        });

        // Update tool stats
        await prisma.saasTool.update({
            where: { id: toolId },
            data: {
                totalRequests: { increment: 1 }
            }
        });
    } catch (error) {
        console.error('Error logging API call:', error);
    }
};

// @desc    Get API usage stats for a key
// @route   GET /api/analytics/api-key/:keyId
// @access  Private
const getApiKeyStats = asyncHandler(async (req, res) => {
    const { keyId } = req.params;
    const { days = 30 } = req.query;

    const key = await prisma.apiKey.findUnique({
        where: { id: keyId },
        include: { tool: { select: { name: true, id: true } } }
    });

    if (!key) {
        res.status(404);
        throw new Error('API key not found');
    }

    if (key.userId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(403);
        throw new Error('Not authorized');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get usage over time
    const logs = await prisma.apiCallLog.findMany({
        where: {
            apiKeyId: keyId,
            createdAt: { gte: startDate }
        },
        select: {
            createdAt: true,
            statusCode: true,
            responseTimeMs: true,
            endpoint: true
        },
        orderBy: { createdAt: 'desc' }
    });

    // Aggregate stats
    const totalCalls = logs.length;
    const successCalls = logs.filter(l => l.statusCode >= 200 && l.statusCode < 300).length;
    const avgResponseTime = logs.length > 0
        ? Math.round(logs.reduce((sum, l) => sum + l.responseTimeMs, 0) / logs.length)
        : 0;

    // Group by date
    const usageByDate = {};
    logs.forEach(log => {
        const dateKey = log.createdAt.toISOString().split('T')[0];
        if (!usageByDate[dateKey]) {
            usageByDate[dateKey] = { date: dateKey, calls: 0, errors: 0 };
        }
        usageByDate[dateKey].calls++;
        if (log.statusCode >= 400) {
            usageByDate[dateKey].errors++;
        }
    });

    // Top endpoints
    const endpointCounts = {};
    logs.forEach(log => {
        endpointCounts[log.endpoint] = (endpointCounts[log.endpoint] || 0) + 1;
    });
    const topEndpoints = Object.entries(endpointCounts)
        .map(([endpoint, count]) => ({ endpoint, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    res.json({
        success: true,
        stats: {
            key: {
                id: key.id,
                name: key.name,
                tier: key.tier,
                usageCount: key.usageCount,
                usageLimit: key.usageLimit,
                tool: key.tool.name
            },
            period: {
                days: parseInt(days),
                totalCalls,
                successRate: totalCalls > 0 ? Math.round((successCalls / totalCalls) * 100) : 100,
                avgResponseTime
            },
            usageByDate: Object.values(usageByDate),
            topEndpoints
        }
    });
});

// @desc    Get SaaS tool analytics (Admin)
// @route   GET /api/analytics/tool/:toolId
// @access  Private/Admin
const getToolAnalytics = asyncHandler(async (req, res) => {
    const { toolId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const [tool, logs, activeKeys] = await Promise.all([
        prisma.saasTool.findUnique({
            where: { id: toolId }
        }),
        prisma.apiCallLog.findMany({
            where: {
                toolId,
                createdAt: { gte: startDate }
            },
            select: {
                createdAt: true,
                statusCode: true,
                responseTimeMs: true
            }
        }),
        prisma.apiKey.count({
            where: { toolId, isActive: true }
        })
    ]);

    if (!tool) {
        res.status(404);
        throw new Error('Tool not found');
    }

    // Aggregate by date
    const usageByDate = {};
    let totalResponseTime = 0;
    logs.forEach(log => {
        const dateKey = log.createdAt.toISOString().split('T')[0];
        if (!usageByDate[dateKey]) {
            usageByDate[dateKey] = { date: dateKey, calls: 0, errors: 0, avgResponseTime: 0, totalTime: 0 };
        }
        usageByDate[dateKey].calls++;
        usageByDate[dateKey].totalTime += log.responseTimeMs;
        if (log.statusCode >= 400) usageByDate[dateKey].errors++;
        totalResponseTime += log.responseTimeMs;
    });

    Object.values(usageByDate).forEach(day => {
        day.avgResponseTime = Math.round(day.totalTime / day.calls);
        delete day.totalTime;
    });

    res.json({
        success: true,
        tool: {
            id: tool.id,
            name: tool.name,
            totalRequests: tool.totalRequests,
            activeUsers: tool.activeUsers,
            uptimePercentage: tool.uptimePercentage
        },
        stats: {
            period: parseInt(days),
            totalCalls: logs.length,
            activeKeys,
            avgResponseTime: logs.length > 0 ? Math.round(totalResponseTime / logs.length) : 0,
            usageByDate: Object.values(usageByDate)
        }
    });
});

// @desc    Get product analytics
// @route   GET /api/analytics/product/:productId
// @access  Private/Admin
const getProductAnalytics = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const [product, orders, views] = await Promise.all([
        prisma.product.findUnique({
            where: { id: productId },
            select: {
                id: true,
                title: true,
                price: true,
                numSales: true,
                numViews: true,
                rating: true,
                numReviews: true
            }
        }),
        prisma.orderItem.findMany({
            where: {
                productId,
                order: { isPaid: true, paidAt: { gte: startDate } }
            },
            include: {
                order: { select: { paidAt: true } }
            }
        }),
        prisma.analyticsEvent.findMany({
            where: {
                productId,
                eventType: 'product_view',
                createdAt: { gte: startDate }
            },
            select: { createdAt: true }
        })
    ]);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Revenue calculation
    const revenue = orders.reduce((sum, item) => sum + item.price, 0);

    // Group sales by date
    const salesByDate = {};
    orders.forEach(item => {
        if (item.order.paidAt) {
            const dateKey = item.order.paidAt.toISOString().split('T')[0];
            if (!salesByDate[dateKey]) {
                salesByDate[dateKey] = { date: dateKey, sales: 0, revenue: 0 };
            }
            salesByDate[dateKey].sales++;
            salesByDate[dateKey].revenue += item.price;
        }
    });

    // Group views by date
    const viewsByDate = {};
    views.forEach(view => {
        const dateKey = view.createdAt.toISOString().split('T')[0];
        viewsByDate[dateKey] = (viewsByDate[dateKey] || 0) + 1;
    });

    // Conversion rate
    const conversionRate = views.length > 0
        ? ((orders.length / views.length) * 100).toFixed(2)
        : 0;

    res.json({
        success: true,
        product,
        stats: {
            period: parseInt(days),
            views: views.length,
            sales: orders.length,
            revenue,
            conversionRate: parseFloat(conversionRate),
            salesByDate: Object.values(salesByDate),
            viewsByDate
        }
    });
});

// @desc    Track product view
// @route   POST /api/analytics/track/product-view
// @access  Public
const trackProductView = asyncHandler(async (req, res) => {
    const { productId, sessionId } = req.body;

    if (!productId) {
        res.status(400);
        throw new Error('Product ID required');
    }

    await prisma.analyticsEvent.create({
        data: {
            eventType: 'product_view',
            productId,
            userId: req.user?.id || null,
            sessionId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        }
    });

    res.json({ success: true });
});

// @desc    Get overall product analytics (Admin)
// @route   GET /api/analytics/products
// @access  Private/Admin
const getAllProductAnalytics = asyncHandler(async (req, res) => {
    const { days = 30, limit = 20 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Top products by revenue
    const topByRevenue = await prisma.product.findMany({
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

    // Add revenue calculation
    const productsWithRevenue = topByRevenue.map(p => ({
        ...p,
        revenue: p.numSales * p.price,
        conversionRate: p.numViews > 0 ? ((p.numSales / p.numViews) * 100).toFixed(2) : 0
    }));

    res.json({
        success: true,
        products: productsWithRevenue
    });
});

module.exports = {
    logApiCall,
    getApiKeyStats,
    getToolAnalytics,
    getProductAnalytics,
    trackProductView,
    getAllProductAnalytics
};
