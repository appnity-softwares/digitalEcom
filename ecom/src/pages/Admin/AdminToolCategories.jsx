import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Loader,
    Save,
    Folder,
    Check
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminToolCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const { showToast } = useToast();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        label: '',
        icon: 'Folder',
        gradient: 'from-blue-500 to-indigo-500',
        isActive: true
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await api.get('/tool-categories');
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            showToast('Failed to load categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            if (editingCategory) {
                await api.put(`/tool-categories/${editingCategory.id}`, formData);
                showToast('Category updated successfully', 'success');
            } else {
                await api.post('/tool-categories', formData);
                showToast('Category created successfully', 'success');
            }
            // Refresh first, then close
            await fetchCategories();
            closeModal();
        } catch (error) {
            console.error('Submit error:', error);
            const msg = error.response?.data?.message || 'Operation failed';
            showToast(msg, 'error');
            // Keep modal open on error so user can fix
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await api.delete(`/tool-categories/${id}`);
            showToast('Category deleted successfully', 'success');
            fetchCategories();
        } catch (error) {
            showToast('Failed to delete category', 'error');
        }
    };

    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                label: category.label,
                icon: category.icon,
                gradient: category.gradient,
                isActive: category.isActive
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                label: '',
                icon: 'Folder',
                gradient: 'from-blue-500 to-indigo-500',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Tool Categories</h1>
                    <p className="text-muted-foreground mt-1">Manage categories for API tools</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-foreground"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCategories.map((cat) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-6 rounded-2xl group hover:border-primary/50 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-white shadow-lg`}>
                                    <Folder className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openModal(cat)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-foreground mb-1">{cat.label}</h3>
                            <p className="text-sm text-muted-foreground mb-4">Slug: {cat.name}</p>

                            <div className="flex items-center justify-between text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${cat.isActive
                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                    }`}>
                                    {cat.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <span className="text-muted-foreground">
                                    {cat._count?.tools || 0} Tools
                                </span>
                            </div>
                        </motion.div>
                    ))}

                    {filteredCategories.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No categories found matching your search.
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-lg bg-background border border-white/10 rounded-2xl shadow-xl overflow-hidden"
                        >
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-foreground">
                                        {editingCategory ? 'Edit Category' : 'New Category'}
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                                            Label (Display Name)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.label}
                                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                            className="w-full px-4 py-2 bg-secondary/50 border border-white/10 rounded-lg focus:outline-none focus:border-primary text-foreground"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                                            Name (Unique Slug)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2 bg-secondary/50 border border-white/10 rounded-lg focus:outline-none focus:border-primary text-foreground"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                                            Gradient Class (Tailwind)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.gradient}
                                            onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                                            className="w-full px-4 py-2 bg-secondary/50 border border-white/10 rounded-lg focus:outline-none focus:border-primary text-foreground"
                                            placeholder="from-blue-500 to-indigo-500"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="rounded border-white/10 bg-secondary/50 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="isActive" className="text-sm font-medium text-foreground">
                                            Active
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Save Category
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminToolCategories;
