import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, Edit, Trash2, X, Star, Eye, Layers, Palette, Wrench
} from 'lucide-react';
import {
    useToolCategories,
    useCreateToolCategory,
    useUpdateToolCategory,
    useDeleteToolCategory
} from '../../hooks/useQueries';
import { useToast } from '../../context/ToastContext';

const AdminToolCategories = () => {
    const { showToast } = useToast();
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    // Queries
    const { data: categoriesResponse, isLoading } = useToolCategories();

    // Mutations
    const createMutation = useCreateToolCategory();
    const updateMutation = useUpdateToolCategory();
    const deleteMutation = useDeleteToolCategory();

    const categories = categoriesResponse?.data || [];

    // State for Search
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCategories = categories.filter(cat =>
        cat.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const [formData, setFormData] = useState({
        name: '',
        label: '',
        icon: 'Wrench',
        gradient: 'from-indigo-500 to-purple-500',
        order: 0,
        isActive: true
    });

    const gradients = [
        'from-indigo-500 to-purple-500',
        'from-blue-500 to-cyan-500',
        'from-green-500 to-emerald-500',
        'from-orange-500 to-red-500',
        'from-pink-500 to-rose-500',
        'from-yellow-400 to-orange-500',
        'from-gray-700 to-gray-900',
    ];

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                label: category.label,
                icon: category.icon,
                gradient: category.gradient,
                order: category.order,
                isActive: category.isActive
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                label: '',
                icon: 'Wrench',
                gradient: 'from-indigo-500 to-purple-500',
                order: 0,
                isActive: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await updateMutation.mutateAsync({
                    id: editingCategory.id,
                    categoryData: formData
                });
                showToast('Category updated successfully', 'success');
            } else {
                await createMutation.mutateAsync(formData);
                showToast('Category created successfully', 'success');
            }
            setShowModal(false);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to save category', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this category? This action cannot be undone if tools are assigned to it.')) return;
        try {
            await deleteMutation.mutateAsync(id);
            showToast('Category deleted successfully', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to delete category', 'error');
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">Tool Categories</h1>
                    <p className="text-muted-foreground">Manage API tool categories and organization</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:scale-105 transition-transform"
                >
                    <Plus className="w-5 h-5" />
                    New Category
                </button>
            </div>

            {/* Content */}
            <div className="flex gap-8">
                {/* List Section */}
                <div className="flex-1 space-y-6">
                    {/* Search */}
                    <div className="glass-card rounded-2xl p-4 border border-white/10 flex items-center gap-4">
                        <Search className="w-5 h-5 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none focus:outline-none text-foreground w-full py-2"
                        />
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredCategories.map((category) => (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card p-4 rounded-xl border border-white/10 flex items-center justify-between group hover:border-primary/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-lg`}>
                                            <Wrench className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground">{category.label}</h3>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className="font-mono bg-secondary px-1.5 py-0.5 rounded">{category.name}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Palette className="w-3 h-3" />
                                                    {category._count?.tools || 0} tools
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className={`text-xs px-2 py-1 rounded-full font-bold ${category.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                            {category.isActive ? 'Active' : 'Inactive'}
                                        </div>
                                        <button
                                            onClick={() => handleOpenModal(category)}
                                            className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-primary"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-muted-foreground hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                            {filteredCategories.length === 0 && (
                                <div className="text-center py-20 text-muted-foreground">
                                    No categories found.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card rounded-3xl border-2 border-white/20 max-w-lg w-full overflow-hidden"
                        >
                            <form onSubmit={handleSubmit} className="flex flex-col max-h-[85vh]">
                                <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                                    <h2 className="text-2xl font-bold text-foreground">
                                        {editingCategory ? 'Edit Category' : 'New Category'}
                                    </h2>
                                    <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Display Label</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.label}
                                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                            placeholder="e.g. Utility Tools"
                                            className="w-full px-4 py-3 bg-secondary border border-white/10 rounded-xl text-foreground focus:outline-none focus:border-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Unique Name (ID)</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. utility-tools"
                                            className="w-full px-4 py-3 bg-secondary border border-white/10 rounded-xl text-foreground focus:outline-none focus:border-primary"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">Used for URL and filtering. Must be unique.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Color Theme</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {gradients.map((grad) => (
                                                <button
                                                    key={grad}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, gradient: grad })}
                                                    className={`h-10 rounded-lg bg-gradient-to-br ${grad} border-2 transition-all ${formData.gradient === grad ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-2">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-foreground mb-2">Order Priority</label>
                                            <input
                                                type="number"
                                                value={formData.order}
                                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                                className="w-full px-4 py-3 bg-secondary border border-white/10 rounded-xl text-foreground focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div className="flex items-center pt-8">
                                            <label className="flex items-center gap-3 cursor-pointer">
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
                                                <span className="font-medium text-foreground">Active</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-white/10 shrink-0 bg-background/50 backdrop-blur-sm">
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-[1.02] transition-transform"
                                    >
                                        {editingCategory ? 'Update Category' : 'Create Category'}
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

export default AdminToolCategories;
