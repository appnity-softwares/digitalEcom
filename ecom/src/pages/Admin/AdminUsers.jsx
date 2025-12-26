import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Edit, Trash2, Shield, User,
    Mail, Calendar, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { getUsers, getUserById, updateUserRole, updateUserSubscription, deleteUser } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const AdminUsers = () => {
    const { showToast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, searchQuery, roleFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getUsers({
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery,
                role: roleFilter
            });
            setUsers(response.users);
            setPagination(response.pagination);
        } catch (err) {
            showToast('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewUser = async (userId) => {
        try {
            const response = await getUserById(userId);
            setSelectedUser(response.user);
            setShowUserModal(true);
        } catch (err) {
            showToast('Failed to load user details', 'error');
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            showToast('User role updated successfully', 'success');
            fetchUsers();
            if (selectedUser?.id === userId) {
                setSelectedUser({ ...selectedUser, role: newRole });
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update role', 'error');
        }
    };

    const handleUpdateSubscription = async (userId, planName, status) => {
        try {
            await updateUserSubscription(userId, { planName, status });
            showToast('Subscription updated successfully', 'success');
            fetchUsers();
        } catch (err) {
            showToast('Failed to update subscription', 'error');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }
        try {
            await deleteUser(userId);
            showToast('User deleted successfully', 'success');
            fetchUsers();
            setShowUserModal(false);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to delete user', 'error');
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-2">User Management</h1>
                <p className="text-muted-foreground">Manage users, roles, and subscriptions</p>
            </div>

            {/* Filters */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-secondary border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                        />
                    </div>

                    {/* Role Filter */}
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-3 bg-secondary border border-white/10 rounded-xl text-foreground focus:outline-none focus:border-primary"
                    >
                        <option value="">All Roles</option>
                        <option value="USER">Users</option>
                        <option value="ADMIN">Admins</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-20">
                        <User className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground">No users found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-secondary/50 border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">User</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Role</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Subscription</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Joined</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                                                            {user.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-foreground">{user.name}</p>
                                                        {(user.googleId || user.githubId) && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {user.googleId ? 'Google' : 'GitHub'}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN'
                                                        ? 'bg-purple-500/20 text-purple-500'
                                                        : 'bg-blue-500/20 text-blue-500'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.subscription ? (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.subscription.status === 'ACTIVE'
                                                            ? 'bg-green-500/20 text-green-500'
                                                            : 'bg-gray-500/20 text-gray-500'
                                                        }`}>
                                                        {user.subscription.planName}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">None</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewUser(user.id)}
                                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Edit className="w-4 h-4 text-blue-500" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                            <p className="text-sm text-muted-foreground">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    disabled={pagination.page === 1}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-sm text-foreground px-4">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    disabled={pagination.page === pagination.pages}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* User Detail Modal */}
            <AnimatePresence>
                {showUserModal && selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowUserModal(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card rounded-3xl border-2 border-white/20 max-w-2xl w-full max-h-[90vh] overflow-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <h2 className="text-2xl font-bold text-foreground">User Details</h2>
                                <button
                                    onClick={() => setShowUserModal(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* User Info */}
                                <div className="flex items-center gap-4">
                                    {selectedUser.avatar ? (
                                        <img src={selectedUser.avatar} alt={selectedUser.name} className="w-20 h-20 rounded-full" />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                                            {selectedUser.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">{selectedUser.name}</h3>
                                        <p className="text-muted-foreground">{selectedUser.email}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Joined {new Date(selectedUser.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Role Management */}
                                <div className="glass-card p-4 rounded-xl">
                                    <h4 className="font-semibold text-foreground mb-3">Role</h4>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdateRole(selectedUser.id, 'USER')}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedUser.role === 'USER'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                                                }`}
                                        >
                                            User
                                        </button>
                                        <button
                                            onClick={() => handleUpdateRole(selectedUser.id, 'ADMIN')}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedUser.role === 'ADMIN'
                                                    ? 'bg-purple-500 text-white'
                                                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                                                }`}
                                        >
                                            Admin
                                        </button>
                                    </div>
                                </div>

                                {/* Subscription Management */}
                                <div className="glass-card p-4 rounded-xl">
                                    <h4 className="font-semibold text-foreground mb-3">Subscription</h4>
                                    <div className="flex gap-2">
                                        {['FREE', 'PRO', 'ENTERPRISE'].map((plan) => (
                                            <button
                                                key={plan}
                                                onClick={() => handleUpdateSubscription(selectedUser.id, plan, 'ACTIVE')}
                                                className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedUser.subscription?.planName === plan
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                                                    }`}
                                            >
                                                {plan}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="glass-card p-4 rounded-xl">
                                        <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                                        <p className="text-2xl font-bold text-foreground">{selectedUser._count?.orders || 0}</p>
                                    </div>
                                    <div className="glass-card p-4 rounded-xl">
                                        <p className="text-sm text-muted-foreground mb-1">API Keys</p>
                                        <p className="text-2xl font-bold text-foreground">{selectedUser._count?.apiKeys || 0}</p>
                                    </div>
                                </div>

                                {/* Delete Button */}
                                <button
                                    onClick={() => handleDeleteUser(selectedUser.id)}
                                    className="w-full py-3 bg-red-500/20 text-red-500 rounded-xl font-semibold hover:bg-red-500/30 transition-all"
                                >
                                    Delete User
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminUsers;
