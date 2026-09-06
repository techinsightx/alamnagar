"use client";

import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { 
  MapPin, BookOpen, Users, ArrowRight, Camera, Phone, 
  ShoppingBag, Sparkles, Landmark, TreePine, Heart, 
  Star, Quote, Mail, ChevronDown, Wheat, Sun, Music, Play,
  Zap, UserPlus, MessageCircle, Share2, Activity, Eye, Shield,
  Flame, Award, TrendingUp, LogIn, Lock, Trash2, Loader2, 
  CheckCircle, X // ✅ FIX: Added missing icons here
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { 
  collection, query, orderBy, limit, onSnapshot, 
  addDoc, deleteDoc, doc, serverTimestamp 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// 📊 Recharts Imports
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";

// ═══════════════════════════════════════════════════════════
// 🔥 ADMIN UIDs
// ═══════════════════════════════════════════════════════════
const ADMIN_UIDS = [
  "5fPCK8mGRTaAvIBTzUn7MEMQ2id2",
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
// 🌟 ANIMATED NUMBER COMPONENT
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
// 🌈 HERO BACKGROUND CHART
// ═══════════════════════════════════════════════════════════
const HeroBackgroundChart = ({ data }: { data: any[] }) => {
  if (data.length === 0) return null;
  
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-60">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="glowViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4}/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="glowLikes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3}/>
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="glowComments" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2}/>
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="glowShares" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <Area type="monotone" dataKey="Views" stroke="#3b82f6" strokeWidth={14} fillOpacity={1} fill="url(#glowViews)" isAnimationActive={true} animationDuration={6000} animationEasing="ease-in-out" />
          <Area type="monotone" dataKey="Likes" stroke="#f43f5e" strokeWidth={10} fillOpacity={1} fill="url(#glowLikes)" isAnimationActive={true} animationDuration={7500} animationEasing="ease-in-out" />
          <Area type="monotone" dataKey="Comments" stroke="#f59e0b" strokeWidth={7} fillOpacity={1} fill="url(#glowComments)" isAnimationActive={true} animationDuration={9000} animationEasing="ease-in-out" />
          <Area type="monotone" dataKey="Shares" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#glowShares)" isAnimationActive={true} animationDuration={10500} animationEasing="ease-in-out" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// 📊 CUSTOM CHART TOOLTIP
// ═══════════════════════════════════════════════════════════
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-stone-900/95 backdrop-blur-xl border border-stone-700 rounded-xl p-4 shadow-2xl">
        <p className="text-amber-400 font-bold text-sm mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" /> {label}
        </p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-stone-300 capitalize">{entry.name}</span>
              </div>
              <span className="font-bold text-white">{entry.value.toLocaleString('hi-IN')}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// ═══════════════════════════════════════════════════════════
// 📈 COMMUNITY PULSE CHART COMPONENT
// ═══════════════════════════════════════════════════════════
const CommunityPulseChart = ({ data }: { data: any[] }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-stone-200/50 border border-stone-100 relative overflow-hidden"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            समुदाय की धड़कन (Community Pulse)
          </h3>
          <p className="text-stone-500 text-sm mt-1">पिछले 7 दिनों की रियल-टाइम एक्टिविटी</p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-bold">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full"><div className="w-2 h-2 rounded-full bg-blue-500" /> व्यूज़</span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full"><div className="w-2 h-2 rounded-full bg-rose-500" /> लाइक्स</span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full"><div className="w-2 h-2 rounded-full bg-amber-500" /> कमेंट्स</span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full"><div className="w-2 h-2 rounded-full bg-emerald-500" /> शेयर्स</span>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorShares" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
            <XAxis dataKey="day" stroke="#a8a29e" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#78716c', fontWeight: 600 }} />
            <YAxis stroke="#a8a29e" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#78716c', fontWeight: 600 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" animationDuration={1500} />
            <Area type="monotone" dataKey="Likes" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorLikes)" animationDuration={1500} />
            <Area type="monotone" dataKey="Comments" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorComments)" animationDuration={1500} />
            <Area type="monotone" dataKey="Shares" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorShares)" animationDuration={1500} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
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
          metrics: { likes: data.likes || 0, comments: data.comments || 0, shares: data.shares || 0 },
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
      const newUsers: TickerItem[] = snapshot.docs.map(doc => ({
        id: doc.id, type: 'join', userName: doc.data().displayName || "नया सदस्य",
        userPhoto: doc.data().photoURL, timestamp: doc.data().createdAt?.toDate?.()?.getTime() || Date.now()
      }));
      setItems(prev => {
        const posts = prev.filter(i => i.type === 'post');
        return [...posts, ...newUsers].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
      });
    });

    return () => { unsubscribePosts(); unsubscribeUsers(); };
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
      <motion.div className="flex gap-8 whitespace-nowrap" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
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

// ═══════════════════════════════════════════════════════════
// 📝 TESTIMONIAL INTERFACE
// ═══════════════════════════════════════════════════════════
interface Testimonial {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  quote: string;
  location: string;
  role: string;
  createdAt: any;
}

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [liveStats, setLiveStats] = useState({ totalUsers: 0, totalPosts: 0, totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success">("idle");

  // Testimonials State
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReviewText, setNewReviewText] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const usersQuery = query(collection(db, "users"));
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      setLiveStats(prev => ({ ...prev, totalUsers: snapshot.size }));
    });

    const postsQuery = query(collection(db, "spotlights"), orderBy("createdAt", "desc"), limit(200));
    const unsubPosts = onSnapshot(postsQuery, (snapshot) => {
      let totalViews = 0, totalLikes = 0, totalComments = 0, totalShares = 0;
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });
      const dailyStats: Record<string, { Views: number; Likes: number; Comments: number; Shares: number }> = {};
      last7Days.forEach(day => { dailyStats[day] = { Views: 0, Likes: 0, Comments: 0, Shares: 0 }; });

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        totalViews += data.views || 0; totalLikes += data.likes || 0;
        totalComments += data.comments || 0; totalShares += data.shares || 0;
        if (data.createdAt?.toDate) {
          const dateStr = data.createdAt.toDate().toISOString().split('T')[0];
          if (dailyStats[dateStr]) {
            dailyStats[dateStr].Views += data.views || 0; dailyStats[dateStr].Likes += data.likes || 0;
            dailyStats[dateStr].Comments += data.comments || 0; dailyStats[dateStr].Shares += data.shares || 0;
          }
        }
      });

      setChartData(last7Days.map(day => ({
        day: new Date(day).toLocaleDateString('hi-IN', { weekday: 'short' }),
        Views: dailyStats[day].Views, Likes: dailyStats[day].Likes,
        Comments: dailyStats[day].Comments, Shares: dailyStats[day].Shares,
      })));
      setLiveStats(prev => ({ ...prev, totalPosts: snapshot.size, totalViews, totalLikes, totalComments, totalShares }));
    });

    // Real-time Testimonials Listener
    const testimonialsQuery = query(collection(db, "testimonials"), orderBy("createdAt", "desc"), limit(6));
    const unsubTestimonials = onSnapshot(testimonialsQuery, (snapshot) => {
      const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
      setTestimonials(reviews);
      setLoadingTestimonials(false);
    });

    return () => { unsubUsers(); unsubPosts(); unsubTestimonials(); };
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus("loading");
    try {
      await addDoc(collection(db, "newsletter"), {
        email: newsletterEmail,
        subscribedAt: serverTimestamp(),
      });
      setNewsletterStatus("success");
      setNewsletterEmail("");
      setTimeout(() => setNewsletterStatus("idle"), 4000);
    } catch (error) {
      console.error("Newsletter error:", error);
      setNewsletterStatus("idle");
    }
  };

  const handleAddReview = async () => {
    if (!currentUser || !newReviewText.trim()) return;
    try {
      await addDoc(collection(db, "testimonials"), {
        userId: currentUser.uid,
        userName: currentUser.displayName || "आलमनगर वासी",
        userPhoto: currentUser.photoURL || "",
        quote: newReviewText.trim(),
        location: "आलमनगर, बिहार",
        role: "सदस्य",
        createdAt: serverTimestamp(),
      });
      setNewReviewText("");
      setShowReviewModal(false);
    } catch (error) {
      console.error("Review error:", error);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!currentUser) return;
    if (window.confirm("क्या आप वाकई अपनी यह समीक्षा हटाना चाहते हैं?")) {
      try {
        await deleteDoc(doc(db, "testimonials", reviewId));
      } catch (error) {
        console.error("Delete review error:", error);
      }
    }
  };

  const isAdmin = currentUser && ADMIN_UIDS.includes(currentUser.uid);

  return (
    <main className="bg-stone-50 text-stone-900 overflow-x-hidden selection:bg-amber-200 selection:text-amber-900">
      <style>{`
        .tiranga-shimmer {
          background: linear-gradient(90deg, #FF9933 0%, #FFFFFF 25%, #138808 50%, #FFFFFF 75%, #FF9933 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: shimmer 4s linear infinite;
        }
        .golden-shimmer {
          background: linear-gradient(90deg, #FCD34D 0%, #FFFFFF 40%, #F59E0B 60%, #FCD34D 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer { 0% { background-position: 0% center; } 100% { background-position: -200% center; } }
      `}</style>

      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500 z-[100] origin-left" style={{ scaleX }} />

      {/* ===== 1. CINEMATIC HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-stone-950 text-white px-6">
        <HeroBackgroundChart data={chartData} />
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-stone-950/85 via-emerald-950/75 to-stone-950/85" />

        {isAdmin && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="absolute top-24 right-6 z-20">
            <Link href="/admin/reports" className="flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-md border border-red-500/30 rounded-full px-5 py-2.5 hover:bg-red-500/30 transition-all group shadow-lg">
              <Shield className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-red-300">Admin Panel</span>
            </Link>
          </motion.div>
        )}

        <div className="relative z-10 text-center max-w-5xl mx-auto pt-20">
          {currentUser ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="inline-flex items-center gap-3 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 rounded-full px-6 py-3 mb-6 shadow-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-stone-900 overflow-hidden flex items-center justify-center">
                  {currentUser.photoURL ? <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold">{currentUser.displayName?.[0] || "U"}</span>}
                </div>
              </div>
              <span className="text-sm font-bold text-emerald-200">स्वागत है, <span className="text-amber-300">{currentUser.displayName?.split(" ")[0] || "मित्र"}</span>! 🙏</span>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-8 shadow-lg hover:bg-white/20 transition-colors cursor-default">
              <MapPin className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-semibold tracking-wide">मधेपुरा, मिथिलांचल, बिहार</span>
            </motion.div>
          )}

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 tracking-tight leading-tight tiranga-shimmer drop-shadow-2xl pt-2">
            आलमनगर
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-2xl md:text-4xl mb-6 font-medium italic golden-shimmer drop-shadow-md leading-relaxed py-1">
            "जड़ों से जुड़ा, मिथिला की धरती का गौरव"
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="text-base md:text-lg text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            हमारी विरासत, हमारे लोग, हमारा गौरव। आलमनगर से जुड़े हर व्यक्ति के लिए एक डिजिटल 'चौपाल'।
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.55 }} className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12 px-4">
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

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="flex flex-col sm:flex-row gap-5 justify-center mb-16">
            <Link href="/about" className="group bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] flex items-center justify-center gap-3 text-lg">
              <BookOpen className="w-5 h-5" /> हमारी विरासत देखें <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/community" className="group bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 text-lg">
              <Users className="w-5 h-5" /> चौपाल में शामिल हों
            </Link>
            <Link href="/marketplace" className="group bg-emerald-600/80 hover:bg-emerald-500/80 backdrop-blur-md border border-emerald-400/30 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 text-lg">
              <ShoppingBag className="w-5 h-5" /> गाँव का हाट
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, repeat: Infinity, repeatType: "reverse", duration: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-xs text-white/50 uppercase tracking-widest">स्क्रॉल करें</span>
            <ChevronDown className="w-8 h-8 text-white/50" />
          </motion.div>
        </div>
      </section>

      <LiveActivityTicker />

      {/* ===== 2. QUICK STATS & REAL-TIME CHART ===== */}
      <section className="py-20 px-6 bg-stone-50 relative z-20">
        <div className="max-w-6xl mx-auto space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <span className="text-emerald-600 font-black text-sm tracking-[0.2em] uppercase mb-4 block">लाइव स्टैट्स</span>
            <h2 className="text-3xl md:text-5xl font-black text-stone-900">आलमनगर आज</h2>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, label: "जुड़े परिवार", value: liveStats.totalUsers, color: "bg-emerald-100 text-emerald-700" },
              { icon: Star, label: "कुल पोस्ट", value: liveStats.totalPosts, color: "bg-amber-100 text-amber-700" },
              { icon: Eye, label: "कुल व्यूज़", value: liveStats.totalViews, color: "bg-blue-100 text-blue-700" },
              { icon: Heart, label: "कुल लाइक", value: liveStats.totalLikes, color: "bg-rose-100 text-rose-700" },
            ].map((stat, i) => (
              <motion.div key={stat.label} variants={fadeInUp} whileHover={{ y: -8, scale: 1.02 }} className="group bg-white rounded-3xl p-8 shadow-lg shadow-stone-200/50 border border-stone-100 transition-all duration-500 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-stone-50 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-150" />
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${stat.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-4xl font-black text-stone-900 mb-2"><AnimatedNumber value={stat.value} /></div>
                <div className="text-sm font-bold text-stone-500 uppercase tracking-wider">{stat.label}</div>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase">Live</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <CommunityPulseChart data={chartData} />
        </div>
      </section>

      {/* ===== 3. ABOUT PREVIEW ===== */}
      <section className="py-24 px-6 bg-white relative overflow-hidden">
        <MadhubaniPattern />
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <span className="text-emerald-600 font-black text-sm tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-emerald-600"></span> आलमनगर के बारे में
            </span>
            <h2 className="text-4xl md:text-6xl font-black mt-3 mb-8 text-stone-900 leading-[1.1]">
              एक गाँव, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-amber-600 to-orange-600">हज़ारों कहानियाँ</span>
            </h2>
            <p className="text-stone-600 leading-relaxed mb-6 text-lg">
              आलमनगर, मधेपुरा जिला, बिहार की पवित्र धरती पर बसा एक ऐसा गाँव जो अपनी समृद्ध संस्कृति, इतिहास और लोगों के आपनेपन की भावना के लिए जाना जाता है।
            </p>
            <p className="text-stone-600 leading-relaxed mb-10 text-lg">
              यह प्लेटफॉर्म हमारा एक छोटा सा प्रयास है हमारी मिथिला की संस्कृति को संभालने का, हमारे समुदाय को जोड़ने का, और मिलकर एक बेहतर भविष्य बनाने का।
            </p>
            <Link href="/about" className="inline-flex items-center gap-2 text-emerald-700 font-black hover:text-emerald-600 transition-colors group text-lg border-b-2 border-emerald-200 hover:border-emerald-600 pb-1">
              पूरा इतिहास पढ़ें <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="relative">
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
                  <p className="text-white/80 text-sm flex items-center gap-2"><Camera className="w-4 h-4" /> अपनी यादें गैलरी में अपलोड करें</p>
                </div>
              </div>
            </Link>
            <motion.div animate={{ rotate: [6, -6, 6] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-8 -right-8 w-40 h-40 bg-amber-200 rounded-[2rem] -z-10 opacity-60" />
            <motion.div animate={{ rotate: [-6, 6, -6] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute -top-8 -left-8 w-32 h-32 bg-emerald-200 rounded-[2rem] -z-10 opacity-60" />
          </motion.div>
        </div>
      </section>

      {/* ===== 4. EXPLORE SECTIONS ===== */}
      <section className="py-24 px-6 bg-stone-100">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
            <span className="text-amber-600 font-black text-sm tracking-[0.2em] uppercase mb-4 block">खोजें</span>
            <h2 className="text-4xl md:text-6xl font-black text-stone-900">आलमनगर को जानें</h2>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Camera, title: "फोटो गैलरी", desc: "पुरानी यादें, नए रंग। गाँव की वो तस्वीरें जो दिल को छू लें और आँखों में नमी ला दें।", href: "/gallery", color: "bg-emerald-100 text-emerald-700", accent: "group-hover:bg-emerald-600 group-hover:text-white", active: true },
              { icon: Users, title: "समुदाय (चौपाल)", desc: "चाहे गाँव में हों या विदेश में, आलमनगर के परिवार से जुड़े रहें। अपनी बात रखें।", href: "/community", color: "bg-amber-100 text-amber-700", accent: "group-hover:bg-amber-600 group-hover:text-white", active: true },
              { icon: Phone, title: "डायरेक्टरी", desc: "ज़रूरी नंबर, स्थानीय व्यवसाय और गाँव के महत्वपूर्ण संपर्क एक ही जगह।", href: "#", color: "bg-rose-100 text-rose-700", accent: "", active: false },
            ].map((card, i) => (
              <motion.div key={card.title} variants={fadeInUp} whileHover={card.active ? { y: -12 } : {}}>
                {card.active ? (
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
                ) : (
                  <div className="group relative bg-white rounded-[2rem] p-10 shadow-sm border border-stone-200 h-full overflow-hidden opacity-75">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 ${card.color} shadow-sm`}>
                      <card.icon className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-stone-900 mb-4">{card.title}</h3>
                    <p className="text-stone-500 leading-relaxed text-lg mb-8">{card.desc}</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">जल्द आ रहा है</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 5. MARKETPLACE TEASER ===== */}
      <section className="py-24 px-6 bg-gradient-to-br from-stone-900 via-emerald-950 to-stone-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-md border border-amber-500/30 rounded-full px-6 py-3 mb-8">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-black tracking-wide uppercase text-amber-300">गाँव का हाट (Marketplace)</span>
              </div>
              <h2 className="text-4xl md:text-7xl font-black mb-8 leading-tight">
                स्थानीय बाज़ार, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">वैश्विक पहुँच</span>
              </h2>
              <p className="text-xl md:text-2xl text-white/80 mb-6 max-w-3xl mx-auto leading-relaxed">
                अपने गाँव के किसानों, कारीगरों और स्थानीय व्यवसायों को सीधा समर्थन दें।
              </p>
            </motion.div>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Wheat, title: "ताज़ा उपज", desc: "खेत की ताज़ी सब्ज़ियाँ, फल और अनाज सीधे किसान से" },
              { icon: Star, title: "मिथिला हस्तशिल्प", desc: "हस्तनिर्मित मिथिला पेंटिंग, मडबनी कला और पारंपरिक वस्तुएं" },
              { icon: Music, title: "स्थानीय सेवाएं", desc: "प्लंबर, इलेक्ट्रीशियन, ट्यूशन और अन्य विश्वसनीय सेवाएं" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} whileHover={{ y: -8, scale: 1.02 }} className="bg-white/5 backdrop-blur-sm rounded-[2rem] p-8 border border-white/10 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300 group relative overflow-hidden">
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

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <Link href="/marketplace" className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black px-12 py-5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] text-lg">
              <ShoppingBag className="w-6 h-6" /> हाट में चलें (Marketplace) <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== 6. REAL-TIME TESTIMONIALS (DYNAMIC) ===== */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="text-center md:text-left">
              <span className="text-emerald-600 font-black text-sm tracking-[0.2em] uppercase mb-4 block">कहानियाँ</span>
              <h2 className="text-4xl md:text-6xl font-black text-stone-900">आलमनगर की आवाज़ें</h2>
            </div>
            {currentUser && (
              <motion.button
                variants={fadeInUp}
                onClick={() => setShowReviewModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5" />
                अपनी राय दें
              </motion.button>
            )}
          </motion.div>

          {loadingTestimonials ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-emerald-600 animate-spin" /></div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12 bg-stone-50 rounded-3xl border border-stone-200">
              <Quote className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500 font-medium">अभी तक कोई समीक्षा नहीं है। पहली राय देने वाले बनें!</p>
            </div>
          ) : (
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <motion.div 
                  key={t.id} 
                  variants={fadeInUp} 
                  whileHover={{ y: -8 }} 
                  className="bg-stone-50 rounded-[2rem] p-10 border border-stone-100 hover:shadow-2xl hover:border-emerald-200 transition-all duration-300 relative group"
                >
                  {/* Delete Button (Only for Owner) */}
                  {currentUser?.uid === t.userId && (
                    <button 
                      onClick={() => handleDeleteReview(t.id)}
                      className="absolute top-6 right-6 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                      title="अपनी समीक्षा हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <Quote className="w-12 h-12 text-amber-400 mb-6 opacity-30 absolute top-8 left-8" />
                  <p className="text-stone-700 leading-relaxed mb-8 text-lg italic relative z-10 pt-4">"{t.quote}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg p-[2px]">
                      <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                        {t.userPhoto ? (
                          <img src={t.userPhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{t.userName[0]}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-black text-stone-900 text-lg">{t.userName}</p>
                      <p className="text-sm text-stone-500 font-medium">{t.location} • {t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ===== 7. WORKING NEWSLETTER ===== */}
      <section className="py-24 px-6 bg-gradient-to-br from-emerald-950 to-green-950 text-white relative overflow-hidden">
        <MadhubaniPattern />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="max-w-3xl mx-auto text-center relative z-10">
          <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Mail className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6">जुड़े रहें</h2>
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
            आलमनगर के कार्यक्रमों, समाचारों और समुदाय की कहानियों की सीधी जानकारी अपने ईमेल पर पाएं।
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto" onSubmit={handleNewsletterSubmit}>
            <input 
              type="email" 
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="अपना ईमेल दर्ज करें" 
              className="flex-1 px-8 py-5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-amber-400/30 focus:border-amber-400 transition-all text-lg disabled:opacity-50" 
              disabled={newsletterStatus === "success"}
              required
            />
            <button 
              type="submit" 
              disabled={newsletterStatus === "loading" || newsletterStatus === "success"}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black px-10 py-5 rounded-full transition-all duration-300 hover:scale-105 shadow-lg text-lg whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[180px]"
            >
              {newsletterStatus === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : 
               newsletterStatus === "success" ? "सफल!" : "सदस्यता लें"}
            </button>
          </form>
          
          <AnimatePresence>
            {newsletterStatus === "success" && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                className="text-emerald-400 mt-6 font-bold flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" /> ✅ सफलतापूर्वक सदस्यता ले ली गई!
              </motion.p>
            )}
          </AnimatePresence>
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
                {isAdmin && (
                  <li><Link href="/admin/reports" className="hover:text-red-400 transition-colors flex items-center gap-2 border-l-2 border-red-500/50 pl-2"><Shield className="w-3 h-3" /> Admin Dashboard</Link></li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black mb-6 text-lg">संपर्क</h4>
              <ul className="space-y-4 text-base">
                <li><Link href="/contact" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> संपर्क करें</Link></li>
                {!currentUser && (<li><Link href="/auth" className="hover:text-amber-400 transition-colors flex items-center gap-2"><LogIn className="w-3 h-3" /> लॉगिन / रजिस्टर</Link></li>)}
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

      {/* 📝 ADD REVIEW MODAL */}
      <AnimatePresence>
        {showReviewModal && currentUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-stone-900">अपनी राय साझा करें</h3>
                <button onClick={() => setShowReviewModal(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-stone-500" />
                </button>
              </div>
              
              <div className="flex items-center gap-3 mb-6 p-4 bg-stone-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 p-[2px]">
                  <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-stone-700">{currentUser.displayName?.[0] || "U"}</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-sm">{currentUser.displayName || "आलमनगर वासी"}</p>
                  <p className="text-xs text-stone-500">आपकी राय सार्वजनिक रूप से दिखाई जाएगी</p>
                </div>
              </div>

              <textarea
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                className="w-full p-4 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none mb-6"
                rows={4}
                placeholder="आलमनगर के बारे में आपका अनुभव कैसा रहा?..."
                maxLength={300}
              />
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowReviewModal(false)} 
                  className="flex-1 py-3 rounded-xl border border-stone-200 font-bold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  रद्द करें
                </button>
                <button 
                  onClick={handleAddReview} 
                  disabled={!newReviewText.trim()}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold hover:from-emerald-700 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  सबमिट करें
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}