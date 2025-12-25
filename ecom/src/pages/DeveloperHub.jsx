import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Smartphone,
    Code,
    Zap,
    BookOpen,
    ArrowRight,
    Check,
    Layers,
    BarChart2,
    Bell,
    Shield,
    Rocket,
    Github,
    Star,
} from "lucide-react";

const DeveloperHub = () => {
    const features = [
        {
            icon: Smartphone,
            title: "Mobile Templates",
            description: "Production-ready React Native & Flutter templates with authentication, navigation, and more.",
            link: "/templates?category=Mobile%20App",
            color: "from-blue-500 to-cyan-500",
        },
        {
            icon: Zap,
            title: "SaaS APIs",
            description: "Ready-to-integrate APIs for OTP, analytics, push notifications, and more.",
            link: "/saas",
            color: "from-purple-500 to-pink-500",
        },
        {
            icon: BookOpen,
            title: "Premium Docs",
            description: "Deep-dive technical documentation and architecture guides.",
            link: "/docs",
            color: "from-orange-500 to-red-500",
        },
        {
            icon: Layers,
            title: "Backend Starters",
            description: "Node.js, FastAPI, and NestJS boilerplates with auth and database setup.",
            link: "/templates?category=Full-Stack%20Project",
            color: "from-green-500 to-emerald-500",
        },
    ];

    const mobileTemplates = [
        {
            title: "React Native Starter Pro",
            description: "TypeScript, Redux, Navigation, Auth ready",
            image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=400",
            price: "$99",
            rating: 4.9,
            reviews: 47,
        },
        {
            title: "Flutter E-Commerce App",
            description: "Complete shopping app with payment integration",
            image: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=400",
            price: "$149",
            rating: 4.8,
            reviews: 32,
        },
        {
            title: "Social Media App Kit",
            description: "Posts, stories, messaging, notifications",
            image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400",
            price: "$129",
            rating: 4.7,
            reviews: 28,
        },
    ];

    const tools = [
        {
            icon: Bell,
            title: "Push Notification API",
            description: "Send push notifications to iOS & Android",
            status: "Available",
        },
        {
            icon: BarChart2,
            title: "Analytics SDK",
            description: "Track user behavior and events",
            status: "Available",
        },
        {
            icon: Shield,
            title: "Auth API",
            description: "JWT, OAuth, 2FA authentication",
            status: "Available",
        },
        {
            icon: Rocket,
            title: "CI/CD Templates",
            description: "GitHub Actions for mobile apps",
            status: "Coming Soon",
        },
    ];

    const resources = [
        {
            title: "React Native Performance Guide",
            category: "Documentation",
            reading_time: "25 min",
        },
        {
            title: "Flutter State Management Deep Dive",
            category: "Documentation",
            reading_time: "30 min",
        },
        {
            title: "Mobile App Architecture Patterns",
            category: "Guide",
            reading_time: "40 min",
        },
        {
            title: "Publishing to App Store & Play Store",
            category: "Tutorial",
            reading_time: "20 min",
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]" />
                </div>

                <div className="relative max-w-6xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm mb-6">
                            <Smartphone className="w-4 h-4" />
                            For App Developers
                        </div>
                        <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 text-foreground">
                            Developer{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-500">
                                Hub
                            </span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            Everything you need to build, ship, and scale mobile and web applications.
                            Templates, APIs, documentation, and tools.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                to="/templates"
                                className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center gap-2"
                            >
                                Browse Templates
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/saas"
                                className="px-8 py-4 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl font-semibold transition-colors flex items-center gap-2 border border-white/10"
                            >
                                <Zap className="w-5 h-5" />
                                Explore APIs
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        to={feature.link}
                                        className="block h-full p-6 glass-card-hover rounded-2xl group"
                                    >
                                        <div className={`inline-block p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm">{feature.description}</p>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Mobile Templates Section */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-display font-bold mb-2 text-foreground">Mobile App Templates</h2>
                            <p className="text-muted-foreground">
                                Production-ready React Native & Flutter templates
                            </p>
                        </div>
                        <Link
                            to="/templates?category=Mobile%20App"
                            className="hidden md:flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                        >
                            View All
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {mobileTemplates.map((template, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group"
                            >
                                <div className="glass-card-hover rounded-2xl overflow-hidden">
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={template.image}
                                            alt={template.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-4 right-4">
                                            <span className="px-3 py-1 bg-background/90 backdrop-blur-sm text-foreground rounded-lg text-sm font-bold border border-white/10">
                                                {template.price}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold mb-2 text-foreground">{template.title}</h3>
                                        <p className="text-muted-foreground text-sm mb-4">
                                            {template.description}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span className="text-foreground">{template.rating}</span>
                                            <span>•</span>
                                            <span>{template.reviews} reviews</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Developer Tools */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-display font-bold mb-4 text-foreground">Developer Tools & APIs</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Integrate powerful APIs into your applications with just a few lines of code
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {tools.map((tool, index) => {
                            const Icon = tool.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="glass-card rounded-2xl p-6"
                                >
                                    <Icon className="w-10 h-10 text-primary mb-4" />
                                    <h3 className="text-lg font-bold mb-2 text-foreground">{tool.title}</h3>
                                    <p className="text-muted-foreground text-sm mb-4">{tool.description}</p>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${tool.status === "Available"
                                            ? "bg-green-500/20 text-green-500"
                                            : "bg-yellow-500/20 text-yellow-500"
                                            }`}
                                    >
                                        {tool.status}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="text-center mt-10">
                        <Link
                            to="/saas"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/25"
                        >
                            View All APIs
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Resources */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-display font-bold mb-2 text-foreground">Learning Resources</h2>
                            <p className="text-muted-foreground">
                                Guides and documentation to level up your skills
                            </p>
                        </div>
                        <Link
                            to="/docs"
                            className="hidden md:flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                        >
                            Browse All Docs
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {resources.map((resource, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    to="/docs"
                                    className="flex items-center justify-between p-6 glass-card-hover rounded-xl"
                                >
                                    <div>
                                        <span className="text-xs text-primary mb-1 block font-medium">
                                            {resource.category}
                                        </span>
                                        <h3 className="font-semibold text-foreground">{resource.title}</h3>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {resource.reading_time}
                                    </span>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-3xl p-12 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-pink-500/10 pointer-events-none" />
                        <div className="relative z-10">
                            <Github className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                            <h2 className="text-3xl font-display font-bold mb-4 text-foreground">Start Building Today</h2>
                            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                                Get instant access to templates, APIs, and documentation.
                                Join thousands of developers building amazing apps.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link
                                    to="/register"
                                    className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all"
                                >
                                    Create Free Account
                                </Link>
                                <Link
                                    to="/templates"
                                    className="px-8 py-4 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl font-semibold transition-colors border border-white/10"
                                >
                                    Browse Templates
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default DeveloperHub;
