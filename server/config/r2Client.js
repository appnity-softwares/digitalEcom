const { S3Client } = require('@aws-sdk/client-s3');

/**
 * Cloudflare R2 Client Singleton
 * 
 * This module provides a reusable S3Client configured for Cloudflare R2.
 * R2 is S3-compatible, so we use the AWS SDK v3 with a custom endpoint.
 * 
 * Key differences from AWS S3:
 * - Endpoint: https://<account-id>.r2.cloudflarestorage.com
 * - Region: 'auto' (R2 handles global distribution automatically)
 * - No egress fees (unlike S3)
 * 
 * @see https://developers.cloudflare.com/r2/api/s3/api/
 */

let r2Client = null;

/**
 * Get or create R2 client instance (singleton pattern)
 * 
 * @returns {S3Client} Configured S3Client for Cloudflare R2
 * @throws {Error} If R2 credentials are not configured
 */
const getR2Client = () => {
    if (!r2Client) {
        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
        const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

        // Validate required environment variables
        if (!accountId || !accessKeyId || !secretAccessKey) {
            throw new Error(
                'Cloudflare R2 credentials not configured. Please set CLOUDFLARE_ACCOUNT_ID, ' +
                'CLOUDFLARE_R2_ACCESS_KEY_ID, and CLOUDFLARE_R2_SECRET_ACCESS_KEY in .env'
            );
        }

        // Initialize S3Client with R2 endpoint
        r2Client = new S3Client({
            region: 'auto', // R2 uses 'auto' for automatic region selection
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });

        console.log('✅ Cloudflare R2 client initialized');
    }

    return r2Client;
};

/**
 * Get the configured bucket name
 * 
 * @returns {string} R2 bucket name
 */
const getBucketName = () => {
    return process.env.CLOUDFLARE_R2_BUCKET_NAME || 'codestudio-uploads';
};

/**
 * Get the public URL for R2 objects (if custom domain is configured)
 * 
 * @returns {string|null} Public URL base or null if not configured
 */
const getPublicUrl = () => {
    return process.env.CLOUDFLARE_R2_PUBLIC_URL || null;
};

module.exports = {
    getR2Client,
    getBucketName,
    getPublicUrl,
};
