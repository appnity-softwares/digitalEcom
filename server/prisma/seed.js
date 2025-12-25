const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...\n');

    // Clear existing data
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.apiKey.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.premiumDoc.deleteMany();
    await prisma.saasTool.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    // Create Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@codestudio.dev',
            password: hashedPassword,
            role: 'ADMIN',
        }
    });
    console.log('✅ Created admin user: admin@codestudio.dev / admin123');

    // Create Demo User
    const demoUser = await prisma.user.create({
        data: {
            name: 'John Developer',
            email: 'demo@example.com',
            password: await bcrypt.hash('demo123', 10),
            role: 'USER',
        }
    });
    console.log('✅ Created demo user: demo@example.com / demo123');

    // ========== PRODUCTS ==========
    const products = await prisma.product.createMany({
        data: [
            // UI Kits
            {
                title: 'Aurora UI Kit',
                slug: 'aurora-ui-kit',
                description: 'A stunning glassmorphism UI kit with 200+ components, dark mode, and Figma source files. Perfect for modern SaaS dashboards.',
                price: 79,
                image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
                category: 'UI Kits',
                productType: 'UI_KIT',
                tags: ['glassmorphism', 'dark-mode', 'figma', 'dashboard'],
                features: ['200+ Components', 'Dark & Light Mode', 'Figma Source', 'React + Tailwind', 'TypeScript Ready'],
                techStack: ['React', 'Tailwind CSS', 'TypeScript', 'Figma'],
                rating: 4.9,
                numReviews: 124,
                numSales: 856,
                isActive: true,
            },
            {
                title: 'Starter Design System',
                slug: 'starter-design-system',
                description: 'Complete design system with tokens, components, and patterns. Built for scalability.',
                price: 149,
                image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
                category: 'UI Kits',
                productType: 'UI_KIT',
                tags: ['design-system', 'tokens', 'scalable'],
                features: ['Design Tokens', 'Component Library', 'Documentation', 'Storybook'],
                techStack: ['React', 'Styled Components', 'Storybook'],
                rating: 4.8,
                numReviews: 89,
                numSales: 432,
                isActive: true,
            },
            // Templates
            {
                title: 'SaaS Landing Page Template',
                slug: 'saas-landing-template',
                description: 'High-converting landing page template for SaaS products. Includes pricing, features, testimonials, and FAQ sections.',
                price: 49,
                image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
                category: 'Templates',
                productType: 'TEMPLATE',
                tags: ['landing-page', 'saas', 'conversion'],
                features: ['Responsive Design', 'SEO Optimized', 'Animations', 'CMS Ready'],
                techStack: ['Next.js', 'Tailwind CSS', 'Framer Motion'],
                rating: 4.7,
                numReviews: 234,
                numSales: 1245,
                isActive: true,
            },
            {
                title: 'E-Commerce Starter',
                slug: 'ecommerce-starter',
                description: 'Complete e-commerce template with cart, checkout, product pages, and admin dashboard.',
                price: 129,
                image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
                category: 'Templates',
                productType: 'TEMPLATE',
                tags: ['ecommerce', 'cart', 'checkout', 'admin'],
                features: ['Product Pages', 'Cart & Checkout', 'Admin Panel', 'Stripe Integration'],
                techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
                rating: 4.9,
                numReviews: 178,
                numSales: 934,
                isActive: true,
            },
            // Boilerplates
            {
                title: 'Full-Stack SaaS Boilerplate',
                slug: 'fullstack-saas-boilerplate',
                description: 'Production-ready SaaS starter with auth, billing, teams, and admin. Save months of development time.',
                price: 299,
                image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80',
                category: 'Boilerplates',
                productType: 'BOILERPLATE',
                tags: ['saas', 'auth', 'billing', 'teams'],
                features: ['Authentication', 'Stripe Billing', 'Team Management', 'Admin Dashboard', 'Email Templates', 'API Routes'],
                techStack: ['Next.js', 'Prisma', 'PostgreSQL', 'Stripe', 'Tailwind'],
                rating: 5.0,
                numReviews: 67,
                numSales: 289,
                isActive: true,
            },
            {
                title: 'React Native Mobile Starter',
                slug: 'react-native-starter',
                description: 'Cross-platform mobile app boilerplate with navigation, auth, state management, and push notifications.',
                price: 199,
                image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
                category: 'Boilerplates',
                productType: 'MOBILE_APP',
                tags: ['react-native', 'mobile', 'cross-platform'],
                features: ['Authentication', 'Navigation', 'Push Notifications', 'Offline Support', 'Dark Mode'],
                techStack: ['React Native', 'Expo', 'Redux', 'Firebase'],
                rating: 4.8,
                numReviews: 112,
                numSales: 567,
                isActive: true,
            },
            // Icon Packs
            {
                title: 'Phosphor Icons Pro',
                slug: 'phosphor-icons-pro',
                description: '5000+ pixel-perfect icons in 6 styles. SVG, React, Vue, and Figma formats included.',
                price: 39,
                image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
                category: 'Icon Packs',
                productType: 'ICONS',
                tags: ['icons', 'svg', 'react', 'figma'],
                features: ['5000+ Icons', '6 Styles', 'SVG + Components', 'Figma Plugin', 'Regular Updates'],
                techStack: ['SVG', 'React', 'Vue', 'Figma'],
                rating: 4.9,
                numReviews: 456,
                numSales: 2134,
                isActive: true,
            },
            // Code Utilities
            {
                title: 'React Hooks Collection',
                slug: 'react-hooks-collection',
                description: '50+ custom React hooks for common use cases. TypeScript, tested, and well-documented.',
                price: 29,
                image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
                category: 'Code Utilities',
                productType: 'CODE_UTILITY',
                tags: ['react', 'hooks', 'typescript', 'utilities'],
                features: ['50+ Hooks', 'TypeScript', 'Unit Tested', 'Tree-shakeable', 'SSR Compatible'],
                techStack: ['React', 'TypeScript', 'Jest'],
                rating: 4.7,
                numReviews: 89,
                numSales: 678,
                isActive: true,
            },
        ]
    });
    console.log(`✅ Created ${products.count} products`);

    // ========== PREMIUM DOCS ==========
    const docs = await prisma.premiumDoc.createMany({
        data: [
            {
                title: 'Production-Grade React Native Architecture',
                slug: 'react-native-architecture',
                description: 'Complete guide to building scalable React Native apps with clean architecture, state management, and CI/CD.',
                content: '# React Native Architecture\n\nThis comprehensive guide covers...',
                category: 'React Native',
                price: 39,
                thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
                difficulty: 'advanced',
                readingTimeMinutes: 45,
                views: 2341,
                isPublished: true,
                requiresSubscription: false,
            },
            {
                title: 'SaaS Payment Integration Handbook',
                slug: 'saas-payment-integration',
                description: 'Deep dive into Stripe & Razorpay integration with webhooks, subscriptions, and error handling.',
                content: '# Payment Integration\n\nLearn how to integrate payments...',
                category: 'Payments',
                price: 49,
                thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
                difficulty: 'intermediate',
                readingTimeMinutes: 60,
                views: 1567,
                isPublished: true,
                requiresSubscription: true,
            },
            {
                title: 'Monorepo Architecture with Turborepo',
                slug: 'monorepo-turborepo',
                description: 'Structure and manage enterprise monorepos with Turborepo for maximum efficiency.',
                content: '# Monorepo Architecture\n\nTurborepo enables...',
                category: 'Architecture',
                price: 0,
                thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80',
                difficulty: 'intermediate',
                readingTimeMinutes: 30,
                views: 892,
                isPublished: true,
                requiresSubscription: false,
            },
            {
                title: 'Next.js 14 App Router Deep Dive',
                slug: 'nextjs-app-router',
                description: 'Master the new Next.js App Router with server components, streaming, and advanced patterns.',
                content: '# Next.js App Router\n\nThe App Router represents...',
                category: 'Next.js',
                price: 29,
                thumbnail: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&q=80',
                difficulty: 'intermediate',
                readingTimeMinutes: 40,
                views: 3421,
                isPublished: true,
                requiresSubscription: false,
            },
        ]
    });
    console.log(`✅ Created ${docs.count} premium docs`);

    // ========== SAAS TOOLS ==========
    const tools = await prisma.saasTool.createMany({
        data: [
            {
                name: 'ImageOptimizer API',
                slug: 'image-optimizer',
                description: 'Automatically compress, resize, and convert images with our fast API. WebP, AVIF, and format detection.',
                category: 'Media',
                apiEndpoint: '/api/v1/optimize',
                monthlyPrice: 0,
                requestsPerMonth: 1000,
                icon: '🖼️',
                features: ['Auto-compression', 'Format conversion', 'Resize on-the-fly', 'CDN delivery', 'Batch processing'],
                documentation: '## Image Optimizer API\n\nEndpoint: POST /api/v1/optimize',
                isActive: true,
                activeUsers: 2341,
                totalRequests: 45678900,
            },
            {
                name: 'CodeFormatter API',
                slug: 'code-formatter',
                description: 'Format code in 20+ languages via API. Supports Prettier, Black, and language-specific formatters.',
                category: 'Developer Tools',
                apiEndpoint: '/api/v1/format',
                monthlyPrice: 0,
                requestsPerMonth: 500,
                icon: '✨',
                features: ['20+ Languages', 'Prettier integration', 'Custom configs', 'Syntax validation', 'Diff output'],
                documentation: '## Code Formatter API\n\nEndpoint: POST /api/v1/format',
                isActive: true,
                activeUsers: 1234,
                totalRequests: 12345678,
            },
            {
                name: 'EmailValidator Pro',
                slug: 'email-validator',
                description: 'Validate emails with syntax check, MX lookup, disposable detection, and deliverability scoring.',
                category: 'Validation',
                apiEndpoint: '/api/v1/validate-email',
                monthlyPrice: 19,
                requestsPerMonth: 10000,
                icon: '📧',
                features: ['Syntax validation', 'MX record check', 'Disposable detection', 'Deliverability score', 'Bulk validation'],
                documentation: '## Email Validator API\n\nEndpoint: POST /api/v1/validate-email',
                isActive: true,
                activeUsers: 567,
                totalRequests: 8901234,
            },
            {
                name: 'PDFGenerator API',
                slug: 'pdf-generator',
                description: 'Generate PDFs from HTML, Markdown, or templates. Headers, footers, and custom styling supported.',
                category: 'Documents',
                apiEndpoint: '/api/v1/generate-pdf',
                monthlyPrice: 29,
                requestsPerMonth: 5000,
                icon: '📄',
                features: ['HTML to PDF', 'Markdown support', 'Custom templates', 'Headers/footers', 'Watermarks'],
                documentation: '## PDF Generator API\n\nEndpoint: POST /api/v1/generate-pdf',
                isActive: true,
                activeUsers: 890,
                totalRequests: 5678901,
            },
        ]
    });
    console.log(`✅ Created ${tools.count} SaaS tools`);

    // Create subscription for demo user
    await prisma.subscription.create({
        data: {
            userId: demoUser.id,
            planName: 'PRO',
            billingCycle: 'MONTHLY',
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            features: ['Unlimited templates', 'All UI kits', 'Premium Docs', 'Priority support'],
        }
    });
    console.log('✅ Created demo user subscription');

    console.log('\n🎉 Seeding complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Admin:  admin@codestudio.dev / admin123');
    console.log('  Demo:   demo@example.com / demo123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
