import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Globe, Zap, Layers, Check, ArrowRight, Sparkles } from 'lucide-react';

const FeaturesGrid = () => {
  const features = [
    {
      icon: Globe,
      title: 'Built with global standards',
      description: 'Unlock brilliance—build your website the smart way with modern best practices.',
      accent: false,
      decorationPosition: 'bottom-right'
    },
    {
      icon: Zap,
      title: 'Scale up 2x faster',
      description: 'Accelerate your development workflow with pre-built, production-ready components.',
      accent: false,
      decorationPosition: 'top-right'
    },
    {
      icon: Layers,
      title: 'Never leave your workflow',
      description: 'Seamlessly integrate with your existing tools and processes.',
      accent: true,
      checklist: ['Pick a template', 'Customize it', 'Launch']
    }
  ];

  return (
    <div className="w-full bg-background px-6 py-20 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto flex flex-col gap-16 relative z-10">

        {/* 1. HEADER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8"
        >
          {/* Left: Huge Title */}
          <h2 className="max-w-3xl text-4xl md:text-6xl font-display font-bold text-foreground tracking-tight leading-[1.1]">
            Fully <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-500">responsive</span> and customizable
          </h2>

          {/* Right: Description Text */}
          <p className="max-w-xs text-muted-foreground text-lg leading-relaxed">
            No more website woes—just powerful solutions at your fingertips
          </p>
        </motion.div>

        {/* 2. CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-3xl p-8 md:p-10 flex flex-col justify-between relative overflow-hidden min-h-[480px] group transition-all duration-300 ${feature.accent
                  ? 'bg-gradient-to-br from-primary to-primary/80 glow-primary'
                  : 'glass-card-hover'
                }`}
            >
              {/* Decoration Shape */}
              {!feature.accent && (
                <div className={`absolute w-64 h-64 bg-secondary/50 rounded-[3rem] transform opacity-50 z-0 group-hover:scale-110 transition-transform duration-500 ${feature.decorationPosition === 'bottom-right'
                    ? '-bottom-16 -right-16 rotate-12'
                    : '-top-16 -right-16 -rotate-12'
                  }`} />
              )}

              {/* Gradient Overlay for accent card */}
              {feature.accent && (
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              )}

              {/* Content */}
              <div className="relative z-10 flex flex-col items-start gap-6">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${feature.accent
                    ? 'bg-white text-primary'
                    : 'bg-primary/10 text-primary'
                  }`}>
                  <feature.icon className="w-7 h-7" />
                </div>

                {/* Text */}
                <div className={feature.decorationPosition === 'top-right' ? 'mt-6' : ''}>
                  <h3 className={`text-3xl font-display font-bold tracking-tight leading-tight mb-4 ${feature.accent ? 'text-white' : 'text-foreground'
                    }`}>
                    {feature.title}
                  </h3>
                  <p className={`text-lg ${feature.accent ? 'text-white/80' : 'text-muted-foreground'
                    }`}>
                    {feature.description}
                  </p>
                </div>

                {/* Button (only for first card) */}
                {index === 0 && (
                  <Link
                    to="/templates"
                    className="mt-4 flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full font-semibold transition-all hover:scale-105 shadow-lg shadow-primary/25"
                  >
                    <Sparkles className="w-4 h-4" />
                    Browse Templates
                  </Link>
                )}
              </div>

              {/* Checklist for accent card */}
              {feature.accent && feature.checklist && (
                <div className="relative z-10 flex flex-col gap-4 mt-8">
                  {feature.checklist.map((item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-3 ${i > 0 ? 'opacity-60' : ''}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${i === 0 ? 'bg-white' : 'border-2 border-white/50'
                        }`}>
                        {i === 0 && <Check className="w-4 h-4 text-primary" />}
                      </div>
                      <span className="text-white font-medium text-lg">{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesGrid;