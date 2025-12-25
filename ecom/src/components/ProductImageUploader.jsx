import React from 'react';
import { Image as ImageIcon, FileText, Film } from 'lucide-react';
import FileUploader from './FileUploader';
import { useSignedUrl } from '../hooks/useQueries';
import { useToast } from '../context/ToastContext';

/**
 * ProductImageUploader Component
 * 
 * Specialized uploader for product images in admin panel.
 * Supports multiple images and preview.
 * 
 * @param {Object} props
 * @param {string[]} props.images - Array of R2 keys for current images
 * @param {Function} props.onImagesUpdate - Callback when images are updated
 * @param {number} props.maxImages - Maximum number of images (default: 5)
 */
const ProductImageUploader = ({
    images = [],
    onImagesUpdate,
    maxImages = 5
}) => {
    const { showToast } = useToast();

    const handleUploadSuccess = (key) => {
        if (images.length >= maxImages) {
            showToast(`Maximum ${maxImages} images allowed`, 'error');
            return;
        }

        const updatedImages = [...images, key];
        onImagesUpdate(updatedImages);
        showToast('Image added successfully', 'success');
    };

    const handleRemoveImage = (index) => {
        const updatedImages = images.filter((_, i) => i !== index);
        onImagesUpdate(updatedImages);
        showToast('Image removed', 'success');
    };

    return (
        <div className="space-y-4">
            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((imageKey, index) => (
                        <ImagePreview
                            key={index}
                            imageKey={imageKey}
                            onRemove={() => handleRemoveImage(index)}
                            isPrimary={index === 0}
                        />
                    ))}
                </div>
            )}

            {/* Upload New Image */}
            {images.length < maxImages && (
                <div>
                    <p className="text-sm text-muted-foreground mb-2">
                        {images.length === 0 ? 'Add product images' : `Add more images (${images.length}/${maxImages})`}
                    </p>
                    <FileUploader
                        accept="image/*"
                        maxSize={5 * 1024 * 1024}
                        onSuccess={handleUploadSuccess}
                    />
                </div>
            )}
        </div>
    );
};

// Image Preview Component
const ImagePreview = ({ imageKey, onRemove, isPrimary }) => {
    const { data: imageUrl } = useSignedUrl(imageKey);

    return (
        <div className="relative group">
            <div className="aspect-square rounded-xl overflow-hidden bg-secondary border-2 border-primary/20">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="Product"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground animate-pulse" />
                    </div>
                )}
            </div>

            {/* Primary Badge */}
            {isPrimary && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-lg">
                    Primary
                </div>
            )}

            {/* Remove Button */}
            <button
                onClick={onRemove}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <ImageIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

export default ProductImageUploader;
