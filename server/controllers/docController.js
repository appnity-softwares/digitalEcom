const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

const getCategories = asyncHandler(async (req, res) => {
    const categories = await prisma.docCategory.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: { _count: { select: { docs: true } } }
    });
    res.json({ success: true, data: categories });
});

const getDocs = asyncHandler(async (req, res) => {
    const { category, search, featured, difficulty } = req.query;
    const where = {
        isActive: true,
        ...(category && category !== 'all' && { categoryId: category }),
        ...(featured === 'true' && { isFeatured: true }),
        ...(difficulty && { difficulty }),
        ...(search && {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { tags: { has: search.toLowerCase() } }
            ]
        })
    };
    const docs = await prisma.doc.findMany({
        where,
        orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
        include: { category: { select: { id: true, name: true, label: true, gradient: true } } }
    });
    res.json({ success: true, count: docs.length, data: docs });
});

const getDoc = asyncHandler(async (req, res) => {
    const doc = await prisma.doc.findUnique({
        where: { id: req.params.id },
        include: { category: true }
    });
    if (!doc) {
        res.status(404);
        throw new Error('Doc not found');
    }
    await prisma.doc.update({
        where: { id: req.params.id },
        data: { views: { increment: 1 } }
    });
    res.json({ success: true, data: doc });
});

const trackLike = asyncHandler(async (req, res) => {
    await prisma.doc.update({
        where: { id: req.params.id },
        data: { likes: { increment: 1 } }
    });
    res.json({ success: true, message: 'Like tracked' });
});

const createDoc = asyncHandler(async (req, res) => {
    const doc = await prisma.doc.create({
        data: req.body,
        include: { category: true }
    });
    res.status(201).json({ success: true, data: doc });
});

const updateDoc = asyncHandler(async (req, res) => {
    const doc = await prisma.doc.findUnique({ where: { id: req.params.id } });
    if (!doc) {
        res.status(404);
        throw new Error('Doc not found');
    }
    const updated = await prisma.doc.update({
        where: { id: req.params.id },
        data: req.body,
        include: { category: true }
    });
    res.json({ success: true, data: updated });
});

const deleteDoc = asyncHandler(async (req, res) => {
    const doc = await prisma.doc.findUnique({ where: { id: req.params.id } });
    if (!doc) {
        res.status(404);
        throw new Error('Doc not found');
    }
    await prisma.doc.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Doc deleted' });
});

module.exports = {
    getCategories,
    getDocs,
    getDoc,
    trackLike,
    createDoc,
    updateDoc,
    deleteDoc
};
