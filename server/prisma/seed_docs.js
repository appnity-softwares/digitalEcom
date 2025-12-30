```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding docs (Dynamic System)...");
  try {
    // 1. Create Categories
    const categories = [
        { name: 'React', label: 'React', icon: 'atom', gradient: 'from-blue-400 to-blue-600' },
        { name: 'Next.js', label: 'Next.js', icon: 'triangle', gradient: 'from-black to-gray-800' },
        { name: 'CSS', label: 'CSS', icon: 'palette', gradient: 'from-pink-400 to-rose-500' },
    ];

    const createdCats = {};
    for (const cat of categories) {
        const c = await prisma.docCategory.upsert({
            where: { name: cat.name },
            update: {},
            create: cat,
        });
        createdCats[cat.name] = c.id;
    }

    // 2. Create Docs
    // Check if docs exist
    const count = await prisma.doc.count();
    if (count > 0) {
        console.log("Docs already exist, skipping custom seed.");
    } else {
        await prisma.doc.createMany({
        data: [
            {
                title: 'React Performance Optimization',
                description: 'Learn how to make your React apps fly with memo, useMemo, and virtualization.',
                content: '# React Performance\n\nOptimizing React apps is crucial...',
                author: 'John Doe',
                readTime: 15,
                difficulty: 'advanced', // Matches frontend filter
                categoryId: createdCats['React'],
                tags: ['react', 'performance', 'optimization'],
                isFeatured: true,
                isPremium: false,
                views: 1250,
                isActive: true
            },
            {
                title: 'Mastering Tailwind CSS',
                description: 'A deep dive into utility-first CSS and how to build complex layouts rapidly.',
                content: '# Tailwind CSS\n\nTailwind is a utility-first CSS framework...',
                author: 'Jane Smith',
                readTime: 8,
                difficulty: 'beginner',
                categoryId: createdCats['CSS'],
                tags: ['css', 'tailwind', 'design'],
                isFeatured: false,
                isPremium: false,
                views: 5400, // For "Most Popular" sort test
                isActive: true
            },
            {
                title: 'Next.js App Router Guide',
                description: 'Everything you need to know about Server Components and the new App Router.',
                content: '# Next.js App Router\n\nThe future of Next.js...',
                author: 'NextJS Team',
                readTime: 20,
                difficulty: 'intermediate',
                categoryId: createdCats['Next.js'],
                tags: ['nextjs', 'ssr', 'react'],
                isFeatured: false,
                isPremium: true, // Locked
                views: 3200,
                isActive: true
            }
        ]
        });
        console.log("Seeded 3 dynamic docs.");
    }
  } catch(e) {
    console.error("Error seeding docs:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```
