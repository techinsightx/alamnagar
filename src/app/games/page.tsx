"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Gamepad2, Sparkles, ExternalLink, Target, Palette, Play } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════
// 🖼️ SMOOTH IMAGE SLIDER COMPONENT
// ═══════════════════════════════════════════════════════════
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552820728-8b83bb6b2b0a?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop",
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
            alt={`Gaming ${index + 1}`} 
            className="w-full h-full object-cover"
            onError={() => handleImageError(index)}
          />
        </motion.div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-950/50 to-transparent pointer-events-none" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {resolvedImages.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-purple-400 w-8' : 'bg-white/50 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// ✅ GAMES CINEMATIC SLIDER
const GamesCinematicSlider = () => {
  const gameImages = [
    '/images/games-hero-1.jpg',
    '/images/games-hero-2.jpg',
    '/images/games-hero-3.jpg',
    '/images/games-hero-4.jpg',
    '/images/games-hero-5.jpg'
  ];

  return (
    <div className="absolute inset-0 z-0 w-full min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
      <SmoothImageSlider images={gameImages} className="w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-purple-950/95 via-purple-950/60 to-transparent" />
    </div>
  );
};

// ✅ UPDATED GAMES ARRAY (Fully in Hindi/Devnagari with Turbo Racer)
const GAMES = [
  {
    id: 1,
    title: "बबल पॉप",
    description: "गुब्बारों को फोड़ो और जादुई वस्तुएं इकट्ठा करो! आरामदायक और रंगीन गेमप्ले।",
    icon: "🎈",
    href: "/games/bubble-pop",
    color: "from-pink-500 to-purple-500",
    tags: ["आरामदायक", "रिलैक्सिंग", "बच्चों के लिए"]
  },
  {
    id: 2,
    title: "जादुई टोकरी",
    description: "गिरते हुए तारे और उपहार पकड़ो, बम से बचो! तेज़ गति वाली जादुई एक्शन।",
    icon: "🧺",
    href: "/games/magical-catch",
    color: "from-indigo-500 to-purple-600",
    tags: ["एक्शन", "जादू", "तेज़"]
  },
  {
    id: 3,
    title: "आलमनगर स्ट्राइक",
    description: "सर्वाइवल शूटर एक्शन! दुश्मनों को हराओ, लहरों का सामना करो और गाँव को बचाओ।",
    icon: "🔫",
    href: "/games/alamnagar-strike",
    color: "from-red-500 to-orange-600",
    tags: ["शूटर", "सर्वाइवल", "हार्डकोर"]
  },
  {
    id: 4,
    title: "टर्बो रेसर",
    description: "जंगल, शहर या हाईवे पर तेज़ रफ़्तार रेस! नाइट्रो बूस्ट के साथ दुश्मनों को पीछे छोड़ो।",
    icon: "🏎️",
    href: "/games/turbo-racer",
    color: "from-emerald-500 to-blue-600",
    tags: ["रेसिंग", "तेज़ रफ़्तार", "नाइट्रो"]
  }
];

export default function GamesPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-stone-950 text-white relative overflow-hidden selection:bg-purple-500/30">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      {/* Top Navigation */}
      <div className="relative z-30 p-4 md:p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-white bg-black/40 hover:bg-black/60 backdrop-blur-md px-4 py-2 rounded-full transition-all border border-white/20 shadow-lg">
          <ArrowLeft className="w-4 h-4" /> आलमनगर पर वापस
        </Link>
      </div>

      {/* Hero Section with Cinematic Slider */}
      <section className="relative z-10 min-h-[500px] md:min-h-[600px] lg:min-h-[700px] flex items-center justify-center px-4 md:px-8">
        <GamesCinematicSlider />
        
        <div className="relative z-10 text-center max-w-5xl mx-auto pt-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 bg-purple-500/30 backdrop-blur-md border border-purple-400/30 rounded-full px-6 py-3 mb-8 shadow-lg shadow-purple-500/20">
              <Gamepad2 className="w-6 h-6 text-purple-300" />
              <span className="text-sm font-black tracking-wider text-white uppercase">गेमिंग एरेना</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight drop-shadow-2xl">
              खेलो, जीतो, और <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
                मज़ा करो!
              </span>
            </h1>
            
            <p className="text-lg md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-lg mb-8">
              आलमनगर के लिए विशेष रूप से डिज़ाइन किए गए गेम्स। चाहे आराम करना हो या एक्शन, यहाँ सब कुछ है!
            </p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 text-sm text-white/70"
            >
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <Sparkles className="w-4 h-4 text-yellow-400" /> मुफ्त में खेलें
              </span>
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <Target className="w-4 h-4 text-red-400" /> बिना डाउनलोड के
              </span>
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <Palette className="w-4 h-4 text-blue-400" /> ब्राउज़र आधारित
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="relative z-10 px-4 md:px-8 py-24 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {GAMES.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-stone-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.3)] overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-20 rounded-full blur-3xl transition-opacity duration-500 -mr-10 -mt-10`} />
              
              <div className="relative z-10">
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">{game.icon}</div>
                
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3">{game.title}</h3>
                <p className="text-stone-400 text-sm md:text-base mb-6 leading-relaxed">{game.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {game.tags.map((tag, i) => (
                    <span key={i} className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-stone-300">
                      {tag}
                    </span>
                  ))}
                </div>

                <Link 
                  href={game.href} 
                  className={`w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r ${game.color} text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-[1.02]`}
                >
                  <Play className="w-5 h-5 fill-white" /> अभी खेलें <ExternalLink className="w-4 h-4 opacity-70" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 border-t border-white/10 bg-stone-950/80 backdrop-blur-md py-16 text-center">
        <p className="text-stone-400 text-base flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" /> आलमनगर गेमिंग एरेना में जल्द ही और भी शानदार गेम्स आ रहे हैं! 🎮
        </p>
      </section>
    </main>
  );
}