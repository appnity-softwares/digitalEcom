import React from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const ResponsiveShowcase = () => {
  // Shared data for the "William Thompson" mock website
  const portfolioData = {
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=800", // Guy with guitar vibe
    name: "WILLIAM THOMPSON",
    bio: "Hi, I'm William Thompson, a professional photographer passionate about storytelling through the lens.",
    heading: "MY GOAL IS TO MAKE EACH SESSION A RELAXED AND CREATIVE EXPERIENCE THAT RESULTS IN STUNNING, MEANINGFUL IMAGES."
  };

  return (
    <section className="w-full bg-background px-6 py-20 font-sans border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">

        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Fully Responsive
          </h2>
          <p className="text-muted-foreground text-lg">
            Every template is meticulously crafted to look perfect on any device, from large desktops to mobile phones.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ================= COLUMN 1: DESKTOP ================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4 group cursor-pointer perspective-1000"
          >

            {/* Preview Card */}
            <div className="w-full aspect-[4/3.5] bg-card rounded-2xl overflow-hidden shadow-2xl shadow-black/50 transition-all duration-500 ease-out group-hover:-translate-y-2 relative border border-white/10 group-hover:border-primary/50">

              {/* Mock Website Container (Desktop Layout) */}
              <div className="w-full h-full flex flex-col">

                {/* Hero Section */}
                <div className="h-[55%] relative overflow-hidden">
                  <img src={portfolioData.image} alt="Desktop View" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/20"></div>

                  {/* Desktop Typography Overlay */}
                  <div className="absolute bottom-6 left-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2 w-1/2 drop-shadow-md">
                      {portfolioData.name}
                    </h2>
                  </div>

                  <div className="absolute bottom-6 right-6 text-white max-w-[200px] text-[10px] leading-tight text-right opacity-90">
                    {portfolioData.bio}
                    <div className="mt-2 text-[10px] font-bold underline decoration-1 underline-offset-2 hover:text-blue-200 transition-colors">CONTACT ME ↗</div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="h-[45%] bg-[#F0F0F0] p-6 flex gap-4">
                  <div className="w-2/3">
                    <h3 className="text-xl font-black text-black uppercase leading-none tracking-tight">
                      {portfolioData.heading}
                    </h3>
                    <div className="mt-4 w-32 h-20 bg-gray-300 rounded overflow-hidden shadow-inner">
                      <img src="https://images.unsplash.com/photo-1554048612-387768052bf7?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover grayscale opacity-80" alt="Work" />
                    </div>
                  </div>
                  <div className="w-1/3 text-[8px] text-gray-500 leading-relaxed">
                    <span className="text-[#0055FF] font-bold block mb-1">INTRO</span>
                    Photography has been my calling since I first picked up a camera. Based in Philadelphia, I specialize in capturing authentic moments.
                  </div>
                </div>

              </div>
            </div>

            {/* Label Card */}
            <div className="bg-card/30 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex items-center gap-4 shadow-lg transition-colors group-hover:bg-card/50">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                <Monitor className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-foreground">Desktop</span>
            </div>
          </motion.div>


          {/* ================= COLUMN 2: TABLET ================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-4 group cursor-pointer"
          >

            {/* Preview Card */}
            <div className="w-full aspect-[4/3.5] bg-card rounded-2xl overflow-hidden shadow-2xl shadow-black/50 transition-all duration-500 ease-out group-hover:-translate-y-2 relative border border-white/10 group-hover:border-primary/50">

              {/* Mock Website Container (Tablet Layout) */}
              <div className="w-full h-full flex flex-col">

                {/* Hero Section */}
                <div className="h-[65%] relative overflow-hidden">
                  <img src={portfolioData.image} alt="Tablet View" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/30"></div>

                  {/* Tablet Typography: Centered & Stacked */}
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 pt-10 group-hover:pt-0 transition-all duration-500">
                    <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-4 drop-shadow-lg">
                      William<br />Thompson
                    </h2>
                    <p className="text-white text-xs max-w-[250px] font-medium opacity-0 group-hover:opacity-90 transition-opacity duration-300 mb-4 transform translate-y-4 group-hover:translate-y-0">
                      {portfolioData.bio}
                    </p>
                    <button className="border border-white text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-wide hover:bg-white hover:text-black transition-colors opacity-0 group-hover:opacity-100">
                      Contact Me ↗
                    </button>
                  </div>
                </div>

                {/* Content Section */}
                <div className="h-[35%] bg-[#F0F0F0] p-6 overflow-hidden">
                  <h3 className="text-lg font-black text-black uppercase leading-tight tracking-tight text-center">
                    {portfolioData.heading}
                  </h3>
                  {/* Cutoff text simulation */}
                  <div className="mt-2 text-center text-xs text-gray-500 font-bold opacity-50">SCROLL FOR MORE</div>
                </div>
              </div>
            </div>

            {/* Label Card */}
            <div className="bg-card/30 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex items-center gap-4 shadow-lg transition-colors group-hover:bg-card/50">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                <Tablet className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-foreground">Tablet</span>
            </div>
          </motion.div>


          {/* ================= COLUMN 3: MOBILE ================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-4 group cursor-pointer"
          >

            {/* Preview Card */}
            <div className="w-full aspect-[4/3.5] bg-card rounded-2xl overflow-hidden shadow-2xl shadow-black/50 transition-all duration-500 ease-out group-hover:-translate-y-2 relative border border-white/10 group-hover:border-primary/50">

              {/* Mock Website Container (Mobile Layout) */}
              <div className="w-full h-full flex flex-col">

                {/* Hero Section */}
                <div className="h-[75%] relative overflow-hidden">
                  <img src={portfolioData.image} alt="Mobile View" className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40"></div>

                  {/* Mobile Typography: Huge & Edgy */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h2 className="text-6xl font-black uppercase tracking-tighter leading-[0.85] mb-4 mix-blend-overlay opacity-90 transition-transform duration-500 group-hover:-translate-y-2">
                      Will<br />iam
                    </h2>
                    <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-4 absolute top-10 left-4 text-transparent stroke-white border-white transition-all duration-500 group-hover:left-6" style={{ WebkitTextStroke: "1px white" }}>
                      Thomp<br />son
                    </h2>

                    <p className="text-[10px] leading-tight opacity-80 mb-4 mt-20 group-hover:opacity-100 transition-opacity">
                      Hi, I'm William Thompson...
                    </p>
                  </div>
                </div>

                {/* Content Section */}
                <div className="h-[25%] bg-[#1a1a1a] p-4 flex items-center justify-center">
                  <p className="text-white/60 text-[10px] text-center uppercase tracking-widest group-hover:text-white transition-colors">
                    © 2024 Portfolio
                  </p>
                </div>
              </div>
            </div>

            {/* Label Card */}
            <div className="bg-card/30 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex items-center gap-4 shadow-lg transition-colors group-hover:bg-card/50">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-foreground">Mobile</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ResponsiveShowcase;