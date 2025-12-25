const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token using Prisma
            req.user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    avatar: true
                }
            });

            if (!req.user) {
                res.status(401);
                throw new Error('User not found');
            }

            next();
        } catch (error) {
            // Don't log error details in production to avoid info leakage
            res.status(401);
            throw new Error('Not authorized');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

// Optional authentication - doesn't fail if no token
const optionalAuth = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    avatar: true
                }
            });
        } catch (error) {
            // Token invalid or expired, but we still continue
            req.user = null;
        }
    }

    next();
});

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

// Validate API Key for SaaS tools
const validateApiKey = asyncHandler(async (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;

    if (!apiKey) {
        res.status(401);
        throw new Error('API key is required');
    }

    // Find the API key in database
    const keyRecord = await prisma.apiKey.findFirst({
        where: {
            key: apiKey,
            isActive: true,
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
            ]
        },
        include: {
            user: {
                select: { id: true, name: true, email: true }
            }
        }
    });

    if (!keyRecord) {
        res.status(401);
        throw new Error('Invalid or expired API key');
    }

    // Update usage count
    await prisma.apiKey.update({
        where: { id: keyRecord.id },
        data: {
            usageCount: { increment: 1 },
            lastUsedAt: new Date()
        }
    });

    req.user = keyRecord.user;
    req.apiKey = keyRecord;
    next();
});

module.exports = { protect, optionalAuth, admin, validateApiKey };

