import { useDoc } from '../../hooks/useQueries';

const BlogEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const isEditing = !!id;

    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        category: '',
        difficulty: 'beginner',
        thumbnail: '',
        requires_subscription: false,
        is_developers_choice: false,
        reading_time_minutes: 5,
        tags: [],
        published: false
    });

    const { data: blogData, isLoading: loading } = useDoc(id);

    useEffect(() => {
        if (blogData && blogData.doc) {
            const blog = blogData.doc;
            setFormData({
                title: blog.title || '',
                description: blog.description || '',
                content: blog.content || '',
                category: blog.category || '',
                difficulty: blog.difficulty || 'beginner',
                thumbnail: blog.thumbnail || '',
                requires_subscription: blog.requires_subscription || false,
                is_developers_choice: blog.is_developers_choice || false,
                reading_time_minutes: blog.reading_time_minutes || 5,
                tags: blog.tags || [],
                published: blog.published !== false
            });
        }
    }, [blogData]);

    const categories = [
        'React', 'React Native', 'Next.js', 'Node.js', 'TypeScript',
        'Flutter', 'Python', 'Architecture', 'DevOps', 'Database',
        'API Design', 'Security', 'Performance', 'Testing', 'UI/UX'
    ];

    const difficulties = ['beginner', 'intermediate', 'advanced'];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleTagInput = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            e.preventDefault();
            const newTag = e.target.value.trim();
            if (!formData.tags.includes(newTag)) {
                setFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, newTag]
                }));
            }
            e.target.value = '';
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.content) {
            showToast('Title and content are required', 'error');
            return;
        }

        setSaving(true);
        try {
            if (isEditing) {
                await api.put(`/docs/${id}`, formData);
                showToast('Blog post updated!', 'success');
            } else {
                await api.post('/docs', formData);
                showToast('Blog post created!', 'success');
            }
            navigate('/admin/dashboard');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to save', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            await api.delete(`/docs/${id}`);
            showToast('Blog post deleted', 'success');
            navigate('/admin/dashboard');
        } catch (err) {
            showToast('Failed to delete', 'error');
        }
    };

    // Calculate reading time from content
    useEffect(() => {
        const words = formData.content.split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(1, Math.ceil(words / 200));
        setFormData(prev => ({ ...prev, reading_time_minutes: minutes }));
    }, [formData.content]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12">
            <div className="max-w-5xl mx-auto px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                            {isEditing ? 'Edit Blog Post' : 'New Blog Post'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Eye className="w-4 h-4" />
                            {previewMode ? 'Edit' : 'Preview'}
                        </button>
                        {isEditing && (
                            <button
                                onClick={handleDelete}
                                className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Title */}
                            <div className="card">
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Post title..."
                                    className="w-full text-2xl font-bold bg-transparent border-none outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                                />
                            </div>

                            {/* Description */}
                            <div className="card">
                                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Brief description for previews..."
                                    rows={2}
                                    className="input resize-none"
                                />
                            </div>

                            {/* Content Editor */}
                            <div className="card">
                                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                                    Content (Markdown supported)
                                </label>

                                {/* Toolbar */}
                                <div className="flex items-center gap-1 mb-3 pb-3 border-b border-[var(--border-primary)]">
                                    {[
                                        { icon: Bold, label: 'Bold' },
                                        { icon: Italic, label: 'Italic' },
                                        { icon: Code, label: 'Code' },
                                        { icon: LinkIcon, label: 'Link' },
                                        { icon: List, label: 'List' },
                                        { icon: ImageIcon, label: 'Image' },
                                    ].map(({ icon: Icon, label }) => (
                                        <button
                                            key={label}
                                            type="button"
                                            title={label}
                                            className="p-2 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                                        >
                                            <Icon className="w-4 h-4" />
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    placeholder="Write your blog post content here... Markdown is supported."
                                    rows={20}
                                    className="input resize-none font-mono text-sm"
                                />
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Developer's Choice Toggle */}
                            <div className="card">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                                            <Award className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[var(--text-primary)]">
                                                Developer's Choice
                                            </p>
                                            <p className="text-xs text-[var(--text-tertiary)]">
                                                Featured badge
                                            </p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="is_developers_choice"
                                        checked={formData.is_developers_choice}
                                        onChange={handleChange}
                                        className="w-5 h-5 accent-yellow-500"
                                    />
                                </label>
                            </div>

                            {/* Subscription Required */}
                            <div className="card">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                            <Lock className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[var(--text-primary)]">
                                                Pro Only
                                            </p>
                                            <p className="text-xs text-[var(--text-tertiary)]">
                                                Requires subscription
                                            </p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="requires_subscription"
                                        checked={formData.requires_subscription}
                                        onChange={handleChange}
                                        className="w-5 h-5 accent-purple-500"
                                    />
                                </label>
                            </div>

                            {/* Published */}
                            <div className="card">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div>
                                        <p className="font-semibold text-[var(--text-primary)]">Published</p>
                                        <p className="text-xs text-[var(--text-tertiary)]">
                                            Make visible to users
                                        </p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="published"
                                        checked={formData.published}
                                        onChange={handleChange}
                                        className="w-5 h-5 accent-green-500"
                                    />
                                </label>
                            </div>

                            {/* Category */}
                            <div className="card">
                                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="input"
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Difficulty */}
                            <div className="card">
                                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                                    Difficulty
                                </label>
                                <div className="flex gap-2">
                                    {difficulties.map(diff => (
                                        <button
                                            key={diff}
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, difficulty: diff }))}
                                            className={`px-3 py-2 rounded-lg text-sm capitalize transition-all ${formData.difficulty === diff
                                                ? diff === 'beginner' ? 'bg-green-500 text-white'
                                                    : diff === 'intermediate' ? 'bg-orange-500 text-white'
                                                        : 'bg-red-500 text-white'
                                                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                                                }`}
                                        >
                                            {diff}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Thumbnail */}
                            <div className="card">
                                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                                    Thumbnail URL
                                </label>
                                <input
                                    type="url"
                                    name="thumbnail"
                                    value={formData.thumbnail}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    className="input"
                                />
                                {formData.thumbnail && (
                                    <img
                                        src={formData.thumbnail}
                                        alt="Thumbnail preview"
                                        className="mt-3 rounded-lg w-full h-32 object-cover"
                                    />
                                )}
                            </div>

                            {/* Tags */}
                            <div className="card">
                                <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                                    Tags
                                </label>
                                <input
                                    type="text"
                                    placeholder="Press Enter to add tag"
                                    onKeyDown={handleTagInput}
                                    className="input mb-2"
                                />
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="pill flex items-center gap-1"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="ml-1 hover:text-red-500"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Reading Time */}
                            <div className="card">
                                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm">
                                        {formData.reading_time_minutes} min read
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlogEditor;
