import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { useDocs, useDeleteDoc } from '../../hooks/useQueries';
import { useToast } from '../../context/ToastContext';

const AdminBlogs = () => {
    const { showToast } = useToast();
    const { data: blogData, isLoading } = useDocs({ limit: 100 });
    const deleteDocMutation = useDeleteDoc();

    const blogs = blogData?.docs || [];

    const handleDelete = async (id) => {
        if (!confirm('Delete this blog post?')) return;
        deleteDocMutation.mutate(id, {
            onSuccess: () => showToast('Blog deleted successfully', 'success'),
            onError: () => showToast('Failed to delete blog', 'error')
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex items-center justify-between"
            >
                <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                        Blog Posts
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your blog content
                    </p>
                </div>
                <Link
                    to="/admin/blog/new"
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Write Post
                </Link>
            </motion.div>

            {/* Blog List */}
            {blogs.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-12 border border-white/10 text-center"
                >
                    <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No blog posts yet</h3>
                    <p className="text-muted-foreground mb-6">Start creating content for your audience</p>
                    <Link
                        to="/admin/blog/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Write First Post
                    </Link>
                </motion.div>
            ) : (
                <div className="grid gap-4">
                    {blogs.map((blog, index) => (
                        <motion.div
                            key={blog.id || blog._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-card rounded-2xl p-6 border border-white/10 hover:border-primary/50 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <img
                                    src={blog.thumbnail || 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=100'}
                                    alt={blog.title}
                                    className="w-20 h-20 rounded-xl object-cover"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-semibold text-foreground">{blog.title}</h3>
                                        {blog.is_developers_choice && (
                                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-lg">
                                                Dev's Choice
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {blog.category} • {blog.difficulty}
                                    </p>
                                </div>
                                {blog.requires_subscription && (
                                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-lg">
                                        Pro
                                    </span>
                                )}
                                <div className="flex gap-2">
                                    <Link
                                        to={`/admin/blog/${blog.id || blog._id}/edit`}
                                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                    >
                                        <Edit className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(blog.id || blog._id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 disabled:opacity-50 transition-colors"
                                        disabled={deleteDocMutation.isPending}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminBlogs;
