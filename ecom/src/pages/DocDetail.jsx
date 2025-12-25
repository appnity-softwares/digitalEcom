import { useDoc } from "../hooks/useQueries";

const DocDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const { showToast } = useToast();

    const { data, isLoading, isError } = useDoc(id);
    const [showToc, setShowToc] = useState(true);

    const doc = data?.doc;
    const hasAccess = data?.has_access;

    const handlePurchase = () => {
        if (!user) {
            showToast("Please login to purchase", "error");
            navigate("/login");
            return;
        }

        addToCart({
            _id: doc._id,
            title: doc.title,
            price: `$${doc.price}`,
            image: doc.thumbnail,
            category: "Premium Doc",
            type: "doc",
        });

        showToast("Added to cart!", "success");
        navigate("/checkout");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-muted-foreground border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (isError || !doc) {
        // Fallback to demo data if error or doc missing
        const activeDoc = isError ? demoDoc : doc;

        if (!activeDoc) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                        <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-foreground mb-2">Document not found</h2>
                        <Link to="/docs" className="text-primary hover:text-primary/80">
                            Back to Docs
                        </Link>
                    </div>
                </div>
            );
        }
    }

    // Re-assign doc if we are using the real data
    const activeDoc = doc || demoDoc;
    const activeHasAccess = hasAccess || false;

    const difficultyColors = {
        beginner: "bg-green-500/20 text-green-500",
        intermediate: "bg-yellow-500/20 text-yellow-500",
        advanced: "bg-red-500/20 text-red-500",
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-secondary/50 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate("/docs")}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm">
                            {activeDoc.category}
                        </span>
                        <span
                            className={`px-3 py-1 rounded-lg text-sm capitalize ${difficultyColors[activeDoc.difficulty || "intermediate"]
                                }`}
                        >
                            {activeDoc.difficulty}
                        </span>
                    </div>

                    <h1 className="text-4xl font-display font-bold text-foreground mb-4">{activeDoc.title}</h1>

                    <p className="text-xl text-muted-foreground mb-6 max-w-3xl">
                        {activeDoc.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <img
                                src={activeDoc.author?.avatar || "https://via.placeholder.com/32"}
                                alt="Author"
                                className="w-8 h-8 rounded-full"
                            />
                            <span className="text-foreground">{activeDoc.author?.name || "DigitalStudio"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {activeDoc.reading_time_minutes} min read
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {activeDoc.views} views
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* TOC Sidebar */}
                    {activeDoc.table_of_contents?.length > 0 && showToc && (
                        <motion.aside
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="hidden lg:block w-64 flex-shrink-0"
                        >
                            <div className="sticky top-24 glass-card rounded-xl p-6">
                                <div className="flex items-center gap-2 mb-4 text-sm font-bold text-foreground uppercase tracking-wide">
                                    <List className="w-4 h-4" />
                                    Table of Contents
                                </div>
                                <nav className="space-y-3">
                                    {activeDoc.table_of_contents.map((item, index) => (
                                        <a
                                            key={index}
                                            href={`#${item.anchor}`}
                                            className={`block text-sm transition-colors ${item.level === 1
                                                ? "text-foreground font-medium hover:text-primary"
                                                : "text-muted-foreground pl-4 hover:text-foreground"
                                                }`}
                                        >
                                            {item.title}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        </motion.aside>
                    )}

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {activeHasAccess ? (
                            <motion.article
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="prose prose-invert prose-lg max-w-none"
                            >
                                <div className="glass-card rounded-[2rem] p-8 md:p-12">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            h1: ({ children }) => <h1 className="text-4xl font-display font-bold text-foreground mb-6 mt-8 tracking-tight">{children}</h1>,
                                            h2: ({ children }) => <h2 className="text-2xl font-bold text-foreground mb-4 mt-8">{children}</h2>,
                                            h3: ({ children }) => <h3 className="text-xl font-bold text-foreground mb-3 mt-6">{children}</h3>,
                                            p: ({ children }) => <p className="text-muted-foreground mb-6 leading-relaxed bg-transparent">{children}</p>,
                                            ul: ({ children }) => <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">{children}</ul>,
                                            ol: ({ children }) => <ol className="list-decimal list-inside text-muted-foreground mb-6 space-y-2">{children}</ol>,
                                            li: ({ children }) => <li className="text-muted-foreground">{children}</li>,
                                            code: ({ inline, children }) => inline
                                                ? <code className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-sm font-semibold">{children}</code>
                                                : <code className="block bg-background p-6 rounded-2xl overflow-x-auto text-sm text-foreground font-mono my-6 border border-white/10">{children}</code>,
                                            pre: ({ children }) => <pre className="bg-transparent p-0 mb-6">{children}</pre>,
                                            blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-6 italic text-muted-foreground my-8 bg-primary/5 py-4 pr-4 rounded-r-xl">{children}</blockquote>,
                                            a: ({ href, children }) => <a href={href} className="text-primary hover:text-primary/80 underline font-medium">{children}</a>,
                                            strong: ({ children }) => <strong className="text-foreground font-bold">{children}</strong>,
                                            table: ({ children }) => <div className="overflow-x-auto mb-8 rounded-xl border border-white/10"><table className="min-w-full">{children}</table></div>,
                                            th: ({ children }) => <th className="bg-secondary border-b border-white/10 px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">{children}</th>,
                                            td: ({ children }) => <td className="border-b border-white/10 px-6 py-4 text-muted-foreground text-sm">{children}</td>,
                                        }}
                                    >
                                        {activeDoc.content_md || activeDoc.content || ""}
                                    </ReactMarkdown>
                                </div>

                                {/* Download PDF */}
                                {activeDoc.pdf_url && (
                                    <div className="mt-8 p-8 glass-card rounded-[2rem] overflow-hidden relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-pink-500/10 pointer-events-none"></div>
                                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div>
                                                <h3 className="text-xl font-bold mb-2 text-foreground">
                                                    Download PDF Version
                                                </h3>
                                                <p className="text-muted-foreground text-sm">
                                                    Get the complete offline guide with all resources.
                                                </p>
                                            </div>
                                            <a
                                                href={activeDoc.pdf_url}
                                                className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/25 rounded-full font-bold transition-all"
                                            >
                                                <Download className="w-5 h-5" />
                                                Download PDF
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </motion.article>
                        ) : (
                            /* Paywall / Preview */
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {/* Preview Content */}
                                <div className="glass-card rounded-[2rem] p-8 md:p-12 mb-8">
                                    <div
                                        className="prose prose-invert prose-lg max-w-none opacity-50 select-none pointer-events-none blur-[2px]"
                                        dangerouslySetInnerHTML={{
                                            __html: (activeDoc.content_md?.slice(0, 1000) || "") + "...",
                                        }}
                                    />
                                </div>

                                {/* Blur Overlay with CTA */}
                                <div className="relative -mt-64 z-10">
                                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent h-32 -top-32"></div>
                                    <div className="text-center py-16 bg-background">
                                        <div className="inline-block p-4 glass-card rounded-full mb-6 animate-bounce">
                                            <Lock className="w-8 h-8 text-primary" />
                                        </div>
                                        <h2 className="text-3xl font-display font-bold mb-4 text-foreground">
                                            Unlock Full Documentation
                                        </h2>
                                        <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                                            Get instant access to this complete guide including code
                                            examples, best practices, and downloadable resources.
                                        </p>

                                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            <button
                                                onClick={handlePurchase}
                                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold hover:shadow-lg hover:shadow-primary/25 transition-all"
                                            >
                                                <ShoppingCart className="w-5 h-5" />
                                                Purchase for ${activeDoc.price}
                                            </button>

                                            {activeDoc.requires_subscription && (
                                                <Link
                                                    to="/pricing"
                                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-foreground border border-white/10 hover:bg-secondary/80 rounded-full font-bold transition-colors"
                                                >
                                                    Or Subscribe to Pro
                                                </Link>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-center gap-8 mt-10 text-sm text-muted-foreground font-medium">
                                            {[
                                                "Lifetime access",
                                                "Free updates",
                                                "Money-back guarantee",
                                            ].map((feature, i) => (
                                                <span key={i} className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-green-500" />
                                                    </div>
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Related Docs */}
                        {activeDoc.related_docs?.length > 0 && (
                            <div className="mt-20">
                                <h3 className="text-2xl font-display font-bold mb-8 text-foreground">Related Documentation</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {activeDoc.related_docs.map((relDoc) => (
                                        <Link
                                            key={relDoc._id}
                                            to={`/docs/${relDoc._id}`}
                                            className="flex gap-6 p-6 glass-card-hover rounded-[2rem] group"
                                        >
                                            <img
                                                src={relDoc.thumbnail}
                                                alt={relDoc.title}
                                                className="w-24 h-24 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div>
                                                <h4 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors leading-tight">
                                                    {relDoc.title}
                                                </h4>
                                                <p className="text-sm text-muted-foreground">{relDoc.slug}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </main>

                    {/* Right Sidebar - Purchase Card */}
                    <aside className="hidden xl:block w-80 flex-shrink-0">
                        <div className="sticky top-24 glass-card rounded-[2rem] p-8">
                            <div className="text-center mb-8">
                                <div className="text-4xl font-display font-bold mb-2 text-foreground">
                                    {activeDoc.price === 0 ? (
                                        <span className="text-green-500">Free</span>
                                    ) : (
                                        <span>${activeDoc.discount_price || activeDoc.price}</span>
                                    )}
                                </div>
                                {activeDoc.discount_price && activeDoc.discount_price < activeDoc.price && (
                                    <span className="text-muted-foreground line-through font-medium">
                                        ${activeDoc.price}
                                    </span>
                                )}
                            </div>

                            {!activeHasAccess && activeDoc.price > 0 && (
                                <button
                                    onClick={handlePurchase}
                                    className="w-full py-4 bg-primary text-primary-foreground rounded-full font-bold hover:shadow-lg hover:shadow-primary/25 transition-all mb-4"
                                >
                                    Purchase Now
                                </button>
                            )}

                            <div className="flex gap-3 mb-8">
                                <button className="flex-1 py-3 bg-secondary border border-white/10 hover:bg-secondary/80 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </button>
                                <button className="flex-1 py-3 bg-secondary border border-white/10 hover:bg-secondary/80 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
                                    <Bookmark className="w-4 h-4" />
                                    Save
                                </button>
                            </div>

                            <div className="space-y-4 text-sm border-t border-white/10 pt-6">
                                <div className="flex justify-between text-muted-foreground font-medium">
                                    <span>Reading time</span>
                                    <span className="text-foreground">{activeDoc.reading_time_minutes} minutes</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground font-medium">
                                    <span>Difficulty</span>
                                    <span className="capitalize text-foreground">{activeDoc.difficulty}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground font-medium">
                                    <span>Updated</span>
                                    <span className="text-foreground">
                                        {new Date(activeDoc.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default DocDetail;

// Demo data
const demoDoc = {
    _id: "1",
    title: "Production-Grade React Native Boilerplate",
    description:
        "Complete guide to setting up a scalable React Native project with TypeScript, state management, navigation, and CI/CD.",
    content_md: `# Getting Started

This is a preview of the documentation. The full content includes:

## What You'll Learn

- Project structure best practices
- TypeScript configuration
- Navigation setup with React Navigation
- State management with Redux Toolkit
- API integration with React Query
- Testing strategies
- CI/CD pipeline configuration

## Prerequisites

Before starting, make sure you have:

1. Node.js 18+
2. React Native CLI
3. Xcode (for iOS)
4. Android Studio (for Android)

*This is a preview. Purchase to see the full content.*`,
    category: "React Native",
    price: 29,
    thumbnail:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800",
    reading_time_minutes: 45,
    difficulty: "advanced",
    requires_subscription: true,
    views: 1234,
    author: {
        name: "DigitalStudio Team",
        avatar: "https://via.placeholder.com/32",
    },
    table_of_contents: [
        { title: "Getting Started", anchor: "getting-started", level: 1 },
        { title: "What You'll Learn", anchor: "what-youll-learn", level: 2 },
        { title: "Prerequisites", anchor: "prerequisites", level: 2 },
        { title: "Project Setup", anchor: "project-setup", level: 1 },
        { title: "Configuration", anchor: "configuration", level: 1 },
    ],
    related_docs: [],
    createdAt: new Date().toISOString(),
};
