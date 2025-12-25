import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Code, Mail, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail('');
        }
    };

    const footerLinks = {
        Products: [
            { name: 'Templates', path: '/templates' },
            { name: 'Documentation', path: '/docs' },
            { name: 'API Tools', path: '/saas' },
            { name: 'Mobile Apps', path: '/mobile-templates' },
        ],
        Resources: [
            { name: 'Getting Started', path: '/docs' },
            { name: 'Developer Hub', path: '/app-developers' },
            { name: 'Features', path: '/features' },
            { name: 'FAQ', path: '/faq' },
        ],
        Company: [
            { name: 'About Us', path: '/about' },
            { name: 'Contact', path: '/contact' },
            { name: 'Testimonials', path: '/testimonials' },
            { name: 'Careers', path: '/careers' },
        ],
    };

    return (
        <footer className="bg-background border-t border-white/5 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1 space-y-6">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center">
                                <Code className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-xl font-display font-bold text-foreground tracking-tight">
                                CodeStudio
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            Premium templates and developer tools for building next-generation applications.
                            Built for developers, by developers.
                        </p>
                        <a
                            href="mailto:hello@codestudio.dev"
                            className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:text-primary/80 transition-colors"
                        >
                            <Mail className="w-4 h-4" />
                            hello@codestudio.dev
                        </a>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="text-sm font-semibold text-foreground mb-6 uppercase tracking-wider">
                                {category}
                            </h4>
                            <ul className="space-y-4">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            to={link.path}
                                            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group"
                                        >
                                            <span className="w-0 overflow-hidden group-hover:w-2 transition-all duration-300 opacity-0 group-hover:opacity-100">-</span>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Newsletter (Optional enhancement - can be added here) */}

                {/* Bottom */}
                <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} CodeStudio. All rights reserved.
                    </p>
                    <div className="flex items-center gap-8">
                        <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Privacy
                        </Link>
                        <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Terms
                        </Link>
                        <Link to="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Cookies
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;