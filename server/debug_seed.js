require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting debug seed...');

    // Check categories
    const categories = await prisma.componentCategory.findMany();
    console.log('Categories found:', categories.length);
    categories.forEach(c => console.log(`- ${c.name} (${c.id})`));

    const btnCat = categories.find(c => c.name === 'buttons');
    if (!btnCat) {
        console.error('Buttons category not found!');
        return;
    }

    console.log('Creating one component...');
    try {
        const result = await prisma.component.create({
            data: {
                title: 'Debug Button',
                description: 'Debug description',
                code: '<button>Debug</button>',
                previewType: 'Debug',
                categoryId: btnCat.id,
                tags: ['debug'],
                isFeatured: false
            }
        });
        console.log('Created component:', result);
    } catch (e) {
        console.error('Error creating component:', e);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
