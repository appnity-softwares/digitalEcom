import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    CreditCard, DollarSign, TrendingUp, CheckCircle,
    Zap, Crown, Shield, ExternalLink
} from 'lucide-react';

const AdminPayments = () => {
    // Pricing plans from Pricing.jsx
    const plans = [
        {
            id: 'free',
            name: 'Free',
            icon: Zap,
            monthlyPrice: 0,
            yearlyPrice: 0,
            features: [
                'Access to free templates',
                'Free blog articles',
                'Community support',
                'API access (100 req/day)',
                'Basic documentation'
            ]
        },
        {
            id: 'pro',
            name: 'Pro',
            icon: Crown,
            monthlyPrice: 499,
            yearlyPrice: 4999,
            features: [
                'All free features',
                'Access to all premium templates',
                'All blog articles (Pro content)',
                'Priority email support',
                'API access (10,000 req/day)',
                'Source code downloads',
                'Private Discord access'
            ],
            popular: true
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            icon: Shield,
            monthlyPrice: 1999,
            yearlyPrice: 19999,
            features: [
                'All Pro features',
                'Unlimited API requests',
                'White-label templates',
                'Custom integrations',
                'Dedicated account manager',
                'SLA guarantee',
                'Team management',
                'Invoice billing'
            ]
        }
    ];

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-2">Payment Gateway</h1>
                <p className="text-muted-foreground">Razorpay integration and pricing plans</p>
            </div>

            {/* Razorpay Status */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 border border-white/10 mb-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                            <CreditCard className="w-8 h-8 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Razorpay Integration</h2>
                            <p className="text-muted-foreground">Payment gateway status</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-500 rounded-full">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Active</span>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="glass-card p-4 rounded-xl">
                        <p className="text-sm text-muted-foreground mb-2">Gateway</p>
                        <p className="text-xl font-bold text-foreground">Razorpay</p>
                    </div>
                    <div className="glass-card p-4 rounded-xl">
                        <p className="text-sm text-muted-foreground mb-2">Currency</p>
                        <p className="text-xl font-bold text-foreground">INR (₹)</p>
                    </div>
                    <div className="glass-card p-4 rounded-xl">
                        <p className="text-sm text-muted-foreground mb-2">Integration</p>
                        <p className="text-xl font-bold text-foreground">RazorpayButton</p>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-sm text-blue-400">
                        <strong>Note:</strong> Payment integration is configured in{' '}
                        <code className="px-2 py-1 bg-black/20 rounded">RazorpayButton.jsx</code>.
                        Transactions are processed through Razorpay's secure gateway.
                    </p>
                </div>
            </motion.div>

            {/* Pricing Plans */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Pricing Plans</h2>
                    <Link
                        to="/pricing"
                        className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-xl text-sm font-medium transition-all"
                    >
                        View Public Page
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan, index) => {
                        const Icon = plan.icon;
                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.1 }}
                                className={`glass-card rounded-2xl p-6 border ${plan.popular ? 'border-primary' : 'border-white/10'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="mb-4">
                                        <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.popular ? 'bg-primary' : 'bg-secondary'
                                        }`}>
                                        <Icon className={`w-6 h-6 ${plan.popular ? 'text-primary-foreground' : 'text-primary'
                                            }`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-3xl font-bold text-foreground">
                                            ₹{plan.monthlyPrice.toLocaleString('en-IN')}
                                        </span>
                                        {plan.monthlyPrice > 0 && (
                                            <span className="text-muted-foreground">/month</span>
                                        )}
                                    </div>
                                    {plan.yearlyPrice > 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            ₹{plan.yearlyPrice.toLocaleString('en-IN')}/year (Save 17%)
                                        </p>
                                    )}
                                </div>

                                <ul className="space-y-2">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Payment Flow Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-2xl p-6 border border-white/10"
            >
                <h2 className="text-2xl font-bold text-foreground mb-4">Payment Flow</h2>
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold flex-shrink-0">
                            1
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-1">User Selects Plan</h4>
                            <p className="text-sm text-muted-foreground">
                                User chooses a subscription plan from the pricing page
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold flex-shrink-0">
                            2
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-1">Create Order</h4>
                            <p className="text-sm text-muted-foreground">
                                Backend creates Razorpay order via <code className="px-2 py-0.5 bg-black/20 rounded text-xs">/razorpay/create-order</code>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold flex-shrink-0">
                            3
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-1">Payment Gateway</h4>
                            <p className="text-sm text-muted-foreground">
                                Razorpay checkout modal opens for secure payment
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold flex-shrink-0">
                            4
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-1">Verify Payment</h4>
                            <p className="text-sm text-muted-foreground">
                                Backend verifies payment signature via <code className="px-2 py-0.5 bg-black/20 rounded text-xs">/razorpay/verify</code>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-bold flex-shrink-0">
                            ✓
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-1">Subscription Activated</h4>
                            <p className="text-sm text-muted-foreground">
                                User subscription is updated and access is granted
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminPayments;
