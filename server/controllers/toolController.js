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

module.exports = { getCategories, getTools, getTool, trackAPICall, createTool, updateTool, deleteTool };
