"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scale, Shield, RefreshCw, Users, ArrowLeft, CheckCircle, 
  AlertTriangle, Mail, FileText, ChevronDown, ChevronUp 
} from "lucide-react";
import Link from "next/link";

const legalSections = [
  {
    id: "terms",
    title: "नियम और शर्तें (Terms of Service)",
    icon: Scale,
    color: "text-emerald-600 bg-emerald-50",
    content: [
      "1. **स्वीकृति**: आलमनगर (alamnagar.in) का उपयोग करके, आप इन नियमों और शर्तों से सहमत होते हैं।",
      "2. **योग्यता**: इस प्लेटफॉर्म का उपयोग करने के लिए आपकी आयु कम से कम 13 वर्ष होनी चाहिए।",
      "3. **उपयोगकर्ता सामग्री**: आप जो भी पोस्ट, तस्वीर या जानकारी साझा करते हैं, उसके लिए आप पूर्ण रूप से जिम्मेदार हैं। आप यह सुनिश्चित करते हैं कि सामग्री कानूनी है और किसी के कॉपीराइट का उल्लंघन नहीं करती।",
      "4. **बाज़ार (Marketplace)**: आलमनगर केवल एक डिजिटल मंच प्रदान करता है। उत्पादों की गुणवत्ता, डिलीवरी और लेन-देन की पूरी जिम्मेदारी खरीदार और विक्रेता के बीच होती है। प्लेटफ़ॉर्म किसी भी विवाद के लिए प्रत्यक्ष रूप से जिम्मेदार नहीं है।",
      "5. **खाता निलंबन**: यदि कोई उपयोगकर्ता इन नियमों का उल्लंघन करता है, तो आलमनगर प्रशासन बिना किसी पूर्व सूचना के उसका खाता निलंबित या हटा सकता है।"
    ]
  },
  {
    id: "privacy",
    title: "गोपनीयता नीति (Privacy Policy)",
    icon: Shield,
    color: "text-blue-600 bg-blue-50",
    content: [
      "1. **एकत्र किया गया डेटा**: हम आपका नाम, ईमेल पता, प्रोफ़ाइल फ़ोटो, और वैकल्पिक रूप से आपका स्थान (Location) और बायो एकत्र करते हैं।",
      "2. **डेटा का उपयोग**: यह डेटा केवल आपकी पहचान सत्यापित करने, समुदाय से जोड़ने, और प्लेटफ़ॉर्म के अनुभव को बेहतर बनाने के लिए उपयोग किया जाता है।",
      "3. **तीसरे पक्ष की सेवाएं**: हम छवियों को स्टोर करने के लिए Cloudinary और डेटाबेस के लिए Firebase का उपयोग करते हैं। आपका डेटा इन सुरक्षित सेवाओं पर एन्क्रिप्टेड रूप से संग्रहीत होता है।",
      "4. **डेटा सुरक्षा**: हम आपके डेटा को बेचते या तीसरे पक्ष को विज्ञापन के लिए साझा नहीं करते हैं।",
      "5. **डेटा हटाना**: यदि आप अपना खाता हटाना चाहते हैं, तो आप हमसे संपर्क कर सकते हैं और हम आपका डेटा स्थायी रूप से हटा देंगे।"
    ]
  },
  {
    id: "refund",
    title: "रिफंड और कैंसलेशन नीति (Refund Policy)",
    icon: RefreshCw,
    color: "text-amber-600 bg-amber-50",
    content: [
      "1. **लिस्टिंग शुल्क (Listing Fee)**: Marketplace में उत्पाद या सेवा सूचीबद्ध (List) करने के लिए लिया गया प्लेटफ़ॉर्म शुल्क (10% या न्यूनतम ₹100) **अपरिवर्तनीय (Non-refundable)** है, क्योंकि यह सर्वर और क्लाउड स्टोरेज की लागत को कवर करता है।",
      "2. **उत्पाद वापसी**: Marketplace के माध्यम से खरीदे गए उत्पादों की वापसी या रिफंड की व्यवस्था सीधे खरीदार और विक्रेता के बीच होती है। आलमनगर प्लेटफ़ॉर्म इसमें मध्यस्थता नहीं करता है।",
      "3. **भुगतान विफलता**: यदि Razorpay के माध्यम से भुगतान विफल हो जाता है, तो कोई राशि काटी नहीं जाएगी। यदि राशि कट जाती है, तो यह 5-7 कार्य दिवसों में स्वचालित रूप से आपके बैंक खाते में वापस आ जाएगी।",
      "4. **धोखाधड़ी**: यदि कोई विक्रेता धोखाधड़ी करता है, तो उसकी लिस्टिंग तुरंत हटा दी जाएगी और कानूनी कार्रवाई की जा सकती है।"
    ]
  },
  {
    id: "guidelines",
    title: "सामुदायिक दिशानिर्देश (Community Guidelines)",
    icon: Users,
    color: "text-purple-600 bg-purple-50",
    content: [
      "1. **सम्मान**: सभी सदस्यों के साथ सम्मानजनक व्यवहार करें। नफरत फैलाने वाली भाषा, धमकी या उत्पीड़न की अनुमति नहीं है।",
      "2. **सटीक जानकारी**: बाज़ार में उत्पादों की कीमत और विवरण सटीक और सत्य होना चाहिए। भ्रामक विज्ञापन सख्त मना हैं।",
      "3. **मिथिला संस्कृति का सम्मान**: आलमनगर हमारी संस्कृति का प्रतिनिधित्व करता है। अश्लील, आपत्तिजनक या संस्कृति का अपमान करने वाली सामग्री तुरंत हटा दी जाएगी।",
      "4. **रिपोर्टिंग**: यदि आपको कोई अनुचित सामग्री दिखती है, तो 'रिपोर्ट' बटन का उपयोग करें। हमारी टीम 24 घंटे के भीतर कार्रवाई करेगी।",
      "5. **स्पैम नहीं**: एक ही उत्पाद या पोस्ट को बार-बार स्पैम करने वाले खातों को प्रतिबंधित कर दिया जाएगा।"
    ]
  }
];

export default function LegalPage() {
  const [openSection, setOpenSection] = useState<string | null>("terms");

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-stone-900 via-emerald-950 to-stone-900 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-6 transition-colors font-semibold">
            <ArrowLeft className="w-5 h-5" /> वापस होम पेज पर जाएं
          </Link>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            कानूनी जानकारी और <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">नीतियाँ</span>
          </h1>
          <p className="text-stone-300 text-lg max-w-2xl leading-relaxed">
            आलमनगर प्लेटफॉर्म का उपयोग करके, आप स्वचालित रूप से इन नीतियों से सहमत होते हैं। हम पारदर्शिता और न्याय में विश्वास रखते हैं।
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden">
          <div className="p-6 md:p-10 space-y-4">
            {legalSections.map((section) => {
              const Icon = section.icon;
              const isOpen = openSection === section.id;
              
              return (
                <motion.div 
                  key={section.id}
                  initial={false}
                  className={`border rounded-2xl transition-all duration-300 ${isOpen ? "border-emerald-200 bg-emerald-50/30 shadow-md" : "border-stone-200 hover:border-stone-300 bg-white"}`}
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${section.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-stone-900">{section.title}</h3>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5 text-stone-500" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 md:px-24 pb-6 md:pb-8">
                          <div className="space-y-4">
                            {section.content.map((point, index) => (
                              <motion.div 
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-start gap-3 text-stone-700 leading-relaxed"
                              >
                                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span dangerouslySetInnerHTML={{ 
                                  __html: point.replace(/\*\*(.*?)\*\*/g, '<strong class="text-stone-900 font-semibold">$1</strong>') 
                                }} />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Contact Support Footer */}
          <div className="bg-stone-50 border-t border-stone-200 p-6 md:p-10 text-center">
            <div className="inline-flex items-center gap-3 bg-white px-6 py-4 rounded-2xl border border-stone-200 shadow-sm">
              <div className="p-2 bg-amber-100 rounded-full">
                <Mail className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-stone-900">क्या आपके पास कोई प्रश्न है?</p>
                <p className="text-sm text-stone-600">हमारी कानूनी टीम से संपर्क करें: <a href="mailto:legal@alamnagar.in" className="text-emerald-600 font-semibold hover:underline">legal@alamnagar.in</a></p>
              </div>
            </div>
            <p className="text-xs text-stone-400 mt-6">
              अंतिम अपडेट: {new Date().toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}