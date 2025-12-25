import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, Eye, Trash2, Cloud, Shield, Zap } from 'lucide-react';
import FileUploader from '../components/FileUploader';
import { useSignedUrl, useDeleteR2File } from '../hooks/useQueries';
import { useToast } from '../context/ToastContext';

/**
 * R2 Upload Demo Page
 * 
 * Demonstrates Cloudflare R2 upload functionality with:
 * - Presigned URL uploads
 * - Progress tracking
 * - File viewing with signed URLs
 * - Upload history
 * - File deletion
 */
const R2UploadDemo = () => {
    const { showToast } = useToast();
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [selectedFileKey, setSelectedFileKey] = useState(null);

    const deleteMutation = useDeleteR2File();

    const handleUploadSuccess = (key) => {
        const newFile = {
            key,
            uploadedAt: new Date().toISOString(),
        };
        setUploadedFiles((prev) => [newFile, ...prev]);
    };

    const handleDelete = async (key, index) => {
        if (!confirm('Are you sure you want to delete this file?')) return;

        try {
            await deleteMutation.mutateAsync(key);
            setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
            showToast('File deleted successfully', 'success');
        } catch (error) {
            showToast(error.message || 'Failed to delete file', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-background py-24 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
                        <Cloud className="w-4 h-4" />
                        Cloudflare R2 Integration
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                        File Upload <span className="text-primary">Demo</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Test secure file uploads to Cloudflare R2 using presigned URLs. All uploads are
                        private and scoped to your account.
                    </p>
                </motion.div>

                {/* Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid md:grid-cols-3 gap-6 mb-12"
                >
                    {[
                        {
                            icon: Shield,
                            title: 'Secure',
                            description: 'Private uploads with user-scoped access control',
                        },
                        {
                            icon: Zap,
                            title: 'Fast',
                            description: 'Direct client-to-R2 uploads with progress tracking',
                        },
                        {
                            icon: Cloud,
                            title: 'Scalable',
                            description: 'No egress fees, powered by Cloudflare R2',
                        },
                    ].map((feature, i) => (
                        <div key={i} className="glass-card rounded-2xl p-6">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                <feature.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Upload Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12"
                >
                    <h2 className="text-2xl font-bold text-foreground mb-6">Upload Files</h2>
                    <FileUploader
                        onSuccess={handleUploadSuccess}
                        onError={(error) => console.error('Upload error:', error)}
                    />
                </motion.div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-2xl font-bold text-foreground mb-6">
                            Uploaded Files ({uploadedFiles.length})
                        </h2>
                        <div className="space-y-4">
                            {uploadedFiles.map((file, index) => (
                                <FileCard
                                    key={index}
                                    file={file}
                                    onView={() => setSelectedFileKey(file.key)}
                                    onDelete={() => handleDelete(file.key, index)}
                                    isDeleting={deleteMutation.isPending}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* File Viewer Modal */}
                {selectedFileKey && (
                    <FileViewerModal
                        fileKey={selectedFileKey}
                        onClose={() => setSelectedFileKey(null)}
                    />
                )}
            </div>
        </div>
    );
};

// File Card Component
const FileCard = ({ file, onView, onDelete, isDeleting }) => {
    return (
        <div className="glass-card rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <p className="font-mono text-sm text-foreground truncate max-w-md">{file.key}</p>
                    <p className="text-xs text-muted-foreground">
                        {new Date(file.uploadedAt).toLocaleString()}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onView}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    title="View file"
                    disabled={isDeleting}
                >
                    <Eye className="w-5 h-5 text-primary" />
                </button>
                <button
                    onClick={onDelete}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-50"
                    title="Delete file"
                    disabled={isDeleting}
                >
                    {isDeleting ? (
                        <div className="w-5 h-5 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                    ) : (
                        <Trash2 className="w-5 h-5 text-red-500" />
                    )}
                </button>
            </div>
        </div>
    );
};

// File Viewer Modal
const FileViewerModal = ({ fileKey, onClose }) => {
    const { data: signedUrl, isLoading, error } = useSignedUrl(fileKey);

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-background rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-foreground">File Viewer</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                        <Trash2 className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {isLoading && (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading file...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center py-12 text-red-500">
                        <p>Failed to load file: {error.message}</p>
                    </div>
                )}

                {signedUrl && (
                    <div>
                        <img
                            src={signedUrl}
                            alt="Uploaded file"
                            className="w-full rounded-xl"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                        <div className="hidden text-center py-12">
                            <p className="text-muted-foreground mb-4">
                                Unable to preview this file type
                            </p>
                            <a
                                href={signedUrl}
                                download
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                            >
                                <Download className="w-5 h-5" />
                                Download File
                            </a>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default R2UploadDemo;
