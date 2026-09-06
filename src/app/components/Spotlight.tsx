"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, Plus, Send, X, Image as ImageIcon, Heart, MessageSquare, 
  Share2, MoreHorizontal, Play, Volume2, VolumeX, Loader2, 
  User, Link2, Check, Home, Trash2, ChevronDown, ChevronUp, Bookmark, 
  BadgeCheck, Eye, Clock, Camera, Circle, StopCircle, Hash, Wand2, 
  Flame, Zap, Sliders, RotateCcw, Mic, MicOff, ShoppingBag, Flag, AlertTriangle, Users,
  Music, Upload, Bell, UserPlus, UserCheck, BarChart3, Award
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { 
  collection, query, orderBy, limit, onSnapshot, 
  addDoc, doc, updateDoc, increment, serverTimestamp, deleteDoc,
  Timestamp, getDoc, setDoc, where, getDocs, arrayUnion, arrayRemove, writeBatch
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ══════════════════════════════════════════════════════════
// INLINE PLACEHOLDERS
// ══════════════════════════════════════════════════════════
const createNotification = async (toUserId: string, type: string, fromUserId: string, fromUserName: string, fromUserPhoto: string, postId?: string, postTitle?: string, commentText?: string, followBack?: boolean, metadata?: any, userHandle?: string) => {
  try {
    await addDoc(collection(db, "notifications"), {
      toUserId, type, fromUserId, fromUserName, fromUserPhoto,
      postId, postTitle, commentText, followBack, metadata, userHandle,
      createdAt: serverTimestamp(),
      read: false
    });
  } catch (error) {
    console.error("Notification error:", error);
  }
};

const AudioLibrary = ({ isOpen, onClose, onApplyAudio }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-stone-900 rounded-2xl p-6 w-full max-w-md border border-stone-700" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Music className="w-5 h-5 text-emerald-500" /> ट्रेंडिंग ऑडियो</h3>
        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
          {["आलमनगर की धुन", "मिथिला बीट्स", "गाँव की शाम", "खेतों की हवा"].map((track, i) => (
            <button key={i} onClick={() => { onApplyAudio({ title: track, artist: "Alamnagar Originals" }); onClose(); }} className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-left">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center"><Music className="w-5 h-5 text-white" /></div>
              <div><p className="text-white font-semibold text-sm">{track}</p><p className="text-stone-400 text-xs">Alamnagar Originals</p></div>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-2 bg-stone-700 text-white rounded-lg font-bold">बंद करें</button>
      </div>
    </div>
  );
};

const AudioUpload = ({ isOpen, onClose, onUploadSuccess }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-stone-900 rounded-2xl p-6 w-full max-w-md border border-stone-700 text-center" onClick={(e) => e.stopPropagation()}>
        <Upload className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-white font-bold mb-2">ऑडियो अपलोड करें</h3>
        <p className="text-stone-400 text-sm mb-4">अपना खुद का ट्रेंडिंग साउंड अपलोड करें।</p>
        <button onClick={() => { onUploadSuccess(); onClose(); }} className="w-full py-2 bg-emerald-600 text-white rounded-lg font-bold">फ़ाइल चुनें (Demo)</button>
      </div>
    </div>
  );
};

const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border ${
        type === 'success' 
          ? 'bg-emerald-900/90 border-emerald-500/30 text-emerald-100 backdrop-blur-md' 
          : 'bg-red-900/90 border-red-500/30 text-red-100 backdrop-blur-md'
      }`}
    >
      {type === 'success' ? <Check className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
      <span className="font-semibold text-sm">{message}</span>
    </motion.div>
  );
};

const SkeletonPost = () => (
  <div className="bg-stone-900 border border-stone-700 rounded-2xl overflow-hidden mb-4 p-4 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-stone-700" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-stone-700 rounded w-1/3" />
        <div className="h-3 bg-stone-700 rounded w-1/4" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-stone-700 rounded w-full" />
      <div className="h-4 bg-stone-700 rounded w-2/3" />
    </div>
    <div className="h-56 bg-stone-700 rounded-xl w-full mb-4" />
    <div className="flex gap-4">
      <div className="h-8 bg-stone-700 rounded w-16" />
      <div className="h-8 bg-stone-700 rounded w-16" />
      <div className="h-8 bg-stone-700 rounded w-16" />
    </div>
  </div>
);

interface EngagementMetrics { views: number; likes: number; comments: number; shares: number; }
const calculateEngagementScore = (metrics: EngagementMetrics) => (metrics.views * 1) + (metrics.likes * 3) + (metrics.comments * 5) + (metrics.shares * 10);
const isAutoFeatured = (metrics: EngagementMetrics) => metrics.views >= 500 || metrics.likes >= 50 || metrics.comments >= 10 || calculateEngagementScore(metrics) >= 200;
const isTrending = (metrics: EngagementMetrics, createdAt: any) => {
  if (!createdAt) return false;
  const createdDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  if ((Date.now() - createdDate.getTime()) / (1000 * 60 * 60) > 24) return false;
  return metrics.views >= 100 || metrics.likes >= 20 || metrics.comments >= 5;
};
const getFeaturedLevel = (metrics: EngagementMetrics, isManualFeatured: boolean): 'platinum' | 'gold' | 'silver' | 'none' => {
  if (isManualFeatured) return 'platinum';
  const score = calculateEngagementScore(metrics);
  if (score >= 1000) return 'platinum';
  if (score >= 500) return 'gold';
  if (isAutoFeatured(metrics)) return 'silver';
  return 'none';
};

const useTypingEffect = (words: string[], typingSpeed = 80, deletingSpeed = 40, pauseTime = 2000) => {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex] || "";
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setText(currentWord.substring(0, text.length + 1));
        if (text === currentWord) {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        setText(currentWord.substring(0, text.length - 1));
        if (text === "") {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseTime]);

  return text;
};

interface SpotlightPost {
  id: string; userId: string; userName: string; userPhoto: string; isVerified: boolean; isFeatured?: boolean;
  title: string; content: string; hashtags: string[]; mediaUrl: string; mediaType: "image" | "video" | null;
  aspectRatio: "vertical" | "horizontal" | "square"; likes: number; comments: number; shares: number; views: number; likedBy: string[]; createdAt: Timestamp | any;
}
interface Comment { id: string; userId: string; userName: string; userPhoto: string; text: string; createdAt: any; }

const REPORT_REASONS = [
  { id: "inappropriate", label: "अश्लील या अनुचित सामग्री", icon: "🔞" },
  { id: "spam", label: "स्पैम या विज्ञापन", icon: "🚫" },
  { id: "hate", label: "नफरत फैलाने वाली भाषा", icon: "⚠️" },
  { id: "fraud", label: "धोखाधड़ी या स्कैम", icon: "💰" },
  { id: "violence", label: "हिंसा या खतरनाक सामग्री", icon: "🚨" },
  { id: "misinfo", label: "गलत जानकारी या अफवाह", icon: "❌" },
  { id: "privacy", label: "निजता का उल्लंघन", icon: "🔒" },
  { id: "other", label: "अन्य (विवरण दें)", icon: "📝" },
];

const getMediaDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    if (file.type.startsWith("image/")) {
      const img = new Image(); img.onload = () => resolve({ width: img.width, height: img.height }); img.src = URL.createObjectURL(file);
    } else {
      const video = document.createElement("video"); video.onloadedmetadata = () => resolve({ width: video.videoWidth, height: video.videoHeight }); video.src = URL.createObjectURL(file);
    }
  });
};
const getSavedPosts = (): string[] => { if (typeof window === "undefined") return []; try { return JSON.parse(localStorage.getItem("alamnagar_saved_posts") || "[]"); } catch { return []; } };
const toggleSavedPost = (id: string): string[] => {
  const saved = getSavedPosts();
  const next = saved.includes(id) ? saved.filter((s) => s !== id) : [...saved, id];
  localStorage.setItem("alamnagar_saved_posts", JSON.stringify(next));
  return next;
};

const FeaturedBadge = ({ level, isTrendingPost }: { level: 'platinum' | 'gold' | 'silver' | 'none'; isTrendingPost: boolean }) => {
  if (level === 'none' && !isTrendingPost) return null;
  if (isTrendingPost) return (
    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full shadow-lg shadow-emerald-500/30">
      <Zap className="w-3 h-3 text-white fill-white animate-pulse" />
      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Trending</span>
    </motion.div>
  );
  const badgeConfig = {
    platinum: { gradient: "from-purple-500 via-pink-500 to-amber-500", shadow: "shadow-purple-500/50", icon: <Award className="w-3 h-3 text-white fill-white" />, label: "Featured", animation: "animate-pulse" },
    gold: { gradient: "from-amber-400 via-yellow-500 to-orange-500", shadow: "shadow-amber-500/50", icon: <Flame className="w-3 h-3 text-white fill-white" />, label: "Featured", animation: "animate-pulse" },
    silver: { gradient: "from-slate-300 via-slate-400 to-slate-500", shadow: "shadow-slate-500/30", icon: <Star className="w-3 h-3 text-white fill-white" />, label: "Featured", animation: "" }
  };
  const validLevel = level as 'platinum' | 'gold' | 'silver';
  const config = badgeConfig[validLevel];
  return (
    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r ${config.gradient} rounded-full shadow-lg ${config.shadow} ${config.animation}`}>
      {config.icon}
      <span className="text-[10px] font-bold text-white uppercase tracking-wider">{config.label}</span>
    </motion.div>
  );
};

const EngagementScore = ({ metrics }: { metrics: EngagementMetrics }) => {
  const score = calculateEngagementScore(metrics);
  const level = score >= 1000 ? 'platinum' : score >= 500 ? 'gold' : score >= 200 ? 'silver' : 'bronze';
  const levelColors = { platinum: "text-purple-400", gold: "text-amber-400", silver: "text-slate-300", bronze: "text-orange-400" };

  return (
    <div className="flex items-center gap-1 text-[10px] font-mono">
      <BarChart3 className={`w-3 h-3 ${levelColors[level]}`} />
      <span className={levelColors[level]}>{score}</span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// 🔥 FIXED NOTIFICATIONS DRAWER (No Index Required + Premium Desi Vibe)
// ═══════════════════════════════════════════════════════════
const NotificationsDrawer = ({ isOpen, onClose, currentUserId }: { isOpen: boolean; onClose: () => void; currentUserId: string }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !currentUserId) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // 🔥 FIX: Fetch all notifications ordered by date (no where clause = no index needed!)
    const q = query(
      collection(db, "notifications"), 
      orderBy("createdAt", "desc"),
      limit(100) // Limit to latest 100 for performance
    );
    
    const unsub = onSnapshot(
      q, 
      (snapshot) => {
        // 🔥 Client-side filtering for the current user
        const allNotifs = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        
        const userNotifs = allNotifs.filter(
          (n: any) => n.toUserId === currentUserId
        );
        
        setNotifications(userNotifs);
        setLoading(false);
      },
      (error) => {
        // 🔥 CRITICAL: Error handler prevents infinite spinner
        console.error("🔥 Notifications fetch error:", error);
        setLoading(false);
        setNotifications([]);
      }
    );
    
    return () => unsub();
  }, [isOpen, currentUserId]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end" 
        onClick={onClose}
      >
        <motion.div 
          initial={{ x: "100%" }} 
          animate={{ x: 0 }} 
          exit={{ x: "100%" }} 
          transition={{ type: "spring", damping: 30, stiffness: 300 }} 
          className="w-full max-w-md bg-stone-900 h-full border-l border-stone-700 flex flex-col" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-stone-700 bg-stone-900/50 backdrop-blur-md sticky top-0 z-10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" /> 
              सूचनाएँ
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
                <p className="text-sm text-white/50 font-medium">सूचनाएँ लोड हो रही हैं...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-stone-800 rounded-full flex items-center justify-center">
                  <Bell className="w-8 h-8 text-stone-500" />
                </div>
                <p className="text-white/80 text-sm font-semibold mb-1">अभी कोई सूचना नहीं है</p>
                <p className="text-white/40 text-xs">जब कोई आपकी पोस्ट को लाइक या कमेंट करेगा, यहाँ दिखेगा</p>
              </div>
            ) : (
              notifications.map((notif: any) => (
                <motion.div 
                  key={notif.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3 p-3 bg-stone-800/50 rounded-xl border border-white/5 hover:bg-stone-800 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 p-[2px] flex-shrink-0">
                    <div className="w-full h-full rounded-full bg-stone-900 overflow-hidden flex items-center justify-center">
                      {notif.fromUserPhoto ? (
                        <img src={notif.fromUserPhoto} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span className="text-sm font-bold text-white">
                          {notif.fromUserName?.[0] || "U"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/90 leading-relaxed">
                      <span className="font-semibold text-amber-400">
                        {notif.fromUserName || "User"}
                      </span>{" "}
                      <span className="text-white/60">
                        {notif.type === 'like' 
                          ? 'ने आपके पोस्ट को लाइक किया ❤️' 
                          : notif.type === 'comment' 
                          ? 'ने कमेंट किया 💬' 
                          : notif.type === 'follow'
                          ? 'ने आपको फॉलो किया 👥'
                          : 'ने कुछ किया'}
                      </span>
                    </p>
                    {notif.postTitle && (
                      <p className="text-xs text-white/40 mt-1 truncate flex items-center gap-1">
                        <span className="text-amber-500/50">📝</span> "{notif.postTitle}"
                      </p>
                    )}
                    <p className="text-[10px] text-white/40 mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {notif.createdAt?.toDate 
                        ? new Date(notif.createdAt.toDate()).toLocaleString('hi-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : "हाल ही में"}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t border-stone-700 text-center bg-stone-900/50 backdrop-blur-md sticky bottom-0">
              <p className="text-xs text-white/40 font-medium">
                कुल {notifications.length} सूचनाएँ
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ReportModal = ({ isOpen, onClose, postId, postOwnerId, showToast }: { isOpen: boolean; onClose: () => void; postId: string; postOwnerId: string; showToast: (msg: string, type: 'success' | 'error') => void }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isOpen || !auth.currentUser) return;
    setChecking(true);
    const checkExistingReport = async () => {
      try {
        const q = query(collection(db, "reports"), where("postId", "==", postId), where("reporterId", "==", auth.currentUser!.uid));
        const snapshot = await getDocs(q);
        setAlreadyReported(!snapshot.empty);
      } catch (error) { console.error("Report check error:", error); } finally { setChecking(false); }
    };
    checkExistingReport();
  }, [isOpen, postId]);

  const handleSubmit = async () => {
    if (!selectedReason || !auth.currentUser) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "reports"), {
        postId, postOwnerId, reporterId: auth.currentUser.uid,
        reporterName: auth.currentUser.displayName || "User", reporterPhoto: auth.currentUser.photoURL || "",
        reason: selectedReason, details: details.trim(), status: "pending", createdAt: serverTimestamp(),
      });
      showToast("रिपोर्ट सफलतापूर्वक भेज दी गई है। धन्यवाद!", "success");
      setSelectedReason(""); setDetails(""); setAlreadyReported(true);
      setTimeout(onClose, 1500);
    } catch (error) {
      console.error("Report submission error:", error);
      showToast("रिपोर्ट भेजने में त्रुटि हुई।", "error");
    } finally { setSubmitting(false); }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
        <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={{ type: "spring", damping: 30, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md bg-stone-900 sm:rounded-2xl rounded-t-3xl border-t sm:border border-stone-700 flex flex-col" style={{ maxHeight: '85vh' }}>
          <div className="flex items-center justify-between p-4 border-b border-stone-700 flex-shrink-0">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Flag className="w-5 h-5 text-red-500" /> पोस्ट रिपोर्ट करें</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5 text-white/70" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {checking ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-amber-500 animate-spin mb-3" />
                <p className="text-white/50 text-sm">जांच हो रही है...</p>
              </div>
            ) : alreadyReported ? (
              <div className="text-center py-12">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
                  <Check className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <h4 className="text-lg font-bold text-white mb-2">आपने यह पोस्ट पहले ही रिपोर्ट कर दी है</h4>
                <p className="text-white/60 text-sm mb-6">हमारी टीम जल्द ही इसकी समीक्षा करेगी।</p>
                <button onClick={onClose} className="px-6 py-2.5 bg-white/10 border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-all">बंद करें</button>
              </div>
            ) : (
              <>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-300 font-semibold mb-1">आपकी गोपनीयता सुरक्षित है</p>
                    <p className="text-xs text-white/60">आपकी रिपोर्ट गुप्त रहेगी। पोस्ट के मालिक को यह नहीं पता चलेगा कि आपने रिपोर्ट की है।</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider mb-3 block">रिपोर्ट का कारण चुनें *</label>
                  <div className="space-y-2">
                    {REPORT_REASONS.map((reason) => (
                      <button key={reason.id} onClick={() => setSelectedReason(reason.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedReason === reason.id ? "bg-red-500/10 border-red-500/50 text-white" : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"}`}>
                        <span className="text-xl">{reason.icon}</span>
                        <span className="text-sm font-medium flex-1">{reason.label}</span>
                        {selectedReason === reason.id && <Check className="w-4 h-4 text-red-400" />}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedReason && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider mb-2 block">अतिरिक्त विवरण (वैकल्पिक)</label>
                    <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="यदि आप कुछ और बताना चाहते हैं, तो यहाँ लिखें..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm placeholder-white/40 focus:outline-none focus:border-red-500/50 transition-all resize-none min-h-[100px]" maxLength={500} />
                    <p className="text-[10px] text-white/40 mt-1 text-right">{details.length}/500</p>
                  </motion.div>
                )}
              </>
            )}
          </div>
          {!checking && !alreadyReported && (
            <div className="p-4 border-t border-stone-700 bg-stone-900 flex-shrink-0 flex gap-3">
              <button onClick={onClose} disabled={submitting} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/10 transition-all disabled:opacity-50">रद्द करें</button>
              <button onClick={handleSubmit} disabled={!selectedReason || submitting} className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold rounded-xl hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> सबमिट हो रहा है...</> : <><Flag className="w-4 h-4" /> रिपोर्ट सबमिट करें</>}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const CreateSpotlightModal = ({ isOpen, onClose, onPostCreated, showToast }: { isOpen: boolean; onClose: () => void; onPostCreated: () => void; showToast: (msg: string, type: 'success' | 'error') => void }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [showAudioLibrary, setShowAudioLibrary] = useState(false);
  const [showAudioUpload, setShowAudioUpload] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<any>(null);

  const titlePlaceholder = useTypingEffect(["आलमनगर की एक शानदार कहानी...", "अपना विचार साझा करें...", "आज क्या खास है?"]);
  const contentPlaceholder = useTypingEffect(["यहाँ अपने विचार लिखें...", "अपने गाँव के बारे में बताएं...", "एक शानदार पोस्ट डालें..."]);
  const hashtagPlaceholder = useTypingEffect(["#आलमनगर #मधेपुरा #बिहार", "#गाँव #विरासत #Spotlight", "#Trending #Viral #India"]);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');
  const [isMuted, setIsMuted] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [filters, setFilters] = useState({ brightness: 100, contrast: 100, saturate: 100, hueRotate: 0, blur: 0 });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        setCurrentUser(userDoc.exists() ? { ...user, ...userDoc.data() } : user);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isCameraActive && videoPreviewRef.current && mediaStreamRef.current) {
      videoPreviewRef.current.srcObject = mediaStreamRef.current;
    }
  }, [isCameraActive]);

  useEffect(() => { if (!isOpen) stopCameraCleanup(); }, [isOpen]);

  const stopCameraCleanup = () => {
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(track => track.stop()); mediaStreamRef.current = null; }
    setIsCameraActive(false); setIsRecording(false); setRecordingTime(0); setShowSettings(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/") && !file.type.startsWith("image/")) { showToast("केवल छवि या वीडियो फ़ाइल चुनें।", "error"); return; }
    setMediaFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result as string);
    reader.readAsDataURL(file);
    setIsCameraActive(false);
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: cameraFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: !isMuted });
      mediaStreamRef.current = stream;
      setIsCameraActive(true); setMediaFile(null); setMediaPreview("");
      setFilters({ brightness: 100, contrast: 100, saturate: 100, hueRotate: 0, blur: 0 });
    } catch (err) {
      console.error("Camera error:", err);
      showToast("कैमरा एक्सेस अस्वीकार कर दिया गया या उपलब्ध नहीं है।", "error");
    }
  };

  const switchCameraFacing = async () => {
    const newMode = cameraFacingMode === 'user' ? 'environment' : 'user';
    setCameraFacingMode(newMode);
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(track => track.stop());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: newMode, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: !isMuted });
      mediaStreamRef.current = stream;
      if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream;
    } catch (err) { console.error("Switch camera error:", err); }
  };

  const toggleMute = () => {
    const newMuteState = !isMuted; setIsMuted(newMuteState);
    if (mediaStreamRef.current) mediaStreamRef.current.getAudioTracks().forEach(track => { track.enabled = !newMuteState; });
  };

  const startRecording = () => {
    if (!mediaStreamRef.current) return;
    recordedChunksRef.current = [];
    const recorder = new MediaRecorder(mediaStreamRef.current, { mimeType: 'video/webm;codecs=vp9,opus' });
    recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const file = new File([blob], `alamnagar-spotlight-${Date.now()}.webm`, { type: 'video/webm' });
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result as string);
      reader.readAsDataURL(file);
      stopCameraCleanup();
    };
    mediaRecorderRef.current = recorder; recorder.start(); setIsRecording(true);
    timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop(); setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const clearMedia = () => { setMediaFile(null); setMediaPreview(""); };

  const generateAICaption = async () => {
    if (!title.trim() && !mediaFile) { showToast("कृपया पहले शीर्षक दर्ज करें या मीडिया चुनें।", "error"); return; }
    setIsGeneratingAI(true);
    try {
      const promptText = title.trim() || (mediaFile ? "आलमनगर का एक शानदार वीडियो" : "एक शानदार पोस्ट");
      const prompt = `Write a highly engaging, viral short video caption in Hindi with 3-5 trending hashtags for: "${promptText}". Keep it under 150 characters. Return ONLY the caption and hashtags.`;
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?json=false`);
      const text = await response.text();
      if (text && text.trim().length > 0 && !text.includes("402")) {
        const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
        const foundHashtags = text.match(hashtagRegex) || [];
        const contentText = text.replace(hashtagRegex, '').replace(/\s+/g, ' ').trim();
        if (contentText) setContent(contentText);
        if (foundHashtags.length > 0) setHashtags(foundHashtags.join(' '));
      } else {
        throw new Error("API limit");
      }
    } catch (error) {
      setContent(`🔥 ${title || 'आलमनगर की शान'} यहाँ देखें! क्या आप सहमत हैं? 💯 #आलमनगर #मधेपुरा #बिहार #Spotlight`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "alamnagar-uploads");
    formData.append("folder", "alamnagar/spotlight");
    const isVideo = file.type.startsWith("video/");
    const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${isVideo ? "video" : "image"}/upload`, { method: "POST", body: formData });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || `Upload failed: ${response.status}`);
    }
    const data = await response.json();
    let url = data.secure_url;
    if (url.includes('/upload/')) {
      url = url.replace('/upload/', `/upload/q_auto,f_auto${isVideo ? "" : ",w_640"}/`);
    }
    return url;
  };

  const handlePost = async () => {
    if (!auth.currentUser || (!content.trim() && !mediaFile && !title.trim())) return;
    setUploading(true);
    try {
      let mediaUrl = "", aspectRatio: "vertical" | "horizontal" | "square" = "square", mediaType: "image" | "video" | null = null;
      if (mediaFile) {
        mediaType = mediaFile.type.startsWith("video/") ? "video" : "image";
        mediaUrl = await uploadToCloudinary(mediaFile);
        const { width, height } = await getMediaDimensions(mediaFile);
        const ratio = width / height;
        if (ratio > 1.1) aspectRatio = "horizontal";
        else if (ratio < 0.9) aspectRatio = "vertical";
      }
      const formattedHashtags = hashtags.trim().split(/\s+/).map(tag => tag.startsWith('#') ? tag : `#${tag}`).filter(Boolean);
      await addDoc(collection(db, "spotlights"), {
        userId: auth.currentUser.uid, userName: currentUser?.displayName || auth.currentUser.displayName || "आलमनगर वासी",
        userPhoto: currentUser?.photoURL || auth.currentUser.photoURL || "", isVerified: currentUser?.isVerified || false,
        title: title.trim(), content: content.trim(), hashtags: formattedHashtags, mediaUrl, mediaType, aspectRatio,
        likes: 0, comments: 0, shares: 0, views: 0, likedBy: [], createdAt: serverTimestamp(),
      });
      setTitle(""); setContent(""); setHashtags(""); clearMedia(); setSelectedAudio(null);
      showToast("स्पॉटलाइट सफलतापूर्वक प्रकाशित हो गया!", "success");
      onClose(); onPostCreated();
    } catch (error: any) {
      console.error(error);
      showToast(error.message.includes("Upload failed") ? "मीडिया अपलोड विफल।" : "पोस्ट करने में त्रुटि।", "error");
    } finally { setUploading(false); }
  };

  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-lg bg-stone-900 sm:rounded-2xl rounded-t-3xl border-t sm:border border-stone-700 flex flex-col" style={{ maxHeight: '90vh' }}>
          <div className="flex items-center justify-between p-4 border-b border-stone-700 flex-shrink-0">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Star className="w-5 h-5 text-amber-500 fill-amber-500" /> स्पॉटलाइट बनाएं</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-white/70" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 p-[2px] flex-shrink-0">
                <div className="w-full h-full rounded-full bg-stone-900 flex items-center justify-center overflow-hidden">
                  {currentUser?.photoURL ? <img src={currentUser.photoURL} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-white/70" />}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{currentUser?.displayName || auth.currentUser?.displayName || "आलमनगर वासी"}</p>
                <p className="text-xs text-white/50">सार्वजनिक स्पॉटलाइट में पोस्ट कर रहे हैं</p>
              </div>
            </div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={titlePlaceholder} className="w-full bg-transparent text-white placeholder-white/40 focus:outline-none text-lg font-semibold border-b border-white/10 pb-2" />
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={contentPlaceholder} className="w-full bg-transparent text-white placeholder-white/40 resize-none focus:outline-none text-base min-h-[80px]" />
            <div className="relative">
              <Hash className="absolute left-3 top-3 w-4 h-4 text-white/40" />
              <input value={hashtags} onChange={(e) => setHashtags(e.target.value)} placeholder={hashtagPlaceholder} className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 transition-all" />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={generateAICaption} disabled={isGeneratingAI} className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500/10 to-amber-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold uppercase tracking-wider hover:from-emerald-500/20 hover:to-amber-500/20 transition-all disabled:opacity-50">
              {isGeneratingAI ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Wand2 className="w-4 h-4" /> AI से कैप्शन और हैशटैग बनाएं</>}
            </motion.button>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Background Audio (Optional)</label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAudioLibrary(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500/10 to-amber-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold hover:from-emerald-500/20 hover:to-amber-500/20 transition-all">
                  <Music className="w-4 h-4" /> {selectedAudio ? "Change Audio" : "Add Trending Audio"}
                </button>
                <button type="button" onClick={() => setShowAudioUpload(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/70 text-xs font-semibold hover:bg-white/10 transition-all">
                  <Upload className="w-4 h-4" />
                </button>
              </div>
              {selectedAudio && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500 rounded-lg"><Music className="w-4 h-4 text-white" /></div>
                    <div><p className="text-sm font-semibold text-white">{selectedAudio.title}</p><p className="text-xs text-white/60">{selectedAudio.artist}</p></div>
                  </div>
                  <button type="button" onClick={() => setSelectedAudio(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X className="w-4 h-4 text-white/60" /></button>
                </div>
              )}
            </div>

            <div className="relative w-full aspect-video bg-black/50 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center group">
              {isCameraActive ? (
                <>
                  <video ref={videoPreviewRef} autoPlay muted={isMuted} playsInline className="w-full h-full object-cover relative z-0" style={{ filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) hue-rotate(${filters.hueRotate}deg) blur(${filters.blur}px)` }} />
                  <AnimatePresence>
                    {showSettings && (
                      <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 z-20" onClick={() => setShowSettings(false)} />
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-14 right-2 left-2 bg-stone-800/95 backdrop-blur-md rounded-xl p-3 border border-stone-600 z-30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-white flex items-center gap-2"><Sliders className="w-4 h-4 text-amber-500" /> कैमरा सेटिंग्स</span>
                            <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X className="w-4 h-4 text-white/70" /></button>
                          </div>
                          <div className="space-y-2">
                            {(['brightness', 'contrast', 'saturate', 'hueRotate', 'blur'] as const).map((key) => (
                              <div key={key} className="flex items-center justify-between text-xs text-white/70">
                                <span className="capitalize">{key === 'hueRotate' ? 'Hue' : key}</span>
                                <input type="range" min={key === 'hueRotate' ? 0 : key === 'blur' ? 0 : 50} max={key === 'hueRotate' ? 360 : key === 'blur' ? 10 : key === 'saturate' ? 200 : 150} value={filters[key]} onChange={(e) => setFilters({...filters, [key]: Number(e.target.value)})} className="w-24 accent-amber-500" />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end pb-6 items-center gap-4 z-10">
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-full backdrop-blur-md transition-colors ${showSettings ? "bg-amber-500 text-white" : "bg-black/60 text-white hover:bg-black/80"}`}><Sliders className="w-5 h-5" /></button>
                      <button onClick={switchCameraFacing} className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-colors"><RotateCcw className="w-5 h-5" /></button>
                      <button onClick={toggleMute} className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-colors">{isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}</button>
                    </div>
                    <div className="flex items-center gap-6">
                      <button onClick={stopCameraCleanup} className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors"><X className="w-6 h-6 text-white" /></button>
                      <button onClick={isRecording ? stopRecording : startRecording} className={`p-4 rounded-full transition-all transform active:scale-95 ${isRecording ? "bg-red-500 hover:bg-red-600" : "bg-white hover:bg-white/90"}`}>
                        {isRecording ? <StopCircle className="w-8 h-8 text-white fill-white" /> : <Circle className="w-8 h-8 text-red-500 fill-red-500" />}
                      </button>
                      <div className="w-12" />
                    </div>
                    {isRecording && (
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-red-500/30">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-mono text-white">{Math.floor(recordingTime / 60).toString().padStart(2, '0')}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : mediaPreview ? (
                <>
                  {mediaFile?.type.startsWith("video/") ? <video src={mediaPreview} controls className="max-h-full w-full object-contain" /> : <img src={mediaPreview} alt="Preview" className="max-h-full w-full object-contain" />}
                  <button onClick={clearMedia} className="absolute top-2 right-2 p-2 bg-black/70 backdrop-blur-sm rounded-full hover:bg-red-500/80 transition-colors"><X className="w-4 h-4 text-white" /></button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 p-6 w-full h-full">
                  <p className="text-sm text-white/50">अपनी पोस्ट में मीडिया जोड़ें</p>
                  <div className="flex items-center gap-4">
                    <button onClick={openCamera} className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-emerald-500/50 transition-all group/btn">
                      <Camera className="w-6 h-6 text-emerald-400 group-hover/btn:text-emerald-300" />
                      <span className="text-xs text-white/70 font-medium">कैमरा</span>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-amber-500/50 transition-all group/btn">
                      <ImageIcon className="w-6 h-6 text-amber-400 group-hover/btn:text-amber-300" />
                      <span className="text-xs text-white/70 font-medium">गैलरी</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
          </div>
          <div className="p-4 border-t border-stone-700 bg-stone-900 flex-shrink-0">
            <button onClick={handlePost} disabled={uploading || (!content.trim() && !mediaFile && !title.trim())} className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> प्रकाशित हो रहा है...</> : <><Send className="w-4 h-4" /> स्पॉटलाइट प्रकाशित करें</>}
            </button>
          </div>
          <AudioLibrary isOpen={showAudioLibrary} onClose={() => setShowAudioLibrary(false)} onApplyAudio={setSelectedAudio} />
          <AudioUpload isOpen={showAudioUpload} onClose={() => setShowAudioUpload(false)} onUploadSuccess={() => setShowAudioLibrary(true)} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const SpotlightCard = ({ post, currentUserId, currentUserObj, requireAuth, onDelete, postId, showToast }: { post: SpotlightPost; currentUserId: string; currentUserObj?: any; requireAuth: (action: string, postId?: string) => boolean; onDelete: (id: string) => void; postId: string; showToast: (msg: string, type: 'success' | 'error') => void }) => {
  const [liked, setLiked] = useState(post.likedBy?.includes(currentUserId) || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  
  const [showComments, setShowComments] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [needsClamp, setNeedsClamp] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [saved, setSaved] = useState(false);

  const isOwnPost = currentUserId === post.userId;
  const engagementMetrics: EngagementMetrics = { views: post.views || 0, likes: post.likes || 0, comments: post.comments || 0, shares: post.shares || 0 };
  const featuredLevel = getFeaturedLevel(engagementMetrics, post.isFeatured || false);
  const trending = isTrending(engagementMetrics, post.createdAt);

  useEffect(() => {
    const el = paragraphRef.current;
    if (el && !expanded) {
      setNeedsClamp(el.scrollHeight > el.clientHeight + 2);
    }
  }, [post.content, expanded]);

  useEffect(() => { setSaved(getSavedPosts().includes(post.id)); }, [post.id]);

  // 🔥 FIXED VIEW TRACKING: Removed localStorage block that was blocking other users on the same browser
  useEffect(() => {
    if (hasTrackedView || !cardRef.current) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && !hasTrackedView) {
          console.log("👁️ View Triggered for Post:", post.id, "by User:", currentUserId || "Guest");
          setHasTrackedView(true);
          
          try {
            // 1. Always increment the main view count
            await updateDoc(doc(db, "spotlights", post.id), { 
              views: increment(1) 
            });
            console.log("✅ SUCCESS: Main view count incremented!");
            
            // 2. If logged in, record detailed view
            if (currentUserId) {
              const viewDocRef = doc(db, "spotlights", post.id, "views", currentUserId);
              const viewSnap = await getDoc(viewDocRef);
              if (!viewSnap.exists()) {
                await setDoc(viewDocRef, { userId: currentUserId, viewedAt: serverTimestamp() });
                console.log("✅ SUCCESS: User view sub-document created!");
              }
            }
          } catch (error: any) {
            console.error("❌ CRITICAL VIEW UPDATE ERROR:", error.code, error.message);
          }
          
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [post.id, currentUserId, hasTrackedView]);

  useEffect(() => {
    if (!currentUserId || post.userId === currentUserId) return;
    const userRef = doc(db, "users", currentUserId);
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const following = snap.data().following || [];
        setIsFollowing(following.includes(post.userId));
      }
    });
    return () => unsub();
  }, [currentUserId, post.userId]);

  useEffect(() => {
    if (!showComments) return;
    setLoadingComments(true);
    const q = query(collection(db, "spotlights", postId, "comments"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
      setLoadingComments(false);
    });
    return () => unsubscribe();
  }, [showComments, postId]);

  const handleLike = async () => {
    if (!auth.currentUser) { requireAuth("like", postId); return; }
    const postRef = doc(db, "spotlights", postId);
    try {
      if (liked) {
        await updateDoc(postRef, { likes: increment(-1), likedBy: arrayRemove(currentUserId) });
        setLikeCount(prev => prev - 1);
      } else {
        await updateDoc(postRef, { likes: increment(1), likedBy: arrayUnion(currentUserId) });
        setLikeCount(prev => prev + 1);
        if (post.userId !== currentUserId) {
          createNotification(post.userId, "like", currentUserId, auth.currentUser.displayName || "User", auth.currentUser.photoURL || "", postId, post.title).catch(console.warn);
        }
      }
      setLiked(!liked);
    } catch (error: any) { 
      console.error("Like Error Details:", error.message);
      setLiked(liked); setLikeCount(likeCount);
      showToast("इस कार्रवाई के लिए अनुमति नहीं है या नेटवर्क त्रुटि।", "error");
    }
  };

  const handleDoubleTap = () => {
    if (!auth.currentUser) { requireAuth("like", postId); return; }
    if (!liked) handleLike();
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 1000);
  };

  // 🔥 FIXED FOLLOW LOGIC: Updates BOTH the array AND the count field
  const handleFollow = async () => {
    if (!auth.currentUser) { requireAuth("follow", postId); return; }
    if (post.userId === currentUserId) return;
    
    setFollowLoading(true);
    try {
      const batch = writeBatch(db);
      const currentUserRef = doc(db, "users", currentUserId);
      const creatorRef = doc(db, "users", post.userId);
      
      if (isFollowing) {
        batch.update(currentUserRef, { 
          following: arrayRemove(post.userId),
          followingCount: increment(-1)
        });
        batch.update(creatorRef, { 
          followers: arrayRemove(currentUserId),
          followersCount: increment(-1)
        });
      } else {
        batch.update(currentUserRef, { 
          following: arrayUnion(post.userId),
          followingCount: increment(1)
        });
        batch.update(creatorRef, { 
          followers: arrayUnion(currentUserId),
          followersCount: increment(1)
        });
        createNotification(post.userId, "follow", currentUserId, auth.currentUser.displayName || "User", auth.currentUser.photoURL || "").catch(console.warn);
      }
      
      await batch.commit();
      console.log("✅ Follow/Unfollow successfully updated in Firestore!");
    } catch (error: any) { 
      console.error("❌ Follow Error Details:", error.message);
      showToast("फॉलो करने में त्रुटि हुई।", "error");
    } finally { 
      setFollowLoading(false); 
    }
  };

  const handleAddComment = async () => {
    if (!auth.currentUser) { requireAuth("comment", postId); return; }
    if (!newComment.trim()) return;
    setPostingComment(true);
    try {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      await addDoc(collection(db, "spotlights", postId, "comments"), {
        userId: auth.currentUser.uid, userName: auth.currentUser.displayName || "User", userPhoto: userData.photoURL || auth.currentUser.photoURL || "", text: newComment.trim(), createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "spotlights", postId), { comments: increment(1) });
      if (post.userId !== auth.currentUser.uid) {
        createNotification(post.userId, "comment", auth.currentUser.uid, auth.currentUser.displayName || "User", auth.currentUser.photoURL || "", postId, post.title, newComment.trim()).catch(console.warn);
      }
      setNewComment("");
      showToast("टिप्पणी सफलतापूर्वक जोड़ी गई!", "success");
    } catch (error: any) { 
      console.error("Comment Error Details:", error.message);
      showToast("टिप्पणी जोड़ने में त्रुटि हुई।", "error");
    } finally { setPostingComment(false); }
  };

  const handleShare = async (platform: string) => {
    if (!auth.currentUser) { requireAuth("share", postId); return; }
    const shareUrl = `${window.location.origin}/community?post=${postId}`;
    try {
      await updateDoc(doc(db, "spotlights", postId), { shares: increment(1) });
      if (platform === 'copy') {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        showToast("लिंक कॉपी हो गया!", "success");
        setTimeout(() => setCopied(false), 2000);
      } else if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent("आलमनगर स्पॉटलाइट देखें: ")}${encodeURIComponent(shareUrl)}`, '_blank');
      }
    } catch (error: any) { 
      console.error("Share Error Details:", error.message);
      showToast("शेयर करने में त्रुटि हुई।", "error");
    }
    if (platform !== 'copy') setShowShareSheet(false);
  };

  const handleDeletePost = async () => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "spotlights", postId));
      setShowDeleteConfirm(false); setShowMenu(false); onDelete(postId);
      showToast("पोस्ट सफलतापूर्वक हटा दी गई।", "success");
    } catch (error) { 
      console.error("Delete error:", error); 
      showToast("पोस्ट हटाने में त्रुटि हुई।", "error");
    } finally { setDeleting(false); }
  };

  const getMediaClasses = () => {
    if (post.aspectRatio === "vertical") return "w-full max-h-[500px] object-contain bg-black";
    if (post.aspectRatio === "horizontal") return "w-full aspect-video object-cover";
    return "w-full aspect-square object-cover";
  };

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return "अभी";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return "अभी";
    if (diff < 3600) return `${Math.floor(diff / 60)} मिनट पहले`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} घंटे पहले`;
    return `${Math.floor(diff / 86400)} दिन पहले`;
  };

  const getCardBorderClass = () => {
    if (featuredLevel === 'platinum') return "border-purple-500/40 shadow-purple-500/20";
    if (featuredLevel === 'gold') return "border-amber-500/40 shadow-amber-500/20";
    if (featuredLevel === 'silver') return "border-slate-400/30 shadow-slate-500/10";
    if (trending) return "border-emerald-500/40 shadow-emerald-500/20";
    return "border-stone-700";
  };

  return (
    <>
      <motion.article ref={cardRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className={`bg-stone-900 border rounded-2xl overflow-hidden mb-4 shadow-xl shadow-black/20 relative ${getCardBorderClass()}`}>
        <div className="flex items-center justify-between p-4 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-stone-900 flex items-center justify-center overflow-hidden">
                {post.userPhoto ? <img src={post.userPhoto} className="w-full h-full object-cover" /> : <span className="text-sm font-bold">{post.userName?.[0] || "U"}</span>}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-white">{post.userName}</p>
                {post.isVerified && <BadgeCheck className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-white/50 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTimeAgo(post.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentUserId && currentUserId !== post.userId && (
              <button onClick={handleFollow} disabled={followLoading} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isFollowing ? "bg-white/10 text-white border border-white/20 hover:bg-red-500/10 hover:text-red-500" : "bg-gradient-to-r from-emerald-600 to-amber-600 text-white hover:from-emerald-700 hover:to-amber-700"}`}>
                {followLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : isFollowing ? <><UserCheck className="w-3 h-3" /> Following</> : <><UserPlus className="w-3 h-3" /> Follow</>}
              </button>
            )}
            {currentUserId && !isOwnPost && <button onClick={() => { setShowMenu(false); setShowReportModal(true); }} className="p-2 hover:bg-red-500/10 rounded-full transition-colors group" title="रिपोर्ट करें"><Flag className="w-4 h-4 text-white/50 group-hover:text-red-400 transition-colors" /></button>}
            {isOwnPost && (
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><MoreHorizontal className="w-5 h-5 text-white/70" /></button>
                <AnimatePresence>
                  {showMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 top-10 z-50 w-44 bg-stone-800 border border-stone-700 rounded-xl shadow-2xl overflow-hidden">
                        <button onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); }} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /> पोस्ट हटाएं</button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {post.title && (
          <div className="px-4 pb-2 flex items-center gap-2 flex-wrap relative">
            <h2 className="text-xl font-bold text-white leading-tight">{post.title}</h2>
            <FeaturedBadge level={featuredLevel} isTrendingPost={trending} />
          </div>
        )}

        {calculateEngagementScore(engagementMetrics) > 0 && (
          <div className="px-4 pb-2 flex items-center gap-2 relative">
            <EngagementScore metrics={engagementMetrics} />
            <span className="text-[10px] text-white/40">•</span>
            <span className="text-[10px] text-white/40">{engagementMetrics.views} views • {engagementMetrics.likes} likes</span>
          </div>
        )}

        {post.content && (
          <div className="px-4 pb-3 relative">
            <p ref={paragraphRef} className={`text-white/90 text-[15px] leading-relaxed whitespace-pre-wrap transition-all duration-300 ${expanded ? "" : "line-clamp-4"}`}>{post.content}</p>
            {(needsClamp || expanded) && (
              <button onClick={() => setExpanded(!expanded)} className="mt-2 flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs font-bold uppercase tracking-wider transition-colors">
                {expanded ? <>कम दिखाएं <ChevronUp className="w-3.5 h-3.5" /></> : <>और पढ़ें <ChevronDown className="w-3.5 h-3.5" /></>}
              </button>
            )}
          </div>
        )}

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2 relative">
            {post.hashtags.map((tag, idx) => <span key={idx} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer transition-colors">{tag}</span>)}
          </div>
        )}

        {post.mediaUrl && (
          <div className="relative bg-black border-y border-white/5" onDoubleClick={handleDoubleTap}>
            {post.mediaType === "image" ? (
              <img src={post.mediaUrl} alt="" className={getMediaClasses()} loading="lazy" />
            ) : (
              <div className="relative">
                <video ref={videoRef} src={post.mediaUrl} className={getMediaClasses()} loop muted={muted} playsInline onClick={() => videoPlaying ? videoRef.current?.pause() : videoRef.current?.play()} onPlay={() => setVideoPlaying(true)} onPause={() => setVideoPlaying(false)} />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); setMuted(!muted); }} className="p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors">
                    {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                  </button>
                </div>
                {!videoPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-16 h-16 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </motion.div>
                  </div>
                )}
              </div>
            )}
            {showHeartAnim && (
              <motion.div initial={{ scale: 0, opacity: 1, rotate: -15 }} animate={{ scale: 1.5, opacity: 0, rotate: 0 }} transition={{ duration: 0.8 }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-2xl" />
              </motion.div>
            )}
          </div>
        )}

        <div className="px-4 py-2.5 flex items-center justify-between text-xs text-white/50 border-b border-white/5 relative">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-full flex items-center justify-center">
              <Heart className="w-2.5 h-2.5 text-white fill-white" />
            </div>
            <span className="font-medium">{likeCount > 0 ? likeCount.toLocaleString() : "पहला लाइक करें"}</span>
          </div>
          <div className="flex items-center gap-4">
            {post.comments > 0 && <span>{post.comments} टिप्पणियाँ</span>}
            {post.views > 0 && <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views} व्यूज़</span>}
          </div>
        </div>

        <div className="px-2 py-1 flex items-center justify-between relative">
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleLike} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors ${liked ? "text-red-500" : "text-white/70"}`}>
            <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} /> <span className="text-sm font-medium">लाइक</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { if (!auth.currentUser) { requireAuth("comment", postId); return; } setShowComments(true); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-white/70">
            <MessageSquare className="w-5 h-5" /> <span className="text-sm font-medium">टिप्पणी</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { const isSaved = toggleSavedPost(postId).includes(postId); setSaved(isSaved); showToast(isSaved ? "पोस्ट सेव कर ली गई!" : "पोस्ट अनसेव कर दी गई!", "success"); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors ${saved ? "text-amber-500" : "text-white/70"}`}>
            <Bookmark className={`w-5 h-5 ${saved ? "fill-current" : ""}`} /> <span className="text-sm font-medium">{saved ? "सेव" : "सेव करें"}</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { if (!auth.currentUser) { requireAuth("share", postId); return; } setShowShareSheet(true); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-white/70">
            <Share2 className="w-5 h-5" /> <span className="text-sm font-medium">शेयर</span>
          </motion.button>
        </div>
      </motion.article>

      <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} postId={postId} postOwnerId={post.userId} showToast={showToast} />

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !deleting && setShowDeleteConfirm(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-stone-800 border border-stone-700 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <motion.div className="inline-flex p-3 bg-red-500/10 border border-red-500/20 rounded-full mb-4" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  <Trash2 className="w-6 h-6 text-red-400" />
                </motion.div>
                <h3 className="text-lg font-bold text-white mb-2">इस पोस्ट को हटाएं?</h3>
                <p className="text-white/50 text-sm mb-6">यह कार्रवाई पूर्ववत नहीं की जा सकती।</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting} className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/10 transition-all disabled:opacity-50">रद्द करें</button>
                  <button onClick={handleDeletePost} disabled={deleting} className="flex-1 px-4 py-2.5 bg-red-500 border border-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> हटा रहे हैं...</> : <><Trash2 className="w-4 h-4" /> हटाएं</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowComments(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="w-full max-w-lg bg-stone-900 rounded-t-3xl border-t border-stone-700 flex flex-col" style={{ maxHeight: '75vh' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-700 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-white font-bold text-base">टिप्पणियाँ</h3>
                  <span className="text-white/50 text-sm">({comments.length})</span>
                </div>
                <button onClick={() => setShowComments(false)} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-white/70" /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {loadingComments ? <div className="flex flex-col items-center justify-center py-12"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div> : comments.length === 0 ? <div className="text-center py-12"><p className="text-white/60 text-sm">अभी तक कोई टिप्पणी नहीं। पहली करें!</p></div> : comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 p-[2px] flex-shrink-0">
                      <div className="w-full h-full rounded-full bg-stone-900 overflow-hidden">
                        {comment.userPhoto ? <img src={comment.userPhoto} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">{comment.userName[0]?.toUpperCase()}</div>}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-white">{comment.userName}</p>
                        {comment.userId === auth.currentUser?.uid && <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-bold uppercase">आप</span>}
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed break-words">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-stone-700 bg-stone-900 flex-shrink-0">
                <div className="flex gap-2 items-center">
                  <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !postingComment && handleAddComment()} placeholder="एक टिप्पणी लिखें..." disabled={postingComment} className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-white text-sm placeholder-white/40 focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-50" />
                  <button onClick={handleAddComment} disabled={!newComment.trim() || postingComment} className="p-2.5 bg-gradient-to-r from-emerald-600 to-amber-600 rounded-full hover:from-emerald-700 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {postingComment ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShareSheet && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowShareSheet(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="w-full max-w-md bg-stone-900 rounded-t-3xl border-t border-stone-700 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Share2 className="w-5 h-5 text-emerald-500" /> पोस्ट शेयर करें</h3>
                <button onClick={() => setShowShareSheet(false)} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-white/70" /></button>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { id: "whatsapp", name: "WhatsApp", icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>, color: "bg-[#25D366]" },
                  { id: "copy", name: copied ? "कॉपी!" : "लिंक", icon: copied ? Check : Link2, color: "bg-white/10 text-white" },
                ].map((platform) => (
                  <button key={platform.id} onClick={() => handleShare(platform.id)} className="flex flex-col items-center gap-2 group">
                    <div className={`w-14 h-14 ${platform.color} rounded-full flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform shadow-lg`}>
                      <platform.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-[10px] text-white/70 font-medium">{platform.name}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowShareSheet(false)} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 transition-all">रद्द करें</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

function SpotlightContent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<SpotlightPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'featured' | 'trending'>('all');
  const [usersCount, setUsersCount] = useState<number>(0);
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        setUser({ uid: currentUser.uid, displayName: currentUser.displayName, photoURL: currentUser.photoURL, handle: userData.handle || currentUser.displayName || "user" });
      } else { setUser(null); }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const usersQuery = query(collection(db, "users"));
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => { setUsersCount(snapshot.size); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const postsQuery = query(collection(db, "spotlights"), orderBy("createdAt", "desc"), limit(50));
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SpotlightPost[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const requireAuth = (action: string, postId?: string): boolean => {
    if (!user?.uid) { router.push(`/auth`); return false; }
    return true;
  };

  const handlePostDeleted = (postId: string) => setPosts((prev) => prev.filter((p) => p.id !== postId));

  const getFilteredPosts = () => {
    let filtered = savedOnly ? posts.filter((p) => getSavedPosts().includes(p.id)) : posts;
    if (filterMode === 'featured') filtered = filtered.filter(p => getFeaturedLevel({ views: p.views || 0, likes: p.likes || 0, comments: p.comments || 0, shares: p.shares || 0 }, p.isFeatured || false) !== 'none');
    else if (filterMode === 'trending') filtered = filtered.filter(p => isTrending({ views: p.views || 0, likes: p.likes || 0, comments: p.comments || 0, shares: p.shares || 0 }, p.createdAt));
    return filtered;
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-20 relative">
      <style>{`
        .tricolor-shimmer {
          background: linear-gradient(90deg, #FF9933 0%, #ffffff 25%, #138808 50%, #ffffff 75%, #FF9933 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: tricolorShimmer 3s linear infinite;
        }
        @keyframes tricolorShimmer {
          0% { background-position: 0% center; }
          100% { background-position: -200% center; }
        }
      `}</style>

      <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>

      <header className="sticky top-20 z-40 bg-stone-50/90 backdrop-blur-xl border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-600 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-extrabold leading-tight tricolor-shimmer">स्पॉटलाइट</h1>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500"> आलमनगर समुदाय </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-amber-50 border border-emerald-200 rounded-lg">
              <Users className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-extrabold text-emerald-700">{usersCount.toLocaleString('hi-IN')}</span>
              <span className="text-[9px] text-stone-600 font-semibold">नागरिक</span>
            </div>
            <button onClick={() => { if (!user?.uid) { router.push("/auth"); return; } setShowNotifications(true); }} className="p-2 hover:bg-stone-200 rounded-full transition-colors relative">
              <Bell className="w-5 h-5 text-stone-600" />
              {user?.uid && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-stone-50"></span>}
            </button>
            <Link href={user ? "/profile" : "/auth"} className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-amber-500 p-[2px] hover:scale-105 transition-transform block" title={user ? "प्रोफ़ाइल देखें" : "लॉगिन करें"}>
              <div className="w-full h-full rounded-full bg-stone-50 overflow-hidden flex items-center justify-center">
                {user?.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-stone-600" />}
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4">
        {user ? (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-stone-200 rounded-2xl p-3 mb-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-amber-500 p-[2px] flex-shrink-0">
              <div className="w-full h-full rounded-full bg-stone-50 flex items-center justify-center overflow-hidden">
                {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-stone-600">{user.displayName?.[0]}</span>}
              </div>
            </div>
            <button onClick={() => setShowCreatePost(true)} className="flex-1 text-left px-4 py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-full text-stone-500 text-sm transition-all">
              आलमनगर के लिए कुछ साझा करें...
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-emerald-50 to-amber-50 border border-emerald-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-amber-500 flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-stone-900 font-semibold">समुदाय से जुड़ें</p>
              <p className="text-xs text-stone-600">लाइक, कमेंट, शेयर और पोस्ट करने के लिए लॉगिन करें</p>
            </div>
            <button onClick={() => router.push("/auth")} className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-amber-600 text-white text-xs font-bold rounded-full hover:from-emerald-700 hover:to-amber-700 transition-all">लॉगिन</button>
          </motion.div>
        )}

        {user && (
          <div className="flex items-center gap-2 mb-4 flex-wrap overflow-x-auto pb-2">
            <button onClick={() => { setFilterMode('all'); setSavedOnly(false); }} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filterMode === 'all' && !savedOnly ? "bg-stone-900 text-white" : "bg-white text-stone-600 border border-stone-200"}`}>सभी पोस्ट</button>
            <button onClick={() => { setFilterMode('featured'); setSavedOnly(false); }} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 whitespace-nowrap ${filterMode === 'featured' && !savedOnly ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" : "bg-white text-stone-600 border border-stone-200"}`}><Flame className="w-3 h-3" /> फीचर्ड</button>
            <button onClick={() => { setFilterMode('trending'); setSavedOnly(false); }} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 whitespace-nowrap ${filterMode === 'trending' && !savedOnly ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white" : "bg-white text-stone-600 border border-stone-200"}`}><Zap className="w-3 h-3" /> ट्रेंडिंग</button>
            <button onClick={() => setSavedOnly(!savedOnly)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 whitespace-nowrap ${savedOnly ? "bg-stone-900 text-white" : "bg-white text-stone-600 border border-stone-200"}`}><Bookmark className="w-3 h-3" /> सेव किए गए</button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4"><SkeletonPost /><SkeletonPost /><SkeletonPost /></div>
        ) : getFilteredPosts().length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <Star className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">{savedOnly ? "कोई सेव की गई पोस्ट नहीं" : "आपका स्पॉटलाइट खाली है"}</h3>
            <p className="text-stone-500 text-sm mb-6 max-w-xs mx-auto">{savedOnly ? "किसी भी पोस्ट पर सेव बटन दबाएं।" : "अपनी पहली फोटो, वीडियो या विचार अपने दर्शकों के साथ साझा करें।"}</p>
            {!savedOnly && filterMode === 'all' && <button onClick={() => setShowCreatePost(true)} className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-full shadow-lg shadow-emerald-500/20">पहली पोस्ट बनाएं</button>}
          </div>
        ) : (
          <div className="space-y-4">
            {getFilteredPosts().map((post) => (
              <SpotlightCard key={post.id} post={post} currentUserId={user?.uid || ""} currentUserObj={user} requireAuth={requireAuth} onDelete={handlePostDeleted} postId={post.id} showToast={showToast} />
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>{showCreatePost && <CreateSpotlightModal isOpen={showCreatePost} onClose={() => setShowCreatePost(false)} onPostCreated={() => {}} showToast={showToast} />}</AnimatePresence>
      <NotificationsDrawer isOpen={showNotifications} onClose={() => setShowNotifications(false)} currentUserId={user?.uid || ""} />

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-stone-200 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-2xl mx-auto px-2 py-1 flex items-center justify-between">
          <Link href="/" className="flex flex-col items-center gap-0.5 p-1.5 text-stone-500 hover:text-emerald-600 transition-colors flex-1">
            <Home className="w-5 h-5" /> <span className="text-[9px] font-medium">होम</span>
          </Link>
          <Link href="/community" className="flex flex-col items-center gap-0.5 p-1.5 text-emerald-600 flex-1">
            <Star className="w-5 h-5 fill-emerald-600" /> <span className="text-[9px] font-bold">स्पॉटलाइट</span>
          </Link>
          <Link href="/marketplace" className="flex flex-col items-center gap-0.5 p-1.5 text-stone-500 hover:text-emerald-600 transition-colors flex-1 relative">
            <ShoppingBag className="w-5 h-5" /> <span className="text-[9px] font-medium">बाज़ार</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default function SpotlightPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" /></div>}>
      <SpotlightContent />
    </Suspense>
  );
}