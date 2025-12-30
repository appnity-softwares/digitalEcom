import { useState, useMemo, useContext } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    BookOpen, Clock, ChevronRight, Lock, Eye, Award,
    Star, Crown, Calendar, User, ArrowRight, Search,
    TrendingUp, Filter
} from "lucide-react";
import { useDocs } from "../hooks/useQueries";
import AuthContext from "../context/AuthContext";

const Docs = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState(
        searchParams.get("category") || ""
    );
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest"); // 'newest', 'popular', 'oldest'

    // React Query hook
    const { data: docsData, isLoading: loading } = useDocs({
        category: selectedCategory,
        page: 1,
        limit: 100
    });

    // Process docs data - no demo data
    const docs = useMemo(() => {
        const data = docsData?.docs || docsData || [];
        return Array.isArray(data) ? data : [];
    }, [docsData]);

    // Derived State: Featured Article
    // Prioritize 'is_developers_choice', then 'ADMIN' role, then latest
    const featuredDoc = useMemo(() => {
        if (!docs.length) return null;
        return docs.find(d => d.is_developers_choice) ||
            docs.find(d => d.authorRole === 'ADMIN') ||
            docs[0];
    }, [docs]);

    // Filter & Sort Logic
    const filteredAndSortedDocs = useMemo(() => {
        // 1. Filter
        let result = docs.filter(doc => {
            // Category
            // (Handled by API usually, but if client-side filtering needed for search/diff)
            // if (selectedCategory && doc.category !== selectedCategory) return false;

            // Difficulty
            if (selectedDifficulty && doc.difficulty !== selectedDifficulty) return false;

            // Search
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const titleMatch = doc.title?.toLowerCase().includes(query);
                const descMatch = doc.description?.toLowerCase().includes(query);
                if (!titleMatch && !descMatch) return false;
            }

            // Exclude featured doc from grid to avoid duplication (only if no category/search active)
            // If user is searching/filtering specific things, maybe show it? 
            // Let's hide it from grid ONLY if we are showing "All" view to keep it clean.
            // Actually, best to just render it if it matches the current filter suite.
            // But usually Hero is separate. Let's exclude it from the GRID list if it's the specific featured one.
            if (!searchQuery && !selectedCategory && !selectedDifficulty && featuredDoc && doc.id === featuredDoc.id) {
                return false;
            }

            return true;
        });

        // 2. Sort
        result.sort((a, b) => {
            if (sortBy === 'popular') {
                return (b.views || 0) - (a.views || 0);
            } else if (sortBy === 'oldest') {
                return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            } else {
                // Newest (Default)
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            }
        });

        return result;
    }, [docs, selectedDifficulty, searchQuery, selectedCategory, sortBy, featuredDoc]);

    // Extract categories from docs
    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(docs.map(d => d.category).filter(Boolean))];
        return uniqueCategories.map(name => ({
            name,
            count: docs.filter(d => d.category === name).length
        }));
    }, [docs]);

    const difficulties = ["beginner", "intermediate", "advanced"];

    // Check if user has active subscription
    const hasSubscription = user?.subscription?.status === 'active';

    return (
        <div className="min-h-screen bg-background py-24 px-6 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
                        <BookOpen className="w-4 h-4" />
                        Developer Resources
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
                        Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-500">Potential</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Deep dives into architecture, best practices, and advanced techniques.
                        Curated by experts for professional developers.
                    </p>
                </motion.div>

                {/* Featured Hero Section */}
                {!loading && featuredDoc && !searchQuery && !selectedCategory && !selectedDifficulty && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16"
                    >
                        <Link to={`/docs/${featuredDoc._id || featuredDoc.id || featuredDoc.slug}`} className="block group">
                            <div className="relative rounded-3xl overflow-hidden glass-card border-0 aspect-[21/9] md:aspect-[2.5/1]">
                                {/* Background Image with Overlay */}
                                <div className="absolute inset-0">
                                    <img
                                        src={featuredDoc.thumbnail || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80"}
                                        alt={featuredDoc.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                                </div>

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-current" />
                                            Featured Story
                                        </span>
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full">
                                            {featuredDoc.category}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 max-w-4xl leading-tight">
                                        {featuredDoc.title}
                                    </h2>
                                    <p className="text-lg text-gray-200 line-clamp-2 max-w-2xl mb-6">
                                        {featuredDoc.description}
                                    </p>
                                    <div className="flex items-center gap-6 text-sm text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                <User className="w-4 h-4 text-white" />
                                            </div>
                                            <span>{featuredDoc.author?.name || 'DigitalStudio'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span>{featuredDoc.reading_time_minutes || 5} min read</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(featuredDoc.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                )}

                {/* Controls Bar: Search, Sort, Filters */}
                <div className="glass-card rounded-2xl p-4 mb-8 border border-white/10 sticky top-24 z-30 backdrop-blur-xl">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        {/* Search */}
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="search"
                                placeholder="Search articles, tutorials..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-2.5 bg-secondary/50 border border-white/5 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-secondary transition-all"
                            />
                        </div>

                        {/* Filters & Sort */}
                        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                            {/* Sort Dropdown */}
                            <div className="relative group">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none pl-4 pr-10 py-2.5 bg-secondary/50 border border-white/5 rounded-xl text-sm font-medium text-foreground focus:outline-none focus:border-primary cursor-pointer hover:bg-secondary transition-colors"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="popular">Most Popular</option>
                                    <option value="oldest">Oldest First</option>
                                </select>
                                <TrendingUp className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            </div>

                            {/* Divider */}
                            <div className="w-px h-8 bg-white/10 mx-1" />

                            {/* Difficulty Toggles */}
                            <div className="flex bg-secondary/50 p-1 rounded-xl border border-white/5">
                                {difficulties.map((diff) => (
                                    <button
                                        key={diff}
                                        onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? "" : diff)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${selectedDifficulty === diff
                                                ? diff === 'beginner' ? 'bg-green-500/20 text-green-500'
                                                    : diff === 'intermediate' ? 'bg-orange-500/20 text-orange-500'
                                                        : 'bg-red-500/20 text-red-500'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                            }`}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Category Pills (Secondary Row) */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                        <button
                            onClick={() => setSelectedCategory("")}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === ""
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"}`}
                        >
                            All Topics
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === cat.name
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"}`}
                            >
                                {cat.name}
                                <span className="opacity-60 ml-1">({cat.count})</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Subscription CTA Banner (Only if not subscribed) */}
                {!hasSubscription && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-l-primary"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Crown className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">
                                    Unlock Premium Tutorials
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Get access to advanced guides, source code, and expert interviews.
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/pricing"
                            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center gap-2 text-sm"
                        >
                            Subscribe Now
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                )}

                {/* Blog Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="glass-card rounded-2xl p-4 animate-pulse">
                                <div className="h-48 bg-secondary rounded-xl mb-4" />
                                <div className="h-6 bg-secondary rounded w-3/4 mb-2" />
                                <div className="h-4 bg-secondary rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filteredAndSortedDocs.length === 0 ? (
                    <EmptyState searchQuery={searchQuery} />
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredAndSortedDocs.map((doc, index) => (
                            <BlogCard
                                key={doc._id || doc.id || index}
                                doc={doc}
                                index={index}
                                hasSubscription={hasSubscription}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Blog Card Component
const BlogCard = ({ doc, index, hasSubscription }) => {
    const isLocked = doc.requires_subscription && !hasSubscription;
    const isDevelopersChoice = doc.is_developers_choice || doc.authorRole === 'ADMIN';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link
                to={isLocked ? '#' : `/docs/${doc._id || doc.id || doc.slug}`}
                className={`block group h-full ${isLocked ? 'cursor-not-allowed' : ''}`}
                onClick={(e) => isLocked && e.preventDefault()}
            >
                <div className="glass-card-hover rounded-2xl p-4 h-full flex flex-col border border-white/5 hover:border-primary/50 transition-colors">
                    {/* Thumbnail */}
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                        <img
                            src={doc.thumbnail || "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800"}
                            alt={doc.title}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isLocked ? 'blur-sm' : ''}`}
                        />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                            {isDevelopersChoice && (
                                <span className="px-2.5 py-1 bg-yellow-500 text-black text-[10px] uppercase tracking-wider font-bold rounded-full flex items-center gap-1">
                                    <Award className="w-3 h-3" />
                                    Choice
                                </span>
                            )}
                            {isLocked && (
                                <span className="px-2.5 py-1 bg-black/70 text-white text-[10px] uppercase tracking-wider font-bold rounded-full flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    Locked
                                </span>
                            )}
                        </div>

                        {/* Lock Overlay */}
                        {isLocked && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <Lock className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-sm font-medium">Subscribe to Read</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                        {/* Meta */}
                        <div className="flex items-center gap-3 mb-3 text-xs">
                            <span className="text-primary font-medium">{doc.category}</span>
                            <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                            <span className={`capitalize ${doc.difficulty === 'advanced' ? 'text-red-500' :
                                doc.difficulty === 'intermediate' ? 'text-orange-500' : 'text-green-500'
                                }`}>
                                {doc.difficulty || 'beginner'}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {doc.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                            {doc.description}
                        </p>

                        {/* Author & Stats */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-3 h-3 text-primary" />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {doc.author?.name || 'DigitalStudio Team'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {doc.reading_time_minutes || 5} min
                                </span>
                                <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {doc.views || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

// Empty State
const EmptyState = ({ searchQuery }) => (
    <div className="text-center py-20 col-span-full">
        <div className="w-20 h-20 glass-card rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-2xl font-display font-bold text-foreground mb-2">
            No articles found
        </h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
            {searchQuery
                ? `We couldn't find any articles matching "${searchQuery}". Try different keywords.`
                : "Only empty shelves here. Check back soon for new content!"}
        </p>
    </div>
);

export default Docs;
