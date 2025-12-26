const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserAuth() {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: 'mouryaneha53@gmail.com'
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                password: true,
                googleId: true,
                githubId: true,
                createdAt: true
            }
        });

        console.log('--- User Authentication Details ---');
        if (!user) {
            console.log('User not found!');
        } else {
            console.log('Name:', user.name);
            console.log('Email:', user.email);
            console.log('Role:', user.role);
            console.log('Has Password:', user.password ? 'YES (can login with email/password)' : 'NO (must use OAuth)');
            console.log('Google ID:', user.googleId || 'Not linked');
            console.log('GitHub ID:', user.githubId || 'Not linked');
            console.log('Created:', user.createdAt);
        }
        console.log('-----------------------------------');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUserAuth();
