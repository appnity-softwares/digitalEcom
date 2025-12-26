import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Users, FileText, CreditCard, TrendingUp,
    UserPlus, Star, DollarSign, Activity,
    Package, ShoppingCart, RefreshCw
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useDashboardStats, useAllOrders, useAllUsers } from '../../hooks/useQueries';

const AdminDashboard = () => {
    const queryClient = useQueryClient();
    const { data: stats = {}, isLoading: statsLoading } = useDashboardStats();
    const { data: allOrders = [], isLoading: ordersLoading } = useAllOrders();
    const { data: allUsers = [], isLoading: usersLoading } = useAllUsers();

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['admin'] });
    };

    const statCards = [
        {
            title: 'Total Revenue',
            value: `$${stats.totalRevenue?.toLocaleString() || 0}`,
            icon: DollarSign,
            gradient: 'from-green-500 to-emerald-500',
            link: '/admin/users'
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders || 0,
            icon: ShoppingCart,
            gradient: 'from-blue-500 to-cyan-500',
            link: '/admin/users'
        },
        {
            title: 'Total Users',
            value: stats.totalUsers || 0,
            icon: Users,
            gradient: 'from-purple-500 to-pink-500',
            link: '/admin/users'
        },
        {
            title: 'Products',
            value: stats.totalProducts || 0,
            icon: Package,
            gradient: 'from-orange-500 to-red-500',
            link: '/admin/templates'
        },
        {
            title: 'Blog Posts',
            value: stats.totalBlogs || 0,
            icon: FileText,
            gradient: 'from-cyan-500 to-blue-500',
            link: '/admin/templates'
        },
        {
            title: 'Active Subscriptions',
            value: stats.activeSubscriptions || 0,
            icon: Star,
            gradient: 'from-yellow-500 to-orange-500',
            link: '/admin/users?filter=subscribed'
        }
    ];

    const loading = statsLoading || ordersLoading || usersLoading;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const recentOrders = allOrders.slice(0, 5);
    const recentUsers = allUsers.slice(0, 5);

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
                        Dashboard Overview
                    </h1>
                    <p className="text-muted-foreground">
                        Welcome back! Here's what's happening.
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-xl transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Data
                </button>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                to={card.link}
                                className="block glass-card rounded-2xl p-6 border border-white/10 hover:border-primary/50 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                </div>
                                <h3 className="text-3xl font-bold text-foreground mb-1">
                                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                                </h3>
                                <p className="text-sm text-muted-foreground">{card.title}</p>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Recent Orders */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card rounded-2xl p-6 border border-white/10"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-foreground">Recent Orders</h3>
                        <Link to="/admin/users" className="text-sm text-primary hover:underline">
                            View All
                        </Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No orders yet</p>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map(order => (
                                <div key={order.id || order._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <div>
                                        <p className="font-medium text-foreground">{order.user?.name || 'Customer'}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className="font-semibold text-green-500">${order.totalPrice || order.total}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Recent Users */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card rounded-2xl p-6 border border-white/10"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-foreground">New Users</h3>
                        <Link to="/admin/users" className="text-sm text-primary hover:underline">
                            View All
                        </Link>
                    </div>
                    {recentUsers.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No users yet</p>
                    ) : (
                        <div className="space-y-3">
                            {recentUsers.map(u => (
                                <div key={u.id || u._id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                        {u.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-foreground">{u.name}</p>
                                        <p className="text-xs text-muted-foreground">{u.email}</p>
                                    </div>
                                    {u.role === 'ADMIN' && (
                                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-lg">Admin</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card rounded-2xl p-6 border border-white/10"
            >
                <h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Link
                        to="/admin/users"
                        className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-all group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Manage Users</h3>
                            <p className="text-xs text-muted-foreground">View and edit users</p>
                        </div>
                    </Link>

                    <Link
                        to="/admin/templates"
                        className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-all group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Manage Templates</h3>
                            <p className="text-xs text-muted-foreground">Add or edit templates</p>
                        </div>
                    </Link>

                    <Link
                        to="/admin/payments"
                        className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-all group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CreditCard className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">View Payments</h3>
                            <p className="text-xs text-muted-foreground">Payment gateway info</p>
                        </div>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
