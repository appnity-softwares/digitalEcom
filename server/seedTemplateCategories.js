const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
    {
        name: 'agency',
        label: 'Agency Template',
        icon: 'Briefcase',
        gradient: 'from-blue-500 to-cyan-500',
        order: 1
    },
    {
        name: 'real-estate',
        label: 'Real Estate Template',
        icon: 'Home',
        gradient: 'from-green-500 to-emerald-500',
        order: 2
    },
    {
        name: 'portfolio',
        label: 'Portfolio Template',
        icon: 'User',
        gradient: 'from-purple-500 to-pink-500',
        order: 3
    },
    {
        name: 'business',
        label: 'Business Template',
        icon: 'TrendingUp',
        gradient: 'from-orange-500 to-red-500',
        order: 4
    },
    {
        name: 'commerce',
        label: 'Commerce Template',
        icon: 'ShoppingCart',
        gradient: 'from-yellow-500 to-orange-500',
        order: 5
    }
];

async function seedCategories() {
    console.log('Seeding template categories...');

    for (const cat of categories) {
        try {
            const category = await prisma.templateCategory.upsert({
                where: { name: cat.name },
                update: cat,
                create: cat,
            });
            console.log(`Upserted category: ${category.label}`);
        } catch (error) {
            console.error(`Error upserting ${cat.label}:`, error);
        }
    }

    console.log('Seeding completed.');
}

seedCategories()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
