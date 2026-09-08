// src/app/spotlights/[id]/page.tsx
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, Heart, MessageCircle, Share2, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';

// ✅ SEO Metadata
export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const docRef = doc(db, 'spotlights', params.id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        title: `${data.title || 'Spotlight'} | Alamnagar`,
        description: data.description || data.content?.substring(0, 150) || 'Read this spotlight post on Alamnagar.in',
        openGraph: {
          title: `${data.title || 'Spotlight'} | Alamnagar`,
          description: data.description || data.content?.substring(0, 150) || 'Read this spotlight post on Alamnagar.in',
          images: ['/og-cover.png'],
        }
      };
    }
  } catch (error) {
    console.error("Metadata fetch error:", error);
  }
  return { title: 'Post Not Found | Alamnagar' };
}

export default async function SpotlightPage({ params }: { params: { id: string } }) {
  let post: any = null;

  try {
    // Ensure params.id is valid
    if (!params.id) notFound();

    const docRef = doc(db, 'spotlights', params.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      post = docSnap.data();
    } else {
      notFound(); // Ye automatically upar wala not-found.tsx dikhayega
    }
  } catch (error) {
    console.error("Error fetching spotlight post:", error);
    notFound();
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

          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-8">
            {post.title || 'Untitled Post'}
          </h1>

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
        <div className="bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden">
          
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
        </div>
      </div>
    </main>
  );
}