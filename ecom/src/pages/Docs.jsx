import { useState, useMemo, useContext } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    BookOpen, Clock, ChevronRight, Lock, Eye, Award,
    Star, Crown, Calendar, User, ArrowRight
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

    // Filter by difficulty
    const filteredDocs = useMemo(() => {
        return docs.filter(doc => {
            if (selectedDifficulty && doc.difficulty !== selectedDifficulty) return false;
            return true;
        });
    }, [docs, selectedDifficulty]);

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

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
                        <BookOpen className="w-4 h-4" />
                        Developer Blog
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
                        Developer <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-500">Insights</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Technical articles, tutorials, and best practices from our team
                        and community developers. Subscribe for full access.
                    </p>
                </motion.div>

                {/* Subscription CTA Banner */}
                {!hasSubscription && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Crown className="w-7 h-7 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">
                                    Unlock All Articles
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Subscribe to access premium tutorials, guides, and exclusive content.
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/pricing"
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center gap-2"
                        >
                            Subscribe Now
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                )}

                {/* Category Filters */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <button
                        onClick={() => setSelectedCategory("")}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === ""
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"}`}
                    >
                        All Topics
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.name}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.name
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"}`}
                        >
                            {cat.name}
                            <span className="text-xs opacity-60 ml-1">({cat.count})</span>
                        </button>
                    ))}
                </div>

                {/* Difficulty Filter */}
                <div className="flex items-center gap-4 mb-12">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Level:</span>
                    {difficulties.map((diff) => (
                        <button
                            key={diff}
                            onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? "" : diff)}
                            className={`text-sm capitalize font-medium transition-colors ${selectedDifficulty === diff
                                ? diff === 'beginner' ? 'text-green-500'
                                    : diff === 'intermediate' ? 'text-orange-500'
                                        : 'text-red-500'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {diff}
                        </button>
                    ))}
                </div>

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
                ) : filteredDocs.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredDocs.map((doc, index) => (
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
                <div className="glass-card-hover rounded-2xl p-4 h-full flex flex-col">
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
                                <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full flex items-center gap-1">
                                    <Award className="w-3 h-3" />
                                    Developer's Choice
                                </span>
                            )}
                            {isLocked && (
                                <span className="px-3 py-1 bg-black/70 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    Pro
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
const EmptyState = () => (
    <div className="text-center py-20">
        <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-display font-bold text-foreground mb-2">
            No articles yet
        </h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
            Blog posts will appear here once published. Check back soon!
        </p>
    </div>
);

export default Docs;
