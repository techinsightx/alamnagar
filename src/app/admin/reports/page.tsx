"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flag, Shield, Eye, Trash2, X, CheckCircle, AlertTriangle, 
  Loader2, User, MessageSquare, Clock, Ban, ArrowLeft,
  Search, Filter, ChevronDown, ExternalLink, Bell
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { 
  collection, query, orderBy, onSnapshot, doc, updateDoc, 
  deleteDoc, getDoc, serverTimestamp, where
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Report {
  id: string;
  postId: string;
  postOwnerId: string;
  reporterId: string;
  reporterName: string;
  reporterPhoto: string;
  reason: string;
  details: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  action?: string;
  createdAt: any;
  reviewedAt?: any;
  reviewedBy?: string;
}

// ✅ FIX: Added 'userId' to PostData interface
interface PostData {
  id: string;
  userId?: string;
  title?: string;
  content?: string;
  mediaUrl?: string;
  userName?: string;
  userPhoto?: string;
}

// 🔥 IMPORTANT: Yahan apne admin UIDs daalo
const ADMIN_UIDS = [
  "XIbwZecsh1hg2ou9Q9UC1OwLEa12", // Tumhara UID
  // Aur admin UIDs yahan add karo
];

export default function AdminReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [postData, setPostData] = useState<PostData | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved" | "dismissed">("pending");
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/auth");
        return;
      }
      
      // 🔥 Admin check
      if (!ADMIN_UIDS.includes(currentUser.uid)) {
        alert("Access Denied: You are not an admin!");
        router.push("/");
        return;
      }
      
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [router]);

  // 🔥 Real-time reports listener
  useEffect(() => {
    if (!user) return;
    
    let reportsQuery;
    if (filter === "all") {
      reportsQuery = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    } else {
      reportsQuery = query(
        collection(db, "reports"), 
        where("status", "==", filter),
        orderBy("createdAt", "desc")
      );
    }
    
    const unsubscribe = onSnapshot(reportsQuery, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Report));
      setReports(reportsData);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user, filter]);

  // 🔥 Fetch post details when a report is selected
  useEffect(() => {
    if (!selectedReport) {
      setPostData(null);
      return;
    }
    
    const fetchPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, "spotlights", selectedReport.postId));
        if (postDoc.exists()) {
          setPostData({ id: postDoc.id, ...postDoc.data() } as PostData);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };
    
    fetchPost();
  }, [selectedReport]);

  // 🔥 ACTION: Delete the reported post
  const handleDeletePost = async () => {
    if (!selectedReport || !postData) return;
    setActionLoading(true);
    
    try {
      // Delete the post
      await deleteDoc(doc(db, "spotlights", selectedReport.postId));
      
      // Update report status
      await updateDoc(doc(db, "reports", selectedReport.id), {
        status: "resolved",
        action: "post_deleted",
        reviewedAt: serverTimestamp(),
        reviewedBy: user.uid
      });
      
      setToast({ message: "Post successfully deleted!", type: "success" });
      setSelectedReport(null);
    } catch (error: any) {
      console.error("Delete error:", error);
      setToast({ message: error.message || "Failed to delete post", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  // 🔥 ACTION: Warn the user (add warning to their profile)
  const handleWarnUser = async () => {
    if (!selectedReport || !postData) return;
    setActionLoading(true);
    
    try {
      // Add warning to user's profile
      const targetUserId = postData.userId || selectedReport.postOwnerId;
      const userRef = doc(db, "users", targetUserId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const warnings = userData.warnings || [];
        warnings.push({
          reason: selectedReport.reason,
          details: selectedReport.details,
          postId: selectedReport.postId,
          issuedAt: serverTimestamp(),
          issuedBy: user.uid
        });
        
        await updateDoc(userRef, { warnings });
      }
      
      // Update report status
      await updateDoc(doc(db, "reports", selectedReport.id), {
        status: "resolved",
        action: "user_warned",
        reviewedAt: serverTimestamp(),
        reviewedBy: user.uid
      });
      
      setToast({ message: "User has been warned!", type: "success" });
      setSelectedReport(null);
    } catch (error: any) {
      console.error("Warn error:", error);
      setToast({ message: error.message || "Failed to warn user", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  // 🔥 ACTION: Ban the user
  const handleBanUser = async () => {
    if (!selectedReport) return;
    
    const confirmBan = confirm("Are you sure you want to ban this user? This action cannot be undone easily.");
    if (!confirmBan) return;
    
    setActionLoading(true);
    
    try {
      // Mark user as banned
      const targetUserId = selectedReport.postOwnerId;
      const userRef = doc(db, "users", targetUserId);
      await updateDoc(userRef, {
        isBanned: true,
        bannedAt: serverTimestamp(),
        bannedBy: user.uid,
        banReason: selectedReport.reason
      });
      
      // Update report status
      await updateDoc(doc(db, "reports", selectedReport.id), {
        status: "resolved",
        action: "user_banned",
        reviewedAt: serverTimestamp(),
        reviewedBy: user.uid
      });
      
      setToast({ message: "User has been banned!", type: "success" });
      setSelectedReport(null);
    } catch (error: any) {
      console.error("Ban error:", error);
      setToast({ message: error.message || "Failed to ban user", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  // 🔥 ACTION: Dismiss the report (no action needed)
  const handleDismiss = async () => {
    if (!selectedReport) return;
    setActionLoading(true);
    
    try {
      await updateDoc(doc(db, "reports", selectedReport.id), {
        status: "dismissed",
        action: "no_action",
        reviewedAt: serverTimestamp(),
        reviewedBy: user.uid
      });
      
      setToast({ message: "Report dismissed", type: "success" });
      setSelectedReport(null);
    } catch (error: any) {
      console.error("Dismiss error:", error);
      setToast({ message: error.message || "Failed to dismiss", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const getReasonLabel = (reasonId: string) => {
    const reasons: Record<string, string> = {
      inappropriate: "अश्लील सामग्री",
      spam: "स्पैम",
      hate: "नफरत भरी भाषा",
      fraud: "धोखाधड़ी",
      violence: "हिंसा",
      misinfo: "गलत जानकारी",
      privacy: "निजता का उल्लंघन",
      other: "अन्य"
    };
    return reasons[reasonId] || reasonId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "resolved": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "dismissed": return "bg-stone-500/20 text-stone-400 border-stone-500/30";
      default: return "bg-stone-500/20 text-stone-400 border-stone-500/30";
    }
  };

  const pendingCount = reports.filter(r => r.status === "pending").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-950 text-white pb-20">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === 'success' 
                ? 'bg-emerald-900/90 border-emerald-500/30 text-emerald-100 backdrop-blur-md' 
                : 'bg-red-900/90 border-red-500/30 text-red-100 backdrop-blur-md'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span className="font-semibold text-sm">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur-xl border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-stone-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-xs text-stone-400">Report Management System</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
              <Bell className="w-4 h-4 text-red-400" />
              <span className="text-sm font-bold text-red-400">{pendingCount} Pending</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-stone-900 overflow-hidden flex items-center justify-center">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-900 border border-stone-800 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <Flag className="w-6 h-6 text-red-400" />
              <span className="text-2xl font-bold">{reports.length}</span>
            </div>
            <p className="text-sm text-stone-400">Total Reports</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-stone-900 border border-amber-500/20 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-6 h-6 text-amber-400" />
              <span className="text-2xl font-bold text-amber-400">{pendingCount}</span>
            </div>
            <p className="text-sm text-stone-400">Pending Review</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-stone-900 border border-emerald-500/20 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <span className="text-2xl font-bold text-emerald-400">
                {reports.filter(r => r.status === "resolved").length}
              </span>
            </div>
            <p className="text-sm text-stone-400">Resolved</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-stone-900 border border-stone-500/20 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <X className="w-6 h-6 text-stone-400" />
              <span className="text-2xl font-bold">
                {reports.filter(r => r.status === "dismissed").length}
              </span>
            </div>
            <p className="text-sm text-stone-400">Dismissed</p>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: "pending", label: "Pending", count: pendingCount },
            { id: "resolved", label: "Resolved", count: reports.filter(r => r.status === "resolved").length },
            { id: "dismissed", label: "Dismissed", count: reports.filter(r => r.status === "dismissed").length },
            { id: "all", label: "All", count: reports.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                filter === tab.id 
                  ? "bg-gradient-to-r from-emerald-600 to-amber-600 text-white" 
                  : "bg-stone-900 text-stone-400 border border-stone-800 hover:border-stone-700"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="text-center py-20 bg-stone-900 rounded-2xl border border-stone-800">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">
              {filter === "pending" ? "No pending reports!" : "No reports found"}
            </h3>
            <p className="text-stone-400">
              {filter === "pending" 
                ? "All reports have been reviewed. Great job!" 
                : "Reports will appear here when users submit them."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report, idx) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => setSelectedReport(report)}
                className={`bg-stone-900 border rounded-2xl p-5 cursor-pointer transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 ${
                  selectedReport?.id === report.id 
                    ? "border-emerald-500/50 shadow-lg shadow-emerald-500/10" 
                    : "border-stone-800"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                    <Flag className="w-5 h-5 text-red-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${getStatusColor(report.status)}`}>
                        {report.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-stone-500">
                        {getReasonLabel(report.reason)}
                      </span>
                      <span className="text-xs text-stone-500 ml-auto">
                        {report.createdAt?.toDate 
                          ? new Date(report.createdAt.toDate()).toLocaleString('hi-IN')
                          : "Recently"}
                      </span>
                    </div>
                    
                    <p className="text-sm text-stone-300 line-clamp-2 mb-2">
                      {report.details || "No details provided"}
                    </p>
                    
                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Reported by: {report.reporterName}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-stone-900 border border-stone-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-stone-900 border-b border-stone-700 p-5 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <Flag className="w-6 h-6 text-red-400" />
                  <div>
                    <h2 className="text-lg font-bold">Report Details</h2>
                    <p className="text-xs text-stone-400">Review and take action</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-stone-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Reporter Info */}
                <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
                  <h3 className="text-sm font-bold text-stone-400 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" /> Reporter Information
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 p-[2px]">
                      <div className="w-full h-full rounded-full bg-stone-900 overflow-hidden flex items-center justify-center">
                        {selectedReport.reporterPhoto ? (
                          <img src={selectedReport.reporterPhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold">{selectedReport.reporterName}</p>
                      <p className="text-xs text-stone-400">
                        {selectedReport.createdAt?.toDate 
                          ? new Date(selectedReport.createdAt.toDate()).toLocaleString('hi-IN')
                          : "Recently"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Report Reason */}
                <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                  <h3 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Reason
                  </h3>
                  <p className="text-lg font-bold mb-2">{getReasonLabel(selectedReport.reason)}</p>
                  {selectedReport.details && (
                    <p className="text-sm text-stone-300 leading-relaxed">{selectedReport.details}</p>
                  )}
                </div>

                {/* Reported Post */}
                {postData && (
                  <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
                    <h3 className="text-sm font-bold text-stone-400 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Reported Post
                    </h3>
                    
                    {postData.mediaUrl && (
                      <div className="mb-3 rounded-lg overflow-hidden bg-black">
                        <img 
                          src={postData.mediaUrl} 
                          alt="" 
                          className="w-full max-h-64 object-cover"
                        />
                      </div>
                    )}
                    
                    {postData.title && (
                      <h4 className="font-bold mb-2">{postData.title}</h4>
                    )}
                    
                    {postData.content && (
                      <p className="text-sm text-stone-300 line-clamp-3 mb-3">{postData.content}</p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                      <User className="w-3 h-3" />
                      <span>Posted by: {postData.userName || "Unknown"}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-700">
                  <button
                    onClick={handleDeletePost}
                    disabled={actionLoading || !postData}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-bold hover:bg-red-500/30 transition-all disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete Post
                  </button>
                  
                  <button
                    onClick={handleWarnUser}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl font-bold hover:bg-amber-500/30 transition-all disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                    Warn User
                  </button>
                  
                  <button
                    onClick={handleBanUser}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-xl font-bold hover:bg-purple-500/30 transition-all disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                    Ban User
                  </button>
                  
                  <button
                    onClick={handleDismiss}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-500/20 border border-stone-500/30 text-stone-400 rounded-xl font-bold hover:bg-stone-500/30 transition-all disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}