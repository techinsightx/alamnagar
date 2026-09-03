import Link from "next/link";
import { ArrowLeft, Camera } from "lucide-react";

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 font-bold mb-8 hover:text-emerald-600">
          <ArrowLeft className="w-5 h-5" />
          वापस जाएं
        </Link>
        
        <h1 className="text-5xl font-extrabold mb-8">फोटो गैलरी</h1>
        
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-stone-100 text-center">
          <Camera className="w-20 h-20 text-emerald-600 mx-auto mb-6" />
          <p className="text-xl text-stone-600 mb-4">
            गाँव की तस्वीरें जल्द ही यहाँ अपलोड की जाएंगी
          </p>
          <p className="text-stone-500">
            आप अपनी आलमनगर की यादें हमारे साथ साझा कर सकते हैं
          </p>
        </div>
      </div>
    </main>
  );
}