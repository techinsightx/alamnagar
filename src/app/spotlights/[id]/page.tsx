// src/app/spotlights/[id]/page.tsx
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, Heart, MessageCircle, Share2, Calendar } from 'lucide-react';
import Link from 'next/link';

// 🔥 Ye function WhatsApp/Telegram ko batata hai ki kya dikhana hai
export async function generateMetadata({ params }: { params: { id: string } }) {
  const docRef = doc(db, 'spotlights', params.id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      title: `${data.title} | Alamnagar Spotlight`,
      description: data.description || data.content?.substring(0, 150) || 'Read this post on Alamnagar',
      openGraph: {
        images: [data.imageUrl || 'https://alamnagar.in/og-cover.png'], // Post ki image preview mein dikhayega
      }
    };
  }
  return { title: 'Post Not Found' };
}

export default async function SpotlightPage({ params }: { params: { id: string } }) {
  const docRef = doc(db, 'spotlights', params.id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) notFound();

  const post = docSnap.data();
  const createdAt = post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('hi-IN') : 'Recently';

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 pb-20">
      {/* Header */}
      <div className="bg-stone-900 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-6 transition-colors font-semibold">
            <ArrowLeft className="w-5 h-5" /> वापस होम पेज पर जाएं
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider">
              {post.category || 'Spotlight'}
            </span>
            <span className="text-stone-400 text-sm flex items-center gap-1">
              <Calendar className="w-4 h-4" /> {createdAt}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6">{post.title}</h1>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center font-bold text-white">
              {post.userName?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-bold text-white">{post.userName || 'Anonymous'}</p>
              <p className="text-xs text-stone-400">आलमनगर वासी</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-8">
        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden">
          {post.imageUrl && (
            <div className="w-full aspect-video bg-stone-100">
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
          {post.videoUrl && !post.imageUrl && (
            <div className="w-full aspect-video bg-black">
               <video src={post.videoUrl} controls className="w-full h-full object-contain" />
            </div>
          )}
          <div className="p-8 md:p-12">
            <p className="text-lg md:text-xl text-stone-700 leading-relaxed whitespace-pre-wrap">
              {post.description || post.content}
            </p>
          </div>
          <div className="border-t border-stone-100 p-6 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-6 text-stone-500">
              <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                <Heart className="w-5 h-5" /> <span className="font-bold">{post.likes || 0}</span>
              </button>
              <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                <MessageCircle className="w-5 h-5" /> <span className="font-bold">{post.comments || 0}</span>
              </button>
            </div>
            <button className="flex items-center gap-2 text-stone-500 hover:text-emerald-600 transition-colors font-bold">
              <Share2 className="w-5 h-5" /> शेयर करें
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}