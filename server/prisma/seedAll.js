const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding all dynamic content...\n');

    // Clear existing data
    await prisma.template.deleteMany();
    await prisma.templateCategory.deleteMany();
    await prisma.doc.deleteMany();
    await prisma.docCategory.deleteMany();
    await prisma.aPITool.deleteMany();
    await prisma.toolCategory.deleteMany();
    await prisma.mobileApp.deleteMany();
    await prisma.appCategory.deleteMany();

    // TEMPLATES
    console.log('📄 Seeding Templates...');
    const templateCategories = await prisma.templateCategory.createMany({
        data: [
            { name: 'all', label: 'All Templates', icon: 'Layout', gradient: 'from-blue-500 to-cyan-500', order: 0 },
            { name: 'landing', label: 'Landing Pages', icon: 'Rocket', gradient: 'from-purple-500 to-pink-500', order: 1 },
            { name: 'dashboard', label: 'Dashboards', icon: 'BarChart', gradient: 'from-green-500 to-emerald-500', order: 2 },
            { name: 'ecommerce', label: 'E-commerce', icon: 'ShoppingCart', gradient: 'from-orange-500 to-red-500', order: 3 },
            { name: 'portfolio', label: 'Portfolio', icon: 'Briefcase', gradient: 'from-indigo-500 to-purple-500', order: 4 },
        ]
    });

    const landingCat = await prisma.templateCategory.findUnique({ where: { name: 'landing' } });
    const dashCat = await prisma.templateCategory.findUnique({ where: { name: 'dashboard' } });
    
    await prisma.template.createMany({
        data: [
            {
                title: 'SaaS Landing Pro',
                description: 'Modern SaaS landing page with pricing, features, and testimonials',
                price: 49,
                features: ['Responsive Design', 'Dark Mode', 'Animations', 'SEO Optimized'],
                techStack: ['React', 'Tailwind', 'Framer Motion'],
                categoryId: landingCat.id,
                tags: ['saas', 'landing', 'modern'],
                isFeatured: true,
                views: 1250,
                downloads: 89,
                rating: 4.8,
                ratingCount: 45
            },
            {
                title: 'Analytics Dashboard',
                description: 'Complete analytics dashboard with charts and real-time data',
                price: 79,
                features: ['Charts', 'Real-time Updates', 'Export Data', 'Custom Widgets'],
                techStack: ['React', 'Chart.js', 'Redux'],
                categoryId: dashCat.id,
                tags: ['dashboard', 'analytics', 'charts'],
                isFeatured: true,
                views: 980,
                downloads: 67,
                rating: 4.9,
                ratingCount: 38
            }
        ]
    });

    // DOCS
    console.log('📚 Seeding Docs...');
    const docCategories = await prisma.docCategory.createMany({
        data: [
            { name: 'all', label: 'All Docs', icon: 'BookOpen', gradient: 'from-blue-500 to-cyan-500', order: 0 },
            { name: 'getting-started', label: 'Getting Started', icon: 'Zap', gradient: 'from-green-500 to-emerald-500', order: 1 },
            { name: 'api', label: 'API Reference', icon: 'Code', gradient: 'from-purple-500 to-pink-500', order: 2 },
            { name: 'tutorials', label: 'Tutorials', icon: 'GraduationCap', gradient: 'from-orange-500 to-red-500', order: 3 },
        ]
    });

    const gettingStartedCat = await prisma.docCategory.findUnique({ where: { name: 'getting-started' } });
    const apiCat = await prisma.docCategory.findUnique({ where: { name: 'api' } });

    await prisma.doc.createMany({
        data: [
            {
                title: 'Quick Start Guide',
                description: 'Get up and running in 5 minutes',
                content: '# Quick Start\n\nFollow these steps to get started...',
                author: 'Dev Team',
                readTime: 5,
                difficulty: 'Beginner',
                categoryId: gettingStartedCat.id,
                tags: ['quickstart', 'beginner', 'setup'],
                isFeatured: true,
                views: 5420,
                likes: 234
            },
            {
                title: 'Authentication API',
                description: 'Complete guide to authentication endpoints',
                content: '# Authentication\n\n## Endpoints\n\n### POST /api/auth/login...',
                author: 'API Team',
                readTime: 12,
                difficulty: 'Intermediate',
                categoryId: apiCat.id,
                tags: ['api', 'auth', 'security'],
                isFeatured: true,
                views: 3210,
                likes: 189
            }
        ]
    });

    // API TOOLS
    console.log('🔧 Seeding API Tools...');
    const toolCategories = await prisma.toolCategory.createMany({
        data: [
            { name: 'all', label: 'All Tools', icon: 'Wrench', gradient: 'from-blue-500 to-cyan-500', order: 0 },
            { name: 'image', label: 'Image Processing', icon: 'Image', gradient: 'from-purple-500 to-pink-500', order: 1 },
            { name: 'data', label: 'Data Conversion', icon: 'Database', gradient: 'from-green-500 to-emerald-500', order: 2 },
            { name: 'ai', label: 'AI/ML', icon: 'Brain', gradient: 'from-orange-500 to-red-500', order: 3 },
        ]
    });

    const imageCat = await prisma.toolCategory.findUnique({ where: { name: 'image' } });
    const dataCat = await prisma.toolCategory.findUnique({ where: { name: 'data' } });

    await prisma.aPITool.createMany({
        data: [
            {
                name: 'Image Resize',
                description: 'Resize images to any dimension',
                endpoint: '/api/image/resize',
                method: 'POST',
                parameters: { url: 'string', width: 'number', height: 'number' },
                responseFormat: { success: 'boolean', url: 'string' },
                exampleRequest: '{"url": "https://example.com/image.jpg", "width": 800, "height": 600}',
                exampleResponse: '{"success": true, "url": "https://cdn.example.com/resized.jpg"}',
                categoryId: imageCat.id,
                tags: ['image', 'resize', 'transform'],
                isFeatured: true,
                apiCalls: 15420
            },
            {
                name: 'JSON to CSV',
                description: 'Convert JSON data to CSV format',
                endpoint: '/api/convert/json-to-csv',
                method: 'POST',
                parameters: { data: 'array', delimiter: 'string' },
                responseFormat: { success: 'boolean', csv: 'string' },
                exampleRequest: '{"data": [{"name": "John", "age": 30}], "delimiter": ","}',
                exampleResponse: '{"success": true, "csv": "name,age\\nJohn,30"}',
                categoryId: dataCat.id,
                tags: ['convert', 'json', 'csv'],
                isFeatured: true,
                apiCalls: 8930
            }
        ]
    });

    // MOBILE APPS
    console.log('📱 Seeding Mobile Apps...');
    const appCategories = await prisma.appCategory.createMany({
        data: [
            { name: 'all', label: 'All Apps', icon: 'Smartphone', gradient: 'from-blue-500 to-cyan-500', order: 0 },
            { name: 'ios', label: 'iOS', icon: 'Apple', gradient: 'from-gray-700 to-gray-900', order: 1 },
            { name: 'android', label: 'Android', icon: 'Smartphone', gradient: 'from-green-500 to-emerald-500', order: 2 },
            { name: 'cross-platform', label: 'Cross-Platform', icon: 'Layers', gradient: 'from-purple-500 to-pink-500', order: 3 },
        ]
    });

    const iosCat = await prisma.appCategory.findUnique({ where: { name: 'ios' } });
    const crossCat = await prisma.appCategory.findUnique({ where: { name: 'cross-platform' } });

    await prisma.mobileApp.createMany({
        data: [
            {
                name: 'E-commerce iOS',
                description: 'Complete e-commerce app for iOS with payment integration',
                platform: 'iOS',
                price: 99,
                features: ['Product Catalog', 'Cart', 'Payment Gateway', 'Push Notifications'],
                techStack: ['Swift', 'SwiftUI', 'Firebase'],
                categoryId: iosCat.id,
                tags: ['ecommerce', 'ios', 'shopping'],
                isFeatured: true,
                views: 2340,
                downloads: 156,
                rating: 4.7,
                ratingCount: 89
            },
            {
                name: 'Social Media App',
                description: 'Cross-platform social media app built with React Native',
                platform: 'Cross-platform',
                price: 129,
                features: ['Feed', 'Stories', 'Chat', 'Live Streaming'],
                techStack: ['React Native', 'Redux', 'Socket.io'],
                categoryId: crossCat.id,
                tags: ['social', 'react-native', 'chat'],
                isFeatured: true,
                views: 3120,
                downloads: 198,
                rating: 4.9,
                ratingCount: 124
            }
        ]
    });

    console.log('\n✅ All dynamic content seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
