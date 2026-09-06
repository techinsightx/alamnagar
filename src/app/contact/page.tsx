"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Send, ArrowLeft, CheckCircle, Loader2, User, AlertCircle, 
  ShieldCheck, MapPin, Navigation
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
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-8 transition-colors font-semibold">
            <ArrowLeft className="w-5 h-5" /> वापस होम पेज पर जाएं
          </Link>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            हमसे <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400">संपर्क करें</span>
          </h1>
          <p className="text-stone-300 text-lg max-w-2xl">
            आलमनगर समुदाय से जुड़े कोई भी प्रश्न या सुझाव के लिए हमसे संपर्क करें।
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-stone-100 p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Send className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-stone-900">संदेश भेजें</h2>
                <p className="text-sm text-stone-500">हम जल्द ही उत्तर देंगे</p>
              </div>
            </div>

            {submitStatus === "success" ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
                <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-emerald-900 mb-2">संदेश भेज दिया गया!</h3>
                <p className="text-emerald-700">धन्यवाद! हम जल्द संपर्क करेंगे।</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {submitStatus === "error" && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">{errorMessage}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">आपका नाम *</label>
                    <input type="text" name="name" required placeholder="राहुल कुमार"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">ईमेल *</label>
                    <input type="email" name="email" required placeholder="email@example.com"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">विषय *</label>
                  <input type="text" name="subject" required placeholder="आपका विषय"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">संदेश *</label>
                  <textarea name="message" required rows={5} placeholder="अपना संदेश यहाँ लिखें..."
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="w-full px-8 py-4 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-amber-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {isSubmitting ? "भेजा जा रहा है..." : "संदेश भेजें"}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-stone-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>आपकी जानकारी 100% सुरक्षित है</span>
                </div>
              </form>
            )}
          </motion.div>

          {/* Edgeless Premium Map */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative h-[600px] rounded-none overflow-hidden shadow-2xl"
          >
            {/* Satellite View Map - Edgeless */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3548.1234567890123!2d86.12345678901234!3d26.123456789012345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDA3JzI0LjQiTiA4NsKwMDcnMjQuNCJF!5e1!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Alamnagar Hariballabh Chowk"
            />

            {/* Animated Pulse Marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <motion.div 
                animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 bg-emerald-500/40 rounded-full absolute -top-3 -left-3"
              />
              <motion.div 
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-full border-4 border-white shadow-2xl flex items-center justify-center"
              >
                <MapPin className="w-5 h-5 text-white" />
              </motion.div>
            </div>

            {/* Minimal Location Badge */}
            <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-white/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-stone-900">आलमनगर हरिबल्लभ चौक</p>
                  <p className="text-xs text-stone-500">मधेपुरा, बिहार - 852210</p>
                </div>
              </div>
            </div>

            {/* Small Pulse Button (Symbol Only) */}
            <a 
              href="https://maps.google.com/?q=Alamnagar+Hariballabh+Chowk+Madhepura+Bihar"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-emerald-600 to-amber-600 rounded-full shadow-2xl flex items-center justify-center group hover:scale-110 transition-transform"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Navigation className="w-6 h-6 text-white" />
              </motion.div>
            </a>
          </motion.div>
        </div>
      </div>
    </main>
  );
}