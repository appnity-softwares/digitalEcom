import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, Edit, Trash2, X, Star, Code, Eye,
    Copy, Monitor, Layout, Smartphone
} from 'lucide-react';
import {
    useComponents,
    useComponentCategories,
    useCreateComponent,
    useUpdateComponent,
    useDeleteComponent
} from '../../hooks/useQueries';
import { useToast } from '../../context/ToastContext';

const AdminComponents = () => {
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingComponent, setEditingComponent] = useState(null);

    // Queries
    const { data: componentsResponse, isLoading: componentsLoading } = useComponents({ search: searchQuery, category: 'all', status: 'all' });
    const { data: categoriesResponse } = useComponentCategories();

    // Mutations
    const createMutation = useCreateComponent();
    const updateMutation = useUpdateComponent();
    const deleteMutation = useDeleteComponent();

    const components = componentsResponse?.data || [];
    const categories = categoriesResponse?.data || [];

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        code: '',
        previewType: 'ReactComponent',
        categoryId: '',
        tags: '',
        isFeatured: false,
        isActive: true
    });

    const previewTypes = [
        { id: 'ReactComponent', label: 'React Component', icon: Code },
        { id: 'HTML', label: 'HTML/CSS', icon: Layout },
        { id: 'Mobile', label: 'Mobile View', icon: Smartphone },
        { id: 'Screenshot', label: 'Screenshot', icon: Monitor }
    ];

    const handleOpenModal = (component = null) => {
        if (component) {
            setEditingComponent(component);
            setFormData({
                title: component.title,
                description: component.description,
                code: component.code,
                previewType: component.previewType,
                categoryId: component.categoryId,
                tags: component.tags.join(', '),
                isFeatured: component.isFeatured,
                isActive: component.isActive
            });
        } else {
            setEditingComponent(null);
            setFormData({
                title: '',
                description: '',
                code: '',
                previewType: 'ReactComponent',
                categoryId: categories.length > 0 ? categories[0].id : '',
                tags: '',
                isFeatured: false,
                isActive: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const dataToSubmit = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        try {
            if (editingComponent) {
                await updateMutation.mutateAsync({
                    id: editingComponent.id,
                    componentData: dataToSubmit
                });
                showToast('Component updated successfully', 'success');
            } else {
                await createMutation.mutateAsync(dataToSubmit);
                showToast('Component created successfully', 'success');
            }
            setShowModal(false);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to save component', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this component?')) return;
        try {
            await deleteMutation.mutateAsync(id);
            showToast('Component deleted successfully', 'success');
        } catch (err) {
            showToast('Failed to delete component', 'error');
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">Component Management</h1>
                    <p className="text-muted-foreground">Add, edit, and manage dynamic components</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:scale-105 transition-transform"
                >
                    <Plus className="w-5 h-5" />
                    Add Component
                </button>
            </div>

            {/* Search */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="search"
                        placeholder="Search components by title, description or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-secondary border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            {/* Components Grid */}
            {componentsLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {components.map((component) => (
                        <motion.div
                            key={component.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card rounded-2xl overflow-hidden border border-white/10 group flex flex-col"
                        >
                            {/* Card Header stats */}
                            <div className="p-4 bg-secondary/30 flex justify-between items-center text-xs text-muted-foreground">
                                <div className="flex gap-3">
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        {component.views}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Copy className="w-3 h-3" />
                                        {component.copies}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {component.isFeatured && (
                                        <span className="text-yellow-500 flex items-center gap-1 font-bold">
                                            <Star className="w-3 h-3 fill-current" />
                                            Featured
                                        </span>
                                    )}
                                    {!component.isActive && (
                                        <span className="text-red-400 font-bold">Inactive</span>
                                    )}
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="px-2 py-1 rounded-md bg-white/5 text-xs text-muted-foreground border border-white/5">
                                        {component.category?.label || 'Uncategorized'}
                                    </span>
                                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                                        {component.previewType}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-foreground mb-2">{component.title}</h3>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                                    {component.description}
                                </p>

                                {/* Tags */}
                                {component.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {component.tags.slice(0, 3).map((tag, i) => (
                                            <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                                                #{tag}
                                            </span>
                                        ))}
                                        {component.tags.length > 3 && (
                                            <span className="text-[10px] text-muted-foreground px-1">+{component.tags.length - 3}</span>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 mt-auto">
                                    <button
                                        onClick={() => handleOpenModal(component)}
                                        className="flex-1 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(component.id)}
                                        className="px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card rounded-3xl border-2 border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[85vh]">
                                {/* Modal Header */}
                                <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                                    <h2 className="text-2xl font-bold text-foreground">
                                        {editingComponent ? 'Edit Component' : 'Add Component'}
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Modal Body - Scrollable */}
                                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.title}
                                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                        className="w-full px-4 py-3 bg-secondary border border-white/10 rounded-xl text-foreground focus:outline-none focus:border-primary"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                                                    <select
                                                        required
                                                        value={formData.categoryId}
                                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                                        className="w-full px-4 py-3 bg-secondary border border-white/10 rounded-xl text-foreground focus:outline-none focus:border-primary"
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categories.map((cat) => (
                                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                                                    <textarea
                                                        required
                                                        rows={3}
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                        className="w-full px-4 py-3 bg-secondary border border-white/10 rounded-xl text-foreground focus:outline-none focus:border-primary"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-foreground mb-2">Tags (comma separated)</label>
                                                    <input
                                                        type="text"
                                                        value={formData.tags}
                                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                                        placeholder="e.g. navigation, header, responsive"
                                                        className="w-full px-4 py-3 bg-secondary border border-white/10 rounded-xl text-foreground focus:outline-none focus:border-primary"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-foreground mb-2">Preview Type</label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {previewTypes.map((type) => {
                                                            const Icon = type.icon;
                                                            return (
                                                                <button
                                                                    key={type.id}
                                                                    type="button"
                                                                    onClick={() => setFormData({ ...formData, previewType: type.id })}
                                                                    className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${formData.previewType === type.id
                                                                        ? 'bg-primary/20 border-primary text-primary'
                                                                        : 'bg-secondary border-white/10 hover:border-white/30 text-muted-foreground'
                                                                        }`}
                                                                >
                                                                    <Icon className="w-4 h-4" />
                                                                    <span className="text-sm">{type.label}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-8 py-2">
                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${formData.isFeatured ? 'bg-primary border-primary' : 'border-white/20 bg-secondary'
                                                            }`}>
                                                            {formData.isFeatured && <Star className="w-3.5 h-3.5 text-white fill-current" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={formData.isFeatured}
                                                            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                                        />
                                                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">Featured Component</span>
                                                    </label>

                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${formData.isActive ? 'bg-green-500 border-green-500' : 'border-white/20 bg-secondary'
                                                            }`}>
                                                            {formData.isActive && <Eye className="w-3.5 h-3.5 text-white" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={formData.isActive}
                                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                        />
                                                        <span className="font-medium text-foreground group-hover:text-green-500 transition-colors">Active Status</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-full min-h-[300px] flex flex-col">
                                            <label className="block text-sm font-medium text-foreground mb-2">Code</label>
                                            <div className="flex-1 relative group">
                                                <textarea
                                                    required
                                                    value={formData.code}
                                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                                    className="w-full h-full min-h-[300px] px-4 py-4 bg-[#1a1b26] border border-white/10 rounded-xl text-sm font-mono text-gray-300 focus:outline-none focus:border-primary resize-y"
                                                    spellCheck="false"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="p-6 border-t border-white/10 shrink-0 bg-background/50 backdrop-blur-sm">
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
                                    >
                                        {editingComponent ? 'Update Component' : 'Create Component'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminComponents;
