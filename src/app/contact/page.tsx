"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Send, ArrowLeft, CheckCircle, Loader2, User, AlertCircle, 
  ShieldCheck, MapPin, Navigation, Clock
} from "lucide-react";
import Link from "next/link";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mrpgldpq";
const CONTACT_EMAIL = "digitechinfo.india@gmail.com";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          _replyto: formData.email,
          _subject: `📩 आलमनगर Contact: ${formData.subject}`
        })
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSubmitStatus("idle"), 8000);
      } else {
        const data = await response.json().catch(() => ({}));
        setSubmitStatus("error");
        setErrorMessage(data.errors?.[0]?.message || "संदेश भेजने में त्रुटि हुई।");
      }
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage("नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 pb-20 selection:bg-emerald-200 selection:text-emerald-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-stone-950 via-emerald-950 to-stone-900 text-white py-20 md:py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-8 transition-colors font-semibold group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> वापस होम पेज पर जाएं
          </Link>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tight"
          >
            हमसे <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400">संपर्क करें</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-stone-300 text-lg max-w-2xl leading-relaxed"
          >
            आलमनगर समुदाय से जुड़े कोई भी प्रश्न, सुझाव या सहयोग के लिए हमसे बेझिझक संपर्क करें। हम आपकी सहायता के लिए हमेशा तत्पर हैं।
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* Left: Contact Form (3 columns) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 bg-white rounded-3xl shadow-xl border border-stone-100 p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Send className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-stone-900">संदेश भेजें</h2>
                <p className="text-sm text-stone-500">हम 24 घंटे के भीतर उत्तर देंगे</p>
              </div>
            </div>

            {submitStatus === "success" ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center"
              >
                <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-emerald-900 mb-2">संदेश सफलतापूर्वक भेज दिया गया!</h3>
                <p className="text-emerald-700">धन्यवाद! हमारी टीम जल्द ही आपसे संपर्क करेगी।</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {submitStatus === "error" && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{errorMessage}</p>
                  </motion.div>
                )}

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" /> आपका नाम *
                    </label>
                    <input type="text" name="name" required placeholder="जैसे: राहुल कुमार"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                      value={formData.name} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> ईमेल पता *
                    </label>
                    <input type="email" name="email" required placeholder="aapka@email.com"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                      value={formData.email} onChange={handleChange} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center gap-2">
                    <Send className="w-4 h-4" /> विषय *
                  </label>
                  <input type="text" name="subject" required placeholder="जैसे: Marketplace लिस्टिंग में समस्या"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    value={formData.subject} onChange={handleChange} />
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center gap-2">
                    <Send className="w-4 h-4" /> आपका संदेश *
                  </label>
                  <textarea name="message" required rows={5} placeholder="अपना प्रश्न या सुझाव यहाँ विस्तार से लिखें..."
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none"
                    value={formData.message} onChange={handleChange} />
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="w-full px-8 py-4 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-amber-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {isSubmitting ? "भेजा जा रहा है..." : "संदेश भेजें"}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-stone-500 pt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>आपकी जानकारी 100% सुरक्षित और एन्क्रिप्टेड है</span>
                </div>
              </form>
            )}
          </motion.div>

          {/* Right: Map & Info (2 columns) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Premium Labeled Map (Best for Local Markets) */}
            <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-xl border-4 border-white group">
              <iframe 
                src="https://maps.google.com/maps?q=Alamnagar+Hariballabh+Chowk+Madhepura+Bihar+852210&t=m&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: "grayscale(20%) contrast(1.1)" }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Alamnagar Location"
                className="group-hover:filter-none transition-all duration-700 ease-in-out"
              />
              
              {/* Location Badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-stone-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-stone-900">आलमनगर हरिबल्लभ चौक</h4>
                    <p className="text-xs text-stone-500 mt-1">मुख्य बाज़ार, मधेपुरा, बिहार</p>
                    <p className="text-xs font-bold text-emerald-600 mt-1">Pin: 852210 / 852219</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">कार्यालय समय</h4>
                  <p className="text-xs text-stone-500 mt-1">सोमवार - शनिवार: 9:00 AM - 6:00 PM</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">ईमेल करें</h4>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium mt-1 block break-all">
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Directions Button */}
            <motion.a 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              href="https://maps.google.com/?q=Alamnagar+Hariballabh+Chowk+Madhepura+Bihar+852210"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-stone-900 text-white font-bold rounded-2xl hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl"
            >
              <Navigation className="w-5 h-5" />
              <span>Google Maps पर दिशा प्राप्त करें</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </main>
  );
}