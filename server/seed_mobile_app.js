const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Demo Mobile App...');

    try {
        const mobileApp = await prisma.product.create({
            data: {
                title: 'E-Commerce Mobile App Template',
                slug: 'ecommerce-mobile-app-template', // Helper to avoid unique constraint error if run multiple times, ideally unique
                description: 'A premium, full-featured mobile e-commerce application template built with React Native and Expo. Includes screens for home, product details, cart, checkout, and user profile.',
                longDescription: `
# E-Commerce Mobile App Template

Launch your mobile store in days, not months. This comprehensive template includes everything you need to build a high-conversion mobile shopping experience.

## Features
- **Modern UI/UX**: Clean, professional design inspired by top fashion apps.
- **Full Navigation**: Tab bar, stack navigation, and custom headers.
- **State Management**: Integrated with Redux Toolkit / Context API examples.
- **Backend Ready**: API services setup to easily connect to your existing backend.
- **Smooth Animations**: Uses Reanimated 2 for buttery smooth interactions.
- **Dark Mode Support**: Automatically adapts to system theme preference.

## Screens Included
1. Onboarding Flow
2. Home / Discover
3. Product Search & Filter
4. Product Details with Gallery
5. Shopping Cart
6. Secure Checkout
7. User Profile & Settings
8. Order History
        `,
                price: 59.99,
                discountPrice: 39.99,
                category: 'mobile', // Matches query in MobileTemplates.jsx
                productType: 'template',
                image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600',
                images: [
                    'https://images.unsplash.com/photo-1556656793-02715d8dd6f8?w=600',
                    'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600'
                ],
                techStack: ['React Native', 'Expo', 'JavaScript', 'Redux', 'Reanimated'],
                tags: ['mobile', 'ecommerce', 'app', 'react-native', 'expo', 'template'],
                features: ['Authentication', 'Push Notifications', 'Payment Integration', 'Analytics'],
                hasMobileApp: true,
                isFeatured: true,
                rating: 4.8,
                numReviews: 12,
                numSales: 34,
            },
        });

        console.log('Created mobile app:', mobileApp.title);
    } catch (error) {
        if (error.code === 'P2002') {
            console.log('Mobile App template already exists (slug collision).');
        } else {
            console.error('Error seeding mobile app:', error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
