import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Shield, Crown, ArrowLeft } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import RazorpayButton from '../components/checkout/RazorpayButton';

const SubscriptionCheckout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const queryParams = new URLSearchParams(location.search);
    const planId = queryParams.get('plan');
    const billingCycle = queryParams.get('billing');

    const [planDetails, setPlanDetails] = useState(null);

    const plans = {
        free: {
            name: 'Free',
            monthlyPrice: 0,
            yearlyPrice: 0,
            features: ['Access to free templates', 'Community support']
        },
        pro: {
            name: 'Pro',
            monthlyPrice: 499,
            yearlyPrice: 4999,
            features: [
                'Unlimited templates',
                'All UI kits',
                'Access to SaaS tools',
                'Premium Docs',
                'Priority support'
            ]
        },
        enterprise: {
            name: 'Enterprise',
            monthlyPrice: 1999,
            yearlyPrice: 19999,
            features: [
                'Everything in Pro',
                'Extended licenses',
                'Custom integrations',
                'Dedicated support',
                'White-label options'
            ]
        }
    };

    useEffect(() => {
        if (!planId || !plans[planId]) {
            navigate('/pricing');
            return;
        }
        setPlanDetails(plans[planId]);
    }, [planId, navigate]);

    if (!planDetails) return null;

    const price = billingCycle === 'yearly' ? planDetails.yearlyPrice : planDetails.monthlyPrice;

    return (
        <div className="min-h-screen bg-background py-24 px-6 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <button
                    onClick={() => navigate('/pricing')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Pricing
                </button>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Plan Details */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card rounded-3xl p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Crown className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">{planDetails.name} Plan</h2>
                                <p className="text-muted-foreground capitalize">{billingCycle} Billing</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <span className="text-4xl font-display font-bold text-foreground">
                                ₹{price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-muted-foreground">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                        </div>

                        <div className="space-y-4 mb-8">
                            <h3 className="font-semibold text-foreground">What's included:</h3>
                            {planDetails.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Payment Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card rounded-3xl p-8 flex flex-col justify-center"
                    >
                        <h3 className="text-xl font-bold text-foreground mb-6">Payment Details</h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span className="text-foreground">₹{price.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Tax</span>
                                <span className="text-foreground">₹0</span>
                            </div>
                            <div className="h-px bg-white/10 my-4" />
                            <div className="flex justify-between text-lg font-bold text-foreground">
                                <span>Total</span>
                                <span>₹{price.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        {user ? (
                            <RazorpayButton
                                amount={price}
                                type="subscription"
                                extraData={{ planId, billingCycle }}
                                onSuccess={() => navigate('/profile')}
                            />
                        ) : (
                            <div className="text-center p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                                <p className="text-yellow-500 mb-2">Please login to continue</p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
                                >
                                    Login
                                </button>
                            </div>
                        )}

                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <Shield className="w-4 h-4" />
                            Secure checkout powered by Razorpay
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionCheckout;
