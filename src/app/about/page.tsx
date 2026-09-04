"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  MapPin, Users, Heart, Sprout, Sun, History, 
  ArrowRight, Star, Home, Calendar, Award, Camera
} from "lucide-react";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════
// ANIMATION VARIANTS (FIXED with `as const`)
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
    transition: { staggerChildren: 0.2 }
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
      desc: "आलमनगर सिर्फ एक गाँव नहीं, बल्कि एक बड़ा परिवार है। यहाँ सुख-दुख में हर कोई एक दूसरे के साथ खड़ा होता है।"
    },
    {
      icon: <Sprout className="w-8 h-8 text-amber-600" />,
      title: "प्रकृति से जुड़ाव",
      desc: "हमारी मिट्टी, हमारे खेत और हमारा पर्यावरण हमारी असली दौलत है। हम प्रकृति के संरक्षक हैं।"
    },
    {
      icon: <History className="w-8 h-8 text-blue-600" />,
      title: "गौरवशाली परंपरा",
      desc: "पीढ़ियों से चली आ रही हमारी संस्कृति, त्योहार और रीति-रिवाज हमारी पहचान हैं, जिनका हम सम्मान करते हैं।"
    },
    {
      icon: <Sun className="w-8 h-8 text-orange-600" />,
      title: "प्रगति और शिक्षा",
      desc: "परंपरा के साथ कदम मिलाकर चलते हुए, हम शिक्षा और तकनीक के माध्यम से गाँव को नई ऊंचाइयों पर ले जा रहे हैं।"
    }
  ];

  const stats = [
    { icon: <Home className="w-6 h-6" />, value: "500+", label: "परिवार" },
    { icon: <Calendar className="w-6 h-6" />, value: "100+", label: "वर्षों की विरासत" },
    { icon: <Users className="w-6 h-6" />, value: "2000+", label: "निवासी" },
    { icon: <Award className="w-6 h-6" />, value: "100%", label: "अटूट एकता" },
  ];

  return (
    <main className="min-h-screen bg-stone-50 overflow-x-hidden">
      
      {/* 🌟 Cinematic Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ y, opacity }}
          className="absolute inset-0 z-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1596522354195-e8448ea1642c?q=80&w=2670&auto=format&fit=crop')",
              filter: "brightness(0.4)"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-900/40 to-stone-50" />
        </motion.div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-8"
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-bold uppercase tracking-widest">मधेपुरा, बिहार</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
          >
            आलमनगर: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400">
              हमारी जड़ें, हमारी पहचान
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-2xl text-stone-200 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            एक ऐसा गाँव जहाँ परंपरा और प्रगति का अनूठा संगम है। 
            यहाँ की मिट्टी में खुशबू है, और लोगों के दिलों में अपार प्यार।
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
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
              className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all"
            >
              <Star className="w-5 h-5 text-amber-400" />
              विरासत देखें
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 📜 Our Story Section */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-12 md:gap-20 items-center"
          >
            <motion.div variants={fadeInUp} className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-amber-200 rounded-full opacity-50 blur-2xl" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-emerald-200 rounded-full opacity-50 blur-2xl" />
              <img 
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2670&auto=format&fit=crop" 
                alt="Village Life" 
                className="relative rounded-3xl shadow-2xl border-4 border-white w-full object-cover h-[400px] md:h-[500px]"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-stone-100 hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 rounded-full">
                    <Heart className="w-6 h-6 text-emerald-600 fill-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-stone-900">100%</p>
                    <p className="text-sm text-stone-500 font-medium">प्यार और अपनापन</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold">
                <History className="w-4 h-4" />
                हमारी कहानी
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-stone-900 leading-tight">
                मिट्टी से जुड़ा एक <span className="text-emerald-600">अनमोल रिश्ता</span>
              </h2>
              <p className="text-lg text-stone-600 leading-relaxed">
                आलमनगर सिर्फ एक भौगोलिक स्थान नहीं, बल्कि हम सबकी भावनाओं का केंद्र है। पीढ़ियों से यहाँ के लोग कृषि, संस्कृति और आपसी सहयोग के बल पर एक मिसाल कायम कर रहे हैं।
              </p>
              <p className="text-lg text-stone-600 leading-relaxed">
                आज, जब दुनिया तेजी से बदल रही है, हमने ठान लिया है कि हम अपनी जड़ों को मजबूत रखते हुए, तकनीक के माध्यम से अपने गाँव को एक <strong className="text-stone-900">"डिजिटल विरासत"</strong> प्रदान करेंगे। ताकि दुनिया के किसी भी कोने में बैठे आलमनगरी को अपने गाँव की हर खबर और यादें मिलती रहें।
              </p>
              
              <div className="pt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-stone-700 font-semibold">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  समृद्ध संस्कृति
                </div>
                <div className="flex items-center gap-2 text-stone-700 font-semibold">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  शिक्षा पर बल
                </div>
                <div className="flex items-center gap-2 text-stone-700 font-semibold">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  पर्यावरण प्रेम
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 💎 Core Values Section */}
      <section className="py-20 bg-stone-100 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold mb-4">
              <Star className="w-4 h-4" />
              हमारे मूल्य
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-extrabold text-stone-900">
              वो सिद्धांत जो हमें <span className="text-amber-600">खास</span> बनाते हैं
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
                className="group bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{value.title}</h3>
                <p className="text-stone-600 leading-relaxed text-sm">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 📊 Stats Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 to-stone-900" />
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        
        <div className="relative max-w-6xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center"
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={fadeInUp} className="space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 text-amber-400">
                  {stat.icon}
                </div>
                <p className="text-4xl md:text-5xl font-extrabold text-white">{stat.value}</p>
                <p className="text-stone-400 font-medium uppercase tracking-wider text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 🚀 Call to Action Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-emerald-600 to-amber-600 rounded-[2.5rem] p-10 md:p-16 shadow-2xl shadow-emerald-500/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                क्या आप भी इस विरासत का <br /> हिस्सा बनना चाहते हैं?
              </h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto mb-10">
                चाहे आप गाँव में रहते हों या दुनिया के किसी कोने में, आलमनगर का यह डिजिटल मंच आपका ही है। 
                अपनी तस्वीरें, यादें और विचार साझा करके इसे और भी खास बनाएं।
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/auth" 
                  className="px-8 py-4 bg-white text-emerald-700 font-bold rounded-2xl shadow-lg hover:bg-stone-100 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  समुदाय में शामिल हों
                </Link>
                <Link 
                  href="/gallery" 
                  className="px-8 py-4 bg-emerald-800/50 backdrop-blur-sm border border-white/20 text-white font-bold rounded-2xl hover:bg-emerald-800/70 transition-all flex items-center gap-2"
                >
                  <Camera className="w-5 h-5" />
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