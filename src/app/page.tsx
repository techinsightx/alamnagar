"use client";

import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { 
  MapPin, BookOpen, Users, ArrowRight, Camera, Phone, 
  ShoppingBag, Sparkles, Landmark, TreePine, Heart, 
  Star, Quote, Mail, ChevronDown, Wheat, Sun, Music, Play,
  Zap, UserPlus, MessageCircle, Share2, Activity, Eye, Shield,
  Flame, Award, TrendingUp, LogIn, Lock, Trash2, Loader2, 
  CheckCircle, X, Globe, AlertTriangle, Gamepad2, Bot, LayoutTemplate, ExternalLink,
  Smile, Rocket, Palette, Trophy
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { db, auth } from "@/lib/firebase";
import { 
  collection, query, orderBy, limit, onSnapshot, 
  addDoc, deleteDoc, doc, serverTimestamp, setDoc 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from "recharts";

import Navbar from "./components/Navbar";

// ═══════════════════════════════════════════════════════════
// 🖼️ SMOOTH IMAGE SLIDER WITH FALLBACK IMAGES
// ═══════════════════════════════════════════════════════════
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1609766418204-94aae7d87817?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2670&auto=format&fit=crop",
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
            alt={`Alamnagar Hero ${index + 1}`} 
            className="w-full h-full object-cover"
            onError={() => handleImageError(index)}
          />
        </motion.div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-stone-950/20 pointer-events-none" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {resolvedImages.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-amber-400 w-8' : 'bg-white/50 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const ADMIN_UIDS = ["5fPCK8mGRTaAvIBTzUn7MEMQ2id2"];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const AnimatedNumber = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 2000;
    const increment = end / (duration / 16);
    if (end === 0) { setCount(0); return; }
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else { setCount(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{count.toLocaleString('hi-IN')}{suffix}</span>;
};

const HeroBackgroundChart = ({ data }: { data: any[] }) => {
  if (data.length === 0) return null;
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="glowViews" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6}/><stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05}/></linearGradient>
            <linearGradient id="glowLikes" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" stopOpacity={0.5}/><stop offset="100%" stopColor="#f43f5e" stopOpacity={0.05}/></linearGradient>
            <linearGradient id="glowComments" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4}/><stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05}/></linearGradient>
            <linearGradient id="glowShares" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="100%" stopColor="#10b981" stopOpacity={0.05}/></linearGradient>
          </defs>
          <Area type="monotone" dataKey="Views" stroke="#3b82f6" strokeWidth={16} fillOpacity={1} fill="url(#glowViews)" isAnimationActive={true} animationDuration={6000} />
          <Area type="monotone" dataKey="Likes" stroke="#f43f5e" strokeWidth={12} fillOpacity={1} fill="url(#glowLikes)" isAnimationActive={true} animationDuration={7500} />
          <Area type="monotone" dataKey="Comments" stroke="#f59e0b" strokeWidth={8} fillOpacity={1} fill="url(#glowComments)" isAnimationActive={true} animationDuration={9000} />
          <Area type="monotone" dataKey="Shares" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#glowShares)" isAnimationActive={true} animationDuration={10500} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const HeroTowerChart = ({ stats }: { stats: any }) => {
  const data = useMemo(() => [
    { name: 'सदस्य', value: stats.totalUsers || 10 },
    { name: 'पोस्ट', value: stats.totalPosts || 10 },
    { name: 'व्यूज़', value: stats.totalViews || 10 },
    { name: 'लाइक', value: stats.totalLikes || 10 },
  ], [stats]);
  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden opacity-20">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="heroTowerEmerald" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={1}/><stop offset="50%" stopColor="#10b981" stopOpacity={0.5}/><stop offset="100%" stopColor="#10b981" stopOpacity={0.05}/></linearGradient>
            <linearGradient id="heroTowerAmber" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/><stop offset="50%" stopColor="#f59e0b" stopOpacity={0.5}/><stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05}/></linearGradient>
            <linearGradient id="heroTowerBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/><stop offset="50%" stopColor="#3b82f6" stopOpacity={0.5}/><stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05}/></linearGradient>
            <linearGradient id="heroTowerRose" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" stopOpacity={1}/><stop offset="50%" stopColor="#f43f5e" stopOpacity={0.5}/><stop offset="100%" stopColor="#f43f5e" stopOpacity={0.05}/></linearGradient>
          </defs>
          <Bar dataKey="value" radius={[12, 12, 0, 0]} animationDuration={2500} animationEasing="ease-out">
            {data.map((entry, index) => {
              const fills = ['url(#heroTowerEmerald)', 'url(#heroTowerAmber)', 'url(#heroTowerBlue)', 'url(#heroTowerRose)'];
              return <rect key={`cell-${index}`} fill={fills[index]} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const NewsletterRealtimeChart = ({ data }: { data: any[] }) => {
  if (data.length === 0) return null;
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-50">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="nlViews" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6}/><stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05}/></linearGradient>
            <linearGradient id="nlLikes" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" stopOpacity={0.5}/><stop offset="100%" stopColor="#f43f5e" stopOpacity={0.05}/></linearGradient>
            <linearGradient id="nlComments" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4}/><stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05}/></linearGradient>
            <linearGradient id="nlShares" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="100%" stopColor="#10b981" stopOpacity={0.05}/></linearGradient>
          </defs>
          <Area type="monotone" dataKey="Views" stroke="#3b82f6" strokeWidth={10} fillOpacity={1} fill="url(#nlViews)" isAnimationActive={true} animationDuration={6000} />
          <Area type="monotone" dataKey="Likes" stroke="#f43f5e" strokeWidth={7} fillOpacity={1} fill="url(#nlLikes)" isAnimationActive={true} animationDuration={7500} />
          <Area type="monotone" dataKey="Comments" stroke="#f59e0b" strokeWidth={5} fillOpacity={1} fill="url(#nlComments)" isAnimationActive={true} animationDuration={9000} />
          <Area type="monotone" dataKey="Shares" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#nlShares)" isAnimationActive={true} animationDuration={10500} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const MarketplaceTowerChart = ({ stats }: { stats: any }) => {
  const data = useMemo(() => [
    { name: 'सदस्य', value: stats.totalUsers || 10 },
    { name: 'पोस्ट', value: stats.totalPosts || 10 },
    { name: 'व्यूज़', value: stats.totalViews || 10 },
    { name: 'लाइक', value: stats.totalLikes || 10 },
  ], [stats]);
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-55">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="towerEmerald" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={1}/><stop offset="100%" stopColor="#10b981" stopOpacity={0.2}/></linearGradient>
            <linearGradient id="towerAmber" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/><stop offset="100%" stopColor="#f59e0b" stopOpacity={0.2}/></linearGradient>
            <linearGradient id="towerBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/><stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2}/></linearGradient>
            <linearGradient id="towerRose" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" stopOpacity={1}/><stop offset="100%" stopColor="#f43f5e" stopOpacity={0.2}/></linearGradient>
          </defs>
          <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={2000} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

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

const CommunityPulseChart = ({ data }: { data: any[] }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
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
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
            <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
            <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
            <linearGradient id="colorShares" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
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
    const unsubPosts = onSnapshot(postsQuery, (snapshot) => {
      const newItems: TickerItem[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id, type: 'post',
          userName: data.userName || "आलमनगर वासी", userPhoto: data.userPhoto,
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
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      const newUsers: TickerItem[] = snapshot.docs.map(doc => ({
        id: doc.id, type: 'join', userName: doc.data().displayName || "नया सदस्य",
        userPhoto: doc.data().photoURL, timestamp: doc.data().createdAt?.toDate?.()?.getTime() || Date.now()
      }));
      setItems(prev => {
        const posts = prev.filter(i => i.type === 'post');
        return [...posts, ...newUsers].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
      });
    });
    return () => { unsubPosts(); unsubUsers(); };
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
                  <span className="font-bold text-emerald-400">{item.userName}</span> आलमनगर परिवार से जुड़े! 
                </span>
              </>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

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

const CreateraOGBanner = () => {
  const [ogData, setOgData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetch("https://api.microlink.io/?url=https://createra.in")
      .then((res) => res.json())
      .then((data) => { if (data.status === "success") setOgData(data.data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);
  if (isLoading) return (
    <div className="w-full mb-12 rounded-2xl bg-stone-100 border border-stone-200 h-40 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
    </div>
  );
  const title = ogData?.title || "Createra";
  const description = ogData?.description || "Create, publish, and share your thoughts with the world.";
  const imageUrl = ogData?.image?.url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop";
  const domain = ogData?.publisher || "createra.in";
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="w-full mb-12">
      <Link href="https://createra.in" target="_blank" rel="noopener noreferrer" className="group block w-full overflow-hidden rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-300">
        <div className="flex flex-col md:flex-row w-full">
          <div className="w-full md:w-1/3 h-48 md:h-40 bg-stone-100 relative overflow-hidden flex-shrink-0">
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="flex-1 p-4 md:p-5 flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Globe className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide truncate">{domain}</span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-stone-900 line-clamp-1 mb-1.5 group-hover:text-emerald-600 transition-colors">{title}</h3>
            <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">{description}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const FooterBrandLogo = () => (
  <Link href="/" className="flex items-center gap-3 group w-max">
    <motion.div 
      className="relative w-11 h-11 bg-gradient-to-br from-emerald-500 via-amber-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-amber-500/30 transition-all overflow-hidden"
      whileHover={{ scale: 1.05 }}
    >
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} className="w-7 h-7 text-white drop-shadow-md relative z-10">
        <Globe className="w-full h-full" strokeWidth={2.5} />
      </motion.div>
      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-white/40 rounded-xl blur-md" />
    </motion.div>
    <div>
      <h1 className="text-xl font-extrabold text-white tracking-tight leading-none">
        आलम<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">नगर</span>
      </h1>
      <p className="text-[10px] text-stone-400 font-semibold tracking-wider uppercase mt-0.5">हमारा गाँव, हमारी पहचान</p>
    </div>
  </Link>
);

const FloatingBubble = ({ delay, size, left, duration }: { delay: number; size: number; left: number; duration: number }) => (
  <motion.div
    className="absolute rounded-full bg-white/20 backdrop-blur-sm"
    style={{ width: size, height: size, left: `${left}%`, bottom: -size }}
    animate={{ y: ["0vh", "-120vh"], x: [0, 30, -30, 0] }}
    transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
  />
);

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [liveStats, setLiveStats] = useState({ totalUsers: 0, totalPosts: 0, totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReviewText, setNewReviewText] = useState("");

  const heroImages = [
    '/images/hero-1.jpg', '/images/hero-2.jpg', '/images/hero-3.jpg',
    '/images/hero-4.jpg', '/images/hero-5.jpg'
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubUsers = onSnapshot(query(collection(db, "users")), (snapshot) => {
      setLiveStats(prev => ({ ...prev, totalUsers: snapshot.size }));
    });

    const unsubPosts = onSnapshot(query(collection(db, "spotlights"), orderBy("createdAt", "desc"), limit(200)), (snapshot) => {
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

    const unsubTestimonials = onSnapshot(query(collection(db, "testimonials"), orderBy("createdAt", "desc"), limit(50)), (snapshot) => {
      setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial)));
      setLoadingTestimonials(false);
    });

    return () => { 
      unsubUsers(); 
      unsubPosts(); 
      unsubTestimonials(); 
    };
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterStatus("error"); setErrorMessage("कृपया एक वैध ईमेल पता दर्ज करें।"); return;
    }
    setNewsletterStatus("loading"); setErrorMessage("");
    try {
      await addDoc(collection(db, "newsletter"), { email: newsletterEmail, subscribedAt: serverTimestamp() });
      setNewsletterStatus("success"); setNewsletterEmail("");
      setTimeout(() => setNewsletterStatus("idle"), 5000);
    } catch (error: any) {
      setNewsletterStatus("error"); setErrorMessage(error.message || "सदस्यता लेने में त्रुटि हुई।");
    }
  };

  const handleAddReview = async () => {
    if (!currentUser || !newReviewText.trim()) return;
    try {
      await setDoc(doc(db, "testimonials", currentUser.uid), {
        userId: currentUser.uid, userName: currentUser.displayName || "आलमनगर वासी",
        userPhoto: currentUser.photoURL || "", quote: newReviewText.trim(),
        location: "आलमनगर, बिहार", role: "सदस्य",
        updatedAt: serverTimestamp(), createdAt: userExistingReview ? userExistingReview.createdAt : serverTimestamp(),
      }, { merge: true });
      setNewReviewText(""); setShowReviewModal(false);
    } catch (error) { console.error("Review error:", error); }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!currentUser) return;
    if (window.confirm("क्या आप वाकई अपनी यह समीक्षा हटाना चाहते हैं?")) {
      try { await deleteDoc(doc(db, "testimonials", reviewId)); } catch (error) { console.error("Delete review error:", error); }
    }
  };

  const isAdmin = currentUser && ADMIN_UIDS.includes(currentUser.uid);
  const userExistingReview = testimonials.find(t => t.userId === currentUser?.uid);

  return (
    <>
      <Navbar />
      <main className="bg-stone-50 text-stone-900 overflow-x-hidden selection:bg-amber-200 selection:text-amber-900">
        <style>{`
          .tiranga-shimmer { background: linear-gradient(90deg, #FF9933 0%, #FFFFFF 25%, #138808 50%, #FFFFFF 75%, #FF9933 100%); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent; animation: shimmer 4s linear infinite; }
          .golden-shimmer { background: linear-gradient(90deg, #FCD34D 0%, #FFFFFF 40%, #F59E0B 60%, #FCD34D 100%); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent; animation: shimmer 3s linear infinite; }
          @keyframes shimmer { 0% { background-position: 0% center; } 100% { background-position: -200% center; } }
        `}</style>

        <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500 z-[100] origin-left" style={{ scaleX }} />

        {/* ===== 1. CINEMATIC HERO SECTION ===== */}
        <section className="relative w-full bg-stone-900 text-white overflow-hidden">
          <div className="relative w-full min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
            <div className="absolute inset-0 z-0">
              <SmoothImageSlider images={heroImages} className="w-full h-full" />
            </div>
            <HeroBackgroundChart data={chartData} />
            <HeroTowerChart stats={liveStats} />
            <div className="absolute inset-0 z-[2] bg-gradient-to-br from-stone-950/40 via-stone-900/25 to-stone-950/50 pointer-events-none" />
            
            {isAdmin && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
                <Link href="/admin/reports" className="flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-md border border-red-500/30 rounded-full px-4 py-2 md:px-5 md:py-2.5 hover:bg-red-500/30 transition-all group shadow-lg">
                  <Shield className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs md:text-sm font-bold text-red-300">Admin</span>
                </Link>
              </motion.div>
            )}
            
            <div className="relative z-[10] h-full flex items-center justify-center px-4 md:px-8 lg:px-12 py-12 md:py-16 lg:py-20">
              <div className="text-center w-full max-w-6xl mx-auto">
                {currentUser ? (
                  <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, ease: "easeOut" }} className="relative w-full max-w-2xl mx-auto mb-6 md:mb-8 p-4 md:p-6 flex flex-col items-center text-center gap-4">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-full blur-2xl opacity-40 animate-pulse" />
                      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white/30 flex items-center justify-center shadow-2xl">
                        {currentUser.photoURL ? <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" /> : <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-amber-400">{currentUser.displayName?.[0] || "U"}</span>}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight drop-shadow-lg">
                        प्रणाम, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">{currentUser.displayName?.split(" ")[0] || "मित्र"}</span> 
                      </h3>
                      <p className="text-sm md:text-base text-stone-200 leading-relaxed font-medium max-w-xl mx-auto">आलमनगर की डिजिटल चौपाल में आपका स्वागत है।</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 md:px-6 py-2 md:py-3 mb-4 md:mb-6 shadow-lg">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                    <span className="text-xs md:text-sm font-semibold tracking-wide">मधेपुरा, मिथिलांचल, बिहार</span>
                  </motion.div>
                )}

                <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-4xl md:text-6xl lg:text-8xl font-black mb-3 md:mb-4 tracking-tight leading-tight tiranga-shimmer drop-shadow-2xl">आलमनगर</motion.h1>
                <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-lg md:text-2xl lg:text-3xl mb-3 md:mb-4 font-medium italic golden-shimmer drop-shadow-md leading-relaxed">"जड़ों से जुड़ा, मिथिला की धरती का गौरव"</motion.p>
                <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="text-xs md:text-base lg:text-lg text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">हमारी विरासत, हमारे लोग, हमारा गौरव।</motion.p>
                
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.55 }} className="flex flex-wrap justify-center gap-2 md:gap-6 mb-6 md:mb-8">
                  <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 md:px-4 py-1.5 md:py-2"><Users className="w-3 h-3 md:w-4 md:h-4 text-emerald-400" /><span className="text-[10px] md:text-xs text-white/90">सदस्य</span><span className="text-xs md:text-sm font-bold text-white"><AnimatedNumber value={liveStats.totalUsers} /></span></div>
                  <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 md:px-4 py-1.5 md:py-2"><Star className="w-3 h-3 md:w-4 md:h-4 text-amber-400" /><span className="text-[10px] md:text-xs text-white/90">पोस्ट</span><span className="text-xs md:text-sm font-bold text-white"><AnimatedNumber value={liveStats.totalPosts} /></span></div>
                  <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 md:px-4 py-1.5 md:py-2"><Eye className="w-3 h-3 md:w-4 md:h-4 text-blue-400" /><span className="text-[10px] md:text-xs text-white/90">व्यूज़</span><span className="text-xs md:text-sm font-bold text-white"><AnimatedNumber value={liveStats.totalViews} /></span></div>
                  <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 md:px-4 py-1.5 md:py-2"><Heart className="w-3 h-3 md:w-4 md:h-4 text-red-400" /><span className="text-[10px] md:text-xs text-white/90">लाइक</span><span className="text-xs md:text-sm font-bold text-white"><AnimatedNumber value={liveStats.totalLikes} /></span></div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                  <Link href="/about" className="group bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold px-5 md:px-8 py-2.5 md:py-3 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 md:gap-3 text-sm md:text-lg"><BookOpen className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden sm:inline">हमारी विरासत देखें</span><span className="sm:hidden">विरासत</span> <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" /></Link>
                  <Link href="/community" className="group bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white font-bold px-5 md:px-8 py-2.5 md:py-3 rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 md:gap-3 text-sm md:text-lg"><Users className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden sm:inline">चौपाल में शामिल हों</span><span className="sm:hidden">चौपाल</span></Link>
                  <Link href="/marketplace" className="group bg-emerald-600/90 hover:bg-emerald-500/90 backdrop-blur-md border border-emerald-400/40 text-white font-bold px-5 md:px-8 py-2.5 md:py-3 rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 md:gap-3 text-sm md:text-lg"><ShoppingBag className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden sm:inline">गाँव का हाट</span><span className="sm:hidden">हाट</span></Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <LiveActivityTicker />

        {/* ===== 2. QUICK STATS & REAL-TIME CHART ===== */}
        <section className="py-20 px-4 md:px-8 lg:px-12 bg-stone-50 relative z-20">
          <div className="max-w-7xl mx-auto space-y-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
              <span className="text-emerald-600 font-black text-sm tracking-[0.2em] uppercase mb-4 block">लाइव स्टैट्स</span>
              <h2 className="text-3xl md:text-5xl font-black text-stone-900">आलमनगर आज</h2>
            </motion.div>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[{ icon: Users, label: "जुड़े परिवार", value: liveStats.totalUsers, color: "bg-emerald-100 text-emerald-700" }, { icon: Star, label: "कुल पोस्ट", value: liveStats.totalPosts, color: "bg-amber-100 text-amber-700" }, { icon: Eye, label: "कुल व्यूज़", value: liveStats.totalViews, color: "bg-blue-100 text-blue-700" }, { icon: Heart, label: "कुल लाइक", value: liveStats.totalLikes, color: "bg-rose-100 text-rose-700" }].map((stat, i) => (
                <motion.div key={stat.label} variants={fadeInUp} whileHover={{ y: -8, scale: 1.02 }} className="group bg-white rounded-3xl p-8 shadow-lg shadow-stone-200/50 border border-stone-100 transition-all duration-500 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-stone-50 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-150" />
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${stat.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}><stat.icon className="w-8 h-8" /></div>
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
        <section className="py-24 px-4 md:px-8 lg:px-12 bg-white relative overflow-hidden">
          <MadhubaniPattern />
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <span className="text-emerald-600 font-black text-sm tracking-[0.2em] uppercase mb-4 flex items-center gap-2"><span className="w-8 h-[2px] bg-emerald-600"></span> आलमनगर के बारे में</span>
              <h2 className="text-4xl md:text-6xl font-black mt-3 mb-8 text-stone-900 leading-[1.1]">एक गाँव, <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-amber-600 to-orange-600">हज़ारों कहानियाँ</span></h2>
              <p className="text-stone-600 leading-relaxed mb-6 text-lg">आलमनगर, मधेपुरा जिला, बिहार की पवित्र धरती पर बसा एक ऐसा गाँव जो अपनी समृद्ध संस्कृति, इतिहास और लोगों के आपनेपन की भावना के लिए जाना जाता है।</p>
              <p className="text-stone-600 leading-relaxed mb-10 text-lg">यह प्लेटफॉर्म हमारा एक छोटा सा प्रयास है हमारी मिथिला की संस्कृति को संभालने का, हमारे समुदाय को जोड़ने का, और मिलकर एक बेहतर भविष्य बनाने का।</p>
              <Link href="/about" className="inline-flex items-center gap-2 text-emerald-700 font-black hover:text-emerald-600 transition-colors group text-lg border-b-2 border-emerald-200 hover:border-emerald-600 pb-1">पूरा इतिहास पढ़ें <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" /></Link>
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
        <section className="py-24 px-4 md:px-8 lg:px-12 bg-stone-100">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
              <span className="text-amber-600 font-black text-sm tracking-[0.2em] uppercase mb-4 block">खोजें</span>
              <h2 className="text-4xl md:text-6xl font-black text-stone-900">आलमनगर को जानें</h2>
            </motion.div>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-8">
              {[{ icon: Camera, title: "फोटो गैलरी", desc: "पुरानी यादें, नए रंग। गाँव की वो तस्वीरें जो दिल को छू लें और आँखों में नमी ला दें।", href: "/gallery", color: "bg-emerald-100 text-emerald-700", accent: "group-hover:bg-emerald-600 group-hover:text-white", active: true }, { icon: Users, title: "समुदाय (चौपाल)", desc: "चाहे गाँव में हों या विदेश में, आलमनगर के परिवार से जुड़े रहें। अपनी बात रखें।", href: "/community", color: "bg-amber-100 text-amber-700", accent: "group-hover:bg-amber-600 group-hover:text-white", active: true }, { icon: Phone, title: "डायरेक्टरी", desc: "ज़रूरी नंबर, स्थानीय व्यवसाय और गाँव के महत्वपूर्ण संपर्क एक ही जगह।", href: "#", color: "bg-rose-100 text-rose-700", accent: "", active: false }].map((card, i) => (
                <motion.div key={card.title} variants={fadeInUp} whileHover={card.active ? { y: -12 } : {}}>
                  {card.active ? (
                    <Link href={card.href} className="group block bg-white rounded-[2rem] p-10 shadow-sm border border-stone-200 hover:shadow-2xl hover:border-emerald-200 transition-all duration-500 h-full relative overflow-hidden">
                      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 ${card.color} ${card.accent} transition-all duration-300 shadow-sm`}><card.icon className="w-10 h-10" /></div>
                      <h3 className="text-2xl font-black text-stone-900 mb-4 group-hover:text-emerald-700 transition-colors">{card.title}</h3>
                      <p className="text-stone-500 leading-relaxed text-lg mb-8">{card.desc}</p>
                      <div className="flex items-center gap-2 text-emerald-600 font-black opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">अभी देखें <ArrowRight className="w-5 h-5" /></div>
                    </Link>
                  ) : (
                    <div className="group relative bg-white rounded-[2rem] p-10 shadow-sm border border-stone-200 h-full overflow-hidden opacity-75">
                      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 ${card.color} shadow-sm`}><card.icon className="w-10 h-10" /></div>
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
        <section className="py-24 px-4 md:px-8 lg:px-12 bg-neutral-900 text-white relative overflow-hidden">
          <MarketplaceTowerChart stats={liveStats} />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                <div className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-md border border-amber-500/30 rounded-full px-6 py-3 mb-8">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-black tracking-wide uppercase text-amber-300">गाँव का हाट (Marketplace)</span>
                </div>
                <h2 className="text-4xl md:text-7xl font-black mb-8 leading-tight">स्थानीय बाज़ार, <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">वैश्विक पहुँच</span></h2>
                <p className="text-xl md:text-2xl text-white/80 mb-6 max-w-3xl mx-auto leading-relaxed">अपने गाँव के किसानों, कारीगरों और स्थानीय व्यवसायों को सीधा समर्थन दें।</p>
              </motion.div>
            </div>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6 mb-12">
              {[{ icon: Wheat, title: "ताज़ा उपज", desc: "खेत की ताज़ी सब्ज़ियाँ, फल और अनाज सीधे किसान से" }, { icon: Star, title: "मिथिला हस्तशिल्प", desc: "हस्तनिर्मित मिथिला पेंटिंग, मडबनी कला और पारंपरिक वस्तुएं" }, { icon: Music, title: "स्थानीय सेवाएं", desc: "प्लंबर, इलेक्ट्रीशियन, ट्यूशन और अन्य विश्वसनीय सेवाएं" }].map((item, i) => (
                <motion.div key={i} variants={fadeInUp} whileHover={{ y: -8, scale: 1.02 }} className="bg-white/5 backdrop-blur-sm rounded-[2rem] p-8 border border-white/10 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-transparent transition-all duration-500" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors duration-300"><item.icon className="w-8 h-8 text-amber-400 group-hover:text-white transition-colors" /></div>
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

        {/* ===== 6. REAL-TIME TESTIMONIALS ===== */}
        <section className="py-24 px-4 md:px-8 lg:px-12 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="text-center md:text-left">
                <span className="text-emerald-600 font-black text-sm tracking-[0.2em] uppercase mb-4 block">कहानियाँ</span>
                <h2 className="text-4xl md:text-6xl font-black text-stone-900">आलमनगर की आवाज़ें</h2>
              </div>
              {currentUser && (
                <motion.button variants={fadeInUp} onClick={() => { setNewReviewText(userExistingReview ? userExistingReview.quote : ""); setShowReviewModal(true); }} className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  <MessageCircle className="w-5 h-5" />
                  {userExistingReview ? "अपनी राय अपडेट करें" : "अपनी राय दें"}
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
                  <motion.div key={t.id} variants={fadeInUp} whileHover={{ y: -8 }} className="bg-stone-50 rounded-[2rem] p-10 border border-stone-100 hover:shadow-2xl hover:border-emerald-200 transition-all duration-300 relative group">
                    {currentUser?.uid === t.userId && (
                      <button onClick={() => handleDeleteReview(t.id)} className="absolute top-6 right-6 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all" title="अपनी समीक्षा हटाएं"><Trash2 className="w-4 h-4" /></button>
                    )}
                    <Quote className="w-12 h-12 text-amber-400 mb-6 opacity-30 absolute top-8 left-8" />
                    <p className="text-stone-700 leading-relaxed mb-8 text-lg italic relative z-10 pt-4">"{t.quote}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg p-[2px]">
                        <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                          {t.userPhoto ? <img src={t.userPhoto} alt="" className="w-full h-full object-cover" /> : <span>{t.userName[0]}</span>}
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

        {/* ===== NEW: KIDS ZONE SECTION (UPGRADED WITH 2 GAMES) ===== */}
        <section className="relative py-24 px-4 md:px-8 lg:px-12 overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <FloatingBubble delay={0} size={80} left={10} duration={12} />
            <FloatingBubble delay={2} size={60} left={25} duration={15} />
            <FloatingBubble delay={4} size={100} left={50} duration={18} />
            <FloatingBubble delay={1} size={50} left={70} duration={14} />
            <FloatingBubble delay={3} size={90} left={85} duration={16} />
            <FloatingBubble delay={5} size={70} left={40} duration={20} />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }} className="inline-block text-7xl md:text-8xl mb-4">🎮</motion.div>
              <span className="inline-block px-6 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white font-black text-sm tracking-widest uppercase mb-6">✨ Kids Zone ✨</span>
              <h2 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl">बच्चों की <span className="text-yellow-300">मस्ती की दुनिया</span></h2>
              <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">आलमनगर के बच्चों के लिए खास गेम्स! यहाँ खेलो, सीखो, और मज़े करो।</p>
            </motion.div>

            {/* ✅ UPGRADED: 2 Game Cards Side by Side */}
            <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
              <Link href="/games/bubble-pop" className="group relative bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-white/50 hover:scale-105 transition-all duration-300 overflow-hidden text-left">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-yellow-400/40 transition-all" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🎈</div>
                  <h3 className="text-2xl font-black text-stone-900 mb-2">Bubble Pop</h3>
                  <p className="text-stone-600 text-sm mb-4">Balloons ko pop karo aur magical items collect karo!</p>
                  <span className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold px-6 py-2 rounded-full group-hover:shadow-lg transition-all">
                    Play Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              <Link href="/games/magical-catch" className="group relative bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-white/50 hover:scale-105 transition-all duration-300 overflow-hidden text-left">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-400/40 transition-all" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🧺</div>
                  <h3 className="text-2xl font-black text-stone-900 mb-2">Jadui Tokri</h3>
                  <p className="text-stone-600 text-sm mb-4">Girte hue stars aur gifts pakdo, bombs se bacho!</p>
                  <span className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-6 py-2 rounded-full group-hover:shadow-lg transition-all">
                    Play Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </div>

            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              {[
                { icon: Smile, title: "Fun & Safe", desc: "बच्चों के लिए 100% सुरक्षित और मज़ेदार", color: "from-yellow-400 to-orange-400" },
                { icon: Palette, title: "Colorful World", desc: "रंग-बिरंगी दुनिया में खो जाओ", color: "from-pink-400 to-purple-400" },
                { icon: Trophy, title: "Win Stars", desc: "हर game में stars जमा करो", color: "from-blue-400 to-cyan-400" }
              ].map((feature, i) => (
                <motion.div key={i} variants={fadeInUp} whileHover={{ y: -10, rotate: 2 }} className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl border-4 border-white/50">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-black text-stone-900 mb-1">{feature.title}</h3>
                  <p className="text-stone-600 text-xs">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ===== 7. WORKING NEWSLETTER ===== */}
        <section className="py-24 px-4 md:px-8 lg:px-12 bg-zinc-800 text-white relative overflow-hidden">
          <NewsletterRealtimeChart data={chartData} />
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="max-w-3xl mx-auto text-center relative z-10">
            <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <Mail className="w-10 h-10 text-amber-400" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6">जुड़े रहें</h2>
            <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">आलमनगर के कार्यक्रमों, समाचारों और समुदाय की कहानियों की सीधी जानकारी अपने ईमेल पर पाएं।</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto relative" onSubmit={handleNewsletterSubmit}>
              <input type="email" value={newsletterEmail} onChange={(e) => { setNewsletterEmail(e.target.value); if (newsletterStatus === "error") { setNewsletterStatus("idle"); setErrorMessage(""); } }} placeholder="अपना ईमेल दर्ज करें" className={`flex-1 px-8 py-5 rounded-full bg-white/10 backdrop-blur-md border text-white placeholder-white/50 focus:outline-none focus:ring-4 transition-all text-lg disabled:opacity-50 ${newsletterStatus === "error" ? "border-red-500/50 focus:ring-red-500/30 focus:border-red-500" : "border-white/20 focus:ring-amber-400/30 focus:border-amber-400"}`} disabled={newsletterStatus === "success" || newsletterStatus === "loading"} required />
              <button type="submit" disabled={newsletterStatus === "loading" || newsletterStatus === "success"} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black px-10 py-5 rounded-full transition-all duration-300 hover:scale-105 shadow-lg text-lg whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[180px]">
                {newsletterStatus === "loading" ? (<><Loader2 className="w-5 h-5 animate-spin" /> प्रोसेस हो रहा है...</>) : newsletterStatus === "success" ? (<><CheckCircle className="w-5 h-5" /> सफल!</>) : ("सदस्यता लें")}
              </button>
            </form>
            <AnimatePresence>
              {newsletterStatus === "success" && (<motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-emerald-400 mt-6 font-bold flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> ✅ सफलतापूर्वक सदस्यता ले ली गई!</motion.p>)}
              {newsletterStatus === "error" && (<motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 mt-6 font-bold flex items-center justify-center gap-2"><AlertTriangle className="w-5 h-5" /> ❌ {errorMessage}</motion.p>)}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* ===== 8. PREMIUM FOOTER WITH INTEGRATED TOOLS ===== */}
        <footer className="bg-stone-950 text-stone-400 py-16 px-4 md:px-8 lg:px-12 border-t border-stone-900 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-600" />
          <div className="max-w-7xl mx-auto">
            <CreateraOGBanner />

            <div className="grid md:grid-cols-12 gap-12 mb-12 mt-8">
              <div className="md:col-span-4">
                <div className="mb-6"><FooterBrandLogo /></div>
                <p className="text-base mb-8 leading-relaxed text-stone-400">मधेपुरा, बिहार, भारत का आधिकारिक डिजिटल प्लेटफॉर्म। हमारी विरासत, हमारा समुदाय, हमारा गौरव।</p>
                <div className="flex gap-4">
                  <Link href="/community" className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center hover:bg-amber-500 hover:text-stone-950 transition-colors cursor-pointer"><Users className="w-5 h-5" /></Link>
                  <Link href="/gallery" className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center hover:bg-amber-500 hover:text-stone-950 transition-colors cursor-pointer"><Camera className="w-5 h-5" /></Link>
                </div>
              </div>

              <div className="md:col-span-4">
                <h4 className="text-white font-black mb-6 text-lg">त्वरित लिंक</h4>
                <ul className="space-y-3 text-base">
                  <li><Link href="/about" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> हमारे बारे में</Link></li>
                  <li><Link href="/gallery" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> गैलरी</Link></li>
                  <li><Link href="/community" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> समुदाय</Link></li>
                  <li><Link href="/marketplace" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> बाज़ार</Link></li>
                  <li><Link href="/contact" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> संपर्क करें</Link></li>
                  <li><Link href="/legal" className="hover:text-amber-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> कानूनी जानकारी</Link></li>
                  {isAdmin && (<li><Link href="/admin/reports" className="hover:text-red-400 transition-colors flex items-center gap-2 border-l-2 border-red-500/50 pl-2"><Shield className="w-3 h-3" /> Admin Dashboard</Link></li>)}
                </ul>
              </div>

              <div className="md:col-span-4">
                <h4 className="text-white font-black mb-6 text-lg flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-500" /> Tools & Games
                </h4>
                <div className="space-y-4">
                  <Link href="https://funnelsbuilder.netlify.app" target="_blank" rel="noopener noreferrer" className="group flex items-start gap-4 p-4 bg-stone-900/50 rounded-2xl border border-stone-800 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0 group-hover:bg-purple-500 transition-colors">
                      <LayoutTemplate className="w-5 h-5 text-purple-400 group-hover:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-bold text-white text-sm group-hover:text-purple-400 transition-colors">FunnelsBuilder</h5>
                        <ExternalLink className="w-3.5 h-3.5 text-stone-500 group-hover:text-purple-400" />
                      </div>
                      <p className="text-xs text-stone-400 leading-relaxed">मुफ्त में प्रोफेशनल वेबसाइट और लैंडिंग पेज बनाएं।</p>
                    </div>
                  </Link>

                  <Link href="https://aipassivesystem.netlify.app" target="_blank" rel="noopener noreferrer" className="group flex items-start gap-4 p-4 bg-stone-900/50 rounded-2xl border border-stone-800 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0 group-hover:bg-cyan-500 transition-colors">
                      <Bot className="w-5 h-5 text-cyan-400 group-hover:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">AI Passive System</h5>
                        <ExternalLink className="w-3.5 h-3.5 text-stone-500 group-hover:text-cyan-400" />
                      </div>
                      <p className="text-xs text-stone-400 leading-relaxed">ऑटोमेटेड AI टूल्स जो खुद काम करते हैं।</p>
                    </div>
                  </Link>

                  {/* ✅ Game 1: Bubble Pop */}
                  <Link href="/games/bubble-pop" className="group flex items-start gap-4 p-4 bg-stone-900/50 rounded-2xl border border-stone-800 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500 transition-colors">
                      <Gamepad2 className="w-5 h-5 text-amber-400 group-hover:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">Bubble Pop Game</h5>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <p className="text-xs text-stone-400 leading-relaxed">Bubbles pop करो और stars जमा करो।</p>
                    </div>
                  </Link>

                  {/* ✅ Game 2: Jadui Tokri (NEW) */}
                  <Link href="/games/magical-catch" className="group flex items-start gap-4 p-4 bg-stone-900/50 rounded-2xl border border-stone-800 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-500 transition-colors">
                      <Gamepad2 className="w-5 h-5 text-indigo-400 group-hover:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">Jadui Tokri Game</h5>
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <p className="text-xs text-stone-400 leading-relaxed">Stars aur gifts pakdo, bombs se bacho!</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <div className="bg-stone-900/50 rounded-2xl p-4 border border-stone-800 h-64 flex flex-col justify-end">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'सदस्य', value: liveStats.totalUsers || 1, fill: '#10b981' },
                    { name: 'पोस्ट', value: liveStats.totalPosts || 1, fill: '#f59e0b' },
                    { name: 'व्यूज़', value: liveStats.totalViews || 1, fill: '#3b82f6' },
                    { name: 'लाइक', value: liveStats.totalLikes || 1, fill: '#f43f5e' },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                    <XAxis dataKey="name" stroke="#78716c" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#78716c" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${(Number(value)/1000).toFixed(1)}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', color: '#fff', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} formatter={(value: any) => [Number(value || 0).toLocaleString('hi-IN'), '']} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-stone-500">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> कुल सदस्य</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> कुल पोस्ट</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> कुल व्यूज़</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div> कुल लाइक</div>
              </div>
            </div>

            <div className="border-t border-stone-900 pt-8 text-center">
              <p className="text-sm text-stone-500">
                © {new Date().getFullYear()} alamnagar.in — आलमनगर के लिए <Heart className="w-4 h-4 inline text-red-500 fill-red-500 mx-1" /> के साथ बनाया गया
              </p>
            </div>
          </div>
        </footer>

        {/* 📝 ADD/UPDATE REVIEW MODAL */}
        <AnimatePresence>
          {showReviewModal && currentUser && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowReviewModal(false)}>
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-stone-900">{userExistingReview ? "अपनी राय अपडेट करें" : "अपनी राय साझा करें"}</h3>
                  <button onClick={() => setShowReviewModal(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><X className="w-6 h-6 text-stone-500" /></button>
                </div>
                <div className="flex items-center gap-3 mb-6 p-4 bg-stone-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                      {currentUser.photoURL ? <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-stone-700">{currentUser.displayName?.[0] || "U"}</span>}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 text-sm">{currentUser.displayName || "आलमनगर वासी"}</p>
                    <p className="text-xs text-stone-500">{userExistingReview ? "आपकी पुरानी राय को अपडेट कर दिया जाएगा" : "आपकी राय सार्वजनिक रूप से दिखाई जाएगी"}</p>
                  </div>
                </div>
                <textarea value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} className="w-full p-4 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none mb-6" rows={4} placeholder="आलमनगर के बारे में आपका अनुभव कैसा रहा?..." maxLength={300} />
                <div className="flex gap-3">
                  <button onClick={() => setShowReviewModal(false)} className="flex-1 py-3 rounded-xl border border-stone-200 font-bold text-stone-600 hover:bg-stone-50 transition-colors">रद्द करें</button>
                  <button onClick={handleAddReview} disabled={!newReviewText.trim()} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold hover:from-emerald-700 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                    {userExistingReview ? "अपडेट करें" : "सबमिट करें"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}