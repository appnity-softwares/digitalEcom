const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const {
        category,
        techStack,
        productType,
        minPrice,
        maxPrice,
        search,
        sort = 'createdAt',
        order = 'desc',
        page = 1,
        limit = 12
    } = req.query;

    const where = {};

    if (category) {
        where.category = category;
    }

    if (techStack) {
        where.techStack = { has: techStack };
    }

    if (productType) {
        where.productType = productType;
    }

    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice);
        if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { tags: { has: search } }
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy: { [sort]: order },
            skip,
            take: parseInt(limit)
        }),
        prisma.product.count({ where })
    ]);

    res.json({
        success: true,
        products,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
        where: { id: req.params.id }
    });

    if (!product) {
        // Try finding by slug
        const productBySlug = await prisma.product.findUnique({
            where: { slug: req.params.id }
        });

        if (productBySlug) {
            // Increment views
            await prisma.product.update({
                where: { id: productBySlug.id },
                data: { numViews: { increment: 1 } }
            });
            return res.json(productBySlug);
        }

        res.status(404);
        throw new Error('Product not found');
    }

    // Increment views
    await prisma.product.update({
        where: { id: product.id },
        data: { numViews: { increment: 1 } }
    });

    res.json(product);
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    const {
        title,
        image,
        images,
        category,
        description,
        longDescription,
        price,
        discountPrice,
        productType,
        techStack,
        hasBackend,
        hasFrontend,
        hasDatabase,
        hasMobileApp,
        hasTests,
        testCoverage,
        liveDemo,
        githubRepo,
        features,
        pages,
        tags,
        licenses,
        documentation,
        codePreview
    } = req.body;

    // Generate slug from title
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const product = await prisma.product.create({
        data: {
            title,
            slug,
            image,
            images: images || [],
            category,
            description,
            longDescription,
            price: parseFloat(price),
            discountPrice: discountPrice ? parseFloat(discountPrice) : null,
            productType: productType || 'template',
            techStack: techStack || [],
            hasBackend: hasBackend || false,
            hasFrontend: hasFrontend !== false,
            hasDatabase: hasDatabase || false,
            hasMobileApp: hasMobileApp || false,
            hasTests: hasTests || false,
            testCoverage: testCoverage || 0,
            liveDemo,
            githubRepo,
            features: features || [],
            pages: pages || [],
            tags: tags || [],
            licenses,
            documentation,
            codePreview
        }
    });

    res.status(201).json(product);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
        where: { id: req.params.id }
    });

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const updatedProduct = await prisma.product.update({
        where: { id: req.params.id },
        data: req.body
    });

    res.json(updatedProduct);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
        where: { id: req.params.id }
    });

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    await prisma.product.delete({
        where: { id: req.params.id }
    });

    res.json({ message: 'Product removed' });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
    const products = await prisma.product.findMany({
        where: { isFeatured: true },
        take: 6,
        orderBy: { numSales: 'desc' }
    });

    res.json(products);
});

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getFeaturedProducts
};
