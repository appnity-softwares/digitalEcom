import {
    useDashboardStats,
    useAllOrders,
    useAllUsers,
    useProducts,
    useDocs,
    useDeleteProduct,
    useDeleteDoc
} from '../../hooks/useQueries';

const AdminPanel = () => {
    const { user } = useContext(AuthContext);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');

    const { data: stats = {}, isLoading: statsLoading } = useDashboardStats();
    const { data: allOrders = [], isLoading: ordersLoading } = useAllOrders();
    const { data: allUsers = [], isLoading: usersLoading } = useAllUsers();

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/login');
            return;
        }
    }, [user, navigate]);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'products', label: 'Templates', icon: Package },
        { id: 'blogs', label: 'Blog Posts', icon: FileText },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const quickActions = [
        { label: 'Add Template', icon: Package, path: '/admin/product/new/edit', color: 'bg-blue-100 text-blue-600' },
        { label: 'Write Blog', icon: FileText, path: '/admin/blog/new', color: 'bg-purple-100 text-purple-600' },
        { label: 'View Orders', icon: ShoppingCart, path: '/admin/dashboard?tab=orders', color: 'bg-green-100 text-green-600' },
        { label: 'Manage Users', icon: Users, path: '/admin/dashboard?tab=users', color: 'bg-orange-100 text-orange-600' },
    ];

    const statCards = [
        { label: 'Total Revenue', value: `$${stats.totalRevenue?.toLocaleString() || 0}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Total Orders', value: stats.totalOrders || 0, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Products', value: stats.totalProducts || 0, icon: Package, color: 'text-orange-600', bg: 'bg-orange-100' },
        { label: 'Blog Posts', value: stats.totalBlogs || 0, icon: FileText, color: 'text-cyan-600', bg: 'bg-cyan-100' },
        { label: 'Subscriptions', value: stats.activeSubscriptions || 0, icon: Crown, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    ];

    const loading = statsLoading || ordersLoading || usersLoading;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] pt-20">
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 h-[calc(100vh-5rem)] sticky top-20 border-r border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4">
                    <div className="mb-6">
                        <h2 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">
                            Admin Panel
                        </h2>
                        <nav className="space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-[var(--accent-primary)] text-white'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                                        }`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Quick Actions */}
                    <div className="pt-6 border-t border-[var(--border-primary)]">
                        <h3 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
                            Quick Actions
                        </h3>
                        <div className="space-y-2">
                            {quickActions.map(action => (
                                <Link
                                    key={action.label}
                                    to={action.path}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                                >
                                    <span className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                                        <action.icon className="w-4 h-4" />
                                    </span>
                                    {action.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    {activeTab === 'overview' && (
                        <OverviewTab
                            stats={statCards}
                            recentOrders={allOrders.slice(0, 5)}
                            recentUsers={allUsers.slice(0, 5)}
                        />
                    )}
                    {activeTab === 'products' && <ProductsTab />}
                    {activeTab === 'blogs' && <BlogsTab />}
                    {activeTab === 'users' && <UsersTab />}
                    {activeTab === 'orders' && <OrdersTab />}
                    {activeTab === 'settings' && <SettingsTab />}
                </main>
            </div>
        </div>
    );
};

// Overview Tab
const OverviewTab = ({ stats, recentOrders, recentUsers }) => {
    const queryClient = useQueryClient();
    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['admin'] });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard Overview</h1>
                    <p className="text-[var(--text-secondary)]">Welcome back! Here's what's happening.</p>
                </div>
                <button onClick={handleRefresh} className="btn-secondary flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Refresh Data
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="card"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                                <p className="text-sm text-[var(--text-tertiary)]">{stat.label}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-[var(--text-primary)]">Recent Orders</h3>
                        <Link to="/admin/dashboard?tab=orders" className="text-sm text-[var(--accent-primary)]">
                            View All
                        </Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <p className="text-[var(--text-tertiary)] text-center py-8">No orders yet</p>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map(order => (
                                <div key={order.id || order._id} className="flex items-center justify-between py-2 border-b border-[var(--border-secondary)] last:border-0">
                                    <div>
                                        <p className="font-medium text-[var(--text-primary)]">{order.user?.name || 'Customer'}</p>
                                        <p className="text-xs text-[var(--text-tertiary)]">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className="font-semibold text-green-600">${order.totalPrice || order.total}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Users */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-[var(--text-primary)]">New Users</h3>
                        <Link to="/admin/dashboard?tab=users" className="text-sm text-[var(--accent-primary)]">
                            View All
                        </Link>
                    </div>
                    {recentUsers.length === 0 ? (
                        <p className="text-[var(--text-tertiary)] text-center py-8">No users yet</p>
                    ) : (
                        <div className="space-y-3">
                            {recentUsers.map(u => (
                                <div key={u.id || u._id} className="flex items-center gap-3 py-2 border-b border-[var(--border-secondary)] last:border-0">
                                    <div className="w-10 h-10 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center text-[var(--accent-primary)] font-bold">
                                        {u.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-[var(--text-primary)]">{u.name}</p>
                                        <p className="text-xs text-[var(--text-tertiary)]">{u.email}</p>
                                    </div>
                                    {u.role === 'ADMIN' && (
                                        <span className="pill bg-purple-100 text-purple-600 text-xs">Admin</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Products Tab
const ProductsTab = () => {
    const { showToast } = useToast();
    const { data: productsData, isLoading } = useProducts({ limit: 100 });
    const deleteProductMutation = useDeleteProduct();

    const products = productsData?.products || [];

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return;
        deleteProductMutation.mutate(id, {
            onSuccess: () => showToast('Product deleted', 'success'),
            onError: () => showToast('Failed to delete', 'error')
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Templates</h1>
                <Link to="/admin/product/new/edit" className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Template
                </Link>
            </div>

            {isLoading ? (
                <div className="text-center py-12">Loading...</div>
            ) : products.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto text-[var(--text-tertiary)] mb-4" />
                    <p className="text-[var(--text-secondary)]">No products yet</p>
                    <Link to="/admin/product/new/edit" className="btn-primary mt-4 inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add First Template
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {products.map(product => (
                        <div key={product.id || product._id} className="card flex items-center gap-4">
                            <img
                                src={product.image || '/placeholder.png'}
                                alt={product.title}
                                className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                                <h3 className="font-semibold text-[var(--text-primary)]">{product.title}</h3>
                                <p className="text-sm text-[var(--text-tertiary)]">{product.category}</p>
                            </div>
                            <span className="font-bold text-[var(--text-primary)]">${product.price}</span>
                            <div className="flex gap-2">
                                <Link to={`/admin/product/${product.id || product._id}/edit`} className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg">
                                    <Edit className="w-4 h-4 text-[var(--text-secondary)]" />
                                </Link>
                                <button
                                    onClick={() => handleDelete(product.id || product._id)}
                                    className="p-2 hover:bg-red-50 rounded-lg text-red-500 disabled:opacity-50"
                                    disabled={deleteProductMutation.isPending}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Blogs Tab
const BlogsTab = () => {
    const { showToast } = useToast();
    const { data: blogData, isLoading } = useDocs({ limit: 100 });
    const deleteDocMutation = useDeleteDoc();

    const blogs = blogData?.docs || [];

    const handleDelete = async (id) => {
        if (!confirm('Delete this blog post?')) return;
        deleteDocMutation.mutate(id, {
            onSuccess: () => showToast('Blog deleted', 'success'),
            onError: () => showToast('Failed to delete', 'error')
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Blog Posts</h1>
                <Link to="/admin/blog/new" className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Write Post
                </Link>
            </div>

            {isLoading ? (
                <div className="text-center py-12">Loading...</div>
            ) : blogs.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto text-[var(--text-tertiary)] mb-4" />
                    <p className="text-[var(--text-secondary)]">No blog posts yet</p>
                    <Link to="/admin/blog/new" className="btn-primary mt-4 inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Write First Post
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {blogs.map(blog => (
                        <div key={blog.id || blog._id} className="card flex items-center gap-4">
                            <img
                                src={blog.thumbnail || 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=100'}
                                alt={blog.title}
                                className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-[var(--text-primary)]">{blog.title}</h3>
                                    {blog.is_developers_choice && (
                                        <span className="pill bg-yellow-100 text-yellow-700 text-xs">Dev's Choice</span>
                                    )}
                                </div>
                                <p className="text-sm text-[var(--text-tertiary)]">{blog.category} • {blog.difficulty}</p>
                            </div>
                            {blog.requires_subscription && (
                                <span className="pill bg-purple-100 text-purple-600 text-xs">Pro</span>
                            )}
                            <div className="flex gap-2">
                                <Link to={`/admin/blog/${blog.id || blog._id}/edit`} className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg">
                                    <Edit className="w-4 h-4 text-[var(--text-secondary)]" />
                                </Link>
                                <button
                                    onClick={() => handleDelete(blog.id || blog._id)}
                                    className="p-2 hover:bg-red-50 rounded-lg text-red-500 disabled:opacity-50"
                                    disabled={deleteDocMutation.isPending}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Placeholder Tabs
const UsersTab = () => (
    <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Users Management</h1>
        <p className="text-[var(--text-secondary)]">User management coming soon...</p>
    </div>
);

const OrdersTab = () => (
    <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Orders</h1>
        <p className="text-[var(--text-secondary)]">Orders list coming soon...</p>
    </div>
);

const SettingsTab = () => (
    <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>
        <p className="text-[var(--text-secondary)]">Settings coming soon...</p>
    </div>
);

export default AdminPanel;
