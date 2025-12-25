const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const { sendEmail, emailTemplates } = require('../config/email');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please provide all fields');
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
        where: { email }
    });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with free subscription
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            subscription: {
                create: {
                    planName: 'FREE',
                    status: 'ACTIVE',
                    features: ['Access to free products', 'Community support']
                }
            }
        },
        include: {
            subscription: true
        }
    });

    if (user) {
        // Send welcome email (non-blocking)
        sendEmail({
            to: user.email,
            subject: 'Welcome to CodeStudio!',
            html: emailTemplates.welcomeEmail(user.name)
        }).catch(err => console.error('Welcome email error:', err));

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            subscription: user.subscription,
            token: generateToken(user.id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { email },
        include: { subscription: true }
    });

    if (!user) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    // Check if user has password (OAuth users might not)
    if (!user.password) {
        res.status(401);
        throw new Error('Please login with Google or GitHub');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        subscription: user.subscription,
        token: generateToken(user.id),
    });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
            subscription: true,
            purchasedProducts: {
                select: { id: true, title: true, slug: true, image: true }
            },
            purchasedDocs: {
                select: { id: true, title: true, slug: true, thumbnail: true }
            }
        }
    });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        subscription: user.subscription,
        purchasedProducts: user.purchasedProducts,
        purchasedDocs: user.purchasedDocs,
        hasGoogleLinked: !!user.googleId,
        hasGithubLinked: !!user.githubId,
    });
});

// @desc    Handle OAuth callback
// @route   Used internally after OAuth success
const handleOAuthCallback = (req, res) => {
    const token = generateToken(req.user.id);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Redirect to frontend with token
    res.redirect(`${frontendUrl}/oauth-callback?token=${token}`);
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Please provide email');
    }

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        // Don't reveal if user exists
        res.json({ message: 'If an account exists, you will receive a reset email' });
        return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to user
    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetToken,
            resetTokenExpiry
        }
    });

    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send email
    try {
        await sendEmail({
            to: user.email,
            subject: 'Password Reset Request - CodeStudio',
            html: emailTemplates.passwordReset(resetUrl)
        });
    } catch (error) {
        // Clear reset token on error
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: null,
                resetTokenExpiry: null
            }
        });
        res.status(500);
        throw new Error('Email could not be sent');
    }

    res.json({ message: 'If an account exists, you will receive a reset email' });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        res.status(400);
        throw new Error('Please provide token and new password');
    }

    // Find user with valid token
    const user = await prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpiry: {
                gt: new Date()
            }
        }
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear reset token
    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null
        }
    });

    res.json({ message: 'Password reset successful' });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const { name, avatar } = req.body;

    const user = await prisma.user.update({
        where: { id: req.user.id },
        data: {
            ...(name && { name }),
            ...(avatar && { avatar })
        },
        include: { subscription: true }
    });

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        subscription: user.subscription,
    });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
        where: { id: req.user.id }
    });

    if (!user.password) {
        res.status(400);
        throw new Error('Cannot change password for OAuth accounts');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
        res.status(400);
        throw new Error('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully' });
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    handleOAuthCallback,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    generateToken
};
