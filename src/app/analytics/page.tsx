"use client";

import { motion, Variants } from "framer-motion";
import { 
  Users, Star, Eye, Heart, MessageCircle, Share2, 
  Activity, ArrowLeft, Clock, Zap, Target, Award,
  BarChart3, PieChart, LineChart, LogIn, Lock, TrendingUp, User
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
  comments: number;
  shares: number;
  authorName?: string;
  authorPhoto?: string;
  authorId?: string;
  image?: string;
  type: 'post' | 'game' | 'tool';
  createdAt?: any;
}

// ✅ Multi-color palette for charts
const CHART_COLORS = {
  posts: '#a855f7',    // Purple
  views: '#3b82f6',    // Blue
  likes: '#f43f5e',    // Rose
  comments: '#f59e0b', // Amber
  shares: '#10b981',   // Emerald
};

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#f43f5e', '#a855f7'];

// ✅ Properly typed Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};

// ✅ Custom Hindi Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-stone-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4 shadow-2xl">
        <p className="text-cyan-400 font-bold mb-2 text-sm border-b border-stone-700 pb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          const hindiLabels: Record<string, string> = {
            posts: 'पोस्ट',
            views: 'दृश्य',
            likes: 'पसंद',
            comments: 'टिप्पणियाँ',
            shares: 'शेयर'
          };
          return (
            <div key={index} className="flex items-center gap-2 text-xs py-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-stone-300 font-medium">{hindiLabels[entry.dataKey] || entry.name}:</span>
              <span className="text-white font-black">{entry.value.toLocaleString('hi-IN')}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
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
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // ✅ Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Real-time Firebase Listeners
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribers: (() => void)[] = [];
    setLoading(true);

    // 1. Users Collection
    const usersQuery = query(collection(db, "users"));
    unsubscribers.push(onSnapshot(usersQuery, (snapshot) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllUsers(usersList);
      
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

    // 2. Posts/Spotlights Collection
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

      const allPosts: TopContent[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const postViews = data.views || 0;
        const postLikes = data.likes || 0;
        const postComments = data.comments || 0;
        const postShares = data.shares || 0;
        
        totalViews += postViews;
        totalLikes += postLikes;
        totalComments += postComments;
        totalShares += postShares;

        // Get author info
        const authorId = data.authorId || data.userId || '';
        const author = allUsers.find(u => u.id === authorId);
        
        allPosts.push({
          id: doc.id,
          title: data.title || 'बिना शीर्षक',
          views: postViews,
          likes: postLikes,
          comments: postComments,
          shares: postShares,
          authorName: author?.displayName || data.authorName || 'अज्ञात',
          authorPhoto: author?.photoURL || data.authorPhoto || '',
          authorId: authorId,
          image: data.image || data.imageUrl || '',
          type: 'post',
          createdAt: data.createdAt
        });
        
        if (data.createdAt?.toDate) {
          const dateStr = data.createdAt.toDate().toISOString().split('T')[0];
          if (dailyStats[dateStr]) {
            dailyStats[dateStr].views += postViews;
            dailyStats[dateStr].likes += postLikes;
            dailyStats[dateStr].comments += postComments;
            dailyStats[dateStr].shares += postShares;
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

      // Top Content - sorted by total engagement
      const sorted = allPosts
        .sort((a, b) => {
          const aTotal = a.views + a.likes + a.comments + a.shares;
          const bTotal = b.views + b.likes + b.comments + b.shares;
          return bTotal - aTotal;
        })
        .slice(0, 6);
      setTopContent(sorted);
    }));

    return () => unsubscribers.forEach(unsub => unsub());
  }, [currentUser, allUsers.length]);

  // Engagement rate
  const engagementRate = useMemo(() => {
    if (liveStats.totalViews === 0) return "0";
    return ((liveStats.totalLikes + liveStats.totalComments + liveStats.totalShares) / liveStats.totalViews * 100).toFixed(2);
  }, [liveStats]);

  // Pie chart data
  const contentDistribution = [
    { name: 'पोस्ट', value: liveStats.totalPosts, color: PIE_COLORS[0] },
    { name: 'गेम्स', value: 3, color: PIE_COLORS[1] },
    { name: 'टूल्स', value: 2, color: PIE_COLORS[2] },
  ];

  // ✅ Login Required Screen (Hindi)
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
          
          <h2 className="text-3xl font-black text-white mb-4">लॉगिन आवश्यक</h2>
          <p className="text-stone-400 mb-8">
            आलमनगर एनालिटिक्स देखने के लिए कृपया लॉगिन करें। रियल-टाइम डेटा केवल प्रमाणित उपयोगकर्ताओं के लिए उपलब्ध है।
          </p>

          <div className="flex flex-col gap-3">
            <Link 
              href="/" 
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 rounded-xl hover:scale-105 transition-transform"
            >
              <LogIn className="w-5 h-5" />
              लॉगिन / साइनअप करें
            </Link>
            <Link 
              href="/" 
              className="flex items-center justify-center gap-2 bg-stone-800 text-stone-300 font-bold py-3 rounded-xl hover:bg-stone-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              मुख्य पृष्ठ पर वापस जाएं
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-stone-800">
            <p className="text-xs text-stone-500">
              🔒 सुरक्षित एनालिटिक्स डैशबोर्ड • रियल-टाइम डेटा
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
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <Activity className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-bold tracking-wide text-cyan-300 uppercase">रियल-टाइम एनालिटिक्स</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                आलमनगर <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                  एनालिटिक्स
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
                रियल-टाइम प्लेटफ़ॉर्म इनसाइट्स, उपयोगकर्ता सहभागिता और प्रदर्शन मेट्रिक्स
              </p>

              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span className="text-white/90">लाइव अपडेट</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-white/90">रियल-टाइम ट्रैकिंग</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Stats Cards (Hindi) */}
      <section className="px-4 md:px-8 lg:px-12 py-12 -mt-20 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: Users, label: "कुल उपयोगकर्ता", value: liveStats.totalUsers, color: "bg-emerald-500", subtext: `आज ${liveStats.newUsersToday} नए` },
              { icon: Star, label: "कुल पोस्ट", value: liveStats.totalPosts, color: "bg-amber-500", subtext: "सक्रिय सामग्री" },
              { icon: Eye, label: "कुल दृश्य", value: liveStats.totalViews, color: "bg-blue-500", subtext: "सभी समय" },
              { icon: Heart, label: "कुल पसंद", value: liveStats.totalLikes, color: "bg-rose-500", subtext: "सहभागिता" },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
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
          
          {/* ✅ MULTI-COLOR TOWER CHART - Featured (Posts, Views, Likes, Comments, Shares) */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-stone-900/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10"
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                  7 दिन की संपूर्ण गतिविधि (टॉवर)
                </h3>
                <p className="text-stone-400 text-sm mt-1">सभी मेट्रिक्स एक नज़र में</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-purple-400" /> पोस्ट
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-blue-400" /> दृश्य
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 text-rose-400 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-rose-400" /> पसंद
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-amber-400" /> टिप्पणियाँ
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" /> शेयर
                </span>
              </div>
            </div>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradPosts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.7}/>
                    </linearGradient>
                    <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.7}/>
                    </linearGradient>
                    <linearGradient id="gradLikes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#be123c" stopOpacity={0.7}/>
                    </linearGradient>
                    <linearGradient id="gradComments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#d97706" stopOpacity={0.7}/>
                    </linearGradient>
                    <linearGradient id="gradShares" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#047857" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="day" stroke="#78716c" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#78716c" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="posts" name="पोस्ट" fill="url(#gradPosts)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="views" name="दृश्य" fill="url(#gradViews)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="likes" name="पसंद" fill="url(#gradLikes)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="comments" name="टिप्पणियाँ" fill="url(#gradComments)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="shares" name="शेयर" fill="url(#gradShares)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* ✅ MULTI-COLOR LINE CHART - Featured */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-stone-900/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10"
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  <LineChart className="w-6 h-6 text-emerald-400" />
                  सहभागिता रुझान (लाइनें)
                </h3>
                <p className="text-stone-400 text-sm mt-1">सभी मेट्रिक्स का समय-आधारित विश्लेषण</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-purple-400" /> पोस्ट
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-blue-400" /> दृश्य
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 text-rose-400 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-rose-400" /> पसंद
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-amber-400" /> टिप्पणियाँ
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" /> शेयर
                </span>
              </div>
            </div>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLine data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="day" stroke="#78716c" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#78716c" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="posts" name="पोस्ट" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="views" name="दृश्य" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="likes" name="पसंद" stroke="#f43f5e" strokeWidth={3} dot={{ fill: '#f43f5e', r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="comments" name="टिप्पणियाँ" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="shares" name="शेयर" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </RechartsLine>
              </ResponsiveContainer>
            </div>
          </motion.div>

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
                सहभागिता दर
              </h3>
              <div className="flex items-center justify-center py-8">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="#333" strokeWidth="12" fill="none" />
                    <motion.circle
                      cx="96" cy="96" r="88"
                      stroke="url(#engagementGradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 553" }}
                      animate={{ strokeDasharray: `${(parseFloat(engagementRate) / 100) * 553} 553` }}
                      transition={{ duration: 1.5, ease: "easeOut" as const }}
                    />
                    <defs>
                      <linearGradient id="engagementGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white">{loading ? '-' : engagementRate}%</span>
                    <span className="text-xs text-stone-400 mt-1">सहभागिता</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-white">{loading ? '-' : liveStats.totalComments.toLocaleString('hi-IN')}</div>
                  <div className="text-[10px] text-stone-400">टिप्पणियाँ</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{loading ? '-' : liveStats.totalShares.toLocaleString('hi-IN')}</div>
                  <div className="text-[10px] text-stone-400">शेयर</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{loading ? '-' : (liveStats.totalLikes / (liveStats.totalPosts || 1)).toFixed(1)}</div>
                  <div className="text-[10px] text-stone-400">औसत पसंद/पोस्ट</div>
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
                सामग्री वितरण
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
                      formatter={(value: any) => value.toLocaleString('hi-IN')}
                    />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* ✅ TOP PERFORMING CONTENT - Fully Accessible with Profile */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-stone-900/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-400" />
                शीर्ष प्रदर्शन करने वाली सामग्री
              </h3>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span>कुल सहभागिता के आधार पर</span>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-stone-400">डेटा लोड हो रहा है...</div>
              ) : topContent.length === 0 ? (
                <div className="text-center py-8 text-stone-400">अभी कोई सामग्री नहीं है</div>
              ) : (
                topContent.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link 
                      href={`/spotlights/${item.id}`}
                      className="block group"
                    >
                      <div className="flex items-center gap-4 p-4 bg-stone-800/50 rounded-xl border border-white/5 hover:border-cyan-500/50 hover:bg-stone-800/80 transition-all cursor-pointer">
                        
                        {/* Rank Badge */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-lg ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/30' :
                          index === 1 ? 'bg-gradient-to-br from-stone-300 to-stone-500' :
                          index === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-800' :
                          'bg-gradient-to-br from-cyan-500 to-blue-500'
                        }`}>
                          #{index + 1}
                        </div>

                        {/* Content Image (if available) */}
                        {item.image && (
                          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-stone-700">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          </div>
                        )}

                        {/* Content Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white truncate group-hover:text-cyan-400 transition-colors mb-1">
                            {item.title}
                          </div>
                          
                          {/* Author Profile - Clickable */}
                          {item.authorName && (
                            <Link 
                              href={item.authorId ? `/profile/${item.authorId}` : '#'}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-2 text-xs text-stone-400 hover:text-cyan-400 transition-colors"
                            >
                              {item.authorPhoto ? (
                                <img src={item.authorPhoto} alt={item.authorName} className="w-5 h-5 rounded-full border border-cyan-400/30" />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-[9px] font-black text-white">
                                  {item.authorName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="font-medium">{item.authorName}</span>
                              <User className="w-3 h-3" />
                            </Link>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3 text-xs flex-shrink-0">
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1 text-blue-400">
                              <Eye className="w-3.5 h-3.5" />
                              <span className="font-bold">{item.views.toLocaleString('hi-IN')}</span>
                            </div>
                            <span className="text-[9px] text-stone-500">दृश्य</span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1 text-rose-400">
                              <Heart className="w-3.5 h-3.5" />
                              <span className="font-bold">{item.likes.toLocaleString('hi-IN')}</span>
                            </div>
                            <span className="text-[9px] text-stone-500">पसंद</span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1 text-amber-400">
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span className="font-bold">{item.comments.toLocaleString('hi-IN')}</span>
                            </div>
                            <span className="text-[9px] text-stone-500">टिप्पणी</span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1 text-emerald-400">
                              <Share2 className="w-3.5 h-3.5" />
                              <span className="font-bold">{item.shares.toLocaleString('hi-IN')}</span>
                            </div>
                            <span className="text-[9px] text-stone-500">शेयर</span>
                          </div>
                        </div>
                      </div>
                    </Link>
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
          <span className="font-bold text-sm">मुख्य पृष्ठ पर वापस</span>
        </Link>
      </div>
    </main>
  );
}