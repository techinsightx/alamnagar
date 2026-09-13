"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  TrendingUp, Users, Star, Eye, Heart, MessageCircle, Share2, 
  Activity, ArrowLeft, Calendar, Clock, Zap, Target, Award,
  BarChart3, PieChart, LineChart, LogIn, Lock
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { db, auth } from "@/lib/firebase";
import { 
  collection, query, onSnapshot, orderBy, limit 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, LineChart as RechartsLine, Line, Legend, PieChart as RechartsPie, Pie, Cell
} from "recharts";

// ═════════════════════════════════════════════════════════
// 🖼️ CINEMATIC HERO SLIDER (16:9 RATIO)
// ═══════════════════════════════════════════════════════════
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2420&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2420&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=2420&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2420&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=2420&auto=format&fit=crop",
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
    }, 5000);
    return () => clearInterval(timer);
  }, [resolvedImages.length]);

  return (
    <div className={`relative w-full h-full overflow-hidden bg-stone-900 ${className}`}>
      {resolvedImages.map((img, index) => (
        <motion.div
          key={img}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ 
            opacity: index === currentIndex ? 1 : 0,
            scale: index === currentIndex ? 1 : 1.1
          }}
          transition={{ duration: 3, ease: "easeInOut" as const }}
        >
          <img 
            src={img} 
            alt={`Analytics ${index + 1}`} 
            className="w-full h-full object-cover"
            onError={() => handleImageError(index)}
          />
        </motion.div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/95 via-indigo-950/60 to-transparent pointer-events-none" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {resolvedImages.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-cyan-400 w-8' : 'bg-white/50 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const AnalyticsCinematicSlider = () => {
  const analyticsImages = [
    '/images/analytics-1.jpg',
    '/images/analytics-2.jpg',
    '/images/analytics-3.jpg',
    '/images/analytics-4.jpg',
    '/images/analytics-5.jpg'
  ];

  return (
    <div className="absolute inset-0 z-0 w-full min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
      <SmoothImageSlider images={analyticsImages} className="w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/95 via-indigo-950/60 to-transparent" />
    </div>
  );
};

interface LiveStats {
  totalUsers: number;
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  activeUsers: number;
  newUsersToday: number;
}

interface ActivityData {
  day: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  posts: number;
}

interface TopContent {
  id: string;
  title: string;
  views: number;
  likes: number;
  type: 'post' | 'game' | 'tool';
}

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#f43f5e', '#8b5cf6'];

// ✅ FIXED: Properly typed Variants to resolve TypeScript ease errors
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};

export default function AlamnagarAnalytics() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  
  const [liveStats, setLiveStats] = useState<LiveStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    activeUsers: 0,
    newUsersToday: 0
  });
  
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [topContent, setTopContent] = useState<TopContent[]>([]);

  // ✅ Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Real-time Firebase Listeners (Only if logged in)
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribers: (() => void)[] = [];
    setLoading(true);

    // 1. Users Collection - Real-time
    const usersQuery = query(collection(db, "users"));
    unsubscribers.push(onSnapshot(usersQuery, (snapshot) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const newUsersToday = snapshot.docs.filter(doc => {
        const createdAt = doc.data().createdAt?.toDate?.();
        return createdAt && createdAt >= today;
      }).length;

      setLiveStats(prev => ({
        ...prev,
        totalUsers: snapshot.size,
        newUsersToday
      }));
      setLoading(false);
    }));

    // 2. Posts/Spotlights Collection - Real-time
    const postsQuery = query(collection(db, "spotlights"), orderBy("createdAt", "desc"), limit(200));
    unsubscribers.push(onSnapshot(postsQuery, (snapshot) => {
      let totalViews = 0, totalLikes = 0, totalComments = 0, totalShares = 0;
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });
      
      const dailyStats: Record<string, { views: number; likes: number; comments: number; shares: number; posts: number }> = {};
      last7Days.forEach(day => { 
        dailyStats[day] = { views: 0, likes: 0, comments: 0, shares: 0, posts: 0 }; 
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
            dailyStats[dateStr].views += data.views || 0;
            dailyStats[dateStr].likes += data.likes || 0;
            dailyStats[dateStr].comments += data.comments || 0;
            dailyStats[dateStr].shares += data.shares || 0;
            dailyStats[dateStr].posts += 1;
          }
        }
      });

      const chartData = last7Days.map(day => ({
        day: new Date(day).toLocaleDateString('hi-IN', { weekday: 'short' }),
        views: dailyStats[day].views,
        likes: dailyStats[day].likes,
        comments: dailyStats[day].comments,
        shares: dailyStats[day].shares,
        posts: dailyStats[day].posts
      }));

      setActivityData(chartData);
      setLiveStats(prev => ({
        ...prev,
        totalPosts: snapshot.size,
        totalViews,
        totalLikes,
        totalComments,
        totalShares
      }));

      // Top Content
      const sorted = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map((item: any) => ({
          id: item.id,
          title: item.title || 'Untitled',
          views: item.views || 0,
          likes: item.likes || 0,
          type: 'post' as const
        }));
      setTopContent(sorted);
    }));

    return () => unsubscribers.forEach(unsub => unsub());
  }, [currentUser]);

  // ✅ FIXED: Always returns a string to satisfy parseFloat
  const engagementRate = useMemo(() => {
    if (liveStats.totalViews === 0) return "0";
    return ((liveStats.totalLikes + liveStats.totalComments + liveStats.totalShares) / liveStats.totalViews * 100).toFixed(2);
  }, [liveStats]);

  // Pie chart data for content distribution
  const contentDistribution = [
    { name: 'Posts', value: liveStats.totalPosts, color: '#3b82f6' },
    { name: 'Games', value: 3, color: '#f59e0b' },
    { name: 'Tools', value: 2, color: '#10b981' },
  ];

  // ✅ Login Required Screen
  if (authChecking) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" as const }} className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-stone-950 text-white relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-600 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-stone-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-8 md:p-12 max-w-md w-full text-center shadow-[0_0_60px_rgba(6,182,212,0.3)]"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl font-black text-white mb-4">Login Required</h2>
          <p className="text-stone-400 mb-8">
            Alamnagar Analytics dekhne ke liye please login karein. Real-time data sirf authenticated users ke liye available hai.
          </p>

          <div className="flex flex-col gap-3">
            <Link 
              href="/" 
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 rounded-xl hover:scale-105 transition-transform"
            >
              <LogIn className="w-5 h-5" />
              Login / Signup
            </Link>
            <Link 
              href="/" 
              className="flex items-center justify-center gap-2 bg-stone-800 text-stone-300 font-bold py-3 rounded-xl hover:bg-stone-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-stone-800">
            <p className="text-xs text-stone-500">
              🔒 Secure Analytics Dashboard • Real-time Data
            </p>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-950 text-white relative overflow-hidden">
      {/* Cinematic Hero Section */}
      <section className="relative w-full min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
        <AnalyticsCinematicSlider />
        
        <div className="relative z-10 h-full flex items-center justify-center px-4 md:px-8 lg:px-12 py-12 md:py-16">
          <div className="text-center w-full max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-cyan-500/20 backdrop-blur-md border border-cyan-400/30 rounded-full px-6 py-3 mb-6">
                <Activity className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-bold tracking-wide text-cyan-300 uppercase">Real-Time Analytics</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                आलमनगर <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                  एनालिटिक्स
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
                Real-time platform insights, user engagement, and performance metrics
              </p>

              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span className="text-white/90">Live Updates</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-white/90">Real-Time Tracking</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Stats Cards */}
      <section className="px-4 md:px-8 lg:px-12 py-12 -mt-20 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: Users, label: "Total Users", value: liveStats.totalUsers, color: "bg-emerald-500", subtext: `${liveStats.newUsersToday} today` },
              { icon: Star, label: "Total Posts", value: liveStats.totalPosts, color: "bg-amber-500", subtext: "Active content" },
              { icon: Eye, label: "Total Views", value: liveStats.totalViews, color: "bg-blue-500", subtext: "All time" },
              { icon: Heart, label: "Total Likes", value: liveStats.totalLikes, color: "bg-rose-500", subtext: "Engagement" },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-stone-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-cyan-500/30 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]"
              >
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-black text-white mb-1">
                  {loading ? '-' : stat.value.toLocaleString('hi-IN')}
                </div>
                <div className="text-xs text-stone-400 font-medium mb-1">{stat.label}</div>
                <div className="text-[10px] text-cyan-400 font-bold">{stat.subtext}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Charts Section */}
      <section className="px-4 md:px-8 lg:px-12 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Activity Area Chart */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-stone-900/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-cyan-400" />
                  7-Day Activity Trend
                </h3>
                <p className="text-stone-400 text-sm mt-1">Real-time engagement metrics</p>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-blue-400" /> Views
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 text-rose-400 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-rose-400" /> Likes
                </span>
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="day" stroke="#78716c" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#78716c" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', color: '#fff', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" dataKey="likes" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorLikes)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Tower (Bar Chart) + Line Chart Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tower Chart - Posts vs Views */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="bg-stone-900/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10"
            >
              <h3 className="text-xl font-black text-white flex items-center gap-2 mb-6">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                Posts & Views (Tower)
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="day" stroke="#78716c" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#78716c" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar dataKey="posts" name="Posts" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="views" name="Views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Line Chart - Engagement Trend */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="bg-stone-900/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10"
            >
              <h3 className="text-xl font-black text-white flex items-center gap-2 mb-6">
                <LineChart className="w-6 h-6 text-emerald-400" />
                Engagement Trend
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLine data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="day" stroke="#78716c" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#78716c" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="comments" name="Comments" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} />
                    <Line type="monotone" dataKey="shares" name="Shares" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
                  </RechartsLine>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Engagement Rate */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="bg-stone-900/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10"
            >
              <h3 className="text-xl font-black text-white flex items-center gap-2 mb-6">
                <Target className="w-6 h-6 text-purple-400" />
                Engagement Rate
              </h3>
              <div className="flex items-center justify-center py-8">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="#333"
                      strokeWidth="12"
                      fill="none"
                    />
                    <motion.circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="#a855f7"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 553" }}
                      animate={{ 
                        strokeDasharray: `${(parseFloat(engagementRate) / 100) * 553} 553` 
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" as const }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white">{loading ? '-' : engagementRate}%</span>
                    <span className="text-xs text-stone-400 mt-1">Engagement</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-white">{loading ? '-' : liveStats.totalComments}</div>
                  <div className="text-[10px] text-stone-400">Comments</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{loading ? '-' : liveStats.totalShares}</div>
                  <div className="text-[10px] text-stone-400">Shares</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{loading ? '-' : (liveStats.totalLikes / (liveStats.totalPosts || 1)).toFixed(1)}</div>
                  <div className="text-[10px] text-stone-400">Avg Likes/Post</div>
                </div>
              </div>
            </motion.div>

            {/* Content Distribution */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="bg-stone-900/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10"
            >
              <h3 className="text-xl font-black text-white flex items-center gap-2 mb-6">
                <PieChart className="w-6 h-6 text-amber-400" />
                Content Distribution
              </h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={contentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {contentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', borderRadius: '8px' }}
                    />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Top Content */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-stone-900/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10"
          >
            <h3 className="text-2xl font-black text-white flex items-center gap-2 mb-6">
              <Award className="w-6 h-6 text-yellow-400" />
              Top Performing Content
            </h3>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-stone-400">Loading data...</div>
              ) : topContent.length === 0 ? (
                <div className="text-center py-8 text-stone-400">No content yet</div>
              ) : (
                topContent.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-stone-800/50 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center font-black text-white">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">{item.title}</div>
                      <div className="text-xs text-stone-400">{item.type}</div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-blue-400">
                        <Eye className="w-4 h-4" />
                        <span className="font-bold">{item.views}</span>
                      </div>
                      <div className="flex items-center gap-1 text-rose-400">
                        <Heart className="w-4 h-4" />
                        <span className="font-bold">{item.likes}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

        </div>
      </section>

      {/* Back Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <Link href="/" className="flex items-center gap-2 bg-stone-900/90 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-full hover:bg-stone-800 transition-all shadow-lg">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-sm">Back to Home</span>
        </Link>
      </div>
    </main>
  );
}