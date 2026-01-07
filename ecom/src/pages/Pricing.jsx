import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    Check, Zap, Crown, Star, ArrowRight,
    Shield, HelpCircle, MessageCircle
} from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const Pricing = () => {
    const { user } = useContext(AuthContext);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [loading, setLoading] = useState(null);

    const plans = [
        {
            id: 'free',
            name: 'Free',
            icon: Zap,
            description: 'Perfect for trying out our platform',
            monthlyPrice: 0,
            yearlyPrice: 0,
            features: [
                'Access to free templates',
                'Free blog articles',
                'Community support',
                'API access (100 req/day)',
                'Basic documentation'
            ],
            cta: 'Get Started',
            popular: false
        },
        {
            id: 'pro',
            name: 'Pro',
            icon: Crown,
            description: 'For serious developers and small teams',
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
            cta: 'Subscribe Now',
            popular: true
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            icon: Shield,
            description: 'For agencies and large teams',
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
            ],
            cta: 'Contact Sales',
            popular: false
        }
    ];

    const handleSubscribe = async (planId) => {
        if (planId === 'free') {
            navigate('/profile');
            return;
        }

        if (planId === 'enterprise') {
            navigate('/contact');
            return;
        }
        // Redirect to subscription checkout page
        navigate(`/subscription-checkout?plan=${planId}&billing=${billingCycle}`);
    };

    const getPrice = (plan) => {
        return billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    };

    return (
        <div className="min-h-screen bg-background pt-28 pb-20 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary/10 border border-primary/20"
                    >
                        <Crown className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                            Simple Pricing
                        </span>
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                        Choose your plan
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                        Get access to premium templates, developer blog, and powerful APIs.
                        Cancel anytime.
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-1 p-1 bg-secondary/50 border border-white/10 rounded-xl">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${billingCycle === 'monthly'
                                ? 'bg-primary text-primary-foreground shadow-lg'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${billingCycle === 'yearly'
                                ? 'bg-primary text-primary-foreground shadow-lg'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Yearly
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                                Save 17%
                            </span>
                        </button>
                    </div>
                </motion.div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative glass-card rounded-3xl overflow-hidden ${plan.popular ? 'border-2 border-primary glow-primary' : 'border border-white/10'}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-px left-1/2 -translate-x-1/2">
                                    <span className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-b-xl flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-current" />
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="p-8">
                                {/* Plan Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.popular ? 'bg-primary' : 'bg-secondary'}`}>
                                        <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-primary-foreground' : 'text-primary'}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">
                                            {plan.name}
                                        </h3>
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                                {/* Price */}
                                <div className="mb-6">
                                    <span className="text-4xl font-display font-bold text-foreground">
                                        ₹{getPrice(plan).toLocaleString('en-IN')}
                                    </span>
                                    {plan.monthlyPrice > 0 && (
                                        <span className="text-muted-foreground">
                                            /{billingCycle === 'yearly' ? 'year' : 'month'}
                                        </span>
                                    )}
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={loading === plan.id}
                                    className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] ${plan.popular
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                        : 'bg-secondary text-foreground border border-white/10 hover:bg-secondary/80'
                                        }`}
                                >
                                    {loading === plan.id ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {plan.cta}
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>

                                {/* Features */}
                                <ul className="mt-8 space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-muted-foreground">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* FAQ Teaser */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-20 text-center"
                >
                    <p className="text-muted-foreground mb-6">
                        Have questions? Check out our FAQ or contact support.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link
                            to="/faq"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-all border border-white/5"
                        >
                            <HelpCircle className="w-4 h-4" />
                            View FAQ
                        </Link>
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-all border border-white/5"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Contact Support
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Pricing;
