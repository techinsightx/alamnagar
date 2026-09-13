"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Rocket, LayoutTemplate, Bot, ExternalLink, Sparkles, Globe, Code, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════
// 🖼️ SMOOTH IMAGE SLIDER COMPONENT
// ═══════════════════════════════════════════════════════════
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop",
];

const SmoothImageSlider = ({ images, className }: { images: string[], className?: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resolvedImages, setResolvedImages] = useState<string[]>(images);

  const handleImageError = (index: number) => {
    setResolvedImages(prev => {
      const updated = [...prev];
      if (!updated[index].startsWith('http')) {
        updated[index] = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
      }
      return updated;
    });
  };

  useEffect(() => {
    if (resolvedImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % resolvedImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [resolvedImages.length]);

  return (
    <div className={`relative w-full h-full overflow-hidden bg-stone-900 ${className}`}>
      {resolvedImages.map((img, index) => (
        <motion.div
          key={img}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ 
            opacity: index === currentIndex ? 1 : 0,
            scale: index === currentIndex ? 1 : 1.15
          }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        >
          <img 
            src={img} 
            alt={`Tools ${index + 1}`} 
            className="w-full h-full object-cover"
            onError={() => handleImageError(index)}
          />
        </motion.div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-indigo-950/50 to-transparent pointer-events-none" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {resolvedImages.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-cyan-400 w-8' : 'bg-white/50 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// ✅ TOOLS CINEMATIC SLIDER
const ToolsCinematicSlider = () => {
  const toolImages = [
    '/images/tools-hero-1.jpg',
    '/images/tools-hero-2.jpg',
    '/images/tools-hero-3.jpg',
    '/images/tools-hero-4.jpg',
    '/images/tools-hero-5.jpg'
  ];

  return (
    <div className="absolute inset-0 z-0 w-full min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
      <SmoothImageSlider images={toolImages} className="w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/95 via-indigo-950/60 to-transparent" />
    </div>
  );
};

// ✅ UPDATED TOOLS ARRAY (No More Coming Soon!)
const TOOLS = [
  {
    id: 1,
    title: "FunnelsBuilder",
    description: "Mufat mein professional website aur high-converting landing pages banayein. Coding ki zarurat nahi!",
    icon: LayoutTemplate,
    href: "https://funnelsbuilder.netlify.app",
    color: "from-purple-500 to-indigo-500",
    tags: ["Web Dev", "No-Code", "Free"],
    external: true
  },
  {
    id: 2,
    title: "AI Passive System",
    description: "Automated AI tools jo khud kaam karte hain. Passive income aur smart work ke liye best solution.",
    icon: Bot,
    href: "https://aipassivesystem.netlify.app",
    color: "from-cyan-500 to-blue-500",
    tags: ["AI", "Automation", "Income"],
    external: true
  },
  {
    id: 3,
    title: "Alamnagar Analytics",
    description: "Community growth, post views, aur user engagement ko track karne ke liye advanced real-time dashboard.",
    icon: BarChart3, // Changed from Lock to BarChart3 for live analytics feel
    href: "/analytics", // ✅ Direct link to the indexed analytics page
    color: "from-emerald-500 to-teal-500",
    tags: ["Analytics", "Real-time", "Dashboard"],
    external: false,
    comingSoon: false // ✅ Removed coming soon
  }
];

export default function ToolsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-stone-950 text-white relative overflow-hidden selection:bg-cyan-500/30">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Top Navigation */}
      <div className="relative z-30 p-4 md:p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-white bg-black/40 hover:bg-black/60 backdrop-blur-md px-4 py-2 rounded-full transition-all border border-white/20 shadow-lg">
          <ArrowLeft className="w-4 h-4" /> Back to Alamnagar
        </Link>
      </div>

      {/* Hero Section with Cinematic Slider */}
      <section className="relative z-10 min-h-[500px] md:min-h-[600px] lg:min-h-[700px] flex items-center justify-center px-4 md:px-8">
        <ToolsCinematicSlider />
        
        <div className="relative z-10 text-center max-w-5xl mx-auto pt-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 bg-cyan-500/30 backdrop-blur-md border border-cyan-400/30 rounded-full px-6 py-3 mb-8 shadow-lg shadow-cyan-500/20">
              <Rocket className="w-6 h-6 text-cyan-300" />
              <span className="text-sm font-black tracking-wider text-white uppercase">Creator Hub</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight drop-shadow-2xl">
              Apne Digital Safar Ko <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                Banayein Aur Bhi Shandaar
              </span>
            </h1>
            
            <p className="text-lg md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-lg mb-8">
              Professional tools, AI automation, aur web development resources ek hi jagah. Apne skills ko next level par le jayein.
            </p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 text-sm text-white/70"
            >
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <Code className="w-4 h-4 text-purple-400" /> Web Development
              </span>
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <Bot className="w-4 h-4 text-cyan-400" /> AI Tools
              </span>
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <Globe className="w-4 h-4 text-blue-400" /> Free Resources
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="relative z-10 px-4 md:px-8 py-24 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {TOOLS.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative bg-stone-900/80 backdrop-blur-xl border rounded-3xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-2 overflow-hidden ${
                tool.comingSoon 
                  ? "border-white/5 opacity-70" 
                  : "border-white/10 hover:border-cyan-500/50 hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.3)]"
              }`}
            >
              {!tool.comingSoon && (
                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-20 rounded-full blur-3xl transition-opacity duration-500 -mr-10 -mt-10`} />
              )}
              
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <tool.icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-2xl md:text-3xl font-black text-white">{tool.title}</h3>
                  {tool.external && !tool.comingSoon && <ExternalLink className="w-5 h-5 text-stone-500" />}
                </div>
                
                <p className="text-stone-400 text-sm md:text-base mb-6 leading-relaxed">{tool.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {tool.tags.map((tag, i) => (
                    <span key={i} className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-stone-300">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* ✅ Dynamic Button: Live Link or Coming Soon */}
                {tool.comingSoon ? (
                  <button disabled className="w-full inline-flex items-center justify-center gap-2 bg-stone-800 text-stone-500 font-bold py-3.5 rounded-xl cursor-not-allowed border border-stone-700">
                    Coming Soon
                  </button>
                ) : (
                  <Link 
                    href={tool.href} 
                    target={tool.external ? "_blank" : "_self"}
                    rel={tool.external ? "noopener noreferrer" : ""}
                    className={`w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r ${tool.color} text-white font-bold py-3.5 rounded-xl hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]`}
                  >
                    {tool.external ? "Use Tool" : "Open Dashboard"} <ExternalLink className="w-4 h-4 opacity-70" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 border-t border-white/10 bg-stone-950/80 backdrop-blur-md py-16 text-center">
        <p className="text-stone-400 text-base flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" /> More powerful tools are being built for the Alamnagar community! 🚀
        </p>
      </section>
    </main>
  );
}