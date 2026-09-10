"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  MapPin, Users, Heart, Sprout, Sun, History, 
  ArrowRight, Star, Home, Calendar, Award, Camera, Sparkles,
  BookOpen, Wheat, Music, GraduationCap, Building2, TrendingUp,
  Landmark, Droplets, Shield, ChevronDown, ChevronUp,
  Stethoscope, Phone, Activity
} from "lucide-react";
import Link from "next/link";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, AreaChart, Area } from "recharts";

// ═══════════════════════════════════════════════════════════
// 🌟 ANIMATED NUMBER COMPONENT
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
// 📊 HERO TOWER CHART COMPONENT (Real Statistics - Enhanced Visibility)
// ═══════════════════════════════════════════════════════════
const HeroTowerChart = () => {
  const data = [
    { name: 'जनसंख्या', value: 175, color: '#10b981' },
    { name: 'क्षेत्रफल', value: 186, color: '#f59e0b' },
    { name: 'साक्षरता', value: 50, color: '#3b82f6' },
    { name: 'पंचायत', value: 14, color: '#f43f5e' },
  ];

  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden opacity-45">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="heroPop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="heroLit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="heroPanch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={1}/>
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="#ffffff" fontSize={13} tickLine={false} axisLine={false} opacity={0.9} />
          <Bar dataKey="value" radius={[10, 10, 0, 0]} animationDuration={2500} animationEasing="ease-out">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={['url(#heroPop)', 'url(#heroArea)', 'url(#heroLit)', 'url(#heroPanch)'][index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// 📖 READ MORE COMPONENT
// ═══════════════════════════════════════════════════════════
const ReadMore = ({ children, limit = 200 }: { children: string; limit?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = children.length > limit;
  const displayText = isExpanded || !isLong ? children : children.slice(0, limit) + '...';

  return (
    <p className="text-stone-600 leading-relaxed text-lg">
      {displayText}
      {isLong && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 text-emerald-600 font-bold ml-1 hover:text-emerald-700 transition-colors"
        >
          {isExpanded ? (
            <><ChevronUp className="w-4 h-4" /> कम पढ़ें</>
          ) : (
            <><ChevronDown className="w-4 h-4" /> और पढ़ें</>
          )}
        </button>
      )}
    </p>
  );
};

// ═══════════════════════════════════════════════════════════
// 📈 BOTTOM SUMMARY CARD WITH LINE CHART (Real Growth Trend)
// ═══════════════════════════════════════════════════════════
const SummaryLineChartCard = () => {
  const data = [
    { year: '2010', growth: 25 },
    { year: '2014', growth: 40 },
    { year: '2018', growth: 60 },
    { year: '2022', growth: 78 },
    { year: '2026', growth: 95 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative bg-gradient-to-br from-emerald-900 to-stone-900 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl border border-emerald-500/20"
    >
      {/* Background Line Chart - Enhanced Visibility */}
      <div className="absolute inset-0 z-0 opacity-35 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="growth" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#lineGlow)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="relative z-10 text-center">
        <h3 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
          आलमनगर: <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">एक उज्ज्वल भविष्य</span>
        </h3>
        <p className="text-stone-300 text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
          परंपरा और आधुनिकता का यह अनूठा संगम आलमनगर को केवल एक गाँव नहीं, बल्कि एक सजीव, विकासशील और गर्वित समुदाय बनाता है। 
          हमारा डिजिटल मंच इसी गौरवशाली यात्रा को सहेजने और आगे बढ़ाने का एक छोटा सा प्रयास है।
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/community" className="px-8 py-4 bg-white text-emerald-900 font-black rounded-2xl shadow-xl hover:bg-stone-100 transition-all hover:scale-105 flex items-center gap-2">
            <Users className="w-5 h-5" />
            हमारे साथ जुड़ें
          </Link>
          <Link href="/contact" className="px-8 py-4 bg-emerald-800/40 backdrop-blur-md border border-emerald-500/30 text-white font-bold rounded-2xl hover:bg-emerald-800/60 transition-all hover:scale-105 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            संपर्क करें
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0.8]);

  const stats = [
    { icon: <Users className="w-6 h-6" />, value: "1.75", label: "लाख+ जनसंख्या", suffix: "L+" },
    { icon: <MapPin className="w-6 h-6" />, value: "186", label: "km² क्षेत्रफल", suffix: " km²" },
    { icon: <GraduationCap className="w-6 h-6" />, value: "50", label: "% साक्षरता दर", suffix: "%" },
    { icon: <Building2 className="w-6 h-6" />, value: "14", label: "पंचायतें", suffix: "+" },
  ];

  return (
    <main className="min-h-screen bg-stone-50 overflow-x-hidden selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* 🌟 Cinematic Hero Section with Tower Chart */}
      <section className="relative h-[95vh] min-h-[700px] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1596522354195-e8448ea1642c?q=80&w=2670&auto=format&fit=crop')",
              filter: "brightness(0.65) contrast(1.1)"
            }}
          />
          {/* Tower Chart Overlay - REAL & VISIBLE */}
          <HeroTowerChart />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-stone-900/25 to-stone-50" />
        </motion.div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/25 backdrop-blur-xl border border-white/40 rounded-full mb-8 shadow-lg"
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="text-white text-sm font-bold uppercase tracking-widest">मधेपुरा, बिहार</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tight drop-shadow-2xl"
          >
            आलमनगर: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-amber-300 to-emerald-300">
              हमारी जड़ें, हमारी पहचान
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-stone-100 max-w-3xl mx-auto mb-12 leading-relaxed font-medium drop-shadow-md"
          >
            कोसी-गंगा के पवित्र मैदानों में बसा एक ऐसा गाँव, जहाँ 1.75 लाख+ निवासी, 186 km² क्षेत्रफल, 
            और 14+ पंचायतों की समृद्ध मिथिला-अंगिका विरासत है।
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <Link 
              href="/community" 
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-105"
            >
              समुदाय से जुड़ें
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            {/* ✅ STRONG VISIBILITY BUTTON */}
            <Link 
              href="/gallery" 
              className="flex items-center gap-2 px-8 py-4 bg-white text-emerald-800 font-black rounded-2xl shadow-xl hover:bg-stone-100 transition-all hover:scale-105"
            >
              <Sparkles className="w-5 h-5 text-amber-600" />
              विरासत देखें
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 📊 Quick Stats Section */}
      <section className="py-16 px-6 bg-white relative z-10 -mt-20">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                variants={fadeInUp}
                className="bg-gradient-to-br from-emerald-50 to-amber-50 p-6 rounded-2xl border border-emerald-100 shadow-lg text-center group hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-xl mb-3 text-emerald-600 group-hover:scale-110 transition-transform shadow-sm">
                  {stat.icon}
                </div>
                <p className="text-3xl md:text-4xl font-black text-stone-900 mb-1">
                  <AnimatedNumber value={stat.value} />{stat.suffix}
                </p>
                <p className="text-xs md:text-sm text-stone-600 font-bold">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 📜 Our Story Section - FIXED: Single Read More */}
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
              <div className="absolute -top-8 -left-8 w-40 h-40 bg-amber-200/50 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-emerald-200/50 rounded-full blur-3xl" />
              
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white group">
                <motion.img 
                  initial={{ scale: 1.1 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  src="https://images.unsplash.com/photo-1625246333195-e8448ea1642c?q=80&w=2670&auto=format&fit=crop" 
                  alt="Village Life" 
                  className="w-full h-[400px] md:h-[550px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

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
              {/* ✅ FIXED: Single Read More for entire story */}
              <div className="space-y-6">
                <ReadMore limit={400}>
                  आलमनगर का विकास कोसी-गंगा के मैदानों में एक छोटे नदी किनारे के बस्ती से शुरू हुआ, जो धीरे-धीरे उत्तर बिहार के प्राचीन व्यापार मार्गों का एक महत्वपूर्ण पड़ाव बन गया। स्थानीय इतिहास के अनुसार, इसका नाम मुगल कालीन शाह आलमगीर से जुड़ा है, जहाँ "आलम" का अर्थ है संसार और "नगर" का अर्थ है कस्बा। स्वतंत्रता संग्राम के दौरान, यहाँ के युवाओं ने राजा रास बिहारी लाल मंडल और बी.एन. मंडल जैसे महान नेताओं से प्रेरणा ली। 1942 के 'Quit India' आंदोलन में, जयप्रकाश नारायण के आह्वान पर यहाँ के क्रांतिकारियों ने सरकारी दफ्तरों पर तिरंगा फहराया और शहीद चुल्हे मंडल जैसे वीरों ने अपने प्राण न्योछावर कर दिए। आज, हम अपनी जड़ों को मजबूत रखते हुए, तकनीक के माध्यम से अपने गाँव को एक "डिजिटल विरासत" प्रदान कर रहे हैं, ताकि दुनिया के किसी भी कोने में बैठे आलमनगरी को अपने गाँव की हर खबर और यादें मिलती रहें।
                </ReadMore>
              </div>
              
              <div className="pt-4 flex flex-wrap gap-6">
                {["समृद्ध मिथिला संस्कृति", "वीर इतिहास", "प्रकृति प्रेम"].map((item, i) => (
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

      {/* 📚 Detailed Info Sections */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-32">
          
          {/* Economy */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fadeInUp} className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold mb-6">
                <TrendingUp className="w-4 h-4" />
                अर्थव्यवस्था
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-stone-900 mb-6">कृषि और विकास</h3>
              <div className="space-y-4">
                <ReadMore limit={200}>
                  आलमनगर की अर्थव्यवस्था छोटे और सीमांत कृषि पर आधारित है। परिवार धान, मक्का और दलहन की खेती करते हैं। बाढ़ और बढ़ती लागत के कारण अब लोग डेयरी, मत्स्य पालन और बकरी पालन से आय को स्थिर करने का प्रयास कर रहे हैं। आलमनगर के युवा पंजाब, दिल्ली और गुजरात जैसे राज्यों में रोजगार की तलाश में जाते हैं, जो स्थानीय अर्थव्यवस्था में महत्वपूर्ण योगदान देते हैं। हाल ही में सरकारी योजनाओं से किसानों को सीधा लाभ मिल रहा है।
                </ReadMore>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {["धान", "मक्का", "डेयरी", "मत्स्य पालन", "मखाना"].map((tag, i) => (
                  <span key={i} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-200">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="order-1 lg:order-2 relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2670" alt="Agriculture" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </motion.div>
          </motion.div>

          {/* Education & Health */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fadeInUp} className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2670" alt="Education" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-bold mb-6">
                <GraduationCap className="w-4 h-4" />
                शिक्षा और स्वास्थ्य
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-stone-900 mb-6">भविष्य की नींव</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-stone-900 mb-2 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" /> शिक्षा
                  </h4>
                  <ReadMore limit={180}>
                    लगभग 50% साक्षरता दर के साथ, यहाँ सरकारी और निजी स्कूलों (जैसे N.K.M. High School) का एक घना नेटवर्क है। नए अंग्रेजी माध्यम स्कूल और कोचिंग सेंटर छात्रों को बोर्ड परीक्षाओं की तैयारी में मदद कर रहे हैं।
                  </ReadMore>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-stone-900 mb-2 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-rose-600" /> स्वास्थ्य
                  </h4>
                  <ReadMore limit={180}>
                    आलमनगर में एक सामुदायिक स्वास्थ्य केंद्र (CHC) है जो आस-पास की पंचायतों के लिए मुख्य रेफरल पॉइंट है। बाढ़ प्रभावित कोसी गाँवों की सेवा के लिए प्राथमिक स्वास्थ्य केंद्र (PHC) सक्रिय हैं।
                  </ReadMore>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Culture & Festivals */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-bold mb-6">
              <Music className="w-4 h-4 fill-amber-800" />
              संस्कृति और त्योहार
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-black text-stone-900 mb-12">
              मिथिला-अंगिका की <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-emerald-600">अनूठी धरोहर</span>
            </motion.h2>
            
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <motion.div variants={fadeInUp} className="bg-stone-50 p-8 rounded-3xl border border-stone-200 hover:shadow-xl transition-all">
                <Wheat className="w-10 h-10 text-amber-600 mb-4" />
                <h4 className="text-xl font-black text-stone-900 mb-3">स्थानीय व्यंजन</h4>
                <ReadMore limit={150}>
                  कोसी बेल्ट की थाली: सरसों के तेल में बनी सब्ज़ी, दाल, चावल और नदी की मछली। लिट्टी-चोकहा, सत्तू पराठा और त्योहारों पर मखाने की खीर, मालपुआ और बलूशाही यहाँ की पहचान हैं।
                </ReadMore>
              </motion.div>
              <motion.div variants={fadeInUp} className="bg-stone-50 p-8 rounded-3xl border border-stone-200 hover:shadow-xl transition-all">
                <Music className="w-10 h-10 text-blue-600 mb-4" />
                <h4 className="text-xl font-black text-stone-900 mb-3">भाषा और लोकगीत</h4>
                <ReadMore limit={150}>
                  यहाँ की बोली मैथिली, स्थानीय हिंदी और अंगिका का अनूठा मिश्रण है। शादियों, छठ और समा-चकेवा के दौरान महिलाओं द्वारा गाए जाने वाले लोकगीत इस क्षेत्र की आत्मा हैं।
                </ReadMore>
              </motion.div>
              <motion.div variants={fadeInUp} className="bg-stone-50 p-8 rounded-3xl border border-stone-200 hover:shadow-xl transition-all">
                <Sun className="w-10 h-10 text-orange-600 mb-4" />
                <h4 className="text-xl font-black text-stone-900 mb-3">प्रमुख त्योहार</h4>
                <ReadMore limit={150}>
                  छठ पूजा यहाँ का सबसे शक्तिशाली त्योहार है। इसके अलावा समा-चकेवा, दुर्गा पूजा, राम नवमी, ईद और प्रसिद्ध 'काली मेला' आलमनगर को एक साझा सांस्कृतिक स्थान बनाते हैं।
                </ReadMore>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 📈 Bottom Summary Card with Line Chart - REAL & VISIBLE */}
      <section className="py-24 px-6 bg-stone-50">
        <div className="max-w-5xl mx-auto">
          <SummaryLineChartCard />
        </div>
      </section>

    </main>
  );
}