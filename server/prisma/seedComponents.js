const prisma = require('../config/prisma');

async function seedComponents() {
  console.log('🌱 Seeding component categories and components...\n');

  // Create categories
  const categories = await Promise.all([
    prisma.componentCategory.upsert({
      where: { name: 'all' },
      update: {},
      create: {
        name: 'all',
        label: 'All Components',
        icon: 'Layers',
        gradient: 'from-purple-500 to-pink-500',
        order: 0
      }
    }),
    prisma.componentCategory.upsert({
      where: { name: 'buttons' },
      update: {},
      create: {
        name: 'buttons',
        label: 'Buttons',
        icon: 'Box',
        gradient: 'from-blue-500 to-cyan-500',
        order: 1
      }
    }),
    prisma.componentCategory.upsert({
      where: { name: 'cards' },
      update: {},
      create: {
        name: 'cards',
        label: 'Cards',
        icon: 'Square',
        gradient: 'from-green-500 to-emerald-500',
        order: 2
      }
    }),
    prisma.componentCategory.upsert({
      where: { name: 'forms' },
      update: {},
      create: {
        name: 'forms',
        label: 'Forms',
        icon: 'Type',
        gradient: 'from-orange-500 to-red-500',
        order: 3
      }
    }),
    prisma.componentCategory.upsert({
      where: { name: 'feedback' },
      update: {},
      create: {
        name: 'feedback',
        label: 'Feedback',
        icon: 'Sparkles',
        gradient: 'from-yellow-500 to-amber-500',
        order: 4
      }
    }),
    prisma.componentCategory.upsert({
      where: { name: 'animations' },
      update: {},
      create: {
        name: 'animations',
        label: 'Animations',
        icon: 'Zap',
        gradient: 'from-indigo-500 to-purple-500',
        order: 5
      }
    })
  ]);

  console.log('✅ Created categories');

  // Get category IDs
  const buttonsCategory = categories.find(c => c.name === 'buttons');
  const cardsCategory = categories.find(c => c.name === 'cards');
  const formsCategory = categories.find(c => c.name === 'forms');
  const feedbackCategory = categories.find(c => c.name === 'feedback');
  const animationsCategory = categories.find(c => c.name === 'animations');

  // Create components
  const components = [
    // Buttons
    {
      title: 'Primary Button',
      description: 'Gradient button with magnetic hover effect',
      code: `<button className="group relative px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl font-bold overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/50">
  <span className="relative z-10">Primary Button</span>
  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
</button>`,
      previewType: 'PrimaryButton',
      categoryId: buttonsCategory.id,
      tags: ['button', 'primary', 'gradient', 'hover'],
      isFeatured: true,
      order: 1
    },
    {
      title: 'Glass Morphism Button',
      description: 'Premium glassmorphism with shimmer effect',
      code: `<button className="group relative px-8 py-4 glass-card rounded-2xl font-bold overflow-hidden transition-all hover:scale-105">
  <span className="relative z-10">Glass Button</span>
  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
</button>`,
      previewType: 'GlassButton',
      categoryId: buttonsCategory.id,
      tags: ['button', 'glass', 'glassmorphism', 'shimmer'],
      order: 2
    },
    {
      title: 'Neon Glow Button',
      description: 'Futuristic button with neon glow animation',
      code: `<button className="relative px-8 py-4 bg-transparent border-2 border-primary text-primary rounded-2xl font-bold transition-all hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] hover:scale-105">
  Neon Button
</button>`,
      previewType: 'NeonButton',
      categoryId: buttonsCategory.id,
      tags: ['button', 'neon', 'glow', 'futuristic'],
      isFeatured: true,
      order: 3
    },
    // Cards
    {
      title: 'Premium Glass Card',
      description: '3D tilt effect with gradient border',
      code: `<div className="group relative glass-card rounded-3xl p-8 overflow-hidden transition-all hover:scale-105">
  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
  <h3 className="text-2xl font-bold mb-2">Premium Card</h3>
  <p className="text-muted-foreground">Hover for effect</p>
</div>`,
      previewType: 'PremiumCard',
      categoryId: cardsCategory.id,
      tags: ['card', 'glass', '3d', 'tilt'],
      isFeatured: true,
      order: 1
    },
    {
      title: 'Animated Stat Card',
      description: 'Real-time counting animation',
      code: `<div className="glass-card rounded-2xl p-6">
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mb-4"
  >
    <Zap className="w-8 h-8 text-white" />
  </motion.div>
  <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">2,543</h3>
</div>`,
      previewType: 'AnimatedStatCard',
      categoryId: cardsCategory.id,
      tags: ['card', 'stats', 'animation', 'counter'],
      order: 2
    },
    {
      title: '3D Product Card',
      description: 'Parallax hover effect',
      code: `<div className="group relative glass-card rounded-3xl overflow-hidden cursor-pointer">
  <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 group-hover:scale-110 transition-transform duration-500" />
  <div className="p-6">
    <h4 className="font-bold text-lg">Product Name</h4>
    <p className="text-primary font-bold text-xl">$99.00</p>
  </div>
</div>`,
      previewType: 'ProductCard3D',
      categoryId: cardsCategory.id,
      tags: ['card', 'product', '3d', 'parallax'],
      order: 3
    },
    // Forms
    {
      title: 'Floating Label Input',
      description: 'Material design inspired input',
      code: `<div className="relative">
  <input
    type="text"
    className="peer w-full px-4 pt-6 pb-2 bg-secondary border-2 border-white/10 rounded-xl focus:border-primary transition-all"
    placeholder=" "
  />
  <label className="absolute left-4 top-4 text-muted-foreground transition-all peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary">
    Email Address
  </label>
</div>`,
      previewType: 'FloatingInput',
      categoryId: formsCategory.id,
      tags: ['input', 'form', 'floating', 'material'],
      isFeatured: true,
      order: 1
    },
    {
      title: 'Spotlight Search',
      description: 'Search with animated spotlight effect',
      code: `<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
  <input
    type="search"
    className="relative w-full px-6 py-4 bg-secondary/50 backdrop-blur-xl border border-white/10 rounded-2xl"
    placeholder="Search with spotlight..."
  />
</div>`,
      previewType: 'SpotlightSearch',
      categoryId: formsCategory.id,
      tags: ['search', 'input', 'spotlight', 'glow'],
      order: 2
    },
    // Feedback
    {
      title: 'Gradient Badge',
      description: 'Animated gradient badges',
      code: `<span className="px-4 py-2 bg-gradient-to-r from-primary to-purple-500 text-white rounded-full text-sm font-bold animate-gradient">
  New Feature
</span>`,
      previewType: 'GradientBadge',
      categoryId: feedbackCategory.id,
      tags: ['badge', 'gradient', 'animated'],
      order: 1
    },
    {
      title: 'Glowing Progress',
      description: 'Progress bar with glow effect',
      code: `<div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
  <motion.div
    className="h-full bg-gradient-to-r from-primary to-purple-500 shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]"
    initial={{ width: 0 }}
    animate={{ width: "75%" }}
  />
</div>`,
      previewType: 'GlowingProgress',
      categoryId: feedbackCategory.id,
      tags: ['progress', 'loading', 'glow'],
      isFeatured: true,
      order: 2
    },
    {
      title: 'Pulse Loader',
      description: 'Elegant pulsing animation',
      code: `<div className="flex gap-2">
  {[0, 1, 2].map((i) => (
    <motion.div
      key={i}
      className="w-3 h-3 bg-primary rounded-full"
      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
    />
  ))}
</div>`,
      previewType: 'PulseLoader',
      categoryId: feedbackCategory.id,
      tags: ['loader', 'loading', 'pulse', 'animation'],
      order: 3
    },
    // Animations
    {
      title: 'Magnetic Hover',
      description: 'Element follows cursor',
      code: `<motion.div
  whileHover={{ scale: 1.1 }}
  className="glass-card p-8 rounded-2xl cursor-pointer"
>
  Hover me
</motion.div>`,
      previewType: 'MagneticHover',
      categoryId: animationsCategory.id,
      tags: ['animation', 'hover', 'magnetic', 'interactive'],
      isFeatured: true,
      order: 1
    },
    {
      title: 'Reveal Animation',
      description: 'Text reveal with gradient',
      code: `<motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent"
>
  Reveal Text
</motion.h1>`,
      previewType: 'RevealAnimation',
      categoryId: animationsCategory.id,
      tags: ['animation', 'reveal', 'gradient', 'text'],
      order: 2
    },
    {
      title: 'Particle Effect',
      description: 'Floating particles animation',
      code: `{[...Array(5)].map((_, i) => (
  <motion.div
    key={i}
    className="absolute w-2 h-2 bg-primary rounded-full"
    animate={{
      y: [-20, -100],
      opacity: [1, 0],
      scale: [1, 0]
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      delay: i * 0.3
    }}
  />
))}`,
      previewType: 'ParticleEffect',
      categoryId: animationsCategory.id,
      tags: ['animation', 'particles', 'floating'],
      order: 3
    }
  ];

  console.log(`Starting to create ${components.length} components...`);
  let createdCount = 0;
  for (const component of components) {
    try {
      await prisma.component.create({
        data: component
      });
      console.log(`✅ Created component: ${component.title}`);
      createdCount++;
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️ Component already exists: ${component.title}`);
      } else {
        console.error(`❌ Failed to create component ${component.title}:`, error.message);
      }
    }
  }

  console.log(`✅ Successfully created ${createdCount} components`);
  console.log('\n🎉 Component seeding complete!\n');
}

// Run if called directly
if (require.main === module) {
  seedComponents()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}

module.exports = { seedComponents };
