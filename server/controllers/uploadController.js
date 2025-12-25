const asyncHandler = require('express-async-handler');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const prisma = require('../config/prisma');

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'codestudio-uploads';
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL; // Optional CDN URL

// Initialize R2 client
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

// Validate API key middleware
const validateApiKeyForUpload = async (req) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        throw new Error('API key required');
    }

    const key = await prisma.apiKey.findUnique({
        where: { key: apiKey },
        include: { tool: true }
    });

    if (!key || !key.isActive) {
        throw new Error('Invalid or inactive API key');
    }

    // Check if this is an upload tool key
    if (key.tool?.slug !== 'image-upload' && key.tool?.category !== 'Storage') {
        throw new Error('API key not valid for this tool');
    }

    // Check usage limits
    if (key.usageLimit && key.usageCount >= key.usageLimit) {
        throw new Error('API key usage limit exceeded');
    }

    return key;
};

// Log API call
const logUploadCall = async (apiKeyId, toolId, success, fileSize, responseTime) => {
    try {
        await prisma.apiCallLog.create({
            data: {
                apiKeyId,
                toolId,
                endpoint: '/api/upload/image',
                method: 'POST',
                statusCode: success ? 200 : 400,
                requestBody: { fileSize },
                responseTimeMs: responseTime
            }
        });

        // Update usage count
        await prisma.apiKey.update({
            where: { id: apiKeyId },
            data: {
                usageCount: { increment: 1 },
                lastUsedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Failed to log API call:', error);
    }
};

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  API Key Required
const uploadImage = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    let apiKey = null;

    try {
        // Validate API key
        apiKey = await validateApiKeyForUpload(req);

        const file = req.file;
        if (!file) {
            res.status(400);
            throw new Error('No image file provided');
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(file.mimetype)) {
            res.status(400);
            throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            res.status(400);
            throw new Error('File size exceeds 10MB limit');
        }

        const client = getR2Client();
        if (!client) {
            res.status(500);
            throw new Error('Storage service not configured');
        }

        // Generate unique filename
        const ext = file.originalname.split('.').pop();
        const uniqueName = `uploads/${apiKey.userId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;

        // Upload to R2
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: uniqueName,
            Body: file.buffer,
            ContentType: file.mimetype,
            CacheControl: 'public, max-age=31536000',
        });

        await client.send(command);

        // Generate public URL
        const publicUrl = R2_PUBLIC_URL
            ? `${R2_PUBLIC_URL}/${uniqueName}`
            : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${uniqueName}`;

        const responseTime = Date.now() - startTime;

        // Log successful upload
        await logUploadCall(apiKey.id, apiKey.toolId, true, file.size, responseTime);

        res.json({
            success: true,
            data: {
                url: publicUrl,
                key: uniqueName,
                filename: file.originalname,
                size: file.size,
                contentType: file.mimetype,
                uploadedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        const responseTime = Date.now() - startTime;
        if (apiKey) {
            await logUploadCall(apiKey.id, apiKey.toolId, false, 0, responseTime);
        }
        throw error;
    }
});

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  API Key Required
const uploadMultipleImages = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    let apiKey = null;

    try {
        apiKey = await validateApiKeyForUpload(req);

        const files = req.files;
        if (!files || files.length === 0) {
            res.status(400);
            throw new Error('No image files provided');
        }

        if (files.length > 10) {
            res.status(400);
            throw new Error('Maximum 10 images per request');
        }

        const client = getR2Client();
        if (!client) {
            res.status(500);
            throw new Error('Storage service not configured');
        }

        const uploadResults = [];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        for (const file of files) {
            if (!allowedTypes.includes(file.mimetype)) {
                uploadResults.push({
                    filename: file.originalname,
                    success: false,
                    error: 'Invalid file type'
                });
                continue;
            }

            if (file.size > 10 * 1024 * 1024) {
                uploadResults.push({
                    filename: file.originalname,
                    success: false,
                    error: 'File size exceeds 10MB'
                });
                continue;
            }

            const ext = file.originalname.split('.').pop();
            const uniqueName = `uploads/${apiKey.userId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;

            try {
                await client.send(new PutObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: uniqueName,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                    CacheControl: 'public, max-age=31536000',
                }));

                const publicUrl = R2_PUBLIC_URL
                    ? `${R2_PUBLIC_URL}/${uniqueName}`
                    : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${uniqueName}`;

                uploadResults.push({
                    filename: file.originalname,
                    success: true,
                    url: publicUrl,
                    key: uniqueName,
                    size: file.size
                });
            } catch (err) {
                uploadResults.push({
                    filename: file.originalname,
                    success: false,
                    error: 'Upload failed'
                });
            }
        }

        const responseTime = Date.now() - startTime;
        const totalSize = files.reduce((sum, f) => sum + f.size, 0);
        await logUploadCall(apiKey.id, apiKey.toolId, true, totalSize, responseTime);

        res.json({
            success: true,
            data: {
                total: files.length,
                successful: uploadResults.filter(r => r.success).length,
                failed: uploadResults.filter(r => !r.success).length,
                results: uploadResults
            }
        });

    } catch (error) {
        const responseTime = Date.now() - startTime;
        if (apiKey) {
            await logUploadCall(apiKey.id, apiKey.toolId, false, 0, responseTime);
        }
        throw error;
    }
});

// @desc    Delete an uploaded image
// @route   DELETE /api/upload/image/:key
// @access  API Key Required
const deleteImage = asyncHandler(async (req, res) => {
    const apiKey = await validateApiKeyForUpload(req);
    const { key } = req.params;

    if (!key) {
        res.status(400);
        throw new Error('Image key required');
    }

    // Verify the key belongs to this user
    if (!key.includes(`uploads/${apiKey.userId}/`)) {
        res.status(403);
        throw new Error('Not authorized to delete this image');
    }

    const client = getR2Client();
    if (!client) {
        res.status(500);
        throw new Error('Storage service not configured');
    }

    await client.send(new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
    }));

    res.json({
        success: true,
        message: 'Image deleted successfully'
    });
});

// @desc    Get upload usage stats for current API key
// @route   GET /api/upload/stats
// @access  API Key Required
const getUploadStats = asyncHandler(async (req, res) => {
    const apiKey = await validateApiKeyForUpload(req);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalCalls, recentCalls] = await Promise.all([
        prisma.apiCallLog.count({
            where: { apiKeyId: apiKey.id }
        }),
        prisma.apiCallLog.findMany({
            where: {
                apiKeyId: apiKey.id,
                createdAt: { gte: thirtyDaysAgo }
            },
            select: {
                createdAt: true,
                statusCode: true,
                requestBody: true
            }
        })
    ]);

    const successfulUploads = recentCalls.filter(c => c.statusCode === 200).length;
    const failedUploads = recentCalls.filter(c => c.statusCode !== 200).length;
    const totalBytes = recentCalls
        .filter(c => c.statusCode === 200)
        .reduce((sum, c) => sum + (c.requestBody?.fileSize || 0), 0);

    res.json({
        success: true,
        stats: {
            apiKey: {
                name: apiKey.name,
                tier: apiKey.tier,
                usageCount: apiKey.usageCount,
                usageLimit: apiKey.usageLimit,
                remainingCalls: apiKey.usageLimit ? apiKey.usageLimit - apiKey.usageCount : 'Unlimited'
            },
            last30Days: {
                totalCalls: recentCalls.length,
                successfulUploads,
                failedUploads,
                totalBytesUploaded: totalBytes,
                totalMBUploaded: (totalBytes / (1024 * 1024)).toFixed(2)
            }
        }
    });
});

module.exports = {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    getUploadStats
};
