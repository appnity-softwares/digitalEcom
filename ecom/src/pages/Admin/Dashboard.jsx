import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    FileText,
    Wrench,
    TrendingUp,
    DollarSign,
    Eye,
    BarChart3,
    Plus,
    Edit,
    Trash2,
    Search,
    Filter,
    Download,
    RefreshCw,
    Crown,
    Shield,
    Mail,
    PieChart
} from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import DashboardCharts from '../../components/admin/DashboardCharts';

import {
    useProducts,
    useAllOrders,
    useDocs,
    useSaasTools,
    useAllUsers,
    useUserStats,
    useDeleteProduct,
    useDeleteDoc,
    useDeleteSaasTool,
    useUpdateUserRole,
    useUpdateUserSubscription,
    useDeleteUser
} from '../../hooks/useQueries';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);

    // React Query hooks
    const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 100 });
    const { data: orders = [], isLoading: ordersLoading } = useAllOrders();
    const { data: docsData, isLoading: docsLoading } = useDocs({ limit: 100 });
    const { data: tools = [], isLoading: toolsLoading } = useSaasTools();
    const { data: allUsers = [], isLoading: usersLoading } = useAllUsers();
    const { data: userStats = {}, isLoading: userStatsLoading } = useUserStats();

    const products = productsData?.products || [];
    const docs = docsData?.docs || [];

    // Mutations
    const deleteProductMutation = useDeleteProduct();
    const deleteDocMutation = useDeleteDoc();
    const deleteToolMutation = useDeleteSaasTool();
    const updateUserRoleMutation = useUpdateUserRole();
    const updateUserSubscriptionMutation = useUpdateUserSubscription();
    const deleteUserMutation = useDeleteUser();

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/login');
        }
    }, [user, navigate]);

    // Derived stats
    const stats = React.useMemo(() => {
        const paidOrders = orders.filter(o => o.isPaid);
        const revenue = paidOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        return {
            totalRevenue: revenue,
            totalOrders: orders.length,
            totalUsers: allUsers.length,
            totalProducts: products.length
        };
    }, [orders, allUsers, products]);

    const deleteProduct = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        deleteProductMutation.mutate(id, {
            onSuccess: () => showToast('Product deleted', 'success'),
            onError: () => showToast('Failed to delete product', 'error')
        });
    };

    const deleteDoc = async (id) => {
        if (!confirm('Are you sure you want to delete this doc?')) return;
        deleteDocMutation.mutate(id, {
            onSuccess: () => showToast('Document deleted', 'success'),
            onError: () => showToast('Failed to delete document', 'error')
        });
    };

    const deleteTool = async (id) => {
        if (!confirm('Are you sure you want to delete this tool?')) return;
        deleteToolMutation.mutate(id, {
            onSuccess: () => showToast('Tool deleted', 'success'),
            onError: () => showToast('Failed to delete tool', 'error')
        });
    };

    const updateUserRole = async (userId, role) => {
        updateUserRoleMutation.mutate({ userId, role }, {
            onSuccess: () => {
                showToast(`User role updated to ${role}`, 'success');
                setEditingUser(null);
            },
            onError: (error) => showToast(error.response?.data?.message || 'Failed to update role', 'error')
        });
    };

    const updateUserSubscription = async (userId, planName) => {
        updateUserSubscriptionMutation.mutate({ userId, planName }, {
            onSuccess: () => showToast(`Subscription updated to ${planName}`, 'success'),
            onError: () => showToast('Failed to update subscription', 'error')
        });
    };

    const deleteUser = async (id) => {
        if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
        deleteUserMutation.mutate(id, {
            onSuccess: () => showToast('User deleted', 'success'),
            onError: (error) => showToast(error.response?.data?.message || 'Failed to delete user', 'error')
        });
    };

    const loading = productsLoading || ordersLoading || docsLoading || toolsLoading || usersLoading || userStatsLoading;

    if (!user || user.role !== 'ADMIN') return null;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analytics', icon: PieChart },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'docs', label: 'Documentation', icon: FileText },
        { id: 'tools', label: 'SaaS Tools', icon: Wrench },
    ];

    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-400 text-sm mb-1">{title}</p>
                    <p className="text-3xl font-bold">{value}</p>
                    {trend && (
                        <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {trend > 0 ? '+' : ''}{trend}% from last month
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    const filteredProducts = products.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0055FF] text-white">
            <div className="flex">
                {/* Sidebar */}
                <div className="w-64 min-h-screen bg-gray-800/30 border-r border-gray-700 p-6">
                    <div className="mb-8">
                        <h1 className="text-xl font-bold bg-[#0055FF] ">
                            Admin Panel
                        </h1>
                        <p className="text-gray-500 text-sm">CodeStudio</p>
                    </div>

                    <nav className="space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-8 pt-8 border-t border-gray-700">
                        <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors">
                            ← Back to Site
                        </Link>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
                        </div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <div className="space-y-8">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
                                        <button
                                            onClick={fetchData}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Refresh
                                        </button>
                                    </div>

                                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <StatCard
                                            title="Total Revenue"
                                            value={`$${stats.totalRevenue.toFixed(2)}`}
                                            icon={DollarSign}
                                            color="bg-green-500"
                                            trend={12}
                                        />
                                        <StatCard
                                            title="Total Orders"
                                            value={orders.length}
                                            icon={ShoppingCart}
                                            color="bg-blue-500"
                                            trend={8}
                                        />
                                        <StatCard
                                            title="Products"
                                            value={products.length}
                                            icon={Package}
                                            color="bg-purple-500"
                                        />
                                        <StatCard
                                            title="Documentation"
                                            value={docs.length}
                                            icon={FileText}
                                            color="bg-amber-500"
                                        />
                                    </div>

                                    {/* Recent Orders */}
                                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                                        <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
                                        {orders.length === 0 ? (
                                            <p className="text-gray-400">No orders yet</p>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                                                            <th className="pb-3">Order ID</th>
                                                            <th className="pb-3">Date</th>
                                                            <th className="pb-3">Status</th>
                                                            <th className="pb-3">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {orders.slice(0, 5).map((order) => (
                                                            <tr key={order.id} className="border-b border-gray-700/50">
                                                                <td className="py-3 font-mono text-sm">{order.id?.substring(0, 8)}</td>
                                                                <td className="py-3 text-gray-400">
                                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                                </td>
                                                                <td className="py-3">
                                                                    <span className={`px-2 py-1 rounded-full text-xs ${order.isPaid
                                                                        ? 'bg-green-500/20 text-green-400'
                                                                        : 'bg-yellow-500/20 text-yellow-400'
                                                                        }`}>
                                                                        {order.isPaid ? 'Paid' : 'Pending'}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 font-semibold">${order.totalPrice}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Analytics Tab */}
                            {activeTab === 'analytics' && (
                                <DashboardCharts />
                            )}

                            {/* Products Tab */}
                            {activeTab === 'products' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold">Products</h2>
                                        <Link
                                            to="/admin/product/new/edit"
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Product
                                        </Link>
                                    </div>

                                    {/* Search */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    {/* Products Table */}
                                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-800">
                                                <tr className="text-left text-gray-400 text-sm">
                                                    <th className="px-6 py-4">Product</th>
                                                    <th className="px-6 py-4">Category</th>
                                                    <th className="px-6 py-4">Price</th>
                                                    <th className="px-6 py-4">Sales</th>
                                                    <th className="px-6 py-4">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredProducts.map((product) => (
                                                    <tr key={product.id} className="border-t border-gray-700 hover:bg-gray-700/30">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={product.image}
                                                                    alt={product.title}
                                                                    className="w-12 h-12 rounded-lg object-cover"
                                                                />
                                                                <div>
                                                                    <p className="font-semibold">{product.title}</p>
                                                                    <p className="text-gray-400 text-sm">{product.productType}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                                                                {product.category}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 font-semibold">${product.price}</td>
                                                        <td className="px-6 py-4 text-gray-400">{product.numSales || 0}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <Link
                                                                    to={`/admin/product/${product.id}/edit`}
                                                                    className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </Link>
                                                                <button
                                                                    onClick={() => deleteProduct(product.id)}
                                                                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Orders Tab */}
                            {activeTab === 'orders' && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold">Orders</h2>

                                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-800">
                                                <tr className="text-left text-gray-400 text-sm">
                                                    <th className="px-6 py-4">Order ID</th>
                                                    <th className="px-6 py-4">Date</th>
                                                    <th className="px-6 py-4">Items</th>
                                                    <th className="px-6 py-4">Total</th>
                                                    <th className="px-6 py-4">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map((order) => (
                                                    <tr key={order.id} className="border-t border-gray-700 hover:bg-gray-700/30">
                                                        <td className="px-6 py-4 font-mono text-sm">{order.id?.substring(0, 8)}</td>
                                                        <td className="px-6 py-4 text-gray-400">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4">{order.items?.length || 0} items</td>
                                                        <td className="px-6 py-4 font-semibold">${order.totalPrice}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-3 py-1 rounded-full text-sm ${order.isPaid
                                                                ? 'bg-green-500/20 text-green-400'
                                                                : 'bg-yellow-500/20 text-yellow-400'
                                                                }`}>
                                                                {order.orderStatus || (order.isPaid ? 'Completed' : 'Pending')}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Users Tab */}
                            {activeTab === 'users' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold">User Management</h2>
                                        <div className="flex gap-4 text-sm">
                                            <div className="px-4 py-2 bg-gray-800 rounded-lg">
                                                <span className="text-gray-400">Total:</span> {userStats.totalUsers || allUsers.length}
                                            </div>
                                            <div className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg">
                                                <Crown className="w-4 h-4 inline mr-1" />
                                                Pro: {userStats.activeSubscriptions || 0}
                                            </div>
                                            <div className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg">
                                                OAuth: {userStats.oauthUsers || 0}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Search */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    {/* Users Table */}
                                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-800">
                                                <tr className="text-left text-gray-400 text-sm">
                                                    <th className="px-6 py-4">User</th>
                                                    <th className="px-6 py-4">Role</th>
                                                    <th className="px-6 py-4">Subscription</th>
                                                    <th className="px-6 py-4">Auth</th>
                                                    <th className="px-6 py-4">Activity</th>
                                                    <th className="px-6 py-4">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allUsers
                                                    .filter(u =>
                                                        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
                                                    )
                                                    .map((u) => (
                                                        <tr key={u.id} className="border-t border-gray-700 hover:bg-gray-700/30">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-[#0055FF] rounded-full flex items-center justify-center text-sm font-bold">
                                                                        {u.avatar ? (
                                                                            <img src={u.avatar} className="w-full h-full rounded-full object-cover" />
                                                                        ) : (
                                                                            u.name?.[0]?.toUpperCase()
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold">{u.name}</p>
                                                                        <p className="text-gray-400 text-sm">{u.email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <select
                                                                    value={u.role}
                                                                    onChange={(e) => updateUserRole(u.id, e.target.value)}
                                                                    disabled={u.id === user.id}
                                                                    className={`px-3 py-1 rounded-lg text-sm font-semibold bg-transparent border cursor-pointer ${u.role === 'ADMIN'
                                                                        ? 'border-red-500 text-red-400'
                                                                        : 'border-gray-600 text-gray-300'
                                                                        } ${u.id === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                >
                                                                    <option value="USER" className="bg-gray-800">User</option>
                                                                    <option value="ADMIN" className="bg-gray-800">Admin</option>
                                                                </select>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <select
                                                                    value={u.subscription?.planName || 'FREE'}
                                                                    onChange={(e) => updateUserSubscription(u.id, e.target.value)}
                                                                    className={`px-3 py-1 rounded-lg text-sm font-semibold bg-transparent border cursor-pointer ${u.subscription?.planName === 'ENTERPRISE'
                                                                        ? 'border-amber-500 text-amber-400'
                                                                        : u.subscription?.planName === 'PRO'
                                                                            ? 'border-purple-500 text-purple-400'
                                                                            : 'border-gray-600 text-gray-400'
                                                                        }`}
                                                                >
                                                                    <option value="FREE" className="bg-gray-800">Free</option>
                                                                    <option value="PRO" className="bg-gray-800">Pro</option>
                                                                    <option value="ENTERPRISE" className="bg-gray-800">Enterprise</option>
                                                                </select>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex gap-2">
                                                                    {u.googleId && (
                                                                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Google</span>
                                                                    )}
                                                                    {u.githubId && (
                                                                        <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">GitHub</span>
                                                                    )}
                                                                    {!u.googleId && !u.githubId && (
                                                                        <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
                                                                            <Mail className="w-3 h-3 inline mr-1" />Email
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-400 text-sm">
                                                                <div>{u._count?.orders || 0} orders</div>
                                                                <div>{u._count?.apiKeys || 0} API keys</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <button
                                                                    onClick={() => deleteUser(u.id)}
                                                                    disabled={u.id === user.id}
                                                                    className={`p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors ${u.id === user.id ? 'opacity-30 cursor-not-allowed' : ''
                                                                        }`}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Documentation Tab */}
                            {activeTab === 'docs' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold">Documentation</h2>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                                            <Plus className="w-4 h-4" />
                                            Add Document
                                        </button>
                                    </div>

                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {docs.map((doc) => (
                                            <div key={doc.id} className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-semibold mb-1">{doc.title}</h3>
                                                        <p className="text-gray-400 text-sm">{doc.category}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs ${doc.isPublished
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-yellow-500/20 text-yellow-400'
                                                        }`}>
                                                        {doc.isPublished ? 'Published' : 'Draft'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                                                    <span><Eye className="w-4 h-4 inline mr-1" />{doc.views || 0}</span>
                                                    <span>${doc.price || 0}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteDoc(doc.id)}
                                                        className="px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SaaS Tools Tab */}
                            {activeTab === 'tools' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold">SaaS Tools</h2>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                                            <Plus className="w-4 h-4" />
                                            Add Tool
                                        </button>
                                    </div>

                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {tools.map((tool) => (
                                            <div key={tool.id} className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-semibold mb-1">{tool.name}</h3>
                                                        <p className="text-gray-400 text-sm">{tool.category}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs ${tool.isActive
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {tool.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                                                    <span>{tool.activeUsers || 0} users</span>
                                                    <span>{tool.avgResponseTimeMs || 0}ms</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteTool(tool.id)}
                                                        className="px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
