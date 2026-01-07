const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding demo template...');

    try {
        const demoProduct = await prisma.product.create({
            data: {
                title: "Demo Premier Template",
                description: "A high-quality demo template for testing Razorpay integration.",
                price: 499.00,
                category: "Templates", // Ensure this category exists or is valid enum if strictly typed
                image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
                fileUrl: "https://example.com/demo.zip",
                numSales: 0,
                rating: 5,
                reviews: 0,
                author: "CodeStudio Team",
                tags: ["demo", "react", "test"],
                features: ["Responsive", "Dark Mode", "SEO Optimized"]
            }
        });

        console.log('Created demo product:', demoProduct.title);
    } catch (e) {
        console.error('Error seeding product:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
