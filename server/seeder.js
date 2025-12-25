const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();
connectDB();

const marketplaceProducts = [
    // FULL-STACK PROJECTS
    {
        title: "SaaS Starter Kit Pro",
        productType: "fullstack",
        category: "Full-Stack Project",
        price: "$199",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
        images: [
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Complete SaaS platform with authentication, billing, multi-tenancy, and admin dashboard. Production-ready in minutes.",
        longDescription: "The ultimate SaaS starter kit with everything you need: user authentication (email, Google, GitHub), Stripe billing integration, team management, role-based permissions, admin dashboard, email notifications, and more. Built with modern best practices and ready to customize for your specific use case.",
        techStack: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind", "Node.js"],
        hasBackend: true,
        hasFrontend: true,
        hasDatabase: true,
        hasTests: true,
        testCoverage: 85,
        rating: 4.9,
        numReviews: 47,
        numSales: 234,
        isBestseller: true,
        isFeatured: true,
        features: [
            "Complete Authentication System",
            "Stripe Billing Integration",
            "Multi-tenant Architecture",
            "Admin Dashboard",
            "Email Notifications",
            "Role-based Permissions",
            "API Documentation",
            "Deployment Scripts"
        ],
        liveDemo: "https://saas-demo.flowgrid.dev",
        documentation: {
            setup: "# Setup Guide\n\n1. Clone repository\n2. Install dependencies: npm install\n3. Configure .env file\n4. Run migrations: npm run migrate\n5. Start dev server: npm run dev",
            deployment: "Deploy to Vercel, Railway, or AWS with one click",
            videoUrl: "https://youtube.com/watch?v=demo"
        },
        tags: ["saas", "starter-kit", "production-ready", "stripe", "authentication"],
        countInStock: 999
    },
    {
        title: "E-Commerce Platform",
        productType: "fullstack",
        category: "Full-Stack Project",
        price: "$249",
        image: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=800",
        description: "Complete e-commerce solution with shopping cart, checkout, payment processing, admin panel, and order management.",
        longDescription: "Build your online store instantly with this complete e-commerce platform. Includes product catalog, shopping cart, secure checkout, payment gateway integration, admin dashboard for managing products and orders, email notifications, and customer accounts.",
        techStack: ["React", "Node.js", "MongoDB", "Express", "Tailwind"],
        hasBackend: true,
        hasFrontend: true,
        hasDatabase: true,
        hasTests: true,
        testCoverage: 78,
        rating: 4.7,
        numReviews: 89,
        numSales: 456,
        isBestseller: true,
        features: [
            "Product Management",
            "Shopping Cart",
            "Payment Integration",
            "Order Tracking",
            "Admin Dashboard",
            "User Reviews",
            "Wishlist",
            "Email Notifications"
        ],
        liveDemo: "https://shop-demo.flowgrid.dev",
        tags: ["ecommerce", "shopping", "store", "marketplace"],
        countInStock: 999
    },
    {
        title: "Social Media Platform",
        productType: "fullstack",
        category: "Full-Stack Project",
        price: "$179",
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800",
        description: "Full-featured social network with posts, comments, likes, follows, real-time notifications, and messaging.",
        longDescription: "Create your own social platform with this complete codebase. Features include user profiles, post creation with media uploads, commenting system, likes and reactions, follower/following system, real-time notifications, direct messaging, and a beautiful responsive UI.",
        techStack: ["React", "Node.js", "MongoDB", "Express", "Tailwind"],
        hasBackend: true,
        hasFrontend: true,
        hasDatabase: true,
        rating: 4.8,
        numReviews: 62,
        numSales: 178,
        isTrending: true,
        features: [
            "User Profiles",
            "Posts & Media",
            "Comments & Likes",
            "Follow System",
            "Real-time Notifications",
            "Direct Messaging",
            "Search & Discovery",
            "Responsive Design"
        ],
        liveDemo: "https://social-demo.flowgrid.dev",
        tags: ["social", "messaging", "real-time", "community"],
        countInStock: 999
    },

    // API COLLECTIONS
    {
        title: "Authentication API Complete",
        productType: "api",
        category: "API Collection",
        price: "$49",
        image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=800",
        description: "Production-ready authentication API with JWT, OAuth, 2FA, email verification, and password reset.",
        longDescription: "Save weeks of development with this battle-tested authentication API. Includes JWT token management, OAuth integration (Google, GitHub, Facebook), two-factor authentication, email verification, password reset, rate limiting, and security best practices.",
        techStack: ["Node.js", "Express", "MongoDB"],
        hasBackend: true,
        hasDatabase: true,
        hasTests: true,
        testCoverage: 92,
        rating: 5.0,
        numReviews: 124,
        numSales: 567,
        isBestseller: true,
        isFeatured: true,
        features: [
            "JWT Authentication",
            "OAuth 2.0 (Google, GitHub)",
            "Two-Factor Authentication",
            "Email Verification",
            "Password Reset",
            "Rate Limiting",
            "Refresh Tokens",
            "API Documentation"
        ],
        documentation: {
            apiDocs: "Complete Swagger/OpenAPI documentation included"
        },
        tags: ["authentication", "api", "jwt", "oauth", "security"],
        countInStock: 999
    },
    {
        title: "Payment Processing API",
        productType: "api",
        category: "API Collection",
        price: "$59",
        image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=800",
        description: "Complete payment API with Stripe integration, subscription management, webhooks, and invoice generation.",
        longDescription: "Handle payments like a pro with this comprehensive payment API. Supports one-time payments, subscriptions, payment plans, invoice generation, refunds, and webhook handling. Fully integrated with Stripe and ready to extend to other payment providers.",
        techStack: ["Node.js", "Express", "PostgreSQL"],
        hasBackend: true,
        hasDatabase: true,
        rating: 4.9,
        numReviews: 87,
        numSales: 345,
        isFeatured: true,
        features: [
            "Stripe Integration",
            "One-time Payments",
            "Subscription Management",
            "Webhook Handling",
            "Invoice Generation",
            "Refund Processing",
            "Payment Analytics",
            "Customer Portal"
        ],
        tags: ["payment", "stripe", "billing", "subscription"],
        countInStock: 999
    },

    // COMPONENT LIBRARIES
    {
        title: "Premium UI Components",
        productType: "component",
        category: "Component Library",
        price: "$39",
        image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&q=80&w=800",
        description: "50+ production-ready React components with TypeScript, themes, and animations. Copy-paste and customize.",
        longDescription: "Build beautiful interfaces faster with 50+ carefully crafted components. Includes forms, buttons, modals, data tables, charts, navigation, and more. Fully typed with TypeScript, themeable, accessible, and optimized for performance.",
        techStack: ["React", "TypeScript", "Tailwind"],
        hasFrontend: true,
        hasTests: true,
        testCoverage: 95,
        rating: 4.8,
        numReviews: 156,
        numSales: 789,
        isBestseller: true,
        features: [
            "50+ Components",
            "TypeScript Support",
            "Full Theme System",
            "Dark Mode",
            "Accessibility (WCAG 2.1)",
            "Animations",
            "Responsive Design",
            "Copy-Paste Ready"
        ],
        tags: ["components", "react", "ui", "design-system"],
        countInStock: 999
    },
    {
        title: "Dashboard Pro Components",
        productType: "component",
        category: "Component Library",
        price: "$69",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
        description: "Advanced dashboard components: charts, data tables, analytics widgets, and admin layouts.",
        longDescription: "Everything you need to build a professional dashboard. Includes interactive charts (line, bar, pie, area), advanced data tables with sorting/filtering/pagination, KPI widgets, admin layouts, sidebar navigation, and more.",
        techStack: ["React", "TypeScript", "Tailwind"],
        hasFrontend: true,
        rating: 4.9,
        numReviews: 93,
        numSales: 432,
        isTrending: true,
        features: [
            "Interactive Charts",
            "Data Tables",
            "KPI Widgets",
            "Analytics Components",
            "Admin Layouts",
            "Responsive Sidebars",
            "Real-time Updates",
            "Export to PDF/CSV"
        ],
        tags: ["dashboard", "charts", "analytics", "admin"],
        countInStock: 999
    },

    // MOBILE APPS
    {
        title: "Fitness Tracker App",
        productType: "mobile",
        category: "Mobile App",
        price: "$99",
        image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=800",
        description: "Complete React Native fitness app with workout tracking, nutrition logging, progress charts, and social features.",
        longDescription: "Launch your fitness app in days. Includes workout tracker, exercise library with animations, nutrition logger with barcode scanning, progress charts, goal setting, water tracker, and social features to share achievements.",
        techStack: ["React Native", "Node.js", "MongoDB", "TypeScript"],
        hasBackend: true,
        hasFrontend: true,
        hasMobileApp: true,
        hasDatabase: true,
        rating: 4.7,
        numReviews: 54,
        numSales: 189,
        isNewProduct: true,
        features: [
            "Workout Tracking",
            "Exercise Library",
            "Nutrition Logger",
            "Progress Charts",
            "Goal Setting",
            "Social Sharing",
            "Barcode Scanner",
            "iOS & Android"
        ],
        tags: ["mobile", "fitness", "health", "react-native"],
        countInStock: 999
    },

    // TEMPLATES
    {
        title: "Agency Portfolio Pro",
        productType: "template",
        category: "Agency Template",
        price: "$39",
        image: "https://images.unsplash.com/photo-1542744173-8e7e5341c12be?auto=format&fit=crop&q=80&w=800",
        description: "Modern agency template with portfolio grid, case studies, team profiles, and contact form.",
        longDescription: "Showcase your agency with this stunning template. Features animated hero section, filterable portfolio grid, detailed case study pages, team member profiles, testimonials, blog, and integrated contact form.",
        techStack: ["React", "Next.js", "Tailwind"],
        hasFrontend: true,
        rating: 4.6,
        numReviews: 212,
        numSales: 891,
        isBestseller: true,
        features: [
            "Animated Hero",
            "Portfolio Grid",
            "Case Studies",
            "Team Profiles",
            "Testimonials",
            "Blog",
            "Contact Form",
            "SEO Optimized"
        ],
        pages: ["Home", "About", "Portfolio", "Case Studies", "Team", "Blog", "Contact"],
        liveDemo: "https://agency-demo.flowgrid.dev",
        tags: ["template", "agency", "portfolio", "business"],
        countInStock: 999
    },
    {
        title: "Landing Page Builder",
        productType: "template",
        category: "Landing Page",
        price: "$29",
        image: "https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&q=80&w=800",
        description: "High-converting landing page template with A/B testing, analytics, and email capture.",
        longDescription: "Create landing pages that convert. Includes 10+ pre-built sections, drag-and-drop customization, A/B testing setup, analytics integration, email capture forms, and conversion optimization best practices.",
        techStack: ["React", "Next.js", "Tailwind"],
        hasFrontend: true,
        rating: 4.8,
        numReviews: 167,
        numSales: 678,
        isTrending: true,
        features: [
            "10+ Sections",
            "Drag & Drop",
            "A/B Testing",
            "Analytics",
            "Email Capture",
            "Mobile Optimized",
            "Fast Loading",
            "Conversion Focused"
        ],
        tags: ["landing-page", "marketing", "conversion", "leads"],
        countInStock: 999,
        isFree: false
    },
    // FREE SAMPLE
    {
        title: "Free Starter Template",
        productType: "template",
        category: "Free Template",
        price: "$0",
        image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&q=80&w=800",
        description: "Free responsive template to get started. Perfect for portfolios and small businesses.",
        longDescription: "Try our quality for free! This template includes responsive design, smooth animations, and clean code. Perfect for testing our platform before purchasing premium products.",
        techStack: ["React", "Tailwind"],
        hasFrontend: true,
        rating: 4.5,
        numReviews: 456,
        numSales: 3421,
        isFree: true,
        isNewProduct: true,
        features: [
            "Responsive Design",
            "Clean Code",
            "Basic Animations",
            "Contact Form",
            "SEO Ready"
        ],
        tags: ["free", "template", "starter", "portfolio"],
        countInStock: 999
    }
];

const importData = async () => {
    try {
        await Product.deleteMany();
        await User.deleteMany();

        const createdUser = await User.create({
            name: 'FlowGrid Admin',
            email: 'admin@flowgrid.dev',
            password: 'admin123',
            role: 'admin'
        });

        const adminUser = createdUser._id;

        const sampleProducts = marketplaceProducts.map((product) => {
            return { ...product, user: adminUser };
        });

        await Product.insertMany(sampleProducts);

        console.log('✅ Marketplace Data Imported!');
        console.log(`📦 ${sampleProducts.length} products added`);
        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Product.deleteMany();
        await User.deleteMany();
        console.log('🗑️  Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
