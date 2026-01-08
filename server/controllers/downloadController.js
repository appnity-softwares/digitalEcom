const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');
const crypto = require('crypto');

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/products');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });
exports.uploadMiddleware = upload.single('file');

// @desc    Get signed download URL for a purchased product
// @route   GET /api/downloads/:productId
// @access  Private
const getDownloadUrl = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;

    // Check if user has purchased this product
    const order = await prisma.order.findFirst({
        where: {
            userId,
            isPaid: true,
            items: {
                some: {
                    productId,
                },
            },
        },
        include: {
            items: {
                where: { productId },
            },
        },
    });

    if (!order) {
        res.status(403);
        throw new Error('You have not purchased this product');
    }

    // Check download expiry (optional - can be removed for lifetime access)
    if (order.downloadExpiry && new Date(order.downloadExpiry) < new Date()) {
        res.status(403);
        throw new Error('Download link has expired. Please contact support.');
    }

    // Get product details
    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
            id: true,
            title: true,
            downloadFile: true,
            downloadUrl: true,
        },
    });

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Local File Download Logic
    if (product.downloadFile) {
        // Generate a temporary access token for the file stream
        const downloadToken = jwt.sign(
            { userId, productId, orderId: order.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Return a URL that the frontend can redirect to
        // Points to: /api/download/stream/:productId?token=...
        const localDownloadUrl = `/api/download/stream/${productId}?token=${downloadToken}`;

        res.json({
            success: true,
            downloadUrl: localDownloadUrl,
            fileName: product.downloadFile, // Just filename
            expiresIn: 3600,
            isLocal: true
        });
        return;
    }
    // Fallback to direct URL if no R2
    else if (product.downloadUrl) {
        res.json({
            success: true,
            downloadUrl: product.downloadUrl,
            fileName: product.title.replace(/\s+/g, '-').toLowerCase() + '.zip',
            expiresIn: null,
        });
    }
    // No download available
    else {
        res.status(404);
        throw new Error('Download file not available');
    }
});

// @desc    Check if user has access to download a product
// @route   GET /api/downloads/check/:productId
// @access  Private
const checkDownloadAccess = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({
        where: {
            userId,
            isPaid: true,
            items: {
                some: {
                    productId,
                },
            },
        },
    });

    // Also check subscription for premium access
    const subscription = await prisma.subscription.findUnique({
        where: { userId },
    });

    const hasSubscriptionAccess = subscription?.status === 'ACTIVE' &&
        new Date(subscription.endDate) > new Date() &&
        ['PRO', 'ENTERPRISE'].includes(subscription.planName);

    res.json({
        hasAccess: !!order || hasSubscriptionAccess,
        accessType: order ? 'purchase' : hasSubscriptionAccess ? 'subscription' : null,
        orderDate: order?.paidAt,
    });
});

// @desc    Upload product file to Local Storage (admin only)
// @route   POST /api/downloads/upload/:productId
// @access  Admin
const uploadProductFile = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const file = req.file;

    if (!file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    // File is already saved by multer middleware at this point
    // Filename is in req.file.filename

    // Update product with filename
    await prisma.product.update({
        where: { id: productId },
        data: { downloadFile: file.filename },
    });

    res.json({
        success: true,
        message: 'File uploaded successfully',
        filePath: file.filename,
    });
});

// @desc    Stream local file
// @route   GET /api/download/stream/:productId
// @access  Public (Protected by Query Token)
const streamLocalFile = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { token } = req.query;

    if (!token) {
        res.status(401);
        throw new Error('No download token provided');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Double check productId match
        if (decoded.productId !== productId) {
            throw new Error('Invalid token for this product');
        }

        // Get product file path
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { downloadFile: true, title: true }
        });

        if (!product || !product.downloadFile) {
            res.status(404);
            throw new Error('File not found');
        }

        const filePath = path.join(__dirname, '../uploads/products', product.downloadFile);

        if (!fs.existsSync(filePath)) {
            res.status(404);
            throw new Error('Physical file missing on server');
        }

        // Log download (using decoded info)
        await prisma.downloadLog.create({
            data: {
                userId: decoded.userId,
                productId: decoded.productId,
                orderId: decoded.orderId,
                ipAddress: req.ip,
            },
        }).catch(() => { });

        // Serve file
        res.download(filePath, `${product.title.replace(/[^a-z0-9]/gi, '_')}.zip`);

    } catch (error) {
        console.error('Download stream error:', error);
        res.status(403).send('Download link expired or invalid');
    }
});

module.exports = {
    getDownloadUrl,
    checkDownloadAccess,
    uploadProductFile,
    streamLocalFile, // Export new controller
    uploadMiddleware: exports.uploadMiddleware // Re-export multer middleware
};
