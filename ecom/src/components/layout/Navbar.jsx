import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, X, Package, FileText, Menu, User, ShoppingCart, Heart, Code, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import CartContext from '../../context/CartContext';
import WishlistContext from '../../context/WishlistContext';
import LoginModal from '../auth/LoginModal';
import ThemeToggle from '../ui/ThemeToggle';
import api from '../../services/api';

const Navbar = () => {
    const { user, logout, loading: authLoading } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const { wishlistItems } = useContext(WishlistContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const searchRef = useRef(null);
    const debounceRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSearch(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, []);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (value.length >= 2) {
            setLoading(true);
            debounceRef.current = setTimeout(async () => {
                try {
                    const res = await api.get(`/search/suggestions?q=${encodeURIComponent(value)}`);
                    setSuggestions(res.suggestions || []);
                } catch (err) {
                    console.log('Search error');
                } finally {
                    setLoading(false);
                }
            }, 300);
        } else {
            setSuggestions([]);
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/templates?search=${searchQuery}`);
            setShowSearch(false);
            setSuggestions([]);
        }
    };

    const navLinks = [
        { name: 'Templates', path: '/templates' },
        { name: 'Components', path: '/components' },
        { name: 'Docs', path: '/docs' },
        { name: 'API Tools', path: '/saas' },
        { name: 'Mobile Apps', path: '/mobile-templates' },
        { name: 'Pricing', path: '/pricing' },
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-nav py-3' : 'py-5 bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors ring-1 ring-primary/20">
                            <Zap className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold tracking-tight font-display">
                                DigitalStudio
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                                Premium Assets
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden lg:flex items-center bg-secondary/50 backdrop-blur-md rounded-full px-2 py-1 border border-gray-200 dark:border-white/5">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) =>
                                    `relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive
                                        ? 'text-primary-foreground bg-primary shadow-lg shadow-primary/25'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                    }`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div ref={searchRef} className="relative hidden md:block">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowSearch(!showSearch)}
                                className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                                <Search className="w-4 h-4 text-foreground" />
                            </motion.button>

                            <AnimatePresence>
                                {showSearch && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute right-0 top-12 w-80 z-50 p-2"
                                    >
                                        <div className="glass-card rounded-xl p-3 shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
                                            <div className="flex items-center gap-3 bg-secondary/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/5">
                                                <Search className="w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={handleSearchChange}
                                                    onKeyDown={handleSearch}
                                                    placeholder="Search assets..."
                                                    className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
                                                    autoFocus
                                                />
                                                <button onClick={() => setShowSearch(false)} className="hover:text-primary transition-colors">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>

                                            {suggestions.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    {suggestions.map((s, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => {
                                                                navigate(s.url || `/templates?search=${s.text}`);
                                                                setShowSearch(false);
                                                            }}
                                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 text-left text-sm transition-colors group"
                                                        >
                                                            {s.type === 'product' && <Package className="w-4 h-4 text-muted-foreground group-hover:text-primary" />}
                                                            {s.type === 'doc' && <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary" />}
                                                            {s.type === 'tool' && <Zap className="w-4 h-4 text-muted-foreground group-hover:text-primary" />}
                                                            {s.type === 'component' && <Code className="w-4 h-4 text-muted-foreground group-hover:text-primary" />}
                                                            <span className="text-foreground group-hover:text-primary transition-colors">{s.text}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Wishlist */}
                        <Link to="/wishlist" className="relative hidden sm:block">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                                <Heart className="w-4 h-4 text-foreground" />
                                {wishlistItems.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive border-2 border-background text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                                        {wishlistItems.length}
                                    </span>
                                )}
                            </motion.div>
                        </Link>

                        {/* Cart */}
                        <Link to="/cart" className="relative">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                                <ShoppingCart className="w-4 h-4 text-foreground" />
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary border-2 border-background text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                                        {cartItems.length}
                                    </span>
                                )}
                            </motion.div>
                        </Link>

                        {/* User Menu */}
                        {user ? (
                            <div className="relative group pl-2">
                                <Link to="/profile">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="w-10 h-10 rounded-full ring-2 ring-primary/20 p-0.5"
                                    >
                                        <div className="w-full h-full rounded-full overflow-hidden bg-secondary">
                                            {user.avatar ? (
                                                <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground font-bold">
                                                    {user.name?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </Link>

                                <div className="absolute right-0 top-full mt-4 w-56 glass-card p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right scale-95 group-hover:scale-100">
                                    <div className="px-3 py-2 mb-2 border-b border-gray-100 dark:border-white/5">
                                        <p className="text-sm font-medium">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                    <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/50 dark:hover:bg-white/5 text-sm transition-colors">
                                        <User className="w-4 h-4" />
                                        Profile
                                    </Link>
                                    {user.role === 'ADMIN' && (
                                        <Link to="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/50 dark:hover:bg-white/5 text-sm transition-colors">
                                            <Zap className="w-4 h-4 text-yellow-500" />
                                            Admin Panel
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => { logout(); navigate('/'); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-destructive/10 text-sm text-destructive hover:text-destructive transition-colors mt-1"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : authLoading ? (
                            <div className="w-10 h-10 rounded-full bg-secondary animate-pulse" />
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsLoginModalOpen(true)}
                                className="px-5 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                            >
                                Sign In
                            </motion.button>
                        )}

                        {/* Mobile Menu Button - unchanged */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 text-foreground"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-background/95 backdrop-blur-3xl lg:hidden pt-24 px-6"
                    >
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block p-4 rounded-2xl bg-secondary/30 hover:bg-primary/10 text-lg font-medium transition-colors border border-gray-200 dark:border-white/5"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </>
    );
};

export default Navbar;