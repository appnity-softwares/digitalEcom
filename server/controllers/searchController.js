const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

// @desc    Full-text search across products and docs
// @route   GET /api/search
// @access  Public
const search = asyncHandler(async (req, res) => {
    const { q, type = 'all', category, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
        res.status(400);
        throw new Error('Search query must be at least 2 characters');
    }

    const searchTerm = q.trim();
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const results = { products: [], docs: [], tools: [] };

    // Build price filter
    const priceFilter = {};
    if (minPrice) priceFilter.gte = parseFloat(minPrice);
    if (maxPrice) priceFilter.lte = parseFloat(maxPrice);

    if (type === 'all' || type === 'products') {
        const productWhere = {
            OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
                { longDescription: { contains: searchTerm, mode: 'insensitive' } },
                { tags: { has: searchTerm.toLowerCase() } },
                { techStack: { has: searchTerm } }
            ]
        };

        if (category) productWhere.category = category;
        if (Object.keys(priceFilter).length > 0) productWhere.price = priceFilter;

        const products = await prisma.product.findMany({
            where: productWhere,
            select: {
                id: true,
                title: true,
                slug: true,
                image: true,
                description: true,
                price: true,
                discountPrice: true,
                rating: true,
                numReviews: true,
                category: true,
                techStack: true,
                isFeatured: true,
                isBestseller: true
            },
            orderBy: [
                { isFeatured: 'desc' },
                { numSales: 'desc' }
            ],
            take: type === 'all' ? 10 : parseInt(limit),
            skip: type === 'products' ? skip : 0
        });

        results.products = products;
    }

    if (type === 'all' || type === 'docs') {
        const docWhere = {
            isPublished: true,
            OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
                { tags: { has: searchTerm.toLowerCase() } }
            ]
        };

        if (category) docWhere.category = category;

        const docs = await prisma.premiumDoc.findMany({
            where: docWhere,
            select: {
                id: true,
                title: true,
                slug: true,
                thumbnail: true,
                description: true,
                price: true,
                category: true,
                difficulty: true,
                readingTimeMinutes: true,
                views: true
            },
            orderBy: { views: 'desc' },
            take: type === 'all' ? 5 : parseInt(limit),
            skip: type === 'docs' ? skip : 0
        });

        results.docs = docs;
    }

    if (type === 'all' || type === 'tools') {
        const toolWhere = {
            isActive: true,
            OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } }
            ]
        };

        if (category) toolWhere.category = category;

        const tools = await prisma.saasTool.findMany({
            where: toolWhere,
            select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                description: true,
                category: true,
                activeUsers: true,
                isBeta: true
            },
            orderBy: { activeUsers: 'desc' },
            take: type === 'all' ? 5 : parseInt(limit),
            skip: type === 'tools' ? skip : 0
        });

        results.tools = tools;
    }

    // Get counts for pagination
    const counts = {};
    if (type === 'products') {
        counts.total = await prisma.product.count({
            where: {
                OR: [
                    { title: { contains: searchTerm, mode: 'insensitive' } },
                    { description: { contains: searchTerm, mode: 'insensitive' } }
                ]
            }
        });
    }

    res.json({
        success: true,
        query: searchTerm,
        results,
        counts: {
            products: results.products.length,
            docs: results.docs.length,
            tools: results.tools.length,
            total: results.products.length + results.docs.length + results.tools.length,
            ...(type !== 'all' && counts)
        }
    });
});

// @desc    Get popular search terms
// @route   GET /api/search/popular
// @access  Public
const getPopularSearches = asyncHandler(async (req, res) => {
    // Get popular categories/tags from products
    const popularProducts = await prisma.product.findMany({
        where: { isFeatured: true },
        select: { category: true, tags: true },
        take: 10
    });

    const categories = [...new Set(popularProducts.map(p => p.category))];
    const tags = [...new Set(popularProducts.flatMap(p => p.tags))].slice(0, 10);

    res.json({
        success: true,
        popularSearches: [
            'React Templates',
            'Next.js',
            'Dashboard',
            'E-commerce',
            'Admin Panel',
            'Mobile App',
            'Landing Page',
            'API Integration',
            ...categories.slice(0, 2)
        ],
        categories,
        tags
    });
});

// @desc    Search suggestions (autocomplete)
// @route   GET /api/search/suggestions
// @access  Public
const getSuggestions = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
        return res.json({ success: true, suggestions: [] });
    }

    const searchTerm = q.trim();

    const [products, docs] = await Promise.all([
        prisma.product.findMany({
            where: {
                title: { contains: searchTerm, mode: 'insensitive' }
            },
            select: { title: true, slug: true, category: true },
            take: 5
        }),
        prisma.premiumDoc.findMany({
            where: {
                isPublished: true,
                title: { contains: searchTerm, mode: 'insensitive' }
            },
            select: { title: true, slug: true },
            take: 3
        })
    ]);

    const suggestions = [
        ...products.map(p => ({
            text: p.title,
            type: 'product',
            category: p.category,
            url: `/templates/${p.slug}`
        })),
        ...docs.map(d => ({
            text: d.title,
            type: 'doc',
            url: `/docs/${d.slug}`
        }))
    ];

    res.json({
        success: true,
        suggestions
    });
});

module.exports = {
    search,
    getPopularSearches,
    getSuggestions
};
