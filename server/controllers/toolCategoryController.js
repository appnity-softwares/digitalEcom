const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

// @desc    Get all tool categories
// @route   GET /api/tool-categories
// @access  Public
const getToolCategories = asyncHandler(async (req, res) => {
    const categories = await prisma.toolCategory.findMany({
        orderBy: { order: 'asc' },
        include: {
            _count: {
                select: { tools: true }
            }
        }
    });
    res.json(categories);
});

// @desc    Create a tool category
// @route   POST /api/tool-categories
// @access  Private/Admin
const createToolCategory = asyncHandler(async (req, res) => {
    const { name, label, icon, gradient, isActive } = req.body;

    const categoryExists = await prisma.toolCategory.findUnique({
        where: { name }
    });

    if (categoryExists) {
        res.status(400);
        throw new Error('Category already exists');
    }

    const category = await prisma.toolCategory.create({
        data: {
            name,
            label,
            icon,
            gradient,
            isActive: isActive !== undefined ? isActive : true
        }
    });

    res.status(201).json(category);
});

// @desc    Update a tool category
// @route   PUT /api/tool-categories/:id
// @access  Private/Admin
const updateToolCategory = asyncHandler(async (req, res) => {
    const { name, label, icon, gradient, isActive, order } = req.body;

    const category = await prisma.toolCategory.findUnique({
        where: { id: req.params.id }
    });

    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    const updatedCategory = await prisma.toolCategory.update({
        where: { id: req.params.id },
        data: {
            name: name || category.name,
            label: label || category.label,
            icon: icon || category.icon,
            gradient: gradient || category.gradient,
            isActive: isActive !== undefined ? isActive : category.isActive,
            order: order !== undefined ? order : category.order
        }
    });

    res.json(updatedCategory);
});

// @desc    Delete a tool category
// @route   DELETE /api/tool-categories/:id
// @access  Private/Admin
const deleteToolCategory = asyncHandler(async (req, res) => {
    const category = await prisma.toolCategory.findUnique({
        where: { id: req.params.id }
    });

    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    await prisma.toolCategory.delete({
        where: { id: req.params.id }
    });

    res.json({ message: 'Category removed' });
});

module.exports = {
    getToolCategories,
    createToolCategory,
    updateToolCategory,
    deleteToolCategory
};
