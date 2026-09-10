"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  MapPin, Users, Heart, Sprout, Sun, History, 
  ArrowRight, Star, Home, Calendar, Award, Camera, Sparkles,
  BookOpen, Wheat, Music, GraduationCap, Building2, TrendingUp,
  Landmark, Droplets, Shield, ChevronDown, ChevronUp,
  Stethoscope, Phone, Activity, Eye, MessageSquare, Share2
} from "lucide-react";
import Link from "next/link";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, AreaChart, Area } from "recharts";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy, limit } from "firebase/firestore";

// ═══════════════════════════════════════════════════════════
// 🖼️ SMOOTH IMAGE SLIDER COMPONENT (World-Class Ken Burns Effect)
// ═══════════════════════════════════════════════════════════
const SmoothImageSlider = ({ images, className }: { images: string[], className?: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Smooth transition every 5 seconds
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className={`relative w-full h-full overflow-hidden bg-stone-200 ${className}`}>
      {images.map((img, index) => (
        <motion.div
          key={img}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ 
            opacity: index === currentIndex ? 1 : 0,
            scale: index === currentIndex ? 1 : 1.1
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <img 
            src={img} 
            alt={`Alamnagar Slide ${index + 1}`} 
            className="w-full h-full object-cover"
          />
        </motion.div>
      ))}
      {/* Subtle vignette overlay for premium feel */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// 🌟 ANIMATED NUMBER COMPONENT
// ═══════════════════════════════════════════════════════════
const AnimatedNumber = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
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
  }, [value]);

  return <span>{count.toLocaleString('hi-IN')}</span>;
};

// ═══════════════════════════════════════════════════════════
// 📊 HERO TOWER CHART COMPONENT (REAL-TIME - SAME AS HOMEPAGE)
// ═══════════════════════════════════════════════════════════
const HeroTowerChart = ({ stats }: { stats: any }) => {
  const data = [
    { name: 'सदस्य', value: Math.max(stats.totalUsers || 0, 10) },
    { name: 'पोस्ट', value: Math.max(stats.totalPosts || 0, 10) },
    { name: 'व्यूज़', value: Math.max(stats.totalViews || 0, 10) },
    { name: 'लाइक', value: Math.max(stats.totalLikes || 0, 10) },
  ];

  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden opacity-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="heroTowerEmerald" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="heroTowerAmber" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="heroTowerBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="heroTowerRose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={1}/>
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <YAxis hide />
          <XAxis 
            dataKey="name" 
            stroke="#ffffff" 
            fontSize={16} 
            tickLine={false} 
            axisLine={false} 
            opacity={0.95}
            fontWeight={700}
          />
          <Bar 
            dataKey="value" 
            radius={[12, 12, 0, 0]} 
            animationDuration={2500} 
            animationEasing="ease-out"
            minPointSize={50}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={[
                  'url(#heroTowerEmerald)', 
                  'url(#heroTowerAmber)', 
                  'url(#heroTowerBlue)', 
                  'url(#heroTowerRose)'
                ][index]} 
              />
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
// 📈 BOTTOM SUMMARY CARD WITH REAL-TIME 4-LINE RAINBOW CHART
// ═══════════════════════════════════════════════════════════
const SummaryLineChartCard = ({ chartData }: { chartData: any[] }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative bg-gradient-to-br from-emerald-900 to-stone-900 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl border border-emerald-500/20"
    >
      <div className="absolute inset-0 z-0 opacity-35 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="footerViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="footerLikes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.7}/>
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="footerComments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6}/>
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="footerShares" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.5}/>
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="Views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#footerViews)" />
            <Area type="monotone" dataKey="Likes" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#footerLikes)" />
            <Area type="monotone" dataKey="Comments" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#footerComments)" />
            <Area type="monotone" dataKey="Shares" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#footerShares)" />
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

  // 🖼️ 5-Image Arrays for Each Section (Place these in public/images/)
  const heroImages = [
    '/images/hero-1.jpg', '/images/hero-2.jpg', '/images/hero-3.jpg', '/images/hero-4.jpg', '/images/hero-5.jpg'
  ];
  const storyImages = [
    '/images/story-1.jpg', '/images/story-2.jpg', '/images/story-3.jpg', '/images/story-4.jpg', '/images/story-5.jpg'
  ];
  const economyImages = [
    '/images/economy-1.jpg', '/images/economy-2.jpg', '/images/economy-3.jpg', '/images/economy-4.jpg', '/images/economy-5.jpg'
  ];
  const educationImages = [
    '/images/education-1.jpg', '/images/education-2.jpg', '/images/education-3.jpg', '/images/education-4.jpg', '/images/education-5.jpg'
  ];
  const cultureImages = [
    '/images/culture-1.jpg', '/images/culture-2.jpg', '/images/culture-3.jpg', '/images/culture-4.jpg', '/images/culture-5.jpg'
  ];

  // ✅ REAL-TIME FIREBASE DATA
  const [liveStats, setLiveStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
  });

  // ✅ REAL-TIME CHART DATA (Last 7 Days)
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const usersQuery = query(collection(db, "users"));
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      setLiveStats(prev => ({ ...prev, totalUsers: snapshot.size }));
    });

    const postsQuery = query(collection(db, "spotlights"), orderBy("createdAt", "desc"), limit(500));
    const unsubPosts = onSnapshot(postsQuery, (snapshot) => {
      let totalViews = 0, totalLikes = 0, totalComments = 0, totalShares = 0;
      
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });
      
      const dailyStats: Record<string, { Views: number; Likes: number; Comments: number; Shares: number }> = {};
      last7Days.forEach(day => {
        dailyStats[day] = { Views: 0, Likes: 0, Comments: 0, Shares: 0 };
      });

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        totalViews += data.views || 0;
        totalLikes += data.likes || 0;
        totalComments += data.comments || 0;
        totalShares += data.shares || 0;

        if (data.createdAt?.toDate) {
          const dateStr = data.createdAt.toDate().toISOString().split('T')[0];
          if (dailyStats[dateStr]) {
            dailyStats[dateStr].Views += data.views || 0;
            dailyStats[dateStr].Likes += data.likes || 0;
            dailyStats[dateStr].Comments += data.comments || 0;
            dailyStats[dateStr].Shares += data.shares || 0;
          }
        }
      });

      setLiveStats(prev => ({
        ...prev,
        totalPosts: snapshot.size,
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
      }));

      setChartData(last7Days.map(day => ({
        day: new Date(day).toLocaleDateString('hi-IN', { weekday: 'short' }),
        Views: dailyStats[day].Views,
        Likes: dailyStats[day].Likes,
        Comments: dailyStats[day].Comments,
        Shares: dailyStats[day].Shares,
      })));
    });

    return () => {
      unsubUsers();
      unsubPosts();
    };
  }, []);

  const stats = [
    { icon: <Users className="w-6 h-6" />, value: liveStats.totalUsers, label: "जुड़े सदस्य", suffix: "" },
    { icon: <Camera className="w-6 h-6" />, value: liveStats.totalPosts, label: "कुल पोस्ट", suffix: "" },
    { icon: <Eye className="w-6 h-6" />, value: liveStats.totalViews, label: "कुल व्यूज़", suffix: "" },
    { icon: <Heart className="w-6 h-6" />, value: liveStats.totalLikes, label: "कुल लाइक", suffix: "" },
  ];

  return (
    <main className="min-h-screen bg-stone-50 overflow-x-hidden selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* 🌟 Cinematic Hero Section with REAL-TIME Tower Chart & Image Slider */}
      <section className="relative h-[95vh] min-h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <SmoothImageSlider images={heroImages} className="w-full h-full" />
          <div className="absolute inset-0 bg-stone-950/40" />
          <HeroTowerChart stats={liveStats} />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/50 via-stone-900/30 to-stone-50" />
        </div>

        <div className="relative z-20 max-w-5xl mx-auto px-6 text-center text-white pt-20">
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
            कोसी-गंगा के पवित्र मैदानों में बसा एक ऐसा गाँव, जहाँ 1.75 लाख+ जनसंख्या, 
            ~50% साक्षरता, और समृद्ध शिक्षा की मिथिला-अंगिका विरासत है।
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
          >
            <Link 
              href="/community" 
              className="group flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all hover:scale-105"
            >
              समुदाय से जुड़ें
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/gallery" 
              className="flex items-center gap-2 px-10 py-5 bg-white text-emerald-800 font-black text-lg rounded-2xl shadow-2xl hover:bg-stone-100 transition-all hover:scale-105"
            >
              <Sparkles className="w-6 h-6 text-amber-600" />
              विरासत देखें
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 📊 Quick Stats Section - REAL-TIME DATA */}
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

      {/* 📜 Our Story Section with 5-Image Slider */}
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
              
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white group aspect-[4/3] md:h-[550px]">
                <SmoothImageSlider images={storyImages} className="w-full h-full" />
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
              <div className="space-y-6">
                <ReadMore limit={500}>
                  आलमनगर का विकास कोसी-गंगा के मैदानों में एक छोटे नदी किनारे के बस्ती से शुरू हुआ, जो धीरे-धीरे उत्तर बिहार के प्राचीन व्यापार मार्गों का एक महत्वपूर्ण पड़ाव बन गया। स्थानीय इतिहास के अनुसार, इसका नाम मुगल कालीन शाह आलमगीर से जुड़ा है, जहाँ "आलम" का अर्थ है संसार और "नगर" का अर्थ है कस्बा। स्वतंत्रता संग्राम के दौरान, यहाँ के युवाओं ने राजा रास बिहारी लाल मंडल और बी.एन. मंडल जैसे महान नेताओं से प्रेरणा ली। 1942 के 'Quit India' आंदोलन में, जयप्रकाश नारायण के आह्वान पर यहाँ के क्रांतिकारियों ने सरकारी दफ्तरों पर तिरंगा फहराया और शहीद चुल्हे मंडल जैसे वीरों ने अपने प्राण न्योछावर कर दिए। आलमनगर प्रारंभ में मधेपुरा subdivision के अंतर्गत कृषि प्रधान गाँवों का एक समूह था। सामुदायिक विकास खंडों के पुनर्गठन के साथ, इस ग्रामीण क्षेत्र को एक पूर्ण ब्लॉक में अपग्रेड किया गया, जिसे आज मधेपुरा जिले की आधिकारिक प्रशासनिक इकाइयों में से एक के रूप में मान्यता प्राप्त है। इसका महत्व तब और बढ़ गया जब आलमनगर को विधान सभा निर्वाचन क्षेत्र संख्या 70 के रूप में अधिसूचित किया गया, जिसमें आलमनगर, पुरैनी और चौसा शामिल हैं।
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

      {/* 📚 Detailed Info Sections with 5-Image Sliders */}
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
                <ReadMore limit={300}>
                  आलमनगर की अर्थव्यवस्था अभी भी छोटे और सीमांत कृषि पर निर्भर है, जहाँ परिवार कोसी बेल्ट में धान, मक्का और दलहन की खेती करते हैं और बाढ़ और इनपुट लागत बढ़ने के कारण आय को स्थिर करने के लिए धीरे-धीरे डेयरी, मत्स्य पालन और बकरी पालन जोड़ने का प्रयास कर रहे हैं। पास के चौसा से हालिया समाचार दिखाते हैं कि यहाँ के किसान सरकारी योजनाओं पर कितनी strongly निर्भर हैं। कोसी division के बाकी हिस्सों की तरह, आलमनगर अपने युवा श्रमिकों की एक बड़ी संख्या पंजाब, दिल्ली और गुजरात जैसे राज्यों में भेजता है।
                </ReadMore>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {["धान", "मक्का", "दलहन", "डेयरी", "मत्स्य पालन", "बकरी पालन"].map((tag, i) => (
                  <span key={i} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-200">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="order-1 lg:order-2 relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <SmoothImageSlider images={economyImages} className="w-full h-full" />
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
                <SmoothImageSlider images={educationImages} className="w-full h-full" />
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
                  <ReadMore limit={250}>
                    2011 में लगभग 52% साक्षरता दर के साथ, ब्लॉक ने धीरे-धीरे सरकारी और निजी स्कूलों का एक घना नेटवर्क बनाया है जैसे N.K.M. High School Shah Alam Nagar, project girls' schools, और Ms Ethari जैसे प्राथमिक क्लस्टर। नए अंग्रेजी-माध्यम और कोचिंग सेंटर छात्रों को बोर्ड परीक्षाओं की तैयारी कराते हैं। स्कूल सुरक्षा और पर्यावरण क्लबों पर राज्य कार्यक्रम साक्षरता को लगातार ऊपर धकेलने का लक्ष्य रखते हैं।
                  </ReadMore>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-stone-900 mb-2 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-rose-600" /> स्वास्थ्य
                  </h4>
                  <ReadMore limit={250}>
                    आलमनगर में एक सामुदायिक स्वास्थ्य केंद्र (CHC) है जो आस-पास की पंचायतों के लिए मुख्य सरकारी रेफरल बिंदु के रूप में काम करता है, सामान्य प्रसव और बुनियादी आपातकालीन देखभाल को संभालता है। इस CHC के आस-पास, कई प्राथमिक स्वास्थ्य केंद्र बाढ़ प्रभावित कोसी गाँवों की सेवा करने का प्रयास करते हैं, लेकिन दस्त और वेक्टर-जनित रोगों के बार-बार होने वाले महामारी दिखाते हैं कि ब्लॉक को अभी भी मजबूत स्टाफिंग और स्वच्छ पेयजल प्रणालियों की आवश्यकता है।
                  </ReadMore>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Culture & Festivals with 5-Image Slider */}
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
            
            {/* Wide Culture Image Slider */}
            <motion.div variants={fadeInUp} className="mb-12 rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[21/9]">
              <SmoothImageSlider images={cultureImages} className="w-full h-full" />
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 text-left">
              <motion.div variants={fadeInUp} className="bg-stone-50 p-8 rounded-3xl border border-stone-200 hover:shadow-xl transition-all">
                <Wheat className="w-10 h-10 text-amber-600 mb-4" />
                <h4 className="text-xl font-black text-stone-900 mb-3">स्थानीय व्यंजन</h4>
                <ReadMore limit={200}>
                  आलमनगर की everyday plate एक classic Kosi-belt thali जैसी दिखती है: सरसों के तेल में पकाया गया चावल या रोटी, हार्डी दाल, मौसमी सब्जियाँ और नदी की मछली, परिवार अभी भी पैकेज्ड भोजन पर घर पर उगाए गए अनाज और पिछवाड़े की साग को प्राथमिकता देते हैं। व्यापक क्षेत्र लिट्टी-चोखा, सत्तू-पराठा, चना घुघनी, कढ़ी-बाड़ी और सरसों मछली करी जैसे बिहारी स्टेपल्स के लिए प्रसिद्ध है, जबकि त्योहारों के दिन मालपुआ, बलूशाही, खाजा और विशेष रूप से मखाना खीर लाते हैं, यह दर्शाता है कि कोसी बेसिन में मखाना उत्पादन ने इस स्थानीय superfood को नकदी फसल और आलमनगर घरों के लिए एक signature snack में बदल दिया है।
                </ReadMore>
              </motion.div>
              <motion.div variants={fadeInUp} className="bg-stone-50 p-8 rounded-3xl border border-stone-200 hover:shadow-xl transition-all">
                <Music className="w-10 h-10 text-blue-600 mb-4" />
                <h4 className="text-xl font-black text-stone-900 mb-3">भाषा और लोकगीत</h4>
                <ReadMore limit={200}>
                  आलमनगर में रोजमर्रा की भाषण मैथिली, स्थानीय हिंदी और अंगिका-प्रभावित शब्दों का एक fluid मिश्रण है, जो मिथिला-कोसी बेल्ट के अंदर अपने स्थान को दर्शाता है जहाँ मैथिली पारंपरिक रूप से प्रमुख मातृभाषा है। लोक संस्कृति शादियों में गाए जाने वाले मैथिली गीतों, छठ और समा-चकेवा - महिलाओं के chorus pieces, रोपाई और बाढ़-मौसम के गीतों, और playful sayings के माध्यम से जीवित है जो "हमरा गाम" हिंदी और soft मैथिली के बीच slip करते हैं, ब्लॉक को अपनी खुद की आवाज़, humor और emotional vocabulary देते हैं।
                </ReadMore>
              </motion.div>
              <motion.div variants={fadeInUp} className="bg-stone-50 p-8 rounded-3xl border border-stone-200 hover:shadow-xl transition-all">
                <Sun className="w-10 h-10 text-orange-600 mb-4" />
                <h4 className="text-xl font-black text-stone-900 mb-3">प्रमुख त्योहार</h4>
                <ReadMore limit={200}>
                  आलमनगर का त्योहार कैलेंडर व्यापक मिथिला-कोसी rhythm का पालन करता है: कोसी और गाँव के तालाबों पर छठ पूजा वर्ष का सबसे शक्तिशाली gathering है, जब सभी castes के परिवार sunrise और sunset पर side by side खड़े होकर सूर्य को arghya और गीत offer करते हैं। जल्द ही बाद में, हवा भाई-बहन bonds का जश्न मनाने वाले समा-चकेवा लोकगीतों से भर जाती है, जबकि दुर्गा पूजा pandals, राम नवमी processions, स्थानीय masjids में ईद namaz और प्रसिद्ध काली मेला - जहाँ दर्जनों nearby villages के लोग fairgrounds visit करते हैं - आलमनगर को lights, stalls, rides और community feasts के एक shared cultural space में बदल देते हैं।
                </ReadMore>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 📈 Bottom Summary Card with REAL-TIME 4-LINE RAINBOW CHART */}
      <section className="py-24 px-6 bg-stone-50">
        <div className="max-w-5xl mx-auto">
          <SummaryLineChartCard chartData={chartData} />
        </div>
      </section>

    </main>
  );
}