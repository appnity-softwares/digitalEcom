const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const prisma = require('../config/prisma');

// @desc    Get all SaaS tools
// @route   GET /api/saas
// @access  Public
const getTools = asyncHandler(async (req, res) => {
    const { category } = req.query;

    const where = { isActive: true };
    if (category) {
        where.category = category;
    }

    const tools = await prisma.saasTool.findMany({
        where,
        orderBy: { activeUsers: 'desc' }
    });

    res.json({
        success: true,
        tools
    });
});

// @desc    Get tool by ID
// @route   GET /api/saas/tool/:id
// @access  Public
const getToolById = asyncHandler(async (req, res) => {
    let tool = await prisma.saasTool.findUnique({
        where: { id: req.params.id }
    });

    if (!tool) {
        tool = await prisma.saasTool.findUnique({
            where: { slug: req.params.id }
        });
    }

    if (!tool) {
        res.status(404);
        throw new Error('Tool not found');
    }

    res.json({
        success: true,
        tool
    });
});

// Helper: Generate API key
const generateApiKey = () => {
    const prefix = 'cs_' + crypto.randomBytes(4).toString('hex');
    const key = crypto.randomBytes(24).toString('hex');
    const fullKey = `${prefix}_${key}`;
    const hash = crypto.createHash('sha256').update(fullKey).digest('hex');
    return { prefix, key: fullKey, hash };
};

// @desc    Generate API key for a tool
// @route   POST /api/saas/tool/:toolId/generate-key
// @access  Private
const generateKey = asyncHandler(async (req, res) => {
    const { name = 'Default API Key' } = req.body;

    const tool = await prisma.saasTool.findUnique({
        where: { id: req.params.toolId }
    });

    if (!tool) {
        res.status(404);
        throw new Error('Tool not found');
    }

    // Check if tool requires subscription
    if (tool.requiresSubscription) {
        const subscription = await prisma.subscription.findUnique({
            where: { userId: req.user.id }
        });

        if (!subscription ||
            (subscription.planName === 'FREE') ||
            (subscription.status !== 'ACTIVE')) {
            res.status(403);
            throw new Error('This tool requires a Pro or Enterprise subscription');
        }
    }

    // Generate new key
    const { prefix, key, hash } = generateApiKey();

    const apiKey = await prisma.apiKey.create({
        data: {
            userId: req.user.id,
            toolId: tool.id,
            name,
            keyPrefix: prefix,
            keyHash: hash,
            tier: 'FREE',
            usageLimit: 100,
            usageResetDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
        }
    });

    // Update tool active users count
    await prisma.saasTool.update({
        where: { id: tool.id },
        data: { activeUsers: { increment: 1 } }
    });

    res.status(201).json({
        success: true,
        api_key: {
            id: apiKey.id,
            name: apiKey.name,
            key: key, // Only show full key once
            prefix: prefix,
            tier: apiKey.tier,
            usage_limit: apiKey.usageLimit,
            created_at: apiKey.createdAt
        },
        message: 'Save this key securely. You will not be able to see it again.'
    });
});

// @desc    Get user's API keys
// @route   GET /api/saas/my-keys
// @access  Private
const getMyKeys = asyncHandler(async (req, res) => {
    const keys = await prisma.apiKey.findMany({
        where: { userId: req.user.id },
        include: {
            tool: {
                select: { id: true, name: true, slug: true, icon: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.json({
        success: true,
        keys: keys.map(k => ({
            id: k.id,
            name: k.name,
            prefix: k.keyPrefix,
            tier: k.tier,
            usage_count: k.usageCount,
            usage_limit: k.usageLimit,
            is_active: k.isActive,
            last_used_at: k.lastUsedAt,
            tool: k.tool,
            created_at: k.createdAt
        }))
    });
});

// @desc    Get API key usage
// @route   GET /api/saas/keys/:keyId/usage
// @access  Private
const getKeyUsage = asyncHandler(async (req, res) => {
    const key = await prisma.apiKey.findUnique({
        where: { id: req.params.keyId },
        include: {
            tool: {
                select: { name: true }
            }
        }
    });

    if (!key) {
        res.status(404);
        throw new Error('API key not found');
    }

    if (key.userId !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to view this key');
    }

    res.json({
        success: true,
        usage: {
            count: key.usageCount,
            limit: key.usageLimit,
            reset_date: key.usageResetDate,
            percentage: Math.round((key.usageCount / key.usageLimit) * 100),
            last_used: key.lastUsedAt,
            tool: key.tool.name
        }
    });
});

// @desc    Revoke API key
// @route   DELETE /api/saas/keys/:keyId
// @access  Private
const revokeKey = asyncHandler(async (req, res) => {
    const key = await prisma.apiKey.findUnique({
        where: { id: req.params.keyId }
    });

    if (!key) {
        res.status(404);
        throw new Error('API key not found');
    }

    if (key.userId !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to revoke this key');
    }

    await prisma.apiKey.delete({
        where: { id: req.params.keyId }
    });

    res.json({
        success: true,
        message: 'API key revoked successfully'
    });
});

// @desc    Create a SaaS tool (Admin)
// @route   POST /api/saas
// @access  Private/Admin
const createTool = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        longDescription,
        icon,
        thumbnail,
        category,
        apiBaseUrl,
        documentationUrl,
        pricing,
        features,
        endpoints,
        codeExamples,
        isBeta,
        requiresSubscription
    } = req.body;

    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const tool = await prisma.saasTool.create({
        data: {
            name,
            slug,
            description,
            longDescription,
            icon,
            thumbnail,
            category: category || 'Other',
            apiBaseUrl,
            documentationUrl,
            pricing,
            features,
            endpoints,
            codeExamples,
            isBeta: isBeta || false,
            requiresSubscription: requiresSubscription || false
        }
    });

    res.status(201).json({
        success: true,
        tool
    });
});

// @desc    Update a SaaS tool (Admin)
// @route   PUT /api/saas/:id
// @access  Private/Admin
const updateTool = asyncHandler(async (req, res) => {
    const tool = await prisma.saasTool.findUnique({
        where: { id: req.params.id }
    });

    if (!tool) {
        res.status(404);
        throw new Error('Tool not found');
    }

    const updatedTool = await prisma.saasTool.update({
        where: { id: req.params.id },
        data: req.body
    });

    res.json({
        success: true,
        tool: updatedTool
    });
});

// @desc    Delete a SaaS tool (Admin)
// @route   DELETE /api/saas/:id
// @access  Private/Admin
const deleteTool = asyncHandler(async (req, res) => {
    const tool = await prisma.saasTool.findUnique({
        where: { id: req.params.id }
    });

    if (!tool) {
        res.status(404);
        throw new Error('Tool not found');
    }

    await prisma.saasTool.delete({
        where: { id: req.params.id }
    });

    res.json({
        success: true,
        message: 'SaaS tool removed'
    });
});

module.exports = {
    getTools,
    getToolById,
    generateKey,
    getMyKeys,
    getKeyUsage,
    revokeKey,
    createTool,
    updateTool,
    deleteTool
};
