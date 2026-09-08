"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  ArrowLeft, Heart, MessageCircle, Share2, Calendar, Eye, 
  Loader2, Search, Home 
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SpotlightPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const docRef = doc(db, "spotlights", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // ✅ Beautiful Loading Skeleton
  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-stone-500 font-medium">स्पॉटलाइट लोड हो रही है...</p>
        </div>
      </main>
    );
  }

  // ✅ Beautiful Inline Not-Found UI (No ugly 404 page)
  if (error || !post) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg"
        >
          <div className="inline-flex p-6 bg-amber-100 rounded-full mb-6">
            <Search className="w-12 h-12 text-amber-600" />
          </div>
          <h1 className="text-6xl font-black text-stone-900 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-stone-800 mb-4">पोस्ट नहीं मिली</h2>
          <p className="text-stone-600 mb-8 leading-relaxed">
            हो सकता है यह स्पॉटलाइट पोस्ट हटा दी गई हो, या आपने गलत लिंक पर क्लिक किया हो।
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-amber-700 transition-all shadow-lg"
            >
              <Home className="w-5 h-5" /> होम पेज पर जाएं
            </Link>
            <Link 
              href="/community" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-stone-200 text-stone-700 font-bold rounded-xl hover:bg-stone-50 transition-all"
            >
              सभी पोस्ट देखें
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  const createdAt = post.createdAt?.toDate 
    ? post.createdAt.toDate().toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' }) 
    : 'Recently';

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 pb-20">
      {/* Header */}
      <div className="bg-stone-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-8 transition-colors font-semibold group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> वापस होम पेज पर जाएं
          </Link>
          
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider">
              {post.category || 'Spotlight'}
            </span>
            <span className="text-stone-400 text-sm flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> {createdAt}
            </span>
            <span className="text-stone-400 text-sm flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> {post.views || 0} व्यूज़
            </span>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black leading-tight mb-8"
          >
            {post.title || 'Untitled Post'}
          </motion.h1>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center font-bold text-white text-lg shadow-lg">
              {post.userName?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-bold text-white text-lg">{post.userName || 'Anonymous'}</p>
              <p className="text-xs text-stone-400">आलमनगर वासी</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden"
        >
          
          {/* Media Section */}
          {post.imageUrl && (
            <div className="w-full aspect-video bg-stone-100 relative">
              <img src={post.imageUrl} alt={post.title || 'Spotlight Image'} className="w-full h-full object-cover" />
            </div>
          )}
          
          {post.videoUrl && !post.imageUrl && (
            <div className="w-full aspect-video bg-black relative flex items-center justify-center">
               <video src={post.videoUrl} controls className="w-full h-full object-contain" />
            </div>
          )}

          {/* Text Content */}
          <div className="p-8 md:p-12">
            <p className="text-lg md:text-xl text-stone-700 leading-relaxed whitespace-pre-wrap">
              {post.description || post.content || 'No content available.'}
            </p>
            
            {/* Hashtags */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-stone-100 flex flex-wrap gap-2">
                {post.hashtags.map((tag: string, idx: number) => (
                  <span key={idx} className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="border-t border-stone-100 p-6 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-6 text-stone-500">
              <span className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" /> <span className="font-bold">{post.likes || 0}</span>
              </span>
              <span className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" /> <span className="font-bold">{post.comments || 0}</span>
              </span>
            </div>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: post.title, text: post.description || post.content, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('लिंक कॉपी हो गया!');
                }
              }}
              className="flex items-center gap-2 text-stone-500 hover:text-emerald-600 transition-colors font-bold"
            >
              <Share2 className="w-5 h-5" /> शेयर करें
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}