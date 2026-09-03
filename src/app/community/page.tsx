import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 font-bold mb-8 hover:text-emerald-600">
          <ArrowLeft className="w-5 h-5" />
          वापस जाएं
        </Link>
        
        <h1 className="text-5xl font-extrabold mb-8">समुदाय से जुड़ें</h1>
        
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-stone-100 text-center">
          <Users className="w-20 h-20 text-amber-600 mx-auto mb-6" />
          <p className="text-xl text-stone-600 mb-4">
            चाहे गाँव में हों या विदेश में, आलमनगर के परिवार से जुड़े रहें
          </p>
          <p className="text-stone-500">
            यह सेक्शन जल्द ही सक्रिय होगा
          </p>
        </div>
      </div>
    </main>
  );
}