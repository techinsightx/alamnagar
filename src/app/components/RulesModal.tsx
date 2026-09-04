"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle, X, Sparkles } from "lucide-react";
import { useState } from "react";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export default function RulesModal({ isOpen, onClose, onAgree }: RulesModalProps) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stone-200"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-green-700 text-white p-6 flex items-center justify-between rounded-t-3xl">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-amber-300" />
              <h2 className="text-2xl font-extrabold">समुदाय दिशा-निर्देश</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-6">
            <p className="text-stone-600 text-lg italic border-l-4 border-amber-400 pl-4 bg-amber-50 py-3 rounded-r-lg">
              "यह केवल एक वेबसाइट नहीं, बल्कि आलमनगर की डिजिटल धरोहर है।"
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "सम्मान सर्वोपरि", desc: "जाति, धर्म या व्यक्तिगत टिप्पणियों का अपमान वर्जित है।" },
                { title: "सच्चाई और प्रामाणिकता", desc: "केवल असली तस्वीरें, वीडियो और सही जानकारी साझा करें।" },
                { title: "सकारात्मकता", desc: "गाँव की उपलब्धियों और कलाकारों को 'Spotlight' में लाएं।" },
                { title: "निजता का सम्मान", desc: "बिना अनुमति किसी की निजी जानकारी साझा न करें।" }
              ].map((rule, i) => (
                <div key={i} className="flex gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-stone-900">{rule.title}</h4>
                    <p className="text-sm text-stone-600 mt-1">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
              <h4 className="font-bold text-red-700 flex items-center gap-2 mb-2">
                🚫 सख्त मनाही (Zero Tolerance)
              </h4>
              <p className="text-sm text-red-600">
                अश्लील सामग्री, नफरत फैलाने वाली भाषा, स्पैम, या धोखाधड़ी पर बिना चेतावनी के सीधा स्थायी प्रतिबंध (Permanent Ban) लगाया जाएगा।
              </p>
            </div>

            {/* Reward Section */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-amber-800">🏆 'आलमनगर हीरो' स्पॉटलाइट रिवॉर्ड</h4>
                <p className="text-sm text-amber-700 mt-1">
                  उत्कृष्ट और सकारात्मक पोस्ट करने वालों को विशेष बैज मिलेगा और उनकी पोस्ट होमपेज पर फीचर होगी!
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t border-stone-200 p-6 rounded-b-3xl flex flex-col sm:flex-row gap-4 items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={agreed} 
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-stone-300"
              />
              <span className="text-stone-700 font-medium">मैंने नियम पढ़ लिए हैं और मैं इनसे सहमत हूँ।</span>
            </label>
            
            <button
              onClick={() => {
                if (agreed) {
                  onAgree();
                  onClose();
                }
              }}
              disabled={!agreed}
              className={`w-full sm:w-auto px-8 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2
                ${agreed 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5" 
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
                }`}
            >
              समुदाय में शामिल हों
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}