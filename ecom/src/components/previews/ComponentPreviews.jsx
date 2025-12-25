import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Box, Star, Code2, Sparkles } from 'lucide-react';

/**
 * Component Preview Library
 * All preview components for the dynamic component system
 */

// Default Preview (fallback)
export const DefaultPreview = () => (
    <div className="glass-card p-6 rounded-2xl">
        <p className="text-foreground">Preview Component</p>
    </div>
);

// Button Previews
export const PrimaryButton = () => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl font-bold overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/50"
    >
        <span className="relative z-10">Primary Button</span>
        <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
        />
    </motion.button>
);

export const GlassButton = () => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative px-8 py-4 glass-card rounded-2xl font-bold overflow-hidden transition-all"
    >
        <span className="relative z-10">Glass Button</span>
        <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
    </motion.button>
);

export const NeonButton = () => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        animate={{
            boxShadow: [
                '0 0 20px rgba(139, 92, 246, 0.3)',
                '0 0 40px rgba(139, 92, 246, 0.6)',
                '0 0 20px rgba(139, 92, 246, 0.3)',
            ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="px-8 py-4 bg-transparent border-2 border-primary text-primary rounded-2xl font-bold"
    >
        Neon Button
    </motion.button>
);

// Card Previews
export const PremiumCard = () => (
    <motion.div
        whileHover={{ rotateY: 5, rotateX: 5 }}
        className="group relative glass-card rounded-3xl p-8 overflow-hidden w-64 cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Premium Card
            </h3>
            <p className="text-muted-foreground">Hover for 3D effect</p>
        </div>
    </motion.div>
);

export const AnimatedStatCard = () => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prev => (prev >= 2543 ? 0 : prev + 50));
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-card rounded-2xl p-6 w-56">
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mb-4"
            >
                <Zap className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h3
                key={count}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"
            >
                {count.toLocaleString()}
            </motion.h3>
            <p className="text-muted-foreground text-sm mt-1">Total Sales</p>
        </div>
    );
};

export const ProductCard3D = () => (
    <motion.div
        whileHover={{ y: -10, rotateY: 10 }}
        className="group relative glass-card rounded-3xl overflow-hidden cursor-pointer w-48"
        style={{ transformStyle: 'preserve-3d' }}
    >
        <div className="aspect-square bg-gradient-to-br from-primary/20 to-purple-500/10 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">
            <Box className="w-16 h-16 text-primary/50" />
        </div>
        <div className="p-6">
            <h4 className="font-bold text-lg mb-1">Product Name</h4>
            <p className="text-primary font-bold text-xl">$99.00</p>
        </div>
    </motion.div>
);

// Form Previews
export const FloatingInput = () => {
    const [focused, setFocused] = useState(false);

    return (
        <div className="relative w-full max-w-sm">
            <input
                type="text"
                onFocus={() => setFocused(true)}
                onBlur={(e) => setFocused(e.target.value !== '')}
                className="peer w-full px-4 pt-6 pb-2 bg-secondary border-2 border-white/10 rounded-xl text-foreground focus:border-primary focus:outline-none transition-all"
                placeholder=" "
            />
            <motion.label
                animate={{
                    top: focused ? '0.5rem' : '1rem',
                    fontSize: focused ? '0.75rem' : '1rem',
                    color: focused ? 'rgb(139, 92, 246)' : 'rgb(156, 163, 175)'
                }}
                className="absolute left-4 pointer-events-none transition-all"
            >
                Email Address
            </motion.label>
        </div>
    );
};

export const SpotlightSearch = () => (
    <div className="relative group w-full max-w-sm">
        <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-2xl blur-xl"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        />
        <input
            type="search"
            className="relative w-full px-6 py-4 bg-secondary/50 backdrop-blur-xl border border-white/10 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all"
            placeholder="Search with spotlight..."
        />
    </div>
);

// Feedback Previews
export const GradientBadge = () => (
    <div className="flex flex-wrap gap-2">
        <motion.span
            animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="px-4 py-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white rounded-full text-sm font-bold"
            style={{ backgroundSize: '200% 200%' }}
        >
            New Feature
        </motion.span>
        <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-bold">
            Active
        </span>
        <span className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-bold">
            Hot
        </span>
    </div>
);

export const GlowingProgress = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => (prev >= 100 ? 0 : prev + 1));
        }, 30);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-sm">
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                />
            </div>
        </div>
    );
};

export const PulseLoader = () => (
    <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
            <motion.div
                key={i}
                className="w-4 h-4 bg-primary rounded-full"
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1]
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                }}
            />
        ))}
    </div>
);

// Animation Previews
export const MagneticHover = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    return (
        <motion.div
            onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setPosition({
                    x: (e.clientX - rect.left - rect.width / 2) * 0.3,
                    y: (e.clientY - rect.top - rect.height / 2) * 0.3
                });
            }}
            onMouseLeave={() => setPosition({ x: 0, y: 0 })}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15 }}
            className="glass-card p-8 rounded-2xl cursor-pointer font-bold"
        >
            Hover me
        </motion.div>
    );
};

export const RevealAnimation = () => (
    <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent"
    >
        Reveal Text
    </motion.h2>
);

export const ParticleEffect = () => (
    <div className="relative w-32 h-32 flex items-center justify-center">
        {[...Array(8)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-2 h-2 bg-primary rounded-full"
                animate={{
                    y: [-10, -60],
                    x: [0, (i - 4) * 10],
                    opacity: [1, 0],
                    scale: [1, 0]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeOut"
                }}
            />
        ))}
        <Sparkles className="w-8 h-8 text-primary" />
    </div>
);
