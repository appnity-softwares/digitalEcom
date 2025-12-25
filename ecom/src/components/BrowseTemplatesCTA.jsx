import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Zap } from 'lucide-react';

const BrowseTemplatesCTA = () => {
  return (
    <section className="w-full bg-background px-6 py-20 font-sans border-t border-white/5">

      {/* Main Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto bg-card/20 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 md:p-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 relative overflow-hidden shadow-2xl shadow-primary/5"
      >

        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />


        {/* 1. LEFT SIDE: Image Collage */}
        <div className="w-full lg:w-1/2 h-[500px] grid grid-cols-2 gap-4 z-10">

          {/* Column 1 (Stacked Images) */}
          <div className="flex flex-col gap-4 h-full translate-y-8 lg:translate-y-12">

            {/* Top Image */}
            <div className="h-1/2 w-full rounded-2xl overflow-hidden relative group border border-white/10 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=800"
                alt="Portfolio Template"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white font-bold tracking-widest uppercase text-sm">William</div>
            </div>

            {/* Bottom Image */}
            <div className="h-1/2 w-full bg-indigo-600 rounded-2xl overflow-hidden relative flex items-center justify-center group p-4 border border-white/10 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
              <div className="relative z-10 grid grid-cols-2 gap-2 w-full max-w-[150px]">
                <div className="bg-white/10 backdrop-blur-md rounded-lg h-16 w-full animate-pulse"></div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg h-16 w-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg h-16 w-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="col-span-1 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center text-white text-xs bg-white/10">+3</div>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 text-white font-bold text-xl">Pro</div>
            </div>

          </div>

          {/* Column 2 (Tall Image) */}
          <div className="h-full w-full rounded-2xl overflow-hidden relative group -translate-y-8 lg:-translate-y-12 border border-white/10 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800"
              alt="SaaS Template"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors"></div>

            <div className="absolute top-10 left-6 right-6 text-white">
              <div className="w-8 h-8 rounded-full bg-primary mb-4 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" fill="currentColor" />
              </div>
              <h3 className="text-xl font-bold leading-tight mb-2">Next Gen SaaS</h3>
              <p className="text-xs text-gray-300">Seamlessly integrate AI-power.</p>
            </div>
          </div>

        </div>


        {/* 2. RIGHT SIDE: Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-start gap-8 relative z-10">

          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/20 border border-primary/20">
            <Globe className="w-8 h-8" />
          </div>

          {/* Text Content */}
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground tracking-tight leading-[1.1] mb-6">
              Browse our <span className="text-gradient-primary">curated</span> collection
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl font-medium leading-relaxed">
              Unlock brilliance—build your next project with production-ready assets designed for speed and quality.
            </p>
          </div>

          {/* CTA Button */}
          <Link to="/templates" className="group flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-xl shadow-primary/20 hover:scale-105">
            <Zap className="w-5 h-5 fill-current" />
            Browse Assets
          </Link>
        </div>

      </motion.div>
    </section>
  );
};

export default BrowseTemplatesCTA;