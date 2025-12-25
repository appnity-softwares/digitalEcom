const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

// @desc    Get all premium docs
// @route   GET /api/docs
// @access  Public
const getDocs = asyncHandler(async (req, res) => {
    const { category, difficulty, search, page = 1, limit = 12 } = req.query;

    const where = { isPublished: true };

    if (category) {
        where.category = category;
    }

    if (difficulty) {
        where.difficulty = difficulty.toUpperCase();
    }

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { tags: { has: search } }
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [docs, total] = await Promise.all([
        prisma.premiumDoc.findMany({
            where,
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                category: true,
                price: true,
                discountPrice: true,
                thumbnail: true,
                readingTimeMinutes: true,
                difficulty: true,
                requiresSubscription: true,
                views: true,
                purchases: true,
                tags: true,
                createdAt: true,
                author: {
                    select: { id: true, name: true, avatar: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit)
        }),
        prisma.premiumDoc.count({ where })
    ]);

    res.json({
        success: true,
        docs,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
});

// @desc    Get doc by ID
// @route   GET /api/docs/:id
// @access  Public (preview) / Private (full)
const getDocById = asyncHandler(async (req, res) => {
    let doc = await prisma.premiumDoc.findUnique({
        where: { id: req.params.id },
        include: {
            author: {
                select: { id: true, name: true, avatar: true }
            },
            relatedProducts: {
                select: { id: true, title: true, slug: true, image: true, price: true }
            }
        }
    });

    if (!doc) {
        // Try finding by slug
        doc = await prisma.premiumDoc.findUnique({
            where: { slug: req.params.id },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true }
                },
                relatedProducts: {
                    select: { id: true, title: true, slug: true, image: true, price: true }
                }
            }
        });
    }

    if (!doc) {
        res.status(404);
        throw new Error('Documentation not found');
    }

    // Increment views
    await prisma.premiumDoc.update({
        where: { id: doc.id },
        data: { views: { increment: 1 } }
    });

    // Check if user has access
    let hasAccess = doc.price === 0 || doc.isFreePreview;

    if (req.user) {
        // Check if user purchased this doc
        const userWithDocs = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                purchasedDocs: { where: { id: doc.id } },
                subscription: true
            }
        });

        if (userWithDocs) {
            // Has purchased
            if (userWithDocs.purchasedDocs.length > 0) {
                hasAccess = true;
            }
            // Has pro subscription and doc requires subscription
            if (doc.requiresSubscription &&
                userWithDocs.subscription &&
                (userWithDocs.subscription.planName === 'PRO' || userWithDocs.subscription.planName === 'ENTERPRISE') &&
                userWithDocs.subscription.status === 'ACTIVE') {
                hasAccess = true;
            }
        }
    }

    // If no access, only return preview content
    if (!hasAccess) {
        const docPreview = {
            ...doc,
            contentMd: doc.previewContentMd || doc.contentMd.substring(0, 500) + '\n\n*[Content truncated - Purchase to view full documentation]*'
        };
        return res.json({
            success: true,
            doc: docPreview,
            has_access: false
        });
    }

    res.json({
        success: true,
        doc,
        has_access: true
    });
});

// @desc    Create a premium doc
// @route   POST /api/docs
// @access  Private/Admin
const createDoc = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        contentMd,
        previewContentMd,
        category,
        price,
        discountPrice,
        thumbnail,
        requiresSubscription,
        tableOfContents,
        tags,
        readingTimeMinutes,
        difficulty,
        pdfUrl
    } = req.body;

    // Generate slug
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    // Calculate reading time if not provided
    const wordCount = contentMd ? contentMd.split(/\s+/).length : 0;
    const calculatedReadingTime = Math.ceil(wordCount / 200);

    const doc = await prisma.premiumDoc.create({
        data: {
            title,
            slug,
            description,
            contentMd,
            previewContentMd,
            category,
            price: parseFloat(price) || 0,
            discountPrice: discountPrice ? parseFloat(discountPrice) : null,
            thumbnail,
            authorId: req.user.id,
            requiresSubscription: requiresSubscription || false,
            isPublished: false, // Start as draft
            tableOfContents,
            tags: tags || [],
            readingTimeMinutes: readingTimeMinutes || calculatedReadingTime,
            difficulty: difficulty?.toUpperCase() || 'INTERMEDIATE',
            pdfUrl
        }
    });

    res.status(201).json({
        success: true,
        doc
    });
});

// @desc    Update a premium doc
// @route   PUT /api/docs/:id
// @access  Private/Admin
const updateDoc = asyncHandler(async (req, res) => {
    const doc = await prisma.premiumDoc.findUnique({
        where: { id: req.params.id }
    });

    if (!doc) {
        res.status(404);
        throw new Error('Documentation not found');
    }

    const updatedDoc = await prisma.premiumDoc.update({
        where: { id: req.params.id },
        data: req.body
    });

    res.json({
        success: true,
        doc: updatedDoc
    });
});

// @desc    Delete a premium doc
// @route   DELETE /api/docs/:id
// @access  Private/Admin
const deleteDoc = asyncHandler(async (req, res) => {
    const doc = await prisma.premiumDoc.findUnique({
        where: { id: req.params.id }
    });

    if (!doc) {
        res.status(404);
        throw new Error('Documentation not found');
    }

    await prisma.premiumDoc.delete({
        where: { id: req.params.id }
    });

    res.json({
        success: true,
        message: 'Documentation removed'
    });
});

// @desc    Get doc categories
// @route   GET /api/docs/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const categories = await prisma.premiumDoc.groupBy({
        by: ['category'],
        _count: { id: true },
        where: { isPublished: true }
    });

    res.json({
        success: true,
        categories: categories.map(c => ({
            name: c.category,
            count: c._count.id
        }))
    });
});

module.exports = {
    getDocs,
    getDocById,
    createDoc,
    updateDoc,
    deleteDoc,
    getCategories
};
