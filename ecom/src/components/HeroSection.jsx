import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Code2, Layers, Cpu, Sparkles, Star } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HeroSection = () => {
    const sectionRef = useRef(null);
    const headingRef = useRef(null);
    const parallaxRef = useRef(null);

    // Parallax scroll effect for background elements
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"]
    });

    const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    // GSAP animations on mount
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animate heading letters
            if (headingRef.current) {
                const words = headingRef.current.querySelectorAll('.word');
                gsap.fromTo(words,
                    { opacity: 0, y: 50, rotateX: -40 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 1,
                        stagger: 0.08,
                        ease: "power3.out"
                    }
                );
            }
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative w-full min-h-screen flex flex-col justify-center px-6 pt-32 pb-20 overflow-hidden bg-background"
        >
            {/* Dynamic Background with Parallax */}
            <motion.div
                ref={parallaxRef}
                style={{ y: bgY }}
                className="absolute inset-0 pointer-events-none"
            >
                {/* Animated Blobs */}
                <div className="absolute top-[5%] right-[10%] w-[600px] h-[600px] bg-primary/20 blob" />
                <div className="absolute bottom-[5%] left-[5%] w-[500px] h-[500px] bg-indigo-500/15 blob blob-delay-2" />
                <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-pink-500/10 blob blob-delay-4" />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

                {/* Noise Texture */}
                <div className="absolute inset-0 opacity-30 noise-bg" />
            </motion.div>

            <motion.div
                style={{ opacity }}
                className="max-w-7xl mx-auto w-full relative z-10 grid lg:grid-cols-2 gap-16 items-center"
            >
                {/* Left Content */}
                <div className="flex flex-col items-start text-left">

                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-secondary/50 border border-white/10 backdrop-blur-md shadow-lg"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-semibold text-foreground/80 uppercase tracking-widest">
                            ✨ v2.0 Now Available
                        </span>
                    </motion.div>

                    <div ref={headingRef} className="perspective-1000 mb-8">
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05] font-display preserve-3d"
                        >
                            <span className="word inline-block">Build</span>{' '}
                            <span className="word inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-pink-500 to-orange-400">
                                Extraordinary
                            </span>
                            <br />
                            <span className="word inline-block">Digital</span>{' '}
                            <span className="word inline-block">Products</span>
                        </motion.h1>
                    </div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed"
                    >
                        Premium functionality meets artistic design. Access a curated library of{' '}
                        <span className="text-foreground font-medium">production-ready templates</span>,{' '}
                        components, and APIs.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="flex flex-wrap gap-4 mb-16"
                    >
                        <Link
                            to="/templates"
                            className="group relative px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-base overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 magnetic-btn"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Browse Assets <Zap className="w-4 h-4 fill-current transition-transform group-hover:rotate-12" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Link>
                        <Link
                            to="/docs"
                            className="group px-8 py-4 rounded-full bg-secondary/50 border border-white/10 text-foreground font-semibold text-base transition-all duration-300 hover:bg-secondary hover:border-white/20 hover:scale-105 flex items-center gap-2"
                        >
                            Documentation <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="grid grid-cols-3 gap-8 w-full border-t border-white/10 pt-8"
                    >
                        <StatItem number="50+" label="Premium Kits" icon={<Sparkles className="w-4 h-4" />} />
                        <StatItem number="2k+" label="Community" icon={<Star className="w-4 h-4" />} />
                        <StatItem number="99%" label="Satisfaction" icon={<Zap className="w-4 h-4" />} />
                    </motion.div>
                </div>

                {/* Right Visual (3D Floating Cards Composition) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotateY: -10 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="relative hidden lg:block h-[600px] w-full perspective-2000"
                >
                    {/* Floating Cards Composition */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full preserve-3d">

                        {/* Main Card with 3D Effect */}
                        <motion.div
                            animate={{
                                y: [0, -20, 0],
                                rotateX: [2, -2, 2],
                                rotateY: [-2, 2, -2]
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-[15%] left-[10%] w-[65%] z-20 preserve-3d"
                        >
                            <div className="glass-card rounded-3xl p-1 shadow-2xl shadow-primary/20 border border-white/10">
                                <div className="bg-background/80 rounded-2xl overflow-hidden border border-white/5">
                                    <div className="h-10 bg-secondary/30 border-b border-white/5 flex items-center px-4 gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/60" />
                                        <div className="ml-4 h-5 w-32 bg-secondary/50 rounded-md" />
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center">
                                                <Code2 className="w-8 h-8 text-primary" />
                                            </div>
                                            <div className="space-y-2 flex-1">
                                                <div className="h-4 w-3/4 bg-secondary/60 rounded" />
                                                <div className="h-3 w-1/2 bg-secondary/40 rounded" />
                                            </div>
                                        </div>
                                        <div className="h-28 bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-xl border border-white/5" />
                                        <div className="flex justify-between items-center pt-2">
                                            <div className="flex gap-2">
                                                <div className="h-6 w-16 bg-primary/20 rounded-full" />
                                                <div className="h-6 w-16 bg-secondary/50 rounded-full" />
                                            </div>
                                            <div className="h-10 w-28 bg-primary rounded-xl flex items-center justify-center text-sm font-medium text-primary-foreground">
                                                Deploy →
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Metric Card 1 */}
                        <motion.div
                            animate={{ y: [0, 15, 0], x: [0, 10, 0], rotateZ: [-2, 2, -2] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute top-[5%] right-[5%] z-30"
                        >
                            <div className="glass-card-hover p-5 rounded-2xl shadow-xl">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-500/10 rounded-xl">
                                        <Code2 className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground font-medium">Clean Code</div>
                                        <div className="text-lg font-bold text-foreground">TypeScript</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Metric Card 2 */}
                        <motion.div
                            animate={{ y: [0, -18, 0], x: [0, -8, 0], rotateZ: [2, -2, 2] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            className="absolute bottom-[22%] left-[0%] z-30"
                        >
                            <div className="glass-card-hover p-5 rounded-2xl shadow-xl">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-xl">
                                        <Layers className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground font-medium">Components</div>
                                        <div className="text-lg font-bold text-foreground">50+ Ready</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Metric Card 3 */}
                        <motion.div
                            animate={{ y: [0, 12, 0], rotateZ: [-1, 1, -1] }}
                            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                            className="absolute bottom-[30%] right-[15%] z-10"
                        >
                            <div className="glass-card-hover p-5 rounded-2xl shadow-xl">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-500/10 rounded-xl">
                                        <Cpu className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground font-medium">Performance</div>
                                        <div className="text-lg font-bold text-foreground">99/100</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Subtle Glow Ring */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-primary/10 opacity-50" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-primary/5 opacity-30" />

                    </div>
                </motion.div>

            </motion.div>
        </section>
    );
};

const StatItem = ({ number, label, icon }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex flex-col gap-1 group cursor-default"
    >
        <div className="flex items-center gap-2">
            <span className="text-3xl md:text-4xl font-bold text-foreground font-display tracking-tight">{number}</span>
            <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">{icon}</span>
        </div>
        <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
    </motion.div>
);

export default HeroSection;