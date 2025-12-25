import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Check } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { showToast } = useToast();
    const token = searchParams.get('token');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [passwordReset, setPasswordReset] = useState(false);

    // Request password reset
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setEmailSent(true);
            showToast('Check your email for reset link', 'success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Reset password with token
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/reset-password', { token, password });
            setPasswordReset(true);
            showToast('Password reset successful!', 'success');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            showToast(error.response?.data?.message || 'Invalid or expired token', 'error');
        } finally {
            setLoading(false);
        }
    };

    // If we have a token, show reset password form
    if (token) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-blue-500/5">
                        {passwordReset ? (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                                    <Check className="w-8 h-8 text-green-500" />
                                </div>
                                <h2 className="text-2xl font-black text-black mb-2 tracking-tight">Password Reset!</h2>
                                <p className="text-gray-500 font-medium mb-6">Redirecting to login...</p>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-black text-black mb-2 tracking-tight">Set New Password</h2>
                                <p className="text-gray-500 font-medium mb-6">Enter your new password below</p>

                                <form onSubmit={handleResetPassword} className="space-y-4">
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="New Password"
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-black font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm Password"
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-black font-medium"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-[#0055FF] rounded-xl font-bold text-white hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Reset Password</>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    // Show forgot password form
    return (
        <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-blue-500/5">
                    {emailSent ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                                <Mail className="w-8 h-8 text-[#0055FF]" />
                            </div>
                            <h2 className="text-2xl font-black text-black mb-2 tracking-tight">Check Your Email</h2>
                            <p className="text-gray-500 font-medium mb-6">
                                We've sent a password reset link to <span className="text-black font-bold">{email}</span>
                            </p>
                            <Link to="/login" className="text-[#0055FF] font-bold hover:underline">
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-black text-black mb-2 tracking-tight">Forgot Password?</h2>
                            <p className="text-gray-500 font-medium mb-6">
                                Enter your email and we'll send you a reset link
                            </p>

                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email Address"
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-black font-medium"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-[#0055FF] rounded-xl font-bold text-white hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Send Reset Link
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <Link to="/login" className="text-gray-500 font-medium hover:text-black transition-colors">
                                    Back to Login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
