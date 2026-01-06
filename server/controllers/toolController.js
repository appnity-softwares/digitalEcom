const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

const getCategories = asyncHandler(async (req, res) => {
    const categories = await prisma.toolCategory.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: { _count: { select: { tools: true } } }
    });
    res.json({ success: true, data: categories });
});

const getTools = asyncHandler(async (req, res) => {
    const { category, search, featured, method } = req.query;
    const where = {
        isActive: true,
        ...(category && category !== 'all' && { categoryId: category }),
        ...(featured === 'true' && { isFeatured: true }),
        ...(method && { method }),
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { tags: { has: search.toLowerCase() } }
            ]
        })
    };
    const tools = await prisma.aPITool.findMany({
        where,
        orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
        include: { category: { select: { id: true, name: true, label: true, gradient: true } } }
    });
    res.json({ success: true, count: tools.length, data: tools });
});

const getTool = asyncHandler(async (req, res) => {
    const tool = await prisma.aPITool.findUnique({
        where: { id: req.params.id },
        include: { category: true }
    });
    if (!tool) {
        res.status(404);
        throw new Error('Tool not found');
    }
    res.json({ success: true, data: tool });
});

const trackAPICall = asyncHandler(async (req, res) => {
    await prisma.aPITool.update({
        where: { id: req.params.id },
        data: { apiCalls: { increment: 1 } }
    });
    res.json({ success: true, message: 'API call tracked' });
});

const createTool = asyncHandler(async (req, res) => {
    const tool = await prisma.aPITool.create({
        data: req.body,
        include: { category: true }
    });
    res.status(201).json({ success: true, data: tool });
});

const updateTool = asyncHandler(async (req, res) => {
    const tool = await prisma.aPITool.findUnique({ where: { id: req.params.id } });
    if (!tool) {
        res.status(404);
        throw new Error('Tool not found');
    }
    const updated = await prisma.aPITool.update({
        where: { id: req.params.id },
        data: req.body,
        include: { category: true }
    });
    res.json({ success: true, data: updated });
});

const deleteTool = asyncHandler(async (req, res) => {
    const tool = await prisma.aPITool.findUnique({ where: { id: req.params.id } });
    if (!tool) {
        res.status(404);
        throw new Error('Tool not found');
    }
    await prisma.aPITool.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Tool deleted' });
});

const createCategory = asyncHandler(async (req, res) => {
    const { name, label, icon, gradient } = req.body;
    if (!name || !label) {
        res.status(400);
        throw new Error('Name and label are required');
    }
    const categoryExists = await prisma.toolCategory.findUnique({ where: { name } });
    if (categoryExists) {
        res.status(400);
        throw new Error('Category already exists');
    }
    const category = await prisma.toolCategory.create({
        data: {
            name,
            label,
            icon: icon || 'Wrench',
            gradient: gradient || 'from-indigo-500 to-purple-500',
            order: req.body.order || 0,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true
        }
    });
    res.status(201).json({ success: true, data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
    const category = await prisma.toolCategory.findUnique({ where: { id: req.params.id } });
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }
    const updatedCategory = await prisma.toolCategory.update({
        where: { id: req.params.id },
        data: req.body
    });
    res.json({ success: true, data: updatedCategory });
});

const deleteCategory = asyncHandler(async (req, res) => {
    const category = await prisma.toolCategory.findUnique({
        where: { id: req.params.id },
        include: { _count: { select: { tools: true } } }
    });
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }
    if (category._count.tools > 0) {
        res.status(400);
        throw new Error(`Cannot delete category with ${category._count.tools} tools. Please move or delete them first.`);
    }
    await prisma.toolCategory.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Category deleted' });
});

module.exports = {
    getCategories,
    getTools,
    getTool,
    trackAPICall,
    createTool,
    updateTool,
    deleteTool,
    createCategory,
    updateCategory,
    deleteCategory
};
