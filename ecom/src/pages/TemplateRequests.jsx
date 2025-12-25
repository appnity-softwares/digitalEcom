import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    Lightbulb, ThumbsUp, Plus, Filter, Search, Clock, CheckCircle,
    XCircle, Loader, ChevronDown, ArrowUp
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const TemplateRequests = () => {
    const { user } = useContext(AuthContext);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('votes');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        techStack: ''
    });

    // Fetch requests
    const { data, isLoading, error } = useQuery({
        queryKey: ['templateRequests', filter, sort],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filter !== 'all') params.append('status', filter);
            params.append('sort', sort);
            const res = await api.get(`/template-requests?${params}`);
            return res.data;
        }
    });

    // Create request mutation
    const createMutation = useMutation({
        mutationFn: (data) => api.post('/template-requests', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['templateRequests']);
            showToast('Request submitted!', 'success');
            setShowForm(false);
            setFormData({ title: '', description: '', category: '', techStack: '' });
        },
        onError: (err) => showToast(err.response?.data?.message || 'Failed to submit', 'error')
    });

    // Vote mutation
    const voteMutation = useMutation({
        mutationFn: (id) => api.post(`/template-requests/${id}/vote`),
        onSuccess: () => queryClient.invalidateQueries(['templateRequests']),
        onError: (err) => showToast(err.response?.data?.message || 'Failed to vote', 'error')
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!user) {
            showToast('Please login to submit a request', 'info');
            return;
        }
        createMutation.mutate({
            ...formData,
            techStack: formData.techStack.split(',').map(s => s.trim()).filter(Boolean)
        });
    };

    const handleVote = (id) => {
        if (!user) {
            showToast('Please login to vote', 'info');
            return;
        }
        voteMutation.mutate(id);
    };

    const statusColors = {
        PENDING: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        APPROVED: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        IN_PROGRESS: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
        COMPLETED: 'bg-green-500/10 text-green-600 border-green-500/20',
        REJECTED: 'bg-red-500/10 text-red-600 border-red-500/20'
    };

    const statusIcons = {
        PENDING: Clock,
        APPROVED: CheckCircle,
        IN_PROGRESS: Loader,
        COMPLETED: CheckCircle,
        REJECTED: XCircle
    };

    return (
        <div className="min-h-screen bg-background pt-28 pb-20">
            <div className="container max-w-4xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary/10 border border-primary/20">
                        <Lightbulb className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                            Community Ideas
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Template Requests
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Request templates you'd love to see. Vote on ideas from other users.
                        We build the most popular ones!
                    </p>
                </motion.div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div className="flex gap-2 bg-secondary/30 p-1 rounded-lg border border-border/50">
                        {['all', 'pending', 'approved', 'in_progress', 'completed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === status
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                    }`}
                            >
                                {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" />
                        New Request
                    </button>
                </div>

                {/* Submit Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleSubmit}
                            className="glass-card mb-8 overflow-hidden rounded-xl border border-border/50 p-6"
                        >
                            <h3 className="text-lg font-bold text-foreground mb-4">
                                Submit a Request
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g., AI SaaS Dashboard Template"
                                        className="w-full bg-secondary/50 border border-border/50 text-foreground px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                                        Description *
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the template you'd like to see..."
                                        rows={4}
                                        className="w-full bg-secondary/50 border border-border/50 text-foreground px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        required
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                                            Category
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-secondary/50 border border-border/50 text-foreground px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        >
                                            <option value="">Select category</option>
                                            <option value="SaaS">SaaS</option>
                                            <option value="E-commerce">E-commerce</option>
                                            <option value="Dashboard">Dashboard</option>
                                            <option value="Landing Page">Landing Page</option>
                                            <option value="Portfolio">Portfolio</option>
                                            <option value="Mobile App">Mobile App</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                                            Tech Stack (comma separated)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.techStack}
                                            onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                                            placeholder="React, Node.js, MongoDB"
                                            className="w-full bg-secondary/50 border border-border/50 text-foreground px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                        disabled={createMutation.isPending}
                                    >
                                        {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-6 py-2.5 rounded-lg font-medium text-muted-foreground hover:bg-secondary transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Requests List */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <Loader className="w-8 h-8 animate-spin mx-auto text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Failed to load requests
                    </div>
                ) : data?.requests?.length === 0 ? (
                    <div className="text-center py-12">
                        <Lightbulb className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground">No requests yet. Be the first!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {data?.requests?.map((request, index) => {
                            const StatusIcon = statusIcons[request.status] || Clock;
                            const hasVoted = request.voters?.includes(user?.id);

                            return (
                                <motion.div
                                    key={request.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass-card p-6 rounded-xl border border-white/5 bg-card/50 flex gap-6 group hover:border-primary/20 transition-colors"
                                >
                                    {/* Vote Button */}
                                    <button
                                        onClick={() => handleVote(request.id)}
                                        disabled={voteMutation.isPending}
                                        className={`flex flex-col items-center justify-center w-16 h-20 rounded-xl transition-all border ${hasVoted
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-secondary/50 text-muted-foreground border-transparent hover:border-primary/50 hover:text-primary'
                                            }`}
                                    >
                                        <ArrowUp className="w-5 h-5 mb-1" />
                                        <span className="font-bold text-lg">{request.votes}</span>
                                    </button>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h3 className="text-lg font-bold text-foreground truncate pr-4">
                                                {request.title}
                                            </h3>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${statusColors[request.status]}`}>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {request.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                                            {request.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            {request.category && (
                                                <span className="px-2.5 py-1 bg-secondary rounded-md font-medium text-foreground">
                                                    {request.category}
                                                </span>
                                            )}
                                            {request.techStack?.length > 0 && (
                                                <div className="flex gap-2">
                                                    {request.techStack.map(stack => (
                                                        <span key={stack} className="px-2 py-1 bg-secondary/50 rounded-md">
                                                            {stack}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <span className="ml-auto flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                                                by {request.user?.name || 'Anonymous'}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TemplateRequests;
