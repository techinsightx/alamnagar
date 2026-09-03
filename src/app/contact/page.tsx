import Link from "next/link";
import { ArrowLeft, Phone, Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 font-bold mb-8 hover:text-emerald-600">
          <ArrowLeft className="w-5 h-5" />
          वापस जाएं
        </Link>
        
        <h1 className="text-5xl font-extrabold mb-8">संपर्क करें</h1>
        
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-stone-100">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">आपातकालीन संपर्क</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  <span className="text-stone-600">जल्द ही उपलब्ध होगा</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-emerald-600" />
                  <span className="text-stone-600">contact@alamnagar.in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-4">स्थानीय डायरेक्टरी</h2>
              <p className="text-stone-600">
                गाँव के महत्वपूर्ण संपर्क और स्थानीय व्यवसायों की जानकारी जल्द ही यहाँ उपलब्ध होगी
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}