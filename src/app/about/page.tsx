import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 font-bold mb-8 hover:text-emerald-600">
          <ArrowLeft className="w-5 h-5" />
          वापस जाएं
        </Link>
        
        <h1 className="text-5xl font-extrabold mb-8">हमारे बारे में</h1>
        
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-stone-100">
          <p className="text-lg text-stone-600 leading-relaxed mb-6">
            आलमनगर, मधेपुरा जिला, बिहार की पवित्र धरती पर बसा एक ऐसा गाँव जो अपनी समृद्ध संस्कृति, इतिहास और लोगों के आपनेपन की भावना के लिए जाना जाता है।
          </p>
          <p className="text-lg text-stone-600 leading-relaxed mb-6">
            यह गाँव मिथिला क्षेत्र की उपजाऊ भूमि पर स्थित है, जहाँ हमारे पूर्वजों ने पीढ़ियों से मेहनत की है। यहाँ की मिट्टी में वो खुशबू है जो दूर रहने वालों को भी अपनी ओर खींचती है।
          </p>
          <p className="text-lg text-stone-600 leading-relaxed">
            यह प्लेटफॉर्म हमारा एक छोटा सा प्रयास है हमारी विरासत को संभालने का, हमारे समुदाय को जोड़ने का, और मिलकर एक बेहतर भविष्य बनाने का।
          </p>
        </div>
      </div>
    </main>
  );
}