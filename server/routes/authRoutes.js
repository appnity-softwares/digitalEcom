const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
    registerUser,
    loginUser,
    getMe,
    handleOAuthCallback,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Standard auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Password reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Google OAuth
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`,
        session: false
    }),
    handleOAuthCallback
);

// GitHub OAuth
router.get('/github', passport.authenticate('github', {
    scope: ['user:email']
}));

router.get('/github/callback',
    passport.authenticate('github', {
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=github_auth_failed`,
        session: false
    }),
    handleOAuthCallback
);

module.exports = router;
