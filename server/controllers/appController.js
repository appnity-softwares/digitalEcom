const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

const getCategories = asyncHandler(async (req, res) => {
    const categories = await prisma.appCategory.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: { _count: { select: { apps: true } } }
    });
    res.json({ success: true, data: categories });
});

const getApps = asyncHandler(async (req, res) => {
    const { category, search, featured, platform } = req.query;
    const where = {
        isActive: true,
        ...(category && category !== 'all' && { categoryId: category }),
        ...(featured === 'true' && { isFeatured: true }),
        ...(platform && { platform }),
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { tags: { has: search.toLowerCase() } }
            ]
        })
    };
    const apps = await prisma.mobileApp.findMany({
        where,
        orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
        include: { category: { select: { id: true, name: true, label: true, gradient: true } } }
    });
    res.json({ success: true, count: apps.length, data: apps });
});

const getApp = asyncHandler(async (req, res) => {
    const app = await prisma.mobileApp.findUnique({
        where: { id: req.params.id },
        include: { category: true }
    });
    if (!app) {
        res.status(404);
        throw new Error('App not found');
    }
    await prisma.mobileApp.update({
        where: { id: req.params.id },
        data: { views: { increment: 1 } }
    });
    res.json({ success: true, data: app });
});

const trackDownload = asyncHandler(async (req, res) => {
    await prisma.mobileApp.update({
        where: { id: req.params.id },
        data: { downloads: { increment: 1 } }
    });
    res.json({ success: true, message: 'Download tracked' });
});

const createApp = asyncHandler(async (req, res) => {
    const app = await prisma.mobileApp.create({
        data: req.body,
        include: { category: true }
    });
    res.status(201).json({ success: true, data: app });
});

const updateApp = asyncHandler(async (req, res) => {
    const app = await prisma.mobileApp.findUnique({ where: { id: req.params.id } });
    if (!app) {
        res.status(404);
        throw new Error('App not found');
    }
    const updated = await prisma.mobileApp.update({
        where: { id: req.params.id },
        data: req.body,
        include: { category: true }
    });
    res.json({ success: true, data: updated });
});

const deleteApp = asyncHandler(async (req, res) => {
    const app = await prisma.mobileApp.findUnique({ where: { id: req.params.id } });
    if (!app) {
        res.status(404);
        throw new Error('App not found');
    }
    await prisma.mobileApp.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'App deleted' });
});

module.exports = { getCategories, getApps, getApp, trackDownload, createApp, updateApp, deleteApp };
