"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { 
  MapPin, BookOpen, Users, ArrowRight, Camera, Phone, 
  ShoppingBag, Sparkles, Landmark, TreePine, Heart, 
  Star, Quote, Mail, ChevronDown, Wheat, Sun, Music, Play,
  Zap, UserPlus, MessageCircle, Share2, Activity, Eye, Shield,
  Flame, Award, TrendingUp, LogIn
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// ═══════════════════════════════════════════════════════════
// 🔥 ADMIN UIDs (Inhe apne project ke hisaab se update karo)
// ═══════════════════════════════════════════════════════════
const ADMIN_UIDS = [
  "XIbwZecsh1hg2ou9Q9UC1OwLEa12", // Tumhara UID
];

// ═══════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

// ═══════════════════════════════════════════════════════════
// 🚀 ANIMATED NUMBER COMPONENT (Live Counting Effect)
// ═══════════════════════════════════════════════════════════
const AnimatedNumber = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 2000;
    const increment = end / (duration / 16);
    
    if (end === 0) {
      setCount(0);
      return;
    }
    
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

  return <span>{count.toLocaleString('hi-IN')}{suffix}</span>;
};

// ═══════════════════════════════════════════════════════════
// LIVING MADHUBANI PATTERN
// ═══════════════════════════════════════════════════════════
const MadhubaniPattern = () => (
  <motion.div 
    animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    className="absolute inset-0 opacity-[0.04] pointer-events-none overflow-hidden"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      backgroundSize: "60px 60px"
    }}
  />
);

// ═══════════════════════════════════════════════════════════
// 🚀 LIVE ACTIVITY TICKER COMPONENT
// ═══════════════════════════════════════════════════════════
interface TickerItem {
  id: string;
  type: 'post' | 'join' | 'milestone';
  userName: string;
  userPhoto?: string;
  title?: string;
  metrics?: { likes: number; comments: number; shares: number };
  timestamp: number;
}

const LiveActivityTicker = () => {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const postsQuery = query(collection(db, "spotlights"), orderBy("createdAt", "desc"), limit(5));
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const newItems: TickerItem[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: 'post',
          userName: data.userName || "आलमनगर वासी",
          userPhoto: data.userPhoto,
          title: data.title || "एक नई तस्वीर",
          metrics: {
            likes: data.likes || 0,
            comments: data.comments || 0,
            shares: data.shares || 0
          },
          timestamp: data.createdAt?.toDate?.()?.getTime() || Date.now()
        };
      });
      
      setItems(prev => {
        const users = prev.filter(i => i.type === 'join');
        return [...newItems, ...users].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
      });
      setIsLoading(false);
    });

    const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(5));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const newUsers: TickerItem[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: 'join',
          userName: data.displayName || "नया सदस्य",
          userPhoto: data.photoURL,
          timestamp: data.createdAt?.toDate?.()?.getTime() || Date.now()
        };
      });

      setItems(prev => {
        const posts = prev.filter(i => i.type === 'post');
        return [...posts, ...newUsers].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
      });
    });

    return () => {
      unsubscribePosts();
      unsubscribeUsers();
    };
  }, []);

  if (isLoading || items.length === 0) return null;

  const marqueeItems = [...items, ...items];

  return (
    <div className="relative bg-stone-900/95 backdrop-blur-md border-y border-amber-500/20 overflow-hidden py-3">
      <div className="absolute left-0 top-0 bottom-0 z-20 w-24 bg-gradient-to-r from-stone-900 to-transparent flex items-center px-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-xs font-black text-red-400 uppercase tracking-widest">LIVE</span>
        </div>
      </div>

      <div className="absolute right-0 top-0 bottom-0 z-20 w-24 bg-gradient-to-l from-stone-900 to-transparent" />

      <motion.div 
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {marqueeItems.map((item, index) => (
          <div key={`${item.id}-${index}`} className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            {item.type === 'post' ? (
              <>
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm text-stone-300">
                  <span className="font-bold text-amber-400">{item.userName}</span> ने पोस्ट किया: 
                  <span className="text-white font-semibold ml-1">"{item.title}"</span>
                </span>
                <div className="flex items-center gap-3 text-xs text-stone-400 border-l border-white/10 pl-3">
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" /> {item.metrics?.likes}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-blue-400" /> {item.metrics?.comments}</span>
                  <span className="flex items-center gap-1"><Share2 className="w-3 h-3 text-emerald-400" /> {item.metrics?.shares}</span>
                </div>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-stone-300">
                  <span className="font-bold text-emerald-400">{item.userName}</span> आलमनगर परिवार से जुड़े! 🎉
                </span>
              </>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // 🔥 NEW: Live Stats State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [liveStats, setLiveStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0
  });

  // 🔥 NEW: Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 🔥 NEW: Real-Time Stats Fetcher
  useEffect(() => {
    // Total Users Count
    const usersQuery = query(collection(db, "users"));
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      setLiveStats(prev => ({ ...prev, totalUsers: snapshot.size }));
    });

    // Total Posts + Total Views + Total Likes
    const postsQuery = query(collection(db, "spotlights"));
    const unsubPosts = onSnapshot(postsQuery, (snapshot) => {
      let totalViews = 0;
      let totalLikes = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        totalViews += data.views || 0;
        totalLikes += data.likes || 0;
      });
      setLiveStats(prev => ({
        ...prev,
        totalPosts: snapshot.size,
        totalViews,
        totalLikes
      }));
    });

    return () => {
      unsubUsers();
      unsubPosts();
    };
  }, []);

  const isAdmin = currentUser && ADMIN_UIDS.includes(currentUser.uid);

  return (
    <main className="bg-stone-50 text-stone-900 overflow-x-hidden selection:bg-amber-200 selection:text-amber-900">
      
      {/* 🎨 CUSTOM SHIMMER ANIMATIONS */}
      <style>{`
        .tiranga-shimmer {
          background: linear-gradient(90deg, #FF9933 0%, #FFFFFF 25%, #138808 50%, #FFFFFF 75%, #FF9933 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shimmer 4s linear infinite;
        }
        .golden-shimmer {
          background: linear-gradient(90deg, #FCD34D 0%, #FFFFFF 40%, #F59E0B 60%, #FCD34D 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: -200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .floating {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Scroll Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500 z-[100] origin-left" style={{ scaleX }} />

      {/* ===== 1. CINEMATIC HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-950 via-green-900 to-amber-950 text-white px-6">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-amber-500/20 rounded-full blur-[150px]" 
        />
        
        <MadhubaniPattern />

        {/* 🔥 NEW: Admin Badge (Top Right) */}
        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute top-24 right-6 z-20"
          >
            <Link 
              href="/admin/reports" 
              className="flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-md border border-red-500/30 rounded-full px-5 py-2.5 hover:bg-red-500/30 transition-all group shadow-lg"
            >
              <Shield className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-red-300">Admin Panel</span>
            </Link>
          </motion.div>
        )}

        <div className="relative z-10 text-center max-w-5xl mx-auto pt-20">
          {/* 🔥 NEW: Personalized Greeting for Logged-In Users */}
          {currentUser ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 rounded-full px-6 py-3 mb-6 shadow-lg"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-stone-900 overflow-hidden flex items-center justify-center">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold">{currentUser.displayName?.[0] || "U"}</span>
                  )}
                </div>
              </div>
              <span className="text-sm font-bold text-emerald-200">
                स्वागत है, <span className="text-amber-300">{currentUser.displayName?.split(" ")[0] || "मित्र"}</span>! 🙏
              </span>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-8 shadow-lg hover:bg-white/20 transition-colors cursor-default"
            >
              <MapPin className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-semibold tracking-wide">मधेपुरा, मिथिलांचल, बिहार</span>
            </motion.div>
          )}

          {/* ✅ FULL "आलमनगर" WITH TIRANGA SHIMMER */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 tracking-tight leading-tight tiranga-shimmer drop-shadow-2xl pt-2"
          >
            आलमनगर
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl md:text-4xl mb-6 font-medium italic golden-shimmer drop-shadow-md leading-relaxed py-1"
          >
            "जड़ों से जुड़ा, मिथिला की धरती का गौरव"
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-base md:text-lg text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            हमारी विरासत, हमारे लोग, हमारा गौरव। आलमनगर से जुड़े हर व्यक्ति के लिए एक डिजिटल 'चौपाल'।
          </motion.p>

          {/* 🔥 NEW: Live Platform Stats Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12 px-4"
          >
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-white/70">सदस्य</span>
              <span className="text-sm font-bold text-white"><AnimatedNumber value={liveStats.totalUsers} /></span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-white/70">पोस्ट</span>
              <span className="text-sm font-bold text-white"><AnimatedNumber value={liveStats.totalPosts} /></span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-white/70">व्यूज़</span>
              <span className="text-sm font-bold text-white"><AnimatedNumber value={liveStats.totalViews} /></span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-xs text-white/70">लाइक</span>
              <span className="text-sm font-bold text-white"><AnimatedNumber value={liveStats.totalLikes} /></span>
            </div>
          </motion.div>

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

      {/* ===== 🚀 LIVE ACTIVITY TICKER ===== */}
      <LiveActivityTicker />

      {/* ===== 2. QUICK STATS (🔥 UPGRADED: Now with Real-Time Live Data) ===== */}
      <section className="py-20 px-6 bg-stone-50 relative z-20">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-emerald-600 font-black text-sm tracking-[0.2em] uppercase mb-4 block">लाइव स्टैट्स</span>
            <h2 className="text-3xl md:text-5xl font-black text-stone-900">आलमनगर आज</h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { icon: Users, label: "जुड़े परिवार", value: liveStats.totalUsers, color: "bg-emerald-100 text-emerald-700" },
              { icon: Star, label: "कुल पोस्ट", value: liveStats.totalPosts, color: "bg-amber-100 text-amber-700" },
              { icon: Eye, label: "कुल व्यूज़", value: liveStats.totalViews, color: "bg-blue-100 text-blue-700" },
              { icon: Heart, label: "कुल लाइक", value: liveStats.totalLikes, color: "bg-rose-100 text-rose-700" },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group bg-white rounded-3xl p-8 shadow-lg shadow-stone-200/50 border border-stone-100 transition-all duration-500 text-center relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-stone-50 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-150" />
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${stat.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-4xl font-black text-stone-900 mb-2">
                  <AnimatedNumber value={stat.value} />
                </div>
                <div className="text-sm font-bold text-stone-500 uppercase tracking-wider">{stat.label}</div>
                {/* Live indicator dot */}
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase">Live</span>
                </div>
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
            <Link href="/gallery" className="block group">
              <div className="aspect-[4/3] bg-gradient-to-br from-emerald-50 via-stone-50 to-amber-50 rounded-[2rem] flex items-center justify-center shadow-2xl border-4 border-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596522354195-e8448ea1642c?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-80 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <p className="text-2xl font-bold mb-2">गाँव की तस्वीरें</p>
                  <p className="text-white/80 text-sm flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    अपनी यादें गैलरी में अपलोड करें
                  </p>
                </div>
              </div>
            </Link>
            <motion.div 
              animate={{ rotate: [6, -6, 6] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-8 -right-8 w-40 h-40 bg-amber-200 rounded-[2rem] -z-10 opacity-60" 
            />
            <motion.div 
              animate={{ rotate: [-6, 6, -6] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -top-8 -left-8 w-32 h-32 bg-emerald-200 rounded-[2rem] -z-10 opacity-60" 
            />
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
              <motion.div key={card.title} variants={fadeInUp} whileHover={{ y: -12 }}>
                <Link href={card.href} className="group block bg-white rounded-[2rem] p-10 shadow-sm border border-stone-200 hover:shadow-2xl hover:border-emerald-200 transition-all duration-500 h-full relative overflow-hidden">
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
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white/5 backdrop-blur-sm rounded-[2rem] p-8 border border-white/10 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-transparent transition-all duration-500" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors duration-300">
                    <item.icon className="w-8 h-8 text-amber-400 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-black mb-3 text-white">{item.title}</h3>
                  <p className="text-base text-white/60 leading-relaxed">{item.desc}</p>
                </div>
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
              <motion.div 
                key={i} 
                variants={fadeInUp} 
                whileHover={{ y: -8 }}
                className="bg-stone-50 rounded-[2rem] p-10 border border-stone-100 hover:shadow-2xl hover:border-emerald-200 transition-all duration-300 relative"
              >
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
                <Link href="/community" className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center hover:bg-amber-500 hover:text-stone-950 transition-colors cursor-pointer">
                  <Users className="w-5 h-5" />
                </Link>
                <Link href="/gallery" className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center hover:bg-amber-500 hover:text-stone-950 transition-colors cursor-pointer">
                  <Camera className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-black mb-6 text-lg">त्वरित लिंक</h4>
              <ul className="space-y-4 text-base">
                <li><Link href="/about" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> हमारे बारे में</Link></li>
                <li><Link href="/gallery" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> गैलरी</Link></li>
                <li><Link href="/community" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> समुदाय</Link></li>
                <li><Link href="/marketplace" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> बाज़ार</Link></li>
                <li><Link href="/legal" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> कानूनी जानकारी</Link></li>
                {/* 🔥 NEW: Admin Dashboard Link (Only visible to admins) */}
                {isAdmin && (
                  <li>
                    <Link href="/admin/reports" className="hover:text-red-400 transition-colors flex items-center gap-2 border-l-2 border-red-500/50 pl-2">
                      <Shield className="w-3 h-3" /> Admin Dashboard
                    </Link>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black mb-6 text-lg">संपर्क</h4>
              <ul className="space-y-4 text-base">
                <li><Link href="/contact" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> संपर्क करें</Link></li>
                {!currentUser && (
                  <li><Link href="/auth" className="hover:text-amber-400 transition-colors flex items-center gap-2"><LogIn className="w-3 h-3" /> लॉगिन / रजिस्टर</Link></li>
                )}
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