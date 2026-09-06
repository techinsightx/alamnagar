"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  MapPin, Users, Heart, Sprout, Sun, History, 
  ArrowRight, Star, Home, Calendar, Award, Camera, Sparkles
} from "lucide-react";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════
// 🌟 ANIMATED NUMBER COMPONENT (Dynamic Counting)
// ═══════════════════════════════════════════════════════════
const AnimatedNumber = ({ value }: { value: string }) => {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value.replace(/\D/g, ""));
  const suffix = value.replace(/\d/g, "");
  
  useEffect(() => {
    let start = 0;
    const end = numericValue;
    const duration = 2000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [numericValue]);

  return <span>{count.toLocaleString('hi-IN')}{suffix}</span>;
};

// ═══════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const values = [
    {
      icon: <Users className="w-8 h-8 text-emerald-600" />,
      title: "एकता और भाईचारा",
      desc: "आलमनगर सिर्फ एक गाँव नहीं, बल्कि एक बड़ा परिवार है। यहाँ सुख-दुख में हर कोई एक दूसरे के साथ खड़ा होता है।",
      gradient: "from-emerald-50 to-teal-50"
    },
    {
      icon: <Sprout className="w-8 h-8 text-amber-600" />,
      title: "प्रकृति से जुड़ाव",
      desc: "हमारी मिट्टी, हमारे खेत और हमारा पर्यावरण हमारी असली दौलत है। हम प्रकृति के संरक्षक हैं।",
      gradient: "from-amber-50 to-orange-50"
    },
    {
      icon: <History className="w-8 h-8 text-blue-600" />,
      title: "गौरवशाली परंपरा",
      desc: "पीढ़ियों से चली आ रही हमारी संस्कृति, त्योहार और रीति-रिवाज हमारी पहचान हैं, जिनका हम सम्मान करते हैं।",
      gradient: "from-blue-50 to-indigo-50"
    },
    {
      icon: <Sun className="w-8 h-8 text-orange-600" />,
      title: "प्रगति और शिक्षा",
      desc: "परंपरा के साथ कदम मिलाकर चलते हुए, हम शिक्षा और तकनीक के माध्यम से गाँव को नई ऊंचाइयों पर ले जा रहे हैं।",
      gradient: "from-orange-50 to-red-50"
    }
  ];

  const stats = [
    { icon: <Home className="w-6 h-6" />, value: "500+", label: "परिवार" },
    { icon: <Calendar className="w-6 h-6" />, value: "100+", label: "वर्षों की विरासत" },
    { icon: <Users className="w-6 h-6" />, value: "2000+", label: "निवासी" },
    { icon: <Award className="w-6 h-6" />, value: "100", label: "% अटूट एकता", isPercent: true },
  ];

  return (
    <main className="min-h-screen bg-stone-50 overflow-x-hidden selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* 🌟 Cinematic Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ y, opacity }}
          className="absolute inset-0 z-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1596522354195-e8448ea1642c?q=80&w=2670&auto=format&fit=crop')",
              filter: "brightness(0.35)"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-900/40 to-stone-50" />
        </motion.div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full mb-8 shadow-lg"
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-bold uppercase tracking-widest">मधेपुरा, बिहार</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tight"
          >
            आलमनगर: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400 animate-pulse">
              हमारी जड़ें, हमारी पहचान
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-2xl text-stone-200 max-w-3xl mx-auto mb-12 leading-relaxed font-light"
          >
            एक ऐसा गाँव जहाँ परंपरा और प्रगति का अनूठा संगम है। 
            यहाँ की मिट्टी में खुशबू है, और लोगों के दिलों में अपार प्यार।
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <Link 
              href="/community" 
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:scale-105"
            >
              समुदाय से जुड़ें
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/gallery" 
              className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all hover:scale-105"
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
              विरासत देखें
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 📜 Our Story Section */}
      <section className="py-24 md:py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fadeInUp} className="relative">
              {/* Decorative Blobs */}
              <div className="absolute -top-8 -left-8 w-40 h-40 bg-amber-200/50 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-emerald-200/50 rounded-full blur-3xl" />
              
              {/* Main Image with Reveal */}
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white group">
                <motion.img 
                  initial={{ scale: 1.1 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2670&auto=format&fit=crop" 
                  alt="Village Life" 
                  className="w-full h-[400px] md:h-[550px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Floating Badge */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="absolute -bottom-8 -right-4 md:-right-8 bg-white p-6 rounded-2xl shadow-2xl border border-stone-100 hidden md:flex items-center gap-4 z-10"
              >
                <div className="p-4 bg-emerald-100 rounded-full animate-pulse">
                  <Heart className="w-8 h-8 text-emerald-600 fill-emerald-600" />
                </div>
                <div>
                  <p className="text-3xl font-black text-stone-900">100%</p>
                  <p className="text-sm text-stone-500 font-semibold">प्यार और अपनापन</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold">
                <History className="w-4 h-4" />
                हमारी कहानी
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-stone-900 leading-[1.1] tracking-tight">
                मिट्टी से जुड़ा एक <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">अनमोल रिश्ता</span>
              </h2>
              <div className="space-y-6 text-lg text-stone-600 leading-relaxed">
                <p>
                  आलमनगर सिर्फ एक भौगोलिक स्थान नहीं, बल्कि हम सबकी भावनाओं का केंद्र है। पीढ़ियों से यहाँ के लोग कृषि, संस्कृति और आपसी सहयोग के बल पर एक मिसाल कायम कर रहे हैं।
                </p>
                <p>
                  आज, जब दुनिया तेजी से बदल रही है, हमने ठान लिया है कि हम अपनी जड़ों को मजबूत रखते हुए, तकनीक के माध्यम से अपने गाँव को एक <strong className="text-stone-900">"डिजिटल विरासत"</strong> प्रदान करेंगे। ताकि दुनिया के किसी भी कोने में बैठे आलमनगरी को अपने गाँव की हर खबर और यादें मिलती रहें।
                </p>
              </div>
              
              <div className="pt-4 flex flex-wrap gap-6">
                {["समृद्ध संस्कृति", "शिक्षा पर बल", "पर्यावरण प्रेम"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-stone-800 font-bold">
                    <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 💎 Core Values Section */}
      <section className="py-24 bg-stone-100 px-6 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-bold mb-6">
              <Star className="w-4 h-4 fill-amber-800" />
              हमारे मूल्य
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-black text-stone-900 tracking-tight">
              वो सिद्धांत जो हमें <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-emerald-600">खास</span> बनाते हैं
            </motion.h2>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`group relative bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden`}
              >
                {/* Hover Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-stone-50 group-hover:bg-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-stone-100">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-black text-stone-900 mb-3 group-hover:text-stone-800">
                    {value.title}
                  </h3>
                  <p className="text-stone-600 group-hover:text-stone-700 leading-relaxed text-sm">
                    {value.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 📊 Dynamic Stats Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-950" />
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/20 rounded-full blur-[120px]" />
        
        <div className="relative max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center"
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={fadeInUp} className="space-y-4 group">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl mb-2 text-amber-400 group-hover:bg-white/10 group-hover:scale-110 transition-all duration-300">
                  {stat.icon}
                </div>
                <p className="text-4xl md:text-6xl font-black text-white tracking-tight">
                  <AnimatedNumber value={stat.value} />
                  {stat.isPercent && "%"}
                </p>
                <p className="text-stone-400 font-bold uppercase tracking-widest text-xs md:text-sm">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 🚀 Call to Action Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-amber-700 rounded-[2.5rem] p-10 md:p-16 shadow-2xl shadow-emerald-900/20 overflow-hidden"
          >
            {/* Animated Background Glows */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" 
            />
            <motion.div 
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 8, repeat: Infinity, delay: 1 }}
              className="absolute bottom-0 left-0 w-96 h-96 bg-black/20 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl" 
            />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-8 leading-tight tracking-tight">
                क्या आप भी इस विरासत का <br /> 
                <span className="text-amber-300">हिस्सा बनना चाहते हैं?</span>
              </h2>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-12 leading-relaxed">
                चाहे आप गाँव में रहते हों या दुनिया के किसी कोने में, आलमनगर का यह डिजिटल मंच आपका ही है। 
                अपनी तस्वीरें, यादें और विचार साझा करके इसे और भी खास बनाएं।
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <Link 
                  href="/auth" 
                  className="w-full sm:w-auto px-10 py-5 bg-white text-emerald-800 font-black rounded-2xl shadow-xl hover:bg-stone-100 transition-all hover:scale-105 flex items-center justify-center gap-3 text-lg"
                >
                  <Users className="w-6 h-6" />
                  समुदाय में शामिल हों
                </Link>
                <Link 
                  href="/gallery" 
                  className="w-full sm:w-auto px-10 py-5 bg-emerald-800/40 backdrop-blur-xl border border-white/20 text-white font-bold rounded-2xl hover:bg-emerald-800/60 transition-all hover:scale-105 flex items-center justify-center gap-3 text-lg"
                >
                  <Camera className="w-6 h-6" />
                  गैलरी देखें
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </main>
  );
}