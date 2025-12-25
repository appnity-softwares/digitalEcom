#!/bin/bash

# Create Doc Routes
cat > server/routes/docRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const { getCategories, getDocs, getDoc, trackLike, createDoc, updateDoc, deleteDoc } = require('../controllers/docController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/categories', getCategories);
router.get('/', getDocs);
router.get('/:id', getDoc);
router.post('/:id/like', trackLike);
router.post('/', protect, admin, createDoc);
router.put('/:id', protect, admin, updateDoc);
router.delete('/:id', protect, admin, deleteDoc);

module.exports = router;
EOF

# Create Tool Controller
cat > server/controllers/toolController.js << 'EOF'
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
EOF

# Create Tool Routes
cat > server/routes/toolRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const { getCategories, getTools, getTool, trackAPICall, createTool, updateTool, deleteTool } = require('../controllers/toolController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/categories', getCategories);
router.get('/', getTools);
router.get('/:id', getTool);
router.post('/:id/call', trackAPICall);
router.post('/', protect, admin, createTool);
router.put('/:id', protect, admin, updateTool);
router.delete('/:id', protect, admin, deleteTool);

module.exports = router;
EOF

# Create App Controller
cat > server/controllers/appController.js << 'EOF'
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
EOF

# Create App Routes
cat > server/routes/appRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const { getCategories, getApps, getApp, trackDownload, createApp, updateApp, deleteApp } = require('../controllers/appController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/categories', getCategories);
router.get('/', getApps);
router.get('/:id', getApp);
router.post('/:id/download', trackDownload);
router.post('/', protect, admin, createApp);
router.put('/:id', protect, admin, updateApp);
router.delete('/:id', protect, admin, deleteApp);

module.exports = router;
EOF

echo "✅ All backend files created!"
