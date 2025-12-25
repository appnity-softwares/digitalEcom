const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

// @desc    Get all template requests
// @route   GET /api/template-requests
// @access  Public
const getTemplateRequests = asyncHandler(async (req, res) => {
    const { status, sort = 'votes', page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) {
        where.status = status.toUpperCase();
    }

    const orderBy = sort === 'votes'
        ? { votes: 'desc' }
        : sort === 'newest'
            ? { createdAt: 'desc' }
            : { votes: 'desc' };

    const requests = await prisma.templateRequest.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: parseInt(limit),
        include: {
            user: {
                select: { id: true, name: true, avatar: true }
            }
        }
    });

    const total = await prisma.templateRequest.count({ where });

    res.json({
        success: true,
        requests,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Get single template request
// @route   GET /api/template-requests/:id
// @access  Public
const getTemplateRequest = asyncHandler(async (req, res) => {
    const request = await prisma.templateRequest.findUnique({
        where: { id: req.params.id },
        include: {
            user: {
                select: { id: true, name: true, avatar: true }
            }
        }
    });

    if (!request) {
        res.status(404);
        throw new Error('Request not found');
    }

    res.json({ success: true, request });
});

// @desc    Create template request
// @route   POST /api/template-requests
// @access  Private
const createTemplateRequest = asyncHandler(async (req, res) => {
    const { title, description, category, techStack } = req.body;

    if (!title || !description) {
        res.status(400);
        throw new Error('Title and description are required');
    }

    const request = await prisma.templateRequest.create({
        data: {
            userId: req.user.id,
            title,
            description,
            category,
            techStack: techStack || []
        },
        include: {
            user: {
                select: { id: true, name: true, avatar: true }
            }
        }
    });

    res.status(201).json({ success: true, request });
});

// @desc    Vote on template request
// @route   POST /api/template-requests/:id/vote
// @access  Private
const voteOnRequest = asyncHandler(async (req, res) => {
    const request = await prisma.templateRequest.findUnique({
        where: { id: req.params.id }
    });

    if (!request) {
        res.status(404);
        throw new Error('Request not found');
    }

    // Check if user already voted
    const hasVoted = request.voters.includes(req.user.id);

    if (hasVoted) {
        // Remove vote
        const updatedRequest = await prisma.templateRequest.update({
            where: { id: req.params.id },
            data: {
                votes: { decrement: 1 },
                voters: request.voters.filter(id => id !== req.user.id)
            }
        });
        res.json({ success: true, message: 'Vote removed', votes: updatedRequest.votes, voted: false });
    } else {
        // Add vote
        const updatedRequest = await prisma.templateRequest.update({
            where: { id: req.params.id },
            data: {
                votes: { increment: 1 },
                voters: [...request.voters, req.user.id]
            }
        });
        res.json({ success: true, message: 'Vote added', votes: updatedRequest.votes, voted: true });
    }
});

// @desc    Update template request (own requests only)
// @route   PUT /api/template-requests/:id
// @access  Private
const updateTemplateRequest = asyncHandler(async (req, res) => {
    const request = await prisma.templateRequest.findUnique({
        where: { id: req.params.id }
    });

    if (!request) {
        res.status(404);
        throw new Error('Request not found');
    }

    if (request.userId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(403);
        throw new Error('Not authorized');
    }

    const { title, description, category, techStack, status, adminNotes } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (techStack) updateData.techStack = techStack;

    // Only admin can update status and notes
    if (req.user.role === 'ADMIN') {
        if (status) updateData.status = status;
        if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    }

    const updatedRequest = await prisma.templateRequest.update({
        where: { id: req.params.id },
        data: updateData
    });

    res.json({ success: true, request: updatedRequest });
});

// @desc    Delete template request
// @route   DELETE /api/template-requests/:id
// @access  Private
const deleteTemplateRequest = asyncHandler(async (req, res) => {
    const request = await prisma.templateRequest.findUnique({
        where: { id: req.params.id }
    });

    if (!request) {
        res.status(404);
        throw new Error('Request not found');
    }

    if (request.userId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(403);
        throw new Error('Not authorized');
    }

    await prisma.templateRequest.delete({
        where: { id: req.params.id }
    });

    res.json({ success: true, message: 'Request deleted' });
});

// @desc    Get my requests
// @route   GET /api/template-requests/mine
// @access  Private
const getMyRequests = asyncHandler(async (req, res) => {
    const requests = await prisma.templateRequest.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, requests });
});

module.exports = {
    getTemplateRequests,
    getTemplateRequest,
    createTemplateRequest,
    voteOnRequest,
    updateTemplateRequest,
    deleteTemplateRequest,
    getMyRequests
};
