const prisma = require('./config/prisma');

async function check() {
    console.log('--- Recent Components ---');
    const components = await prisma.component.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { category: true }
    });
    components.forEach(c => console.log(`[Component] ID: ${c.id} | Title: ${c.title} | Status: ${c.isActive}`));

    console.log('\n--- Recent Categories ---');
    const categories = await prisma.componentCategory.findMany({
        take: 5,
        orderBy: { id: 'desc' }
    });
    categories.forEach(c => console.log(`[Category] ID: ${c.id} | Name: ${c.name}`));
}

check()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
