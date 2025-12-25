import api from './api';

/**
 * Cloudflare R2 Upload Service
 * 
 * This service handles secure file uploads to Cloudflare R2 using presigned URLs.
 * Benefits of presigned URLs:
 * - No R2 credentials exposed on frontend
 * - Upload happens directly from client to R2 (faster)
 * - Server validates file before generating URL (security)
 * - Progress tracking support
 */

/**
 * Get presigned upload URL from backend
 * 
 * @param {string} fileName - Original file name
 * @param {string} fileType - MIME type (e.g., 'image/jpeg')
 * @param {number} fileSize - File size in bytes
 * @returns {Promise<{uploadUrl: string, key: string, expiresIn: number}>}
 */
export const getPresignedUrl = async (fileName, fileType, fileSize) => {
    const response = await api.post('/r2/presigned-url', {
        fileName,
        fileType,
        fileSize,
    });
    return response.data.data;
};

/**
 * Upload file to R2 using presigned URL with progress tracking
 * 
 * @param {File} file - File object from input
 * @param {Function} onProgress - Callback for upload progress (0-100)
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise<string>} - Returns the object key for the uploaded file
 */
export const uploadFileToR2 = async (file, onProgress = null, signal = null) => {
    // Step 1: Get presigned URL from backend
    const { uploadUrl, key } = await getPresignedUrl(
        file.name,
        file.type,
        file.size
    );

    // Step 2: Upload directly to R2 using XMLHttpRequest (for progress support)
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Handle upload progress
        if (onProgress) {
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    onProgress(percentComplete);
                }
            });
        }

        // Handle completion
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                resolve(key); // Return the object key
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
            reject(new Error('Upload failed due to network error'));
        });

        xhr.addEventListener('abort', () => {
            reject(new Error('Upload cancelled'));
        });

        // Handle cancellation via AbortSignal
        if (signal) {
            signal.addEventListener('abort', () => {
                xhr.abort();
            });
        }

        // Configure and send request
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
    });
};

/**
 * Get signed URL for viewing/downloading private files
 * 
 * @param {string} key - Object key from upload
 * @returns {Promise<{url: string, expiresIn: number}>}
 */
export const getSignedUrl = async (key) => {
    const response = await api.get(`/r2/signed-url/${encodeURIComponent(key)}`);
    return response.data.data;
};

/**
 * Validate file before upload
 * 
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @param {string[]} options.allowedTypes - Allowed MIME types
 * @param {number} options.maxSize - Maximum file size in bytes
 * @throws {Error} If validation fails
 */
export const validateFile = (file, options = {}) => {
    const {
        allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
        maxSize = 5 * 1024 * 1024, // 5MB default
    } = options;

    // Check file type
    if (!allowedTypes.includes(file.type)) {
        throw new Error(
            `Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`
        );
    }

    // Check file size
    if (file.size > maxSize) {
        throw new Error(
            `File size exceeds ${(maxSize / 1024 / 1024).toFixed(2)}MB limit. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`
        );
    }

    return true;
};

/**
 * Complete upload workflow with validation and error handling
 * 
 * @param {File} file - File to upload
 * @param {Function} onProgress - Progress callback
 * @param {AbortSignal} signal - Cancellation signal
 * @returns {Promise<string>} - Object key
 */
export const uploadFile = async (file, onProgress = null, signal = null) => {
    // Validate file first
    validateFile(file);

    // Upload to R2
    const key = await uploadFileToR2(file, onProgress, signal);

    return key;
};

/**
 * Delete file from R2
 * 
 * @param {string} key - Object key to delete
 * @returns {Promise<void>}
 */
export const deleteFile = async (key) => {
    const response = await api.delete(`/r2/file/${encodeURIComponent(key)}`);
    return response.data;
};

