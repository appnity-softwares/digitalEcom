import React from 'react';
import { motion } from 'framer-motion';

const FeaturedHeader = () => {
    // Dummy data for avatars
    const avatars = [
        "https://i.pravatar.cc/150?u=a042581f4e29026024d",
        "https://i.pravatar.cc/150?u=a042581f4e29026704d",
        "https://i.pravatar.cc/150?u=a04258114e29026302d",
        "https://i.pravatar.cc/150?u=a042581f4e29026704f",
        "https://i.pravatar.cc/150?u=a042581f4e29026703d",
    ];

    return (
        <section className="w-full bg-background px-6 py-20 border-t border-white/5">
            <div className="max-w-7xl mx-auto flex flex-col items-start gap-8">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl md:text-6xl font-display font-bold text-foreground tracking-tight">
                        Featured <span className="text-muted-foreground">Assets</span>
                    </h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
                >
                    <div className="flex items-center pl-3">
                        {avatars.map((src, index) => (
                            <div
                                key={index}
                                className="relative w-12 h-12 rounded-full border-2 border-background -ml-3 overflow-hidden shrink-0 first:ml-0 z-0 hover:z-10 hover:scale-110 transition-transform duration-200"
                            >
                                <img
                                    src={src}
                                    alt={`User ${index}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-foreground">5.0</span>
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="w-5 h-5 text-primary"
                                    >
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                ))}
                            </div>
                        </div>

                        <p className="text-muted-foreground font-medium text-sm">
                            Trusted by 10,000+ developers
                        </p>
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

export default FeaturedHeader;