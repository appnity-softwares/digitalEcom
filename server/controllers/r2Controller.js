const asyncHandler = require('express-async-handler');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const { getR2Client, getBucketName } = require('../config/r2Client');

/**
 * Allowed file types for upload
 * - Images: JPEG, PNG, WebP, GIF
 * - Documents: PDF
 */
const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
];

/**
 * Maximum file size: 5MB
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

/**
 * Presigned URL expiration times
 */
const UPLOAD_URL_EXPIRY = 300; // 5 minutes for upload
const READ_URL_EXPIRY = 3600; // 60 minutes for read

/**
 * Validate file metadata before generating presigned URL
 * 
 * @param {string} fileType - MIME type of the file
 * @param {number} fileSize - Size of file in bytes
 * @throws {Error} If validation fails
 */
const validateFile = (fileType, fileSize) => {
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(fileType)) {
        throw new Error(
            `Invalid file type: ${fileType}. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`
        );
    }

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
        throw new Error(
            `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit. Your file: ${(fileSize / 1024 / 1024).toFixed(2)}MB`
        );
    }
};

/**
 * Generate a unique, secure file key for storage
 * 
 * @param {string} userId - User ID for scoping
 * @param {string} originalFileName - Original file name
 * @returns {string} Unique file key
 */
const generateFileKey = (userId, originalFileName) => {
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(8).toString('hex');
    const ext = originalFileName.split('.').pop();

    // Format: uploads/user_<userId>/<timestamp>-<random>.ext
    // This ensures user-scoped storage and prevents collisions
    return `uploads/user_${userId}/${timestamp}-${randomHash}.${ext}`;
};

/**
 * @desc    Generate presigned URL for client-side upload
 * @route   POST /api/r2/presigned-url
 * @access  Protected (JWT required)
 */
const generatePresignedUrl = asyncHandler(async (req, res) => {
    const { fileName, fileType, fileSize } = req.body;

    // Validate request body
    if (!fileName || !fileType || !fileSize) {
        res.status(400);
        throw new Error('fileName, fileType, and fileSize are required');
    }

    // Validate file
    try {
        validateFile(fileType, fileSize);
    } catch (error) {
        res.status(400);
        throw error;
    }

    // Generate unique file key
    const key = generateFileKey(req.user.id, fileName);

    try {
        const client = getR2Client();
        const bucketName = getBucketName();

        // Create PUT command for upload
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            ContentType: fileType,
            Metadata: {
                userId: req.user.id,
                originalName: fileName,
            },
        });

        // Generate presigned URL (valid for 5 minutes)
        const uploadUrl = await getSignedUrl(client, command, {
            expiresIn: UPLOAD_URL_EXPIRY,
        });

        res.json({
            success: true,
            data: {
                uploadUrl,
                key,
                expiresIn: UPLOAD_URL_EXPIRY,
            },
        });
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        res.status(500);
        throw new Error('Failed to generate upload URL');
    }
});

/**
 * @desc    Generate signed URL for reading private files
 * @route   GET /api/r2/signed-url/:key
 * @access  Protected (JWT required)
 */
const getSignedReadUrl = asyncHandler(async (req, res) => {
    const { key } = req.params;

    if (!key) {
        res.status(400);
        throw new Error('File key is required');
    }

    // Security: Verify the file belongs to this user
    // Format: uploads/user_<userId>/...
    const expectedPrefix = `uploads/user_${req.user.id}/`;
    if (!key.startsWith(expectedPrefix)) {
        res.status(403);
        throw new Error('Access denied: You can only access your own files');
    }

    try {
        const client = getR2Client();
        const bucketName = getBucketName();

        // Create GET command
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        });

        // Generate signed URL (valid for 60 minutes)
        const url = await getSignedUrl(client, command, {
            expiresIn: READ_URL_EXPIRY,
        });

        res.json({
            success: true,
            data: {
                url,
                expiresIn: READ_URL_EXPIRY,
            },
        });
    } catch (error) {
        console.error('Error generating signed read URL:', error);
        res.status(500);
        throw new Error('Failed to generate read URL');
    }
});

/**
 * @desc    Delete file from R2
 * @route   DELETE /api/r2/file/:key
 * @access  Protected (JWT required)
 */
const deleteFile = asyncHandler(async (req, res) => {
    const { key } = req.params;

    if (!key) {
        res.status(400);
        throw new Error('File key is required');
    }

    // Security: Verify the file belongs to this user
    const expectedPrefix = `uploads/user_${req.user.id}/`;
    if (!key.startsWith(expectedPrefix)) {
        res.status(403);
        throw new Error('Access denied: You can only delete your own files');
    }

    try {
        const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
        const client = getR2Client();
        const bucketName = getBucketName();

        // Delete from R2
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
        });

        await client.send(command);

        res.json({
            success: true,
            message: 'File deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500);
        throw new Error('Failed to delete file');
    }
});

module.exports = {
    generatePresignedUrl,
    getSignedReadUrl,
    deleteFile,
};
