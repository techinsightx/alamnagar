import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export default function MarketplacePage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 font-bold mb-8 hover:text-emerald-600">
          <ArrowLeft className="w-5 h-5" />
          वापस जाएं
        </Link>
        
        <h1 className="text-5xl font-extrabold mb-8">स्थानीय बाज़ार</h1>
        
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-stone-100 text-center">
          <ShoppingBag className="w-20 h-20 text-amber-600 mx-auto mb-6" />
          <p className="text-xl text-stone-600 mb-4">
            जल्द आ रहा है!
          </p>
          <p className="text-stone-500 mb-6">
            अपने गाँव के किसानों, कारीगरों और स्थानीय व्यवसायों से सीधे खरीदें
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 inline-block">
            <p className="text-amber-900 font-semibold">
              ✨ स्थानीय उत्पाद, हस्तशिल्प और सेवाएं - सब एक ही जगह पर
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}