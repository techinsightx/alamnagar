// src/app/spotlights/[id]/not-found.tsx
import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
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
      </div>
    </main>
  );
}