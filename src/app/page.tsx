"use client";

import { motion } from "framer-motion";
import { 
  MapPin, BookOpen, Users, ArrowRight, Camera, Phone, 
  ShoppingBag, Sparkles, Landmark, TreePine, Heart, 
  Star, Quote, Mail, ChevronDown
} from "lucide-react";
import Link from "next/link";

// Animation variants - TypeScript safe
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

export default function HomePage() {
  return (
    <main className="bg-stone-50 text-stone-900 overflow-x-hidden">
      
      {/* ===== 1. HERO SECTION ===== */}
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-950 via-green-900 to-amber-950 text-white px-6">
        {/* Animated Background Glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-8 shadow-lg"
          >
            <MapPin className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-semibold tracking-wide">मधेपुरा, बिहार, भारत</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-9xl font-extrabold mb-6 tracking-tight"
          >
            आलम<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">नगर</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl md:text-3xl text-white/90 mb-4 font-medium"
          >
            जड़ों से जुड़ा, मिथिला की धरती का गौरव
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-base md:text-lg text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            हमारी विरासत, हमारे लोग, हमारा गौरव। आलमनगर से जुड़े हर व्यक्ति के लिए एक डिजिटल घर।
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-5 justify-center mb-16"
          >
            <Link href="/about" className="group bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center justify-center gap-3">
              <BookOpen className="w-5 h-5" />
              हमारी विरासत देखें
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/community" className="group bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3">
              <Users className="w-5 h-5" />
              समुदाय से जुड़ें
            </Link>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="w-8 h-8 text-white/50 animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* ===== 2. QUICK STATS ===== */}
      <section className="py-20 px-6 bg-stone-50 relative -mt-16 z-20">
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
                className="group bg-white rounded-3xl p-8 shadow-sm border border-stone-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-center"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-4xl font-extrabold text-stone-900 mb-2">{stat.value}</div>
                <div className="text-sm font-semibold text-stone-500">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 3. ABOUT PREVIEW ===== */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInLeft}
          >
            <span className="text-emerald-600 font-bold text-sm tracking-widest uppercase mb-4 block">आलमनगर के बारे में</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-3 mb-8 text-stone-900 leading-tight">
              एक गाँव, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">हज़ारों कहानियाँ</span>
            </h2>
            <p className="text-stone-600 leading-relaxed mb-6 text-lg">
              आलमनगर, मधेपुरा जिला, बिहार की पवित्र धरती पर बसा एक ऐसा गाँव जो अपनी समृद्ध संस्कृति, इतिहास और लोगों के आपनेपन की भावना के लिए जाना जाता है।
            </p>
            <p className="text-stone-600 leading-relaxed mb-10 text-lg">
              यह प्लेटफॉर्म हमारा एक छोटा सा प्रयास है हमारी मिथिला की संस्कृति को संभालने का, हमारे समुदाय को जोड़ने का, और मिलकर एक बेहतर भविष्य बनाने का।
            </p>
            <Link href="/about" className="inline-flex items-center gap-2 text-emerald-700 font-bold hover:text-emerald-600 transition-colors group text-lg">
              पूरा इतिहास पढ़ें 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInRight}
            className="relative"
          >
            <div className="aspect-[4/3] bg-gradient-to-br from-emerald-100 via-stone-100 to-amber-100 rounded-3xl flex items-center justify-center shadow-2xl border border-stone-200 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-amber-600/10 group-hover:from-emerald-600/20 group-hover:to-amber-600/20 transition-all duration-500" />
              <div className="text-center p-8 relative z-10">
                <Landmark className="w-20 h-20 text-emerald-700 mx-auto mb-6 animate-pulse" />
                <p className="text-emerald-900 font-bold text-xl mb-2">गाँव की तस्वीरें जल्द आएंगी</p>
                <p className="text-emerald-700 text-sm">अपनी आलमनगर की यादें अपलोड करें</p>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-amber-200 rounded-3xl -z-10 opacity-50" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-emerald-200 rounded-2xl -z-10 opacity-50" />
          </motion.div>
        </div>
      </section>

      {/* ===== 4. EXPLORE SECTIONS ===== */}
      <section className="py-24 px-6 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <span className="text-emerald-600 font-bold text-sm tracking-widest uppercase mb-4 block">खोजें</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-stone-900">आलमनगर को जानें</h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: Camera, title: "फोटो गैलरी", desc: "पुरानी यादें, नए रंग। गाँव की तस्वीरें जो दिल को छू लें।", href: "/gallery", color: "bg-emerald-100 text-emerald-700" },
              { icon: Users, title: "समुदाय से जुड़ें", desc: "चाहे गाँव में हों या विदेश में, आलमनगर के परिवार से जुड़े रहें।", href: "/community", color: "bg-amber-100 text-amber-700" },
              { icon: Phone, title: "आपातकालीन और डायरेक्टरी", desc: "ज़रूरी नंबर, स्थानीय व्यवसाय और गाँव के महत्वपूर्ण संपर्क।", href: "/contact", color: "bg-rose-100 text-rose-700" },
            ].map((card, i) => (
              <motion.div key={card.title} variants={fadeInUp}>
                <Link href={card.href} className="group block bg-white rounded-3xl p-10 shadow-sm border border-stone-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900 mb-4 group-hover:text-emerald-700 transition-colors">{card.title}</h3>
                  <p className="text-stone-500 leading-relaxed text-lg mb-6">{card.desc}</p>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    अभी देखें <ArrowRight className="w-5 h-5" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 5. MARKETPLACE TEASER ===== */}
      <section className="py-24 px-6 bg-gradient-to-br from-indigo-950 via-purple-950 to-stone-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-8">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold tracking-wide uppercase">जल्द आ रहा है</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-extrabold mb-8">स्थानीय बाज़ार</h2>
            <p className="text-xl md:text-2xl text-white/90 mb-6 max-w-3xl mx-auto leading-relaxed">
              अपने गाँव के किसानों, कारीगरों और स्थानीय व्यवसायों को समर्थन दें।
            </p>
            <p className="text-base text-white/60 mb-12 max-w-3xl mx-auto">
              ताज़ी उपज, हस्तनिर्मित शिल्प और स्थानीय सेवाएं — सब कुछ एक ही जगह पर। सीधे आलमनगर से, दुनिया के लिए।
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: ShoppingBag, title: "स्थानीय उत्पाद", desc: "खेत की ताज़ी सब्ज़ियाँ, फल और अनाज" },
                { icon: Users, title: "हस्तशिल्प", desc: "हस्तनिर्मित मिथिला कला और पारंपरिक वस्तुएं" },
                { icon: Phone, title: "स्थानीय सेवाएं", desc: "प्लंबर, इलेक्ट्रीशियन और अन्य सेवाएं" },
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  variants={scaleIn}
                  className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300"
                >
                  <item.icon className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-white/60">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <Link href="/marketplace" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-10 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]">
              <ShoppingBag className="w-5 h-5" />
              बाज़ार देखें
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== 6. TESTIMONIALS ===== */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <span className="text-emerald-600 font-bold text-sm tracking-widest uppercase mb-4 block">कहानियाँ</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-stone-900">आलमनगर की आवाज़ें</h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { quote: "आलमनगर की मिट्टी में वो खुशबू है जो दूर रहने वालों को भी अपनी ओर खींचती है।", author: "रमेश कुमार", location: "दिल्ली, भारत" },
              { quote: "गाँव की यादें हमेशा दिल के करीब रहती हैं। यह प्लेटफॉर्म हमें जोड़े रखता है।", author: "सुनीता देवी", location: "मुंबई, भारत" },
              { quote: "मिथिला की संस्कृति और आलमनगर का प्यार - यह हमारी पहचान है।", author: "अमित सिंह", location: "अमेरिका" },
            ].map((t, i) => (
              <motion.div key={i} variants={fadeInUp} className="bg-stone-50 rounded-3xl p-8 border border-stone-100 hover:shadow-xl transition-all duration-300">
                <Quote className="w-10 h-10 text-emerald-600 mb-6 opacity-50" />
                <p className="text-stone-700 leading-relaxed mb-8 text-lg italic">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {t.author[0]}
                  </div>
                  <div>
                    <p className="font-bold text-stone-900">{t.author}</p>
                    <p className="text-sm text-stone-500">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 7. NEWSLETTER ===== */}
      <section className="py-24 px-6 bg-gradient-to-br from-emerald-950 to-green-950 text-white">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-3xl mx-auto text-center"
        >
          <Mail className="w-16 h-16 text-amber-400 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">जुड़े रहें</h2>
          <p className="text-lg text-white/70 mb-10">
            आलमनगर के कार्यक्रमों, समाचारों और समुदाय की कहानियों की सीधी जानकारी अपने ईमेल पर पाएं।
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="अपना ईमेल दर्ज करें"
              className="flex-1 px-6 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
            />
            <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg">
              सदस्यता लें
            </button>
          </form>
        </motion.div>
      </section>

      {/* ===== 8. FOOTER ===== */}
      <footer className="bg-stone-950 text-stone-400 py-16 px-6 border-t border-stone-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-white text-3xl font-extrabold mb-4">
                आलम<span className="text-amber-500">नगर</span>
              </h3>
              <p className="text-sm mb-6 max-w-md leading-relaxed">
                मधेपुरा, बिहार, भारत का आधिकारिक डिजिटल प्लेटफॉर्म। हमारी विरासत, हमारा समुदाय, हमारा गौरव।
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">त्वरित लिंक</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="hover:text-amber-400 transition-colors">हमारे बारे में</Link></li>
                <li><Link href="/gallery" className="hover:text-amber-400 transition-colors">गैलरी</Link></li>
                <li><Link href="/community" className="hover:text-amber-400 transition-colors">समुदाय</Link></li>
                <li><Link href="/marketplace" className="hover:text-amber-400 transition-colors">बाज़ार</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">संपर्क</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/contact" className="hover:text-amber-400 transition-colors">संपर्क करें</Link></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">आपातकालीन</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">योगदान दें</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-900 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} alamnagar.in — आलमनगर के लिए ❤️ के साथ बनाया गया</p>
          </div>
        </div>
      </footer>
    </main>
  );
}