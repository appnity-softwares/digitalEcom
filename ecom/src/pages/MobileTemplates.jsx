import React, { useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Smartphone, Star, Heart, ShoppingCart, Search,
    Zap, Layers, Shield, Globe, SlidersHorizontal, X
} from 'lucide-react';
import WishlistContext from '../context/WishlistContext';
import CartContext from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useProducts } from '../hooks/useQueries';

const MobileTemplates = () => {
    const { addToWishlist, isInWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        platform: 'all',
        priceRange: 'all',
        sortBy: 'newest'
    });
    const [showFilters, setShowFilters] = useState(false);

    const { data: templatesData, isLoading: loading } = useProducts({ category: 'mobile' });
    const templates = templatesData?.products || [];

    // Apply filters and search
    const filteredTemplates = useMemo(() => {
        let result = [...templates];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(t =>
                t.title?.toLowerCase().includes(term) ||
                t.description?.toLowerCase().includes(term)
            );
        }

        // Platform filter
        if (filters.platform !== 'all') {
            result = result.filter(t => t.platform === filters.platform);
        }

        // Price filter
        if (filters.priceRange !== 'all') {
            switch (filters.priceRange) {
                case 'free':
                    result = result.filter(t => !t.price || t.price === 0);
                    break;
                case 'under50':
                    result = result.filter(t => t.price && t.price < 50);
                    break;
                case 'under100':
                    result = result.filter(t => t.price && t.price < 100);
                    break;
                case 'over100':
                    result = result.filter(t => t.price && t.price >= 100);
                    break;
            }
        }

        // Sort
        switch (filters.sortBy) {
            case 'price-low':
                result.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'price-high':
                result.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'rating':
                result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            default:
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return result;
    }, [templates, searchTerm, filters]);

    const handleAddToCart = (template) => {
        addToCart(template);
        showToast('Added to cart!', 'success');
    };

    const handleWishlist = (template) => {
        addToWishlist(template);
        showToast('Added to wishlist!', 'success');
    };

    const platforms = [
        { id: 'all', label: 'All Platforms' },
        { id: 'react-native', label: 'React Native' },
        { id: 'flutter', label: 'Flutter' },
        { id: 'expo', label: 'Expo' }
    ];

    const priceRanges = [
        { id: 'all', label: 'All Prices' },
        { id: 'free', label: 'Free' },
        { id: 'under50', label: 'Under $50' },
        { id: 'under100', label: 'Under $100' },
        { id: 'over100', label: '$100+' }
    ];

    const sortOptions = [
        { id: 'newest', label: 'Newest' },
        { id: 'price-low', label: 'Price: Low to High' },
        { id: 'price-high', label: 'Price: High to Low' },
        { id: 'rating', label: 'Top Rated' }
    ];

    return (
        <div className="min-h-screen bg-background pt-28">
            {/* Hero */}
            <section className="relative pb-16 px-6">
                <div className="absolute inset-0 grid-pattern opacity-30" />
                <div className="absolute top-10 right-1/4 w-96 h-96 bg-primary/20 opacity-30 rounded-full blur-3xl p-32" />

                <div className="container max-w-6xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-secondary/50 border border-border/50">
                            <Smartphone className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">
                                Mobile App Templates
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
                            Build mobile apps <span className="text-primary">10x faster</span>
                        </h1>

                        <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                            Production-ready React Native & Flutter templates. Skip months of development and launch your app today.
                        </p>

                        {/* Feature Pills */}
                        <div className="flex flex-wrap gap-3 mb-8">
                            {[
                                { icon: Zap, text: 'Production Ready' },
                                { icon: Layers, text: 'Full Source Code' },
                                { icon: Shield, text: 'Free Updates' },
                                { icon: Globe, text: 'Cross Platform' }
                            ].map(({ icon: Icon, text }) => (
                                <div key={text} className="px-3 py-1.5 rounded-full bg-secondary border border-border/50 flex items-center gap-2 text-sm text-foreground">
                                    <Icon className="w-4 h-4 text-primary" />
                                    {text}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Filters & Search */}
            <section className="py-6 border-y border-border/40 bg-background/50 backdrop-blur-sm sticky top-16 z-30">
                <div className="container max-w-6xl mx-auto px-6">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search templates..."
                                className="w-full bg-secondary/50 border border-border/50 text-foreground pl-12 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                            />
                        </div>

                        {/* Platform Filters */}
                        <div className="hidden md:flex gap-2">
                            {platforms.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setFilters(f => ({ ...f, platform: p.id }))}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filters.platform === p.id
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                        : 'bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {/* Filter Button (Mobile) */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium flex items-center gap-2"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                        </button>

                        {/* Sort Dropdown */}
                        <select
                            value={filters.sortBy}
                            onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value }))}
                            className="bg-secondary/50 border border-border/50 text-foreground px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            {sortOptions.map(s => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Mobile Filter Panel */}
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="md:hidden mt-4 pt-4 border-t border-border/40"
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Platform</label>
                                    <div className="flex flex-wrap gap-2">
                                        {platforms.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => setFilters(f => ({ ...f, platform: p.id }))}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filters.platform === p.id
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-secondary text-muted-foreground'}`}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Price</label>
                                    <div className="flex flex-wrap gap-2">
                                        {priceRanges.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => setFilters(f => ({ ...f, priceRange: p.id }))}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filters.priceRange === p.id
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-secondary text-muted-foreground'}`}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Templates Grid */}
            <section className="py-12 px-6">
                <div className="container max-w-6xl mx-auto">
                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="glass-card h-[340px] animate-pulse p-4 rounded-xl border border-white/5 bg-secondary/20">
                                    <div className="aspect-video bg-muted/20 rounded-lg mb-4" />
                                    <div className="h-5 bg-muted/20 rounded w-3/4 mb-2" />
                                    <div className="h-4 bg-muted/20 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            <p className="text-muted-foreground mb-6">
                                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
                            </p>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTemplates.map((template, i) => (
                                    <TemplateCard
                                        key={template.id || i}
                                        template={template}
                                        index={i}
                                        onAddToCart={() => handleAddToCart(template)}
                                        onWishlist={() => handleWishlist(template)}
                                        isInWishlist={isInWishlist(template.id)}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
};

// Template Card
const TemplateCard = ({ template, index, onAddToCart, onWishlist, isInWishlist }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="glass-card rounded-xl overflow-hidden group hover:border-primary/50 transition-colors"
    >
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
            <img
                src={template.image || 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600'}
                alt={template.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Platform Badge */}
            <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${template.platform === 'react-native' ? 'bg-blue-500' :
                template.platform === 'flutter' ? 'bg-cyan-500' : 'bg-purple-500'
                }`}>
                {template.platform === 'react-native' ? 'React Native' :
                    template.platform === 'flutter' ? 'Flutter' : 'Expo'}
            </span>

            {/* Wishlist Button */}
            <button
                onClick={(e) => { e.preventDefault(); onWishlist(); }}
                className={`absolute top-3 right-3 p-2 rounded-full transition-colors backdrop-blur-md ${isInWishlist
                    ? 'bg-red-500 text-white'
                    : 'bg-black/30 text-white hover:bg-black/50 opacity-0 group-hover:opacity-100'
                    }`}
            >
                <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
        </div>

        {/* Content */}
        <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                    {[...Array(5)].map((_, j) => (
                        <Star
                            key={j}
                            className={`w-3.5 h-3.5 ${j < Math.floor(template.rating || 4)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-muted/30'
                                }`}
                        />
                    ))}
                </div>
                <span className="text-xs text-muted-foreground">
                    ({template.reviews || 0})
                </span>
            </div>

            <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1">
                {template.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {template.description}
            </p>

            {/* Tech Stack */}
            {template.techStack && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {template.techStack.slice(0, 3).map((tech, j) => (
                        <span key={j} className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded">
                            {tech}
                        </span>
                    ))}
                </div>
            )}

            {/* Price & Action */}
            <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <div>
                    <span className="text-xl font-bold text-foreground">
                        ${template.price || 0}
                    </span>
                    {template.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through ml-2">
                            ${template.originalPrice}
                        </span>
                    )}
                </div>
                <button
                    onClick={(e) => { e.preventDefault(); onAddToCart(); }}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-lg text-sm flex items-center gap-2 font-medium transition-colors shadow-lg shadow-primary/20"
                >
                    <ShoppingCart className="w-4 h-4" />
                    Add
                </button>
            </div>
        </div>
    </motion.div>
);

// Empty State
const EmptyState = () => (
    <div className="text-center py-20">
        <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Smartphone className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">
            No templates found
        </h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
            Try adjusting your filters or check back later for new templates.
        </p>
    </div>
);

export default MobileTemplates;
