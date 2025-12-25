import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Zap,
    Code,
    ChevronRight,
    Star,
    Package,
    FileText
} from 'lucide-react';
import ProductHeader from '../components/ProductHeader';
import TemplateCarousel from '../components/TemplateCarousel';
import TemplateDetails from '../components/TemplateDetails';
import { templates } from '../data/templates';
import { useProduct } from '../hooks/useQueries';

// Ecosystem Links Component
const EcosystemSection = ({ product }) => {
    // Map product categories to related resources
    const relatedDocs = [
        {
            title: 'Architecture & Setup Guide',
            description: 'Learn best practices for setting up this template',
            slug: 'react-native-architecture',
            icon: BookOpen,
            isPro: false
        },
        {
            title: 'Payment Integration Handbook',
            description: 'Add Stripe or Razorpay to your project',
            slug: 'saas-payment-integration',
            icon: FileText,
            isPro: true
        }
    ];

    const relatedTools = [
        {
            name: 'ImageOptimizer API',
            description: 'Compress & optimize images automatically',
            slug: 'image-optimizer',
            icon: '🖼️',
            isFree: true
        },
        {
            name: 'CodeFormatter API',
            description: 'Format code in 20+ languages',
            slug: 'code-formatter',
            icon: '✨',
            isFree: true
        }
    ];

    return (

        <div className="bg-background py-20 border-t border-white/5 relative overflow-hidden">
            {/* Simple Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm mb-6 font-semibold shadow-gloss">
                        <Zap className="w-4 h-4 fill-current" />
                        Ecosystem Resources
                    </div>
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground tracking-tight mb-4">
                        Power Up Your Project
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-medium">
                        This template connects seamlessly with our Premium Docs and Developer APIs
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Related Documentation */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-card/20 backdrop-blur-3xl shadow-2xl rounded-[2rem] p-8 border border-white/5 flex flex-col h-full hover:border-primary/20 transition-colors"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                                <BookOpen className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-foreground">Premium Docs</h3>
                                <p className="text-muted-foreground font-medium">Deep-dive documentation</p>
                            </div>
                        </div>

                        <div className="space-y-4 flex-1">
                            {relatedDocs.map((doc, index) => (
                                <Link
                                    key={index}
                                    to={`/docs/${doc.slug}`}
                                    className="block p-4 bg-card/40 rounded-xl hover:bg-card/80 transition-all group border border-white/5 hover:border-primary/30"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-background rounded-lg shadow-sm border border-white/10 text-primary">
                                            <doc.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
                                                    {doc.title}
                                                </h4>
                                                {doc.isPro && (
                                                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full border border-primary/20">
                                                        Pro
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground font-medium mt-1">{doc.description}</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <Link
                            to="/docs"
                            className="mt-8 flex items-center justify-center gap-2 w-full py-4 bg-card hover:bg-muted text-foreground rounded-xl transition-all font-bold border border-white/10"
                        >
                            <BookOpen className="w-4 h-4" />
                            Explore All Docs
                        </Link>
                    </motion.div>

                    {/* Developer APIs / SaaS Tools */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-card/20 backdrop-blur-3xl shadow-2xl rounded-[2rem] p-8 border border-white/5 flex flex-col h-full hover:border-blue-500/20 transition-colors"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                <Code className="w-8 h-8 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-foreground">Developer APIs</h3>
                                <p className="text-muted-foreground font-medium">Supercharge your project</p>
                            </div>
                        </div>

                        <div className="space-y-4 flex-1">
                            {relatedTools.map((tool, index) => (
                                <Link
                                    key={index}
                                    to={`/saas`}
                                    className="block p-4 bg-card/40 rounded-xl hover:bg-card/80 transition-all group border border-white/5 hover:border-blue-500/30"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-background rounded-lg shadow-sm border border-white/10 text-xl">
                                            {tool.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-foreground group-hover:text-blue-500 transition-colors">
                                                    {tool.name}
                                                </h4>
                                                {tool.isFree && (
                                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-500/20">
                                                        Free
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground font-medium mt-1">{tool.description}</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <Link
                            to="/saas"
                            className="mt-8 flex items-center justify-center gap-2 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-bold shadow-lg shadow-blue-600/20"
                        >
                            <Code className="w-4 h-4" />
                            Explore All APIs
                        </Link>
                    </motion.div>
                </div>

                {/* CTA Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 bg-card rounded-[2.5rem] p-12 border border-white/10 shadow-2xl relative overflow-hidden text-center"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] opacity-60 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-4 py-1.5 rounded-full text-sm font-bold mb-6 border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                            <Star className="w-4 h-4 fill-current" />
                            Pro Subscription
                        </div>

                        <h3 className="text-3xl md:text-4xl font-display font-black text-foreground mb-4 tracking-tight">
                            Unlock Everything with Pro
                        </h3>
                        <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-lg leading-relaxed">
                            Get unlimited access to all templates, premium docs, SaaS APIs, and priority support.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                to="/app-developers"
                                className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold hover:shadow-lg hover:shadow-primary/20 transition-all hover:-translate-y-1"
                            >
                                View Pro Plans
                            </Link>
                            <Link
                                to="/app-developers"
                                className="px-8 py-4 bg-secondary text-foreground border border-white/10 rounded-full font-bold hover:bg-secondary/80 transition-all"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const TemplatesDetailsPage = () => {
    const { id } = useParams();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const { data: template, isLoading, isError } = useProduct(id);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
                    <p className="text-muted-foreground">Loading product...</p>
                </div>
            </div>
        );
    }

    if (isError || !template) {
        const fallback = templates.find(t => t.id === Number(id) || t.id === id);

        if (!fallback) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                    <Package className="w-16 h-16 text-muted-foreground mb-4" />
                    <h2 className="text-3xl font-bold mb-4 text-foreground">Product not found</h2>
                    <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
                    <Link to="/templates" className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors">
                        Browse Products
                    </Link>
                </div>
            );
        }

        return (
            <div>
                <ProductHeader product={fallback} />
                <TemplateCarousel />
                <TemplateDetails
                    description={fallback.longDescription || fallback.description}
                    features={fallback.features}
                    pages={fallback.pages}
                />
                <EcosystemSection product={fallback} />
            </div>
        );
    }

    return (
        <div>
            <ProductHeader product={template} />
            <TemplateCarousel />
            <TemplateDetails
                description={template.longDescription || template.description}
                features={template.features}
                pages={template.pages}
            />
            <EcosystemSection product={template} />
        </div>
    );
}

export default TemplatesDetailsPage;