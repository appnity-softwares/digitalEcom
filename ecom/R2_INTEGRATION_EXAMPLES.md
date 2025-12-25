# Cloudflare R2 Integration Examples

This document provides real-world examples of integrating the R2 upload system into your application.

---

## Example 1: User Avatar Upload (Profile Page)

Use the `AvatarUploader` component for user profile pictures:

```jsx
import AvatarUploader from '../components/AvatarUploader';

const Profile = () => {
    const { user, updateUser } = useContext(AuthContext);

    return (
        <div className="profile-page">
            <AvatarUploader
                currentAvatarKey={user.avatar}
                onAvatarUpdate={(newKey) => {
                    updateUser({ ...user, avatar: newKey });
                }}
            />
        </div>
    );
};
```

**Features:**
- Circular avatar display
- Hover overlay for upload
- Delete old avatar when uploading new one
- Updates user profile automatically

---

## Example 2: Product Images (Admin Panel)

Use the `ProductImageUploader` for managing product images:

```jsx
import ProductImageUploader from '../components/ProductImageUploader';

const ProductEdit = () => {
    const [productData, setProductData] = useState({
        images: [],
        // ... other fields
    });

    return (
        <form>
            <ProductImageUploader
                images={productData.images}
                onImagesUpdate={(newImages) => {
                    setProductData({ ...productData, images: newImages });
                }}
                maxImages={5}
            />
        </form>
    );
};
```

**Features:**
- Multiple image upload
- Grid preview
- Primary image badge
- Max limit enforcement

---

## Example 3: Blog Post Featured Image

```jsx
import FileUploader from '../components/FileUploader';
import { useSignedUrl } from '../hooks/useQueries';

const BlogEditor = () => {
    const [featuredImage, setFeaturedImage] = useState(null);
    const { data: imageUrl } = useSignedUrl(featuredImage);

    return (
        <div>
            {imageUrl && (
                <img src={imageUrl} alt="Featured" className="w-full h-64 object-cover rounded-xl" />
            )}
            
            <FileUploader
                accept="image/*"
                maxSize={3 * 1024 * 1024}
                onSuccess={(key) => setFeaturedImage(key)}
            />
        </div>
    );
};
```

---

## Example 4: Document Attachments

```jsx
const DocumentUploader = () => {
    const [documents, setDocuments] = useState([]);

    return (
        <div>
            <FileUploader
                accept="application/pdf,.doc,.docx"
                maxSize={10 * 1024 * 1024}
                onSuccess={(key) => {
                    setDocuments([...documents, { key, name: 'Document' }]);
                }}
            />

            {/* Document List */}
            {documents.map((doc, i) => (
                <DocumentItem key={i} doc={doc} />
            ))}
        </div>
    );
};
```

---

## Example 5: Direct API Usage (Without Component)

For advanced use cases, use the service functions directly:

```javascript
import { uploadFile, getSignedUrl, deleteFile } from '../services/r2UploadService';

// Upload with progress
const handleUpload = async (file) => {
    try {
        const key = await uploadFile(
            file,
            (progress) => setUploadProgress(progress),
            abortController.signal
        );
        
        console.log('Uploaded:', key);
    } catch (error) {
        console.error('Upload failed:', error);
    }
};

// Get signed URL
const viewFile = async (key) => {
    const { url } = await getSignedUrl(key);
    window.open(url, '_blank');
};

// Delete file
const removeFile = async (key) => {
    await deleteFile(key);
    console.log('Deleted:', key);
};
```

---

## Example 6: Form Integration with Validation

```jsx
import { useForm } from 'react-hook-form';
import FileUploader from '../components/FileUploader';

const UserForm = () => {
    const { register, handleSubmit, setValue, watch } = useForm();
    const avatarKey = watch('avatar');

    const onSubmit = async (data) => {
        // Submit form with avatar key
        await api.post('/users', {
            name: data.name,
            email: data.email,
            avatar: data.avatar, // R2 key
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('name', { required: true })} />
            <input {...register('email', { required: true })} />
            
            <FileUploader
                onSuccess={(key) => setValue('avatar', key)}
            />
            
            <button type="submit">Create User</button>
        </form>
    );
};
```

---

## Backend Integration Example

When saving file keys to database:

```javascript
// Backend route
app.patch('/api/users/me', protect, async (req, res) => {
    const { avatar } = req.body;
    
    // Validate the avatar key belongs to this user
    if (avatar && !avatar.startsWith(`uploads/user_${req.user.id}/`)) {
        return res.status(403).json({ error: 'Invalid avatar key' });
    }
    
    // Update user in database
    const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { avatar },
    });
    
    res.json({ user });
});
```

---

## Tips & Best Practices

1. **Always validate file keys on backend** before saving
2. **Store only the key** in database, not the full URL
3. **Generate signed URLs on-demand** when displaying files
4. **Clean up old files** when updating (e.g., old avatar)
5. **Set appropriate file size limits** per use case:
   - Avatars: 2MB
   - Product images: 5MB
   - Documents: 10MB
6. **Use loading states** during upload/delete operations
7. **Show progress** for better UX
8. **Handle errors gracefully** with user-friendly messages
