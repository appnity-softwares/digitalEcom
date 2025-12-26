import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, Edit, Trash2, X, Star, Crown, Eye, Download
} from 'lucide-react';
import { getAdminTemplates, createTemplate, updateTemplate, deleteTemplate, getTemplateCategories } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const AdminTemplates = () => {
    const { showToast } = useToast();
    const [templates, setTemplates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        price: 0,
        demoUrl: '',
        downloadUrl: '',
        previewImage: '',
        tags: [],
        isPremium: false,
        isFeatured: false,
        isActive: true
    });

    useEffect(() => {
        fetchTemplates();
        fetchCategories();
    }, [searchQuery]);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await getAdminTemplates({ search: searchQuery });
            setTemplates(response.data);
        } catch (err) {
            showToast('Failed to load templates', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await getTemplateCategories();
            setCategories(response.data);
        } catch (err) {
            console.error('Failed to load categories');
        }
    };

    const handleOpenModal = (template = null) => {
        if (template) {
            setEditingTemplate(template);
            setFormData({
                title: template.title,
                description: template.description,
                categoryId: template.categoryId,
                price: template.price,
                demoUrl: template.demoUrl || '',
                downloadUrl: template.downloadUrl || '',
                previewImage: template.previewImage || '',
                tags: template.tags || [],
                isPremium: template.isPremium,
                isFeatured: template.isFeatured,
                isActive: template.isActive
            });
        } else {
            setEditingTemplate(null);
            setFormData({
                title: '',
                description: '',
                categoryId: categories[0]?.id || '',
                price: 0,
                demoUrl: '',
                downloadUrl: '',
                previewImage: '',
                tags: [],
                isPremium: false,
                isFeatured: false,
                isActive: true
            });
        }
        setShowTemplateModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTemplate) {
                await updateTemplate(editingTemplate.id, formData);
                showToast('Template updated successfully', 'success');
            } else {
                await createTemplate(formData);
                showToast('Template created successfully', 'success');
            }
            setShowTemplateModal(false);
            fetchTemplates();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to save template', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        try {
            await deleteTemplate(id);
            showToast('Template deleted successfully', 'success');
            fetchTemplates();
        } catch (err) {
            showToast('Failed to delete template', 'error');
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">Template Management</h1>
                    <p className="text-muted-foreground">Add, edit, and manage templates</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:scale-105 transition-transform"
                >
                    <Plus className="w-5 h-5" />
                    Add Template
                </button>
            </div>

            {/* Search */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="search"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-secondary border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            {/* Templates Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card rounded-2xl overflow-hidden border border-white/10 group"
                        >
                            {/* Preview Image */}
                            <div className="relative aspect-video bg-secondary/50 overflow-hidden">
                                {template.previewImage ? (
                                    <img src={template.previewImage} alt={template.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <FileText className="w-16 h-16 text-muted-foreground/30" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2">
                                    {template.isFeatured && (
                                        <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-current" />
                                            Featured
                                        </span>
                                    )}
                                    {template.isPremium && (
                                        <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                            <Crown className="w-3 h-3" />
                                            Premium
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-foreground mb-1">{template.title}</h3>
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.description}</p>

                                {/* Stats */}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                                    <div className="flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        {template.views || 0}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Download className="w-3 h-3" />
                                        {template.downloads || 0}
                                    </div>
                                    <div className="ml-auto text-primary font-bold">
                                        ₹{template.price}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenModal(template)}
                                        className="flex-1 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(template.id)}
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

            {/* Template Form Modal */}
            <AnimatePresence>
                {showTemplateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowTemplateModal(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card rounded-3xl border-2 border-white/20 max-w-2xl w-full max-h-[90vh] overflow-auto"
                        >
                            <form onSubmit={handleSubmit}>
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-white/10">
                                    <h2 className="text-2xl font-bold text-foreground">
                                        {editingTemplate ? 'Edit Template' : 'Add Template'}
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => setShowTemplateModal(false)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Form */}
                                <div className="p-6 space-y-4">
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
                                        <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                                        <textarea
                                            required
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-3 bg-secondary border border-white/10 rounded-xl text-foreground focus:outline-none focus:border-primary"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                                            <select
                                                required
                                                value={formData.categoryId}
                                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                                className="w-full px-4 py-3 bg-secondary border border-white/10 rounded-xl text-foreground focus:outline-none focus:border-primary"
                                            >
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">Price (₹)</label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                                className="w-full px-4 py-3 bg-secondary border border-white/10 rounded-xl text-foreground focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Preview Image URL</label>
                                        <input
                                            type="url"
                                            value={formData.previewImage}
                                            onChange={(e) => setFormData({ ...formData, previewImage: e.target.value })}
                                            className="w-full px-4 py-3 bg-secondary border border-white/10 rounded-xl text-foreground focus:outline-none focus:border-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Demo URL</label>
                                        <input
                                            type="url"
                                            value={formData.demoUrl}
                                            onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                                            className="w-full px-4 py-3 bg-secondary border border-white/10 rounded-xl text-foreground focus:outline-none focus:border-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Download URL</label>
                                        <input
                                            type="url"
                                            value={formData.downloadUrl}
                                            onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                                            className="w-full px-4 py-3 bg-secondary border border-white/10 rounded-xl text-foreground focus:outline-none focus:border-primary"
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isPremium}
                                                onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                                                className="w-5 h-5 rounded border-white/10"
                                            />
                                            <span className="text-sm font-medium text-foreground">Premium</span>
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isFeatured}
                                                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                                className="w-5 h-5 rounded border-white/10"
                                            />
                                            <span className="text-sm font-medium text-foreground">Featured</span>
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                className="w-5 h-5 rounded border-white/10"
                                            />
                                            <span className="text-sm font-medium text-foreground">Active</span>
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:scale-[1.02] transition-transform"
                                    >
                                        {editingTemplate ? 'Update Template' : 'Create Template'}
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

export default AdminTemplates;
