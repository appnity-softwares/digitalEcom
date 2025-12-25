import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const TestimonialsGrid = () => {
  const testimonials = [
    {
      id: 1,
      name: "Jake Thompson",
      handle: "@jakethompsonux",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      text: "DigitalStudio made launching my first Framer template effortless! The layout is sleek, the CMS is intuitive, and I had my store up in minutes. Highly recommend!",
      template: "Haven Estate",
      date: "Feb 16, 2025"
    },
    {
      id: 2,
      name: "Emily Carter",
      handle: "@emilycdesigns",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      text: "I've used several Framer templates before, but this one is a game-changer. Everything is optimized for selling templates effortlessly!",
      template: "Educore",
      date: "Feb 16, 2025"
    },
    {
      id: 3,
      name: "Ryan Mitchell",
      handle: "@ryanmitchellux",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200",
      text: "This is hands down the best way to launch a template store. The UI is clean, and the CMS is perfectly structured. 10/10!",
      template: "Bento Portfolio",
      date: "Feb 16, 2025"
    },
    {
      id: 4,
      name: "Sophia Williams",
      handle: "@sophiawdesigns",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
      text: "The perfect balance of aesthetics and functionality! I had my store live in under an hour, and it looks stunning!",
      template: "Designo",
      date: "Feb 16, 2025"
    },
    {
      id: 5,
      name: "Brandon Scott",
      handle: "@brandonscottui",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
      text: "As a designer, I appreciate how polished and flexible this platform is. It's exactly what I needed to start selling templates professionally!",
      template: "Vellox",
      date: "Feb 16, 2025"
    },
    {
      id: 6,
      name: "Olivia Reed",
      handle: "@oliviareedux",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
      text: "This platform turned what used to be a complicated process into something super easy. It's fast, responsive, and built for success!",
      template: "AI Chatbot",
      date: "Feb 16, 2025"
    }
  ];

  return (
    <div className="w-full bg-background px-6 py-20 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card-hover rounded-2xl p-8 flex flex-col justify-between h-full"
            >
              {/* Top Section: User Info & Content */}
              <div>
                {/* Header: Avatar, Name, Stars */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground text-sm leading-tight">
                        {item.name}
                      </span>
                      <span className="text-primary text-xs font-medium">
                        {item.handle}
                      </span>
                    </div>
                  </div>

                  {/* 5 Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>

                {/* Quote Icon */}
                <Quote className="w-6 h-6 text-primary/30 mb-3" />

                {/* Review Text */}
                <p className="text-muted-foreground text-[15px] leading-relaxed">
                  {item.text}
                </p>
              </div>

              {/* Bottom Section: Template & Date */}
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-medium text-foreground">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">{item.template}</span>
                <span className="text-muted-foreground">{item.date}</span>
              </div>

            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsGrid;