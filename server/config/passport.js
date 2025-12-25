const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// JWT Strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: payload.id },
                include: { subscription: true }
            });

            if (user) {
                return done(null, user);
            }
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    })
);

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
                scope: ['profile', 'email'],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user exists with this Google ID
                    let user = await prisma.user.findUnique({
                        where: { googleId: profile.id }
                    });

                    if (user) {
                        return done(null, user);
                    }

                    // Check if user exists with this email
                    const email = profile.emails?.[0]?.value;
                    if (email) {
                        user = await prisma.user.findUnique({
                            where: { email }
                        });

                        if (user) {
                            // Link Google account to existing user
                            user = await prisma.user.update({
                                where: { id: user.id },
                                data: {
                                    googleId: profile.id,
                                    avatar: user.avatar || profile.photos?.[0]?.value
                                }
                            });
                            return done(null, user);
                        }
                    }

                    // Create new user
                    user = await prisma.user.create({
                        data: {
                            name: profile.displayName,
                            email: email || `${profile.id}@google.oauth`,
                            googleId: profile.id,
                            avatar: profile.photos?.[0]?.value,
                            // Create free subscription
                            subscription: {
                                create: {
                                    planName: 'FREE',
                                    status: 'ACTIVE',
                                    features: ['Access to free products', 'Community support']
                                }
                            }
                        }
                    });

                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
                scope: ['user:email'],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user exists with this GitHub ID
                    let user = await prisma.user.findUnique({
                        where: { githubId: profile.id }
                    });

                    if (user) {
                        return done(null, user);
                    }

                    // Check if user exists with this email
                    const email = profile.emails?.[0]?.value;
                    if (email) {
                        user = await prisma.user.findUnique({
                            where: { email }
                        });

                        if (user) {
                            // Link GitHub account to existing user
                            user = await prisma.user.update({
                                where: { id: user.id },
                                data: {
                                    githubId: profile.id,
                                    avatar: user.avatar || profile.photos?.[0]?.value
                                }
                            });
                            return done(null, user);
                        }
                    }

                    // Create new user
                    user = await prisma.user.create({
                        data: {
                            name: profile.displayName || profile.username,
                            email: email || `${profile.id}@github.oauth`,
                            githubId: profile.id,
                            avatar: profile.photos?.[0]?.value,
                            // Create free subscription
                            subscription: {
                                create: {
                                    planName: 'FREE',
                                    status: 'ACTIVE',
                                    features: ['Access to free products', 'Community support']
                                }
                            }
                        }
                    });

                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
}

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: { subscription: true }
        });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
