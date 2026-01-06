import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Copy, Check, Code2, Zap, Layout,
    Sparkles, Box, Type, Square, Star,
    Search, Filter, ArrowUpRight, Layers, Cpu, Wand2, X, Maximize2,
    ExternalLink, Eye, Code, Monitor, Heart
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useComponentCategories, useComponents, useTrackComponentCopy } from '../hooks/useQueries';

// Import all preview components
import * as PreviewComponents from '../components/previews/ComponentPreviews';

/**
 * Ultra-Premium Dynamic Components Showcase
 * 
 * Fully dynamic component library powered by database
 */

const Components = () => {
    const { showToast } = useToast();
    const [copiedCode, setCopiedCode] = useState(null);
    const [activeTab, setActiveTab] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [fullscreenComponent, setFullscreenComponent] = useState(null);
    const [hoveredCard, setHoveredCard] = useState(null);

    // Fetch categories and components
    const { data: categoriesData, isLoading: categoriesLoading } = useComponentCategories();

    // Extract data arrays (service returns { success: true, data: [...] })
    const categories = categoriesData?.data || [];

    // Set initial activeTab to 'all' category ID once categories are loaded
    useEffect(() => {
        if (categories.length > 0 && !activeTab) {
            const allCategory = categories.find(cat => cat.name === 'all');
            if (allCategory) {
                setActiveTab(allCategory.id);
            }
        }
    }, [categories, activeTab]);

    // Find the 'all' category to check if we should filter
    const allCategory = categories.find(cat => cat.name === 'all');
    const shouldFilter = activeTab && activeTab !== allCategory?.id;

    const { data: componentsData, isLoading: componentsLoading } = useComponents({
        category: shouldFilter ? activeTab : undefined,
        search: searchQuery || undefined
    });

    const trackCopy = useTrackComponentCopy();

    const components = componentsData || [];


    const copyToClipboard = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        showToast('Code copied to clipboard!', 'success');

        // Track copy analytics
        trackCopy.mutate(id);

        setTimeout(() => setCopiedCode(null), 2000);
    };

    // Get icon component from lucide-react
    const getIcon = (iconName) => {
        const icons = { Layers, Box, Square, Type, Sparkles, Zap };
        return icons[iconName] || Layers;
    };

    if (categoriesLoading || componentsLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <Cpu className="w-16 h-16 text-primary" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Premium Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-16 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 rounded-full text-primary text-sm font-bold mb-8 backdrop-blur-xl"
                        >
                            <Wand2 className="w-4 h-4 animate-pulse" />
                            Premium Component Library
                            <Sparkles className="w-4 h-4 animate-pulse" />
                        </motion.div>

                        <motion.h1
                            className="text-6xl md:text-7xl font-display font-black mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <span className="bg-gradient-to-r from-foreground via-primary to-purple-500 bg-clip-text text-transparent">
                                Luxury Components
                            </span>
                        </motion.h1>

                        <motion.p
                            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Handcrafted with precision. Animated with passion. Built for perfection.
                        </motion.p>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center justify-center gap-8 mt-8"
                        >
                            <div className="flex items-center gap-2">
                                <Box className="w-5 h-5 text-primary" />
                                <span className="text-foreground font-bold">{components.length}</span>
                                <span className="text-muted-foreground">Components</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Layers className="w-5 h-5 text-primary" />
                                <span className="text-foreground font-bold">{categories.length}</span>
                                <span className="text-muted-foreground">Categories</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Premium Search */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mb-12 max-w-2xl mx-auto"
                    >
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative flex items-center gap-4 px-6 py-4 glass-card rounded-2xl border border-white/10">
                                <Search className="w-6 h-6 text-primary" />
                                <input
                                    type="search"
                                    placeholder="Search components..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-lg"
                                />
                                <Filter className="w-5 h-5 text-muted-foreground" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Premium Category Tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mb-16"
                    >
                        <div className="flex flex-wrap gap-4 justify-center">
                            {categories.map((category, index) => {
                                const Icon = getIcon(category.icon);
                                const isActive = activeTab === category.id;
                                return (
                                    <motion.button
                                        key={category.id}
                                        onClick={() => setActiveTab(category.id)}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 + index * 0.05 }}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`group relative px-8 py-4 rounded-2xl font-bold transition-all ${isActive
                                            ? 'text-white'
                                            : 'glass-card text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className={`absolute inset-0 bg-gradient-to-r ${category.gradient} rounded-2xl`}
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        <span className="relative z-10 flex items-center gap-2">
                                            <Icon className="w-5 h-5" />
                                            {category.label}
                                            {category._count?.components > 0 && (
                                                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                                    {category._count.components}
                                                </span>
                                            )}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Components Grid */}
                    <motion.div
                        layout
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {components.map((component, index) => (
                                <ComponentCard
                                    key={component.id}
                                    component={component}
                                    index={index}
                                    onCopy={copyToClipboard}
                                    isCopied={copiedCode === component.id}
                                    onHover={setHoveredCard}
                                    isHovered={hoveredCard === component.id}
                                    onViewCode={() => setSelectedComponent(component)}
                                    onFullscreen={() => setFullscreenComponent(component)}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {components.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-32"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            >
                                <Cpu className="w-24 h-24 text-muted-foreground/30 mx-auto mb-6" />
                            </motion.div>
                            <p className="text-xl text-muted-foreground">No components found matching your search.</p>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Glass Code Popup Modal */}
            <CodePopupModal
                component={selectedComponent}
                onClose={() => setSelectedComponent(null)}
                onCopy={copyToClipboard}
                isCopied={copiedCode === selectedComponent?.id}
                onFullscreen={() => {
                    setFullscreenComponent(selectedComponent);
                    setSelectedComponent(null);
                }}
            />

            {/* Fullscreen Code Viewer */}
            <FullscreenCodeViewer
                component={fullscreenComponent}
                onClose={() => setFullscreenComponent(null)}
                onCopy={copyToClipboard}
                isCopied={copiedCode === fullscreenComponent?.id}
            />
        </div>
    );
};

// Component Card with 3D Effect
const ComponentCard = ({ component, index, onCopy, isCopied, onHover, isHovered, onViewCode, onFullscreen }) => {
    const [rotation, setRotation] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        setRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 0 });
    };

    // Get preview component
    const PreviewComponent = PreviewComponents[component.previewType] || PreviewComponents.DefaultPreview;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{
                delay: index * 0.05,
                type: "spring",
                stiffness: 100,
                damping: 15
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onHoverStart={() => onHover(component.id)}
            onHoverEnd={() => onHover(null)}
            style={{
                transformStyle: 'preserve-3d',
                transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            }}
            className="group relative cursor-pointer"
        >
            {/* 3D Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ transform: 'translateZ(-50px)' }} />

            <div className="relative glass-card rounded-3xl overflow-hidden border border-white/10 group-hover:border-primary/50 transition-all"
                style={{ transform: 'translateZ(0)' }}>
                {/* Preview Section */}
                <div
                    className="relative p-10 bg-gradient-to-br from-secondary/50 to-secondary/20 border-b border-white/10 min-h-[220px] flex items-center justify-center overflow-hidden"
                    style={{ transform: 'translateZ(20px)' }}
                    onClick={onViewCode}
                >
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
                    </div>

                    {/* Hover Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 backdrop-blur-sm flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            whileHover={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="flex gap-3"
                        >
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
                            >
                                <Eye className="w-6 h-6 text-white" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFullscreen();
                                }}
                                className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
                            >
                                <Maximize2 className="w-6 h-6 text-white" />
                            </motion.button>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.05 + 0.2 }}
                    >
                        <PreviewComponent />
                    </motion.div>
                </div>

                {/* Info Section */}
                <div className="p-6" style={{ transform: 'translateZ(10px)' }}>
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                    {component.title}
                                </h3>
                                {component.isFeatured && (
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {component.description}
                            </p>
                            {/* Tags */}
                            {component.tags && component.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {component.tags.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <motion.div
                            whileHover={{ rotate: 90 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Sparkles className="w-5 h-5 text-primary" />
                        </motion.div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {component.views || 0}
                        </div>
                        <div className="flex items-center gap-1">
                            <Copy className="w-3 h-3" />
                            {component.copies || 0}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                        <motion.button
                            onClick={onViewCode}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 px-4 py-3 bg-secondary/50 hover:bg-secondary rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-white/10"
                        >
                            <Code2 className="w-4 h-4" />
                            View Code
                        </motion.button>
                        <motion.button
                            onClick={() => onCopy(component.code, component.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-3 bg-gradient-to-r from-primary to-purple-500 hover:shadow-lg hover:shadow-primary/50 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                        >
                            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Glass Code Popup Modal
const CodePopupModal = ({ component, onClose, onCopy, isCopied, onFullscreen }) => {
    if (!component) return null;

    const PreviewComponent = PreviewComponents[component.previewType] || PreviewComponents.DefaultPreview;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 50 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
                >
                    {/* Glass Card Container */}
                    <div className="glass-card rounded-3xl border-2 border-white/20 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-primary/10 to-purple-500/10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                                    <Code2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">{component.title}</h2>
                                    <p className="text-sm text-muted-foreground">{component.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onFullscreen}
                                    className="p-3 hover:bg-white/10 rounded-xl transition-all"
                                >
                                    <Maximize2 className="w-5 h-5 text-foreground" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="p-3 hover:bg-white/10 rounded-xl transition-all"
                                >
                                    <X className="w-5 h-5 text-foreground" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Content - Split View */}
                        <div className="grid md:grid-cols-2 divide-x divide-white/10">
                            {/* Preview */}
                            <div className="p-8 bg-gradient-to-br from-secondary/50 to-secondary/20 flex items-center justify-center min-h-[300px]">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur-2xl" />
                                    <div className="relative">
                                        <PreviewComponent />
                                    </div>
                                </div>
                            </div>

                            {/* Code */}
                            <div className="relative">
                                <div className="absolute top-4 right-4 z-10">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onCopy(component.code, component.id)}
                                        className="px-4 py-2 bg-gradient-to-r from-primary to-purple-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg"
                                    >
                                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {isCopied ? 'Copied!' : 'Copy'}
                                    </motion.button>
                                </div>
                                <div className="p-6 overflow-auto max-h-[500px]">
                                    <pre className="text-sm">
                                        <code className="text-green-400 font-mono leading-relaxed">
                                            {component.code}
                                        </code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Fullscreen Code Viewer
const FullscreenCodeViewer = ({ component, onClose, onCopy, isCopied }) => {
    const [viewMode, setViewMode] = useState('split'); // 'split', 'code', 'preview'

    if (!component) return null;

    const PreviewComponent = PreviewComponents[component.previewType] || PreviewComponents.DefaultPreview;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background z-50"
            >
                {/* Header */}
                <div className="glass-card border-b border-white/10">
                    <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-xl transition-all"
                            >
                                <X className="w-6 h-6" />
                            </motion.button>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">{component.title}</h1>
                                <p className="text-sm text-muted-foreground">{component.description}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* View Mode Toggle */}
                            <div className="flex gap-2 p-1 bg-secondary rounded-xl">
                                <button
                                    onClick={() => setViewMode('preview')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'preview' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('split')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'split' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <Layout className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('code')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'code' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <Code className="w-4 h-4" />
                                </button>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onCopy(component.code, component.id)}
                                className="px-6 py-3 bg-gradient-to-r from-primary to-purple-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg"
                            >
                                {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                {isCopied ? 'Copied!' : 'Copy Code'}
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="h-[calc(100vh-80px)]">
                    {viewMode === 'split' && (
                        <div className="grid md:grid-cols-2 h-full divide-x divide-white/10">
                            {/* Preview */}
                            <div className="p-12 bg-gradient-to-br from-secondary/30 to-background flex items-center justify-center overflow-auto">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur-3xl" />
                                    <div className="relative transform scale-150">
                                        <PreviewComponent />
                                    </div>
                                </div>
                            </div>

                            {/* Code */}
                            <div className="p-8 overflow-auto bg-black/20">
                                <pre className="text-base">
                                    <code className="text-green-400 font-mono leading-loose">
                                        {component.code}
                                    </code>
                                </pre>
                            </div>
                        </div>
                    )}

                    {viewMode === 'preview' && (
                        <div className="h-full p-12 bg-gradient-to-br from-secondary/30 to-background flex items-center justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur-3xl" />
                                <div className="relative transform scale-150">
                                    <PreviewComponent />
                                </div>
                            </div>
                        </div>
                    )}

                    {viewMode === 'code' && (
                        <div className="h-full p-8 overflow-auto bg-black/20">
                            <pre className="text-lg">
                                <code className="text-green-400 font-mono leading-loose">
                                    {component.code}
                                </code>
                            </pre>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default Components;
