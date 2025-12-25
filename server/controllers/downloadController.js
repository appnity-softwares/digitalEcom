const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');
const crypto = require('crypto');

// Cloudflare R2 configuration (S3-compatible)
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'codestudio-downloads';

// Initialize R2 client (S3-compatible)
let r2Client = null;

const getR2Client = () => {
    if (!r2Client && R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
        r2Client = new S3Client({
            region: 'auto',
            endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: R2_ACCESS_KEY_ID,
                secretAccessKey: R2_SECRET_ACCESS_KEY,
            },
        });
    }
    return r2Client;
};

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

    const client = getR2Client();

    // If R2 is configured and product has file in R2
    if (client && product.downloadFile) {
        const command = new GetObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: product.downloadFile,
        });

        // Generate signed URL valid for 1 hour
        const signedUrl = await getSignedUrl(client, command, {
            expiresIn: 3600 // 1 hour
        });

        // Log download
        await prisma.downloadLog.create({
            data: {
                userId,
                productId,
                orderId: order.id,
                ipAddress: req.ip,
            },
        }).catch(() => { }); // Don't fail if logging fails

        res.json({
            success: true,
            downloadUrl: signedUrl,
            fileName: product.downloadFile.split('/').pop(),
            expiresIn: 3600,
        });
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

// @desc    Upload product file to R2 (admin only)
// @route   POST /api/downloads/upload/:productId
// @access  Admin
const uploadProductFile = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const file = req.file;

    if (!file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const client = getR2Client();
    if (!client) {
        res.status(500);
        throw new Error('R2 storage not configured');
    }

    // Generate unique filename
    const ext = file.originalname.split('.').pop();
    const uniqueName = `products/${productId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;

    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: uniqueName,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    await client.send(command);

    // Update product with file path
    await prisma.product.update({
        where: { id: productId },
        data: { downloadFile: uniqueName },
    });

    res.json({
        success: true,
        message: 'File uploaded successfully',
        filePath: uniqueName,
    });
});

module.exports = {
    getDownloadUrl,
    checkDownloadAccess,
    uploadProductFile,
};
