import React, { useState } from 'react';
import { Camera, Upload, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUploader from './FileUploader';
import { useSignedUrl, useDeleteR2File } from '../hooks/useQueries';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

/**
 * AvatarUploader Component
 * 
 * Specialized uploader for user avatars using Cloudflare R2.
 * Integrates with user profile updates.
 * 
 * @param {Object} props
 * @param {string} props.currentAvatarKey - Current avatar R2 key
 * @param {Function} props.onAvatarUpdate - Callback when avatar is updated
 */
const AvatarUploader = ({ currentAvatarKey, onAvatarUpdate }) => {
    const { showToast } = useToast();
    const [showUploader, setShowUploader] = useState(false);
    const [avatarKey, setAvatarKey] = useState(currentAvatarKey);

    const { data: avatarUrl } = useSignedUrl(avatarKey);
    const deleteMutation = useDeleteR2File();

    const handleUploadSuccess = async (key) => {
        try {
            // Update user profile with new avatar key
            await api.patch('/users/me', { avatar: key });

            // Delete old avatar if exists
            if (avatarKey && avatarKey !== currentAvatarKey) {
                try {
                    await deleteMutation.mutateAsync(avatarKey);
                } catch (error) {
                    console.error('Failed to delete old avatar:', error);
                }
            }

            setAvatarKey(key);
            setShowUploader(false);
            showToast('Avatar updated successfully!', 'success');

            if (onAvatarUpdate) {
                onAvatarUpdate(key);
            }
        } catch (error) {
            showToast('Failed to update profile', 'error');
        }
    };

    const handleRemoveAvatar = async () => {
        if (!confirm('Remove your avatar?')) return;

        try {
            await api.patch('/users/me', { avatar: null });

            if (avatarKey) {
                await deleteMutation.mutateAsync(avatarKey);
            }

            setAvatarKey(null);
            showToast('Avatar removed', 'success');

            if (onAvatarUpdate) {
                onAvatarUpdate(null);
            }
        } catch (error) {
            showToast('Failed to remove avatar', 'error');
        }
    };

    return (
        <div className="relative">
            {/* Avatar Display */}
            <div className="relative w-32 h-32 mx-auto">
                <div className="w-full h-full rounded-full overflow-hidden bg-secondary border-4 border-primary/20">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                            <Camera className="w-12 h-12 text-muted-foreground" />
                        </div>
                    )}
                </div>

                {/* Upload Button Overlay */}
                <button
                    onClick={() => setShowUploader(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                >
                    <Upload className="w-8 h-8 text-white" />
                </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-2 mt-4">
                <button
                    onClick={() => setShowUploader(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                    {avatarKey ? 'Change' : 'Upload'} Photo
                </button>
                {avatarKey && (
                    <button
                        onClick={handleRemoveAvatar}
                        disabled={deleteMutation.isPending}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                )}
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploader && (
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        onClick={() => setShowUploader(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-background rounded-2xl max-w-2xl w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-foreground">Upload Avatar</h3>
                                <button
                                    onClick={() => setShowUploader(false)}
                                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            <FileUploader
                                accept="image/*"
                                maxSize={2 * 1024 * 1024} // 2MB for avatars
                                onSuccess={handleUploadSuccess}
                                onError={(error) => showToast(error.message, 'error')}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AvatarUploader;
