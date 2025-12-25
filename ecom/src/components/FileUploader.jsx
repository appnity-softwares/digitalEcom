import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle, AlertCircle, File, Image } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useUploadToR2 } from '../hooks/useQueries';

/**
 * FileUploader Component
 * 
 * A reusable drag-and-drop file uploader with progress tracking for Cloudflare R2.
 * 
 * @param {Object} props
 * @param {string} props.accept - Accepted file types (default: images and PDF)
 * @param {number} props.maxSize - Max file size in bytes (default: 5MB)
 * @param {Function} props.onSuccess - Callback when upload succeeds (receives key)
 * @param {Function} props.onError - Callback when upload fails
 */
const FileUploader = ({
    accept = 'image/*,application/pdf',
    maxSize = 5 * 1024 * 1024,
    onSuccess,
    onError,
}) => {
    const { showToast } = useToast();
    const fileInputRef = useRef(null);
    const abortControllerRef = useRef(null);

    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error

    const uploadMutation = useUploadToR2();

    // Handle file selection
    const handleFileSelect = (file) => {
        if (!file) return;

        // Validate file
        try {
            const { validateFile } = require('../services/r2UploadService');
            validateFile(file, { maxSize });

            setSelectedFile(file);
            setUploadStatus('idle');
            setUploadProgress(0);

            // Generate preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => setPreview(reader.result);
                reader.readAsDataURL(file);
            } else {
                setPreview(null);
            }
        } catch (error) {
            showToast(error.message, 'error');
            if (onError) onError(error);
        }
    };

    // File input change handler
    const handleFileInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    // Drag handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
    };

    // Upload handler
    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            setUploadStatus('uploading');
            setUploadProgress(0);

            // Create abort controller for cancellation
            abortControllerRef.current = new AbortController();

            const key = await uploadMutation.mutateAsync({
                file: selectedFile,
                onProgress: (progress) => setUploadProgress(progress),
                signal: abortControllerRef.current.signal,
            });

            setUploadStatus('success');
            showToast('File uploaded successfully!', 'success');
            if (onSuccess) onSuccess(key);

            // Reset after 2 seconds
            setTimeout(() => {
                setSelectedFile(null);
                setPreview(null);
                setUploadProgress(0);
                setUploadStatus('idle');
            }, 2000);
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('error');
            showToast(error.message || 'Upload failed', 'error');
            if (onError) onError(error);
        }
    };

    // Cancel upload
    const handleCancel = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setSelectedFile(null);
        setPreview(null);
        setUploadProgress(0);
        setUploadStatus('idle');
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Dropzone */}
            <motion.div
                className={`relative border-2 border-dashed rounded-2xl p-8 transition-all ${isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-white/10 hover:border-white/20'
                    } ${selectedFile ? 'hidden' : 'block'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="text-center">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        Drag and drop your file here
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        or click to browse from your computer
                    </p>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Select File
                    </button>
                    <p className="text-xs text-muted-foreground mt-4">
                        Max size: {(maxSize / 1024 / 1024).toFixed(0)}MB • Supported: Images, PDF
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileInputChange}
                    className="hidden"
                />
            </motion.div>

            {/* File Preview & Upload */}
            <AnimatePresence>
                {selectedFile && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-card rounded-2xl p-6"
                    >
                        <div className="flex items-start gap-4 mb-4">
                            {/* Preview */}
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <File className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                )}
                            </div>

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-foreground truncate">
                                    {selectedFile.name}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                </p>
                            </div>

                            {/* Cancel Button */}
                            {uploadStatus !== 'success' && (
                                <button
                                    onClick={handleCancel}
                                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                    disabled={uploadStatus === 'uploading'}
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            )}
                        </div>

                        {/* Progress Bar */}
                        {uploadStatus === 'uploading' && (
                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-primary"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${uploadProgress}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Status Messages */}
                        {uploadStatus === 'success' && (
                            <div className="flex items-center gap-2 text-green-500 mb-4">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">Upload successful!</span>
                            </div>
                        )}

                        {uploadStatus === 'error' && (
                            <div className="flex items-center gap-2 text-red-500 mb-4">
                                <AlertCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">Upload failed. Please try again.</span>
                            </div>
                        )}

                        {/* Upload Button */}
                        {uploadStatus === 'idle' && (
                            <button
                                onClick={handleUpload}
                                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                            >
                                <Upload className="w-5 h-5" />
                                Upload to Cloud
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FileUploader;
