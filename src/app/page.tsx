"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { 
  MapPin, BookOpen, Users, ArrowRight, Camera, Phone, 
  ShoppingBag, Sparkles, Landmark, TreePine, Heart, 
  Star, Quote, Mail, ChevronDown, Wheat, Sun, Music
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

// Madhubani-inspired subtle pattern component
const MadhubaniPattern = () => (
  <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="madhubani" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#madhubani)" />
    </svg>
  </div>
);

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <main className="bg-stone-50 text-stone-900 overflow-x-hidden selection:bg-amber-200 selection:text-amber-900">
      
      {/* ===== 1. CINEMATIC HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-950 via-green-900 to-amber-950 text-white px-6">
        {/* Animated Background Glow */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1.5s" }} />
        
        <MadhubaniPattern />

        <div className="relative z-10 text-center max-w-5xl mx-auto pt-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-8 shadow-lg hover:bg-white/20 transition-colors cursor-default"
          >
            <MapPin className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-semibold tracking-wide">मधेपुरा, मिथिलांचल, बिहार</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 tracking-tight leading-none"
          >
            आलम<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 drop-shadow-lg">नगर</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl md:text-4xl text-amber-100 mb-6 font-medium italic"
          >
            "जड़ों से जुड़ा, मिथिला की धरती का गौरव"
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-base md:text-lg text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            हमारी विरासत, हमारे लोग, हमारा गौरव। आलमनगर से जुड़े हर व्यक्ति के लिए एक डिजिटल 'चौपाल'।
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-5 justify-center mb-16"
          >
            <Link href="/about" className="group bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] flex items-center justify-center gap-3 text-lg">
              <BookOpen className="w-5 h-5" />
              हमारी विरासत देखें
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/community" className="group bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 text-lg">
              <Users className="w-5 h-5" />
              चौपाल में शामिल हों
            </Link>
            <Link href="/marketplace" className="group bg-emerald-600/80 hover:bg-emerald-500/80 backdrop-blur-md border border-emerald-400/30 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 text-lg">
              <ShoppingBag className="w-5 h-5" />
              गाँव का हाट
            </Link>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-xs text-white/50 uppercase tracking-widest">स्क्रॉल करें</span>
            <ChevronDown className="w-8 h-8 text-white/50" />
          </motion.div>
        </div>
      </section>

      {/* ===== 2. QUICK STATS (Floating Cards) ===== */}
      <section className="py-20 px-6 bg-stone-50 relative -mt-20 z-20">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { icon: TreePine, label: "वर्षों की विरासत", value: "100+", color: "bg-emerald-100 text-emerald-700" },
              { icon: Users, label: "जुड़े परिवार", value: "500+", color: "bg-amber-100 text-amber-700" },
              { icon: Landmark, label: "पवित्र स्थल", value: "10+", color: "bg-rose-100 text-rose-700" },
              { icon: Heart, label: "विदेश में हमारे लोग", value: "200+", color: "bg-purple-100 text-purple-700" },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                variants={fadeInUp}
                className="group bg-white rounded-3xl p-8 shadow-lg shadow-stone-200/50 border border-stone-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-center relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-stone-50 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-150" />
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${stat.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-4xl font-black text-stone-900 mb-2">{stat.value}</div>
                <div className="text-sm font-bold text-stone-500 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 3. ABOUT PREVIEW (Mithila Vibe) ===== */}
      <section className="py-24 px-6 bg-white relative overflow-hidden">
        <MadhubaniPattern />
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="text-emerald-600 font-black text-sm tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-emerald-600"></span>
              आलमनगर के बारे में
            </span>
            <h2 className="text-4xl md:text-6xl font-black mt-3 mb-8 text-stone-900 leading-[1.1]">
              एक गाँव, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-amber-600 to-orange-600">
                हज़ारों कहानियाँ
              </span>
            </h2>
            <p className="text-stone-600 leading-relaxed mb-6 text-lg">
              आलमनगर, मधेपुरा जिला, बिहार की पवित्र धरती पर बसा एक ऐसा गाँव जो अपनी समृद्ध संस्कृति, इतिहास और लोगों के आपनेपन की भावना के लिए जाना जाता है।
            </p>
            <p className="text-stone-600 leading-relaxed mb-10 text-lg">
              यह प्लेटफॉर्म हमारा एक छोटा सा प्रयास है हमारी मिथिला की संस्कृति को संभालने का, हमारे समुदाय को जोड़ने का, और मिलकर एक बेहतर भविष्य बनाने का।
            </p>
            <Link href="/about" className="inline-flex items-center gap-2 text-emerald-700 font-black hover:text-emerald-600 transition-colors group text-lg border-b-2 border-emerald-200 hover:border-emerald-600 pb-1">
              पूरा इतिहास पढ़ें 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="relative"
          >
            <div className="aspect-[4/3] bg-gradient-to-br from-emerald-50 via-stone-50 to-amber-50 rounded-[2rem] flex items-center justify-center shadow-2xl border-4 border-white relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596522354195-e8448ea1642c?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-80 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <p className="text-2xl font-bold mb-2">गाँव की तस्वीरें</p>
                <p className="text-white/80 text-sm flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  अपनी यादें गैलरी में अपलोड करें
                </p>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-amber-200 rounded-[2rem] -z-10 opacity-60 rotate-6" />
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-emerald-200 rounded-[2rem] -z-10 opacity-60 -rotate-6" />
          </motion.div>
        </div>
      </section>

      {/* ===== 4. EXPLORE SECTIONS (Chaupal Style) ===== */}
      <section className="py-24 px-6 bg-stone-100">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <span className="text-amber-600 font-black text-sm tracking-[0.2em] uppercase mb-4 block">खोजें</span>
            <h2 className="text-4xl md:text-6xl font-black text-stone-900">आलमनगर को जानें</h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { 
                icon: Camera, 
                title: "फोटो गैलरी", 
                desc: "पुरानी यादें, नए रंग। गाँव की वो तस्वीरें जो दिल को छू लें और आँखों में नमी ला दें।", 
                href: "/gallery", 
                color: "bg-emerald-100 text-emerald-700",
                accent: "group-hover:bg-emerald-600 group-hover:text-white"
              },
              { 
                icon: Users, 
                title: "समुदाय (चौपाल)", 
                desc: "चाहे गाँव में हों या विदेश में, आलमनगर के परिवार से जुड़े रहें। अपनी बात रखें।", 
                href: "/community", 
                color: "bg-amber-100 text-amber-700",
                accent: "group-hover:bg-amber-600 group-hover:text-white"
              },
              { 
                icon: Phone, 
                title: "डायरेक्टरी", 
                desc: "ज़रूरी नंबर, स्थानीय व्यवसाय और गाँव के महत्वपूर्ण संपर्क एक ही जगह।", 
                href: "/contact", 
                color: "bg-rose-100 text-rose-700",
                accent: "group-hover:bg-rose-600 group-hover:text-white"
              },
            ].map((card, i) => (
              <motion.div key={card.title} variants={fadeInUp}>
                <Link href={card.href} className="group block bg-white rounded-[2rem] p-10 shadow-sm border border-stone-200 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 h-full relative overflow-hidden">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 ${card.color} ${card.accent} transition-all duration-300 shadow-sm`}>
                    <card.icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-stone-900 mb-4 group-hover:text-emerald-700 transition-colors">{card.title}</h3>
                  <p className="text-stone-500 leading-relaxed text-lg mb-8">{card.desc}</p>
                  <div className="flex items-center gap-2 text-emerald-600 font-black opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                    अभी देखें <ArrowRight className="w-5 h-5" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 5. MARKETPLACE TEASER (Gaon ka Haat) ===== */}
      <section className="py-24 px-6 bg-gradient-to-br from-stone-900 via-emerald-950 to-stone-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <MadhubaniPattern />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-md border border-amber-500/30 rounded-full px-6 py-3 mb-8">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-black tracking-wide uppercase text-amber-300">गाँव का हाट (Marketplace)</span>
              </div>

              <h2 className="text-4xl md:text-7xl font-black mb-8 leading-tight">
                स्थानीय बाज़ार, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                  वैश्विक पहुँच
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-white/80 mb-6 max-w-3xl mx-auto leading-relaxed">
                अपने गाँव के किसानों, कारीगरों और स्थानीय व्यवसायों को सीधा समर्थन दें।
              </p>
            </motion.div>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            {[
              { icon: Wheat, title: "ताज़ा उपज", desc: "खेत की ताज़ी सब्ज़ियाँ, फल और अनाज सीधे किसान से" },
              { icon: Star, title: "मिथिला हस्तशिल्प", desc: "हस्तनिर्मित मिथिला पेंटिंग, मडबनी कला और पारंपरिक वस्तुएं" },
              { icon: Music, title: "स्थानीय सेवाएं", desc: "प्लंबर, इलेक्ट्रीशियन, ट्यूशन और अन्य विश्वसनीय सेवाएं" },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                className="bg-white/5 backdrop-blur-sm rounded-[2rem] p-8 border border-white/10 hover:bg-white/10 hover:border-amber-500/30 hover:scale-105 transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors">
                  <item.icon className="w-8 h-8 text-amber-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-black mb-3 text-white">{item.title}</h3>
                <p className="text-base text-white/60 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link href="/marketplace" className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black px-12 py-5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] text-lg">
              <ShoppingBag className="w-6 h-6" />
              हाट में चलें (Marketplace)
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== 6. TESTIMONIALS (Chaupal Stories) ===== */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <span className="text-emerald-600 font-black text-sm tracking-[0.2em] uppercase mb-4 block">कहानियाँ</span>
            <h2 className="text-4xl md:text-6xl font-black text-stone-900">आलमनगर की आवाज़ें</h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { quote: "आलमनगर की मिट्टी में वो खुशबू है जो दूर रहने वालों को भी अपनी ओर खींचती है। यह प्लेटफॉर्म उस खुशबू को डिजिटल रूप दे रहा है।", author: "रमेश कुमार", location: "दिल्ली, भारत", role: "प्रवासी" },
              { quote: "गाँव की यादें हमेशा दिल के करीब रहती हैं। यहाँ अपनी पुरानी तस्वीरें देखकर बचपन की यादें ताज़ा हो गईं।", author: "सुनीता देवी", location: "मुंबई, भारत", role: "शिक्षिका" },
              { quote: "मिथिला की संस्कृति और आलमनगर का प्यार - यह हमारी पहचान है। विदेश में बैठे हमें अपने गाँव से जोड़े रखने के लिए धन्यवाद।", author: "अमित सिंह", location: "अमेरिका", role: "सॉफ्टवेयर इंजीनियर" },
            ].map((t, i) => (
              <motion.div key={i} variants={fadeInUp} className="bg-stone-50 rounded-[2rem] p-10 border border-stone-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative">
                <Quote className="w-12 h-12 text-amber-400 mb-6 opacity-30 absolute top-8 right-8" />
                <p className="text-stone-700 leading-relaxed mb-8 text-lg italic relative z-10">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">
                    {t.author[0]}
                  </div>
                  <div>
                    <p className="font-black text-stone-900 text-lg">{t.author}</p>
                    <p className="text-sm text-stone-500 font-medium">{t.location} • {t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 7. NEWSLETTER ===== */}
      <section className="py-24 px-6 bg-gradient-to-br from-emerald-950 to-green-950 text-white relative overflow-hidden">
        <MadhubaniPattern />
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Mail className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6">जुड़े रहें</h2>
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
            आलमनगर के कार्यक्रमों, समाचारों और समुदाय की कहानियों की सीधी जानकारी अपने ईमेल पर पाएं।
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="अपना ईमेल दर्ज करें"
              className="flex-1 px-8 py-5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-amber-400/30 focus:border-amber-400 transition-all text-lg"
            />
            <button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black px-10 py-5 rounded-full transition-all duration-300 hover:scale-105 shadow-lg text-lg whitespace-nowrap">
              सदस्यता लें
            </button>
          </form>
        </motion.div>
      </section>

      {/* ===== 8. FOOTER ===== */}
      <footer className="bg-stone-950 text-stone-400 py-20 px-6 border-t border-stone-900 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-600" />
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <h3 className="text-white text-4xl font-black mb-6 tracking-tight">
                आलम<span className="text-amber-500">नगर</span>
              </h3>
              <p className="text-base mb-8 max-w-md leading-relaxed text-stone-400">
                मधेपुरा, बिहार, भारत का आधिकारिक डिजिटल प्लेटफॉर्म। हमारी विरासत, हमारा समुदाय, हमारा गौरव।
              </p>
              <div className="flex gap-4">
                {/* Social placeholders */}
                <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center hover:bg-amber-500 hover:text-stone-950 transition-colors cursor-pointer">
                  <Users className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center hover:bg-amber-500 hover:text-stone-950 transition-colors cursor-pointer">
                  <Camera className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-black mb-6 text-lg">त्वरित लिंक</h4>
              <ul className="space-y-4 text-base">
                <li><Link href="/about" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> हमारे बारे में</Link></li>
                <li><Link href="/gallery" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> गैलरी</Link></li>
                <li><Link href="/community" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> समुदाय</Link></li>
                <li><Link href="/marketplace" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> बाज़ार</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black mb-6 text-lg">संपर्क</h4>
              <ul className="space-y-4 text-base">
                <li><Link href="/contact" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> संपर्क करें</Link></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> आपातकालीन</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> योगदान दें</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-900 pt-10 text-center">
            <p className="text-sm text-stone-500">
              © {new Date().getFullYear()} alamnagar.in — आलमनगर के लिए <Heart className="w-4 h-4 inline text-red-500 fill-red-500 mx-1" /> के साथ बनाया गया
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}