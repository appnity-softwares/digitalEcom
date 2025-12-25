const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

/**
 * Template Controller
 * Handles all template-related operations
 */

// @desc    Get all template categories
// @route   GET /api/templates/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const categories = await prisma.templateCategory.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
            _count: {
                select: { templates: true }
            }
        }
    });

    res.json({
        success: true,
        data: categories
    });
});

// @desc    Get all templates
// @route   GET /api/templates
// @access  Public
const getTemplates = asyncHandler(async (req, res) => {
    const { category, search, featured, premium } = req.query;

    const where = {
        isActive: true,
        ...(category && category !== 'all' && { categoryId: category }),
        ...(featured === 'true' && { isFeatured: true }),
        ...(premium === 'true' && { isPremium: true }),
        ...(search && {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { tags: { has: search.toLowerCase() } }
            ]
        })
    };

    const templates = await prisma.template.findMany({
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
        count: templates.length,
        data: templates
    });
});

// @desc    Get single template
// @route   GET /api/templates/:id
// @access  Public
const getTemplate = asyncHandler(async (req, res) => {
    const template = await prisma.template.findUnique({
        where: { id: req.params.id },
        include: {
            category: true
        }
    });

    if (!template) {
        res.status(404);
        throw new Error('Template not found');
    }

    // Increment view count
    await prisma.template.update({
        where: { id: req.params.id },
        data: { views: { increment: 1 } }
    });

    res.json({
        success: true,
        data: template
    });
});

// @desc    Track template download
// @route   POST /api/templates/:id/download
// @access  Public
const trackDownload = asyncHandler(async (req, res) => {
    await prisma.template.update({
        where: { id: req.params.id },
        data: { downloads: { increment: 1 } }
    });

    res.json({
        success: true,
        message: 'Download tracked'
    });
});

// @desc    Create template (Admin only)
// @route   POST /api/templates
// @access  Private/Admin
const createTemplate = asyncHandler(async (req, res) => {
    const template = await prisma.template.create({
        data: req.body,
        include: {
            category: true
        }
    });

    res.status(201).json({
        success: true,
        data: template
    });
});

// @desc    Update template (Admin only)
// @route   PUT /api/templates/:id
// @access  Private/Admin
const updateTemplate = asyncHandler(async (req, res) => {
    const template = await prisma.template.findUnique({
        where: { id: req.params.id }
    });

    if (!template) {
        res.status(404);
        throw new Error('Template not found');
    }

    const updated = await prisma.template.update({
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

// @desc    Delete template (Admin only)
// @route   DELETE /api/templates/:id
// @access  Private/Admin
const deleteTemplate = asyncHandler(async (req, res) => {
    const template = await prisma.template.findUnique({
        where: { id: req.params.id }
    });

    if (!template) {
        res.status(404);
        throw new Error('Template not found');
    }

    await prisma.template.delete({
        where: { id: req.params.id }
    });

    res.json({
        success: true,
        message: 'Template deleted'
    });
});

module.exports = {
    getCategories,
    getTemplates,
    getTemplate,
    trackDownload,
    createTemplate,
    updateTemplate,
    deleteTemplate
};
