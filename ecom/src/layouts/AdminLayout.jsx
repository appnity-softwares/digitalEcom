import React, { useContext, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Users, FileText, CreditCard,
    LogOut, Menu, X, Settings
} from 'lucide-react';
import AuthContext from '../context/AuthContext';
import AdminLoginModal from '../components/auth/AdminLoginModal';

const AdminLayout = () => {
    const { user, logout, loading } = useContext(AuthContext);
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    // Show login modal if not authenticated or not admin
    if (!user || user.role !== 'ADMIN') {
        return (
            <AdminLoginModal
                isOpen={true}
                onClose={null} // Don't allow closing - must login
                onSuccess={() => {
                    // Modal validates admin role before calling this
                    // Component will re-render with updated user context
                }}
            />
        );
    }

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/templates', icon: FileText, label: 'Templates' },
        { path: '/admin/blogs', icon: FileText, label: 'Blogs' },
        { path: '/admin/orders', icon: CreditCard, label: 'Orders' },
        { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
    ];

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 280 : 80 }}
                className="glass-card border-r border-white/10 flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    {sidebarOpen && (
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"
                        >
                            Admin Panel
                        </motion.h1>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                                    }`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && (
                                    <span className="font-medium">{item.label}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-white/10">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/50 ${!sidebarOpen && 'justify-center'}`}>
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-8 h-8 rounded-full"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-muted-foreground">Admin</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={logout}
                        className={`w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all ${!sidebarOpen && 'justify-center'}`}
                    >
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
