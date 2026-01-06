const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

/**
 * @desc    Get all component categories
 * @route   GET /api/components/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
    const { status } = req.query;

    const categories = await prisma.componentCategory.findMany({
        where: {
            ...(status !== 'all' && { isActive: true })
        },
        orderBy: { order: 'asc' },
        include: {
            _count: {
                select: { components: true }
            }
        }
    });

    res.json({
        success: true,
        data: categories
    });
});

/**
 * @desc    Get all components
 * @route   GET /api/components
 * @access  Public
 */
const getComponents = asyncHandler(async (req, res) => {
    const { category, search, featured, status } = req.query;

    const where = {
        ...(status !== 'all' && { isActive: true }),
        ...(category && category !== 'all' && { categoryId: category }),
        ...(featured === 'true' && { isFeatured: true }),
        ...(search && {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { tags: { has: search.toLowerCase() } }
            ]
        })
    };

    const components = await prisma.component.findMany({
        where,
        orderBy: [
            { isFeatured: 'desc' },
            { order: 'asc' },
            { createdAt: 'desc' }
        ],
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    label: true,
                    gradient: true
                }
            }
        }
    });

    res.json({
        success: true,
        count: components.length,
        data: components
    });
});

/**
 * @desc    Get single component
 * @route   GET /api/components/:id
 * @access  Public
 */
const getComponent = asyncHandler(async (req, res) => {
    const component = await prisma.component.findUnique({
        where: { id: req.params.id },
        include: {
            category: true
        }
    });

    if (!component) {
        res.status(404);
        throw new Error('Component not found');
    }

    // Increment view count
    await prisma.component.update({
        where: { id: req.params.id },
        data: { views: { increment: 1 } }
    });

    res.json({
        success: true,
        data: component
    });
});

/**
 * @desc    Track component copy
 * @route   POST /api/components/:id/copy
 * @access  Public
 */
const trackCopy = asyncHandler(async (req, res) => {
    await prisma.component.update({
        where: { id: req.params.id },
        data: { copies: { increment: 1 } }
    });

    res.json({
        success: true,
        message: 'Copy tracked'
    });
});

/**
 * @desc    Create component (Admin only)
 * @route   POST /api/components
 * @access  Private/Admin
 */
const createComponent = asyncHandler(async (req, res) => {
    const { title, description, code, previewType, categoryId, tags, isFeatured } = req.body;

    if (!title || !description || !code || !previewType || !categoryId) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    const component = await prisma.component.create({
        data: {
            title,
            description,
            code,
            previewType,
            categoryId,
            tags: tags || [],
            isFeatured: isFeatured || false
        },
        include: {
            category: true
        }
    });

    res.status(201).json({
        success: true,
        data: component
    });
});

/**
 * @desc    Update component (Admin only)
 * @route   PUT /api/components/:id
 * @access  Private/Admin
 */
const updateComponent = asyncHandler(async (req, res) => {
    const component = await prisma.component.findUnique({
        where: { id: req.params.id }
    });

    if (!component) {
        res.status(404);
        throw new Error('Component not found');
    }

    const updated = await prisma.component.update({
        where: { id: req.params.id },
        data: req.body,
        include: {
            category: true
        }
    });

    res.json({
        success: true,
        data: updated
    });
});

/**
 * @desc    Delete component (Admin only)
 * @route   DELETE /api/components/:id
 * @access  Private/Admin
 */
const deleteComponent = asyncHandler(async (req, res) => {
    const component = await prisma.component.findUnique({
        where: { id: req.params.id }
    });

    if (!component) {
        res.status(404);
        throw new Error('Component not found');
    }

    await prisma.component.delete({
        where: { id: req.params.id }
    });

    res.json({
        success: true,
        message: 'Component deleted'
    });
});

/**
 * @desc    Create component category (Admin only)
 * @route   POST /api/components/categories
 * @access  Private/Admin
 */
const createCategory = asyncHandler(async (req, res) => {
    const { name, label, icon, gradient } = req.body;

    if (!name || !label) {
        res.status(400);
        throw new Error('Name and label are required');
    }

    const categoryExists = await prisma.componentCategory.findUnique({
        where: { name }
    });

    if (categoryExists) {
        res.status(400);
        throw new Error('Category already exists');
    }

    const category = await prisma.componentCategory.create({
        data: {
            name,
            label,
            icon: icon || 'Box',
            gradient: gradient || 'from-indigo-500 to-purple-500',
            order: req.body.order || 0,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true
        }
    });

    res.status(201).json({
        success: true,
        data: category
    });
});

/**
 * @desc    Update component category (Admin only)
 * @route   PUT /api/components/categories/:id
 * @access  Private/Admin
 */
const updateCategory = asyncHandler(async (req, res) => {
    const category = await prisma.componentCategory.findUnique({
        where: { id: req.params.id }
    });

    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    const updatedCategory = await prisma.componentCategory.update({
        where: { id: req.params.id },
        data: req.body
    });

    res.json({
        success: true,
        data: updatedCategory
    });
});

/**
 * @desc    Delete component category (Admin only)
 * @route   DELETE /api/components/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await prisma.componentCategory.findUnique({
        where: { id: req.params.id },
        include: { _count: { select: { components: true } } }
    });

    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    if (category._count.components > 0) {
        res.status(400);
        throw new Error(`Cannot delete category with ${category._count.components} components. Please move or delete them first.`);
    }

    await prisma.componentCategory.delete({
        where: { id: req.params.id }
    });

    res.json({
        success: true,
        message: 'Category deleted'
    });
});

module.exports = {
    getCategories,
    getComponents,
    getComponent,
    trackCopy,
    createComponent,
    updateComponent,
    deleteComponent,
    createCategory,
    updateCategory,
    deleteCategory
};
