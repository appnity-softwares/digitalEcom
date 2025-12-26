import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import { Shield, X, AlertCircle } from 'lucide-react';

const AdminLoginModal = ({ isOpen, onClose, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, logout } = useContext(AuthContext);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await login(email, password);

            if (res.success) {
                // Check if the logged-in user has admin role
                if (res.user && res.user.role === 'ADMIN') {
                    // User is admin, call onSuccess
                    onSuccess();
                } else {
                    // User is not admin
                    setError('Access denied. This account does not have administrator privileges.');
                    // Logout the user since they can't access admin panel
                    setTimeout(() => {
                        logout();
                    }, 2000);
                }
            } else {
                setError(res.error || "Authentication failed");
            }
        } catch (err) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md p-4"
                onClick={(e) => e.target === e.currentTarget && onClose && onClose()}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="bg-card/95 backdrop-blur-xl border border-red-500/20 rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
                >
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] pointer-events-none" />

                    {/* Close Button - Only show if onClose is provided */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-white/5 rounded-lg z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    {/* Header */}
                    <div className="text-center mb-8 relative z-10">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center ring-2 ring-red-500/20">
                            <Shield className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                            Admin Access
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Enter your admin credentials to continue
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl mb-6 text-sm flex items-start gap-2"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-secondary/50 text-foreground placeholder-muted-foreground border border-white/10 rounded-xl px-4 py-3.5 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all hover:bg-secondary/80"
                                required
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-secondary/50 text-foreground placeholder-muted-foreground border border-white/10 rounded-xl px-4 py-3.5 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all hover:bg-secondary/80"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-500/25 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Shield className="w-5 h-5" />
                                    Access Admin Panel
                                </>
                            )}
                        </button>
                    </form>

                    {/* Info */}
                    <div className="mt-6 text-center relative z-10">
                        <p className="text-xs text-muted-foreground">
                            Only administrators can access this area
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AdminLoginModal;
