import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Zap, Code, Globe, ChevronRight, Check, Star, Users, Clock,
    Key, ArrowRight, Shield, Cpu, Terminal, Sparkles, Upload
} from "lucide-react";
import AuthContext from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useSaasTools, useGenerateApiKey } from "../hooks/useQueries";
// api import removed as it is now handled by mutation

const Saas = () => {
    const [selectedCategory, setSelectedCategory] = useState("");
    const { user } = useContext(AuthContext);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const { data: toolsData, isLoading: loading } = useSaasTools();
    const tools = toolsData || [];

    const filteredTools = selectedCategory
        ? tools.filter(t => t.category === selectedCategory)
        : tools;

    const categories = [
        { id: "", name: "All APIs", icon: Zap },
        { id: "Code Utilities", name: "Code Utils", icon: Code },
        { id: "API Services", name: "API Services", icon: Globe },
        { id: "AI Tools", name: "AI Powered", icon: Sparkles },
        { id: "Storage", name: "Storage", icon: Upload },
    ];

    const stats = [
        { label: "APIs Available", value: tools.length || "6+", icon: Cpu },
        { label: "Uptime", value: "99.9%", icon: Shield },
        { label: "Avg Response", value: "<100ms", icon: Zap },
        { label: "Developers", value: "5K+", icon: Users },
    ];

    const generateKeyMutation = useGenerateApiKey();

    const getApiKey = async (tool) => {
        if (!user) {
            showToast("Please login to get an API key", "error");
            return;
        }

        generateKeyMutation.mutate({ toolId: tool.id }, {
            onSuccess: () => {
                showToast("API key generated! Check your profile.", "success");
                navigate("/profile");
            },
            onError: (err) => {
                showToast(err.response?.data?.message || "Failed to generate key", "error");
            }
        });
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-secondary border border-white/10">
                            <Terminal className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-muted-foreground">
                                Developer APIs & SaaS Tools
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
                            Build faster with <span className="text-primary">powerful APIs</span>
                        </h1>

                        <p className="text-lg text-muted-foreground mb-10 max-w-2xl">
                            Production-ready APIs and developer tools. Generate API keys instantly and integrate in minutes.
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-8">
                            {stats.map((stat) => (
                                <div key={stat.label} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <stat.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-foreground">{stat.value}</p>
                                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-8 border-y border-white/5 bg-secondary/50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-wrap gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${selectedCategory === cat.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-muted-foreground hover:text-foreground border border-white/10'
                                    }`}
                            >
                                <cat.icon className="w-4 h-4" />
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Built-in API Tools */}
            <section className="py-12">
                <div className="container max-w-6xl mx-auto px-6">
                    <h2 className="text-headline text-[var(--text-primary)] mb-2">
                        Built-in API Tools
                    </h2>
                    <p className="text-body mb-8">
                        Ready-to-use APIs you can try right now. No setup required.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Screenshot API */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card card-hover group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <svg className="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <path d="M21 15l-5-5L5 21" />
                                    </svg>
                                </div>
                                <span className="pill bg-blue-100 text-blue-700 text-xs">Live Demo</span>
                            </div>

                            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                                Screenshot API
                            </h3>
                            <p className="text-body text-sm mb-4">
                                Capture high-quality screenshots of any website. Perfect for thumbnails, previews, and social media cards.
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                                    <Check className="w-3 h-3 text-[var(--success)]" /> Full Page Support
                                </span>
                                <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                                    <Check className="w-3 h-3 text-[var(--success)]" /> Custom Viewport
                                </span>
                                <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                                    <Check className="w-3 h-3 text-[var(--success)]" /> PNG/JPEG
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-secondary)]">
                                <div>
                                    <span className="text-xl font-bold text-green-600">Free</span>
                                    <span className="text-xs text-[var(--text-tertiary)] block">100 req/day</span>
                                </div>
                                <Link
                                    to="/api-playground"
                                    className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                                >
                                    Try Demo
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>

                        {/* Color Palette API */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="card card-hover group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <svg className="w-7 h-7 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <circle cx="12" cy="12" r="4" fill="currentColor" />
                                        <path d="M12 2v4M12 18v4M22 12h-4M6 12H2" />
                                    </svg>
                                </div>
                                <span className="pill bg-purple-100 text-purple-700 text-xs">Live Demo</span>
                            </div>

                            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                                Color Palette API
                            </h3>
                            <p className="text-body text-sm mb-4">
                                Extract dominant colors from any image. Generate beautiful color schemes for your designs.
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                                    <Check className="w-3 h-3 text-[var(--success)]" /> Vibrant Colors
                                </span>
                                <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                                    <Check className="w-3 h-3 text-[var(--success)]" /> Color Schemes
                                </span>
                                <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                                    <Check className="w-3 h-3 text-[var(--success)]" /> CSS Output
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-secondary)]">
                                <div>
                                    <span className="text-xl font-bold text-green-600">Free</span>
                                    <span className="text-xs text-[var(--text-tertiary)] block">100 req/day</span>
                                </div>
                                <Link
                                    to="/api-playground"
                                    className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                                >
                                    Try Demo
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* More Tools Header */}
            {tools.length > 0 && (
                <section className="py-8 border-t border-[var(--border-primary)]">
                    <div className="container max-w-6xl mx-auto px-6">
                        <h2 className="text-headline text-[var(--text-primary)] mb-2">
                            More API Tools
                        </h2>
                        <p className="text-body">
                            Additional tools added by our team.
                        </p>
                    </div>
                </section>
            )}

            {/* Tools Grid */}
            {tools.length > 0 && (
                <section className="py-8">
                    <div className="container max-w-6xl mx-auto px-6">
                        {loading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="card animate-pulse">
                                        <div className="h-12 w-12 rounded-lg bg-[var(--bg-tertiary)] mb-4" />
                                        <div className="h-5 w-3/4 bg-[var(--bg-tertiary)] rounded mb-2" />
                                        <div className="h-4 w-full bg-[var(--bg-tertiary)] rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTools.map((tool, index) => (
                                    <ToolCard
                                        key={tool.id}
                                        tool={tool}
                                        index={index}
                                        onGetKey={() => getApiKey(tool)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-20 border-t border-[var(--border-primary)]">
                <div className="container max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-headline text-[var(--text-primary)] mb-4">
                        Ready to get started?
                    </h2>
                    <p className="text-body mb-8">
                        Generate your API keys in seconds and start building.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/docs" className="btn-primary inline-flex items-center gap-2">
                            View Documentation
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link to="/contact" className="btn-secondary">
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

const ToolCard = ({ tool, index, onGetKey }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="card card-hover group"
    >
        <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center">
                {tool.category === "Code Utilities" && <Code className="w-6 h-6 text-[var(--accent-primary)]" />}
                {tool.category === "API Services" && <Globe className="w-6 h-6 text-[var(--accent-primary)]" />}
                {tool.category === "AI Tools" && <Sparkles className="w-6 h-6 text-[var(--accent-primary)]" />}
                {tool.category === "Storage" && <Upload className="w-6 h-6 text-[var(--accent-primary)]" />}
                {!["Code Utilities", "API Services", "AI Tools", "Storage"].includes(tool.category) &&
                    <Zap className="w-6 h-6 text-[var(--accent-primary)]" />
                }
            </div>
            <span className="pill text-xs">{tool.category || 'API'}</span>
        </div>

        <h3 className="text-title text-[var(--text-primary)] mb-2">{tool.name}</h3>
        <p className="text-body text-sm mb-4 line-clamp-2">{tool.description}</p>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
            {(tool.features || ['REST API', 'JSON Response', 'Fast']).slice(0, 3).map((feature, i) => (
                <span key={i} className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                    <Check className="w-3 h-3 text-[var(--success)]" />
                    {feature}
                </span>
            ))}
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-secondary)]">
            <div>
                <span className="text-xl font-bold text-[var(--text-primary)]">
                    {tool.pricing || 'Free'}
                </span>
                {tool.rateLimit && (
                    <span className="text-xs text-[var(--text-tertiary)] block">
                        {tool.rateLimit}
                    </span>
                )}
            </div>
            <button
                onClick={onGetKey}
                className="btn-primary py-2 px-4 text-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Key className="w-4 h-4" />
                Get Key
            </button>
        </div>
    </motion.div>
);

export default Saas;

