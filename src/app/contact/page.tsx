"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, MapPin, Phone, Send, Clock, MessageSquare, 
  ArrowLeft, CheckCircle, Loader2, User, AlertCircle, 
  ShieldCheck, Globe, Share2, ExternalLink
} from "lucide-react";
import Link from "next/link";

// 🔥 YOUR FORMSPREE ENDPOINT
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
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
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
        setErrorMessage(data.errors?.[0]?.message || "संदेश भेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।");
      }
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage("नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "ईमेल करें",
      details: CONTACT_EMAIL,
      link: `mailto:${CONTACT_EMAIL}`,
      color: "bg-emerald-100 text-emerald-600",
      hoverColor: "group-hover:shadow-emerald-500/20"
    },
    {
      icon: MapPin,
      title: "हमारा पता",
      details: "आलमनगर मुख्य बाज़ार, मधेपुरा, बिहार - 852210 / 852219",
      link: "https://maps.google.com/?q=Alamnagar+Main+Market+Madhepura+Bihar",
      color: "bg-amber-100 text-amber-600",
      hoverColor: "group-hover:shadow-amber-500/20"
    },
    {
      icon: Clock,
      title: "कार्यालय समय",
      details: "सोमवार - शनिवार: 9:00 AM - 6:00 PM",
      link: "#",
      color: "bg-blue-100 text-blue-600",
      hoverColor: "group-hover:shadow-blue-500/20"
    }
  ];

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 pb-20 selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* 🌟 Cinematic Hero Section */}
      <div className="bg-gradient-to-br from-stone-950 via-emerald-950 to-stone-900 text-white py-20 md:py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px]" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-8 transition-colors font-semibold group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
              वापस होम पेज पर जाएं
            </Link>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight"
          >
            हमसे <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400">संपर्क करें</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-stone-300 text-lg md:text-xl max-w-2xl leading-relaxed font-light"
          >
            आलमनगर समुदाय से जुड़े कोई भी प्रश्न, सुझाव या सहयोग के लिए हमसे बेझिझक संपर्क करें। 
            हम आपकी सहायता के लिए हमेशा तत्पर हैं।
          </motion.p>
        </div>
      </div>

      {/* 📬 Main Content Grid */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Contact Info & Trust Badges */}
          <div className="lg:col-span-4 space-y-6">
            {contactInfo.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.a
                  key={index}
                  href={item.link}
                  target={item.link.startsWith("http") ? "_blank" : undefined}
                  rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`block bg-white p-6 rounded-2xl shadow-sm border border-stone-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group ${item.hoverColor}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 mb-1">{item.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{item.details}</p>
                </motion.a>
              );
            })}

            {/* Quick Support Note */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-emerald-600 to-amber-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="relative z-10">
                <MessageSquare className="w-8 h-8 mb-3 opacity-90" />
                <h3 className="text-lg font-bold mb-2">त्वरित सहायता</h3>
                <p className="text-sm text-white/90 leading-relaxed">
                  क्या आपको प्लेटफॉर्म का उपयोग करने में कोई तकनीकी दिक्कत आ रही है? हमारी सपोर्ट टीम 24 घंटे के भीतर जवाब देने का प्रयास करती है।
                </p>
              </div>
            </motion.div>

            {/* Social / Trust (Fixed Icons) */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center lg:justify-start gap-4 pt-4"
            >
              {[Globe, Share2, ExternalLink].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-500 hover:text-emerald-600 hover:border-emerald-500 hover:shadow-md transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-xl border border-stone-100 p-6 md:p-10"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Send className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-stone-900">संदेश भेजें</h2>
                  <p className="text-sm text-stone-500">हम आपके संदेश का जल्द से जल्द उत्तर देंगे।</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {submitStatus === "success" ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 md:p-12 text-center"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle className="w-10 h-10 text-emerald-600" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-emerald-900 mb-3">संदेश सफलतापूर्वक भेज दिया गया!</h3>
                    <p className="text-emerald-700 mb-6 max-w-md mx-auto">
                      धन्यवाद! हमारी टीम आपके संदेश की समीक्षा कर रही है और जल्द ही आपसे संपर्क करेगी।
                    </p>
                    <button 
                      onClick={() => setSubmitStatus("idle")}
                      className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                      नया संदेश भेजें
                    </button>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit} 
                    className="space-y-6"
                  >
                    {submitStatus === "error" && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
                      </motion.div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center gap-2">
                          <User className="w-4 h-4" /> आपका नाम *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="जैसे: राहुल कुमार"
                          className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-stone-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4" /> ईमेल पता *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="aapka@email.com"
                          className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-stone-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> विषय *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="जैसे: Marketplace लिस्टिंग में समस्या"
                        className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-stone-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center gap-2">
                        <Send className="w-4 h-4" /> आपका संदेश *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="अपना प्रश्न या सुझाव यहाँ विस्तार से लिखें..."
                        className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none placeholder:text-stone-400"
                      />
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-amber-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                      >
                        {isSubmitting ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> भेजा जा रहा है...</>
                        ) : (
                          <><Send className="w-5 h-5" /> संदेश भेजें</>
                        )}
                      </button>

                      <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-100 px-3 py-2 rounded-lg">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>आपकी जानकारी 100% सुरक्षित और एन्क्रिप्टेड है।</span>
                      </div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* 🗺️ Interactive Google Map Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-stone-900 mb-2">हमें यहाँ खोजें</h2>
            <p className="text-stone-500">आलमनगर मुख्य बाज़ार, मधेपुरा, बिहार</p>
          </div>
          
          <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
            <iframe 
              src="https://maps.google.com/maps?q=Alamnagar+Main+Market,+Madhepura,+Bihar+852210&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: "grayscale(30%) contrast(1.1)" }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="group-hover:filter-none transition-all duration-700 ease-in-out"
            />
            
            {/* Map Overlay Badge */}
            <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-stone-200 flex items-center gap-3 group-hover:scale-105 transition-transform duration-300">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-black text-stone-900">आलमनगर मुख्य बाज़ार</p>
                <p className="text-xs text-stone-500 font-medium">मधेपुरा, बिहार - 852210 / 852219</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </main>
  );
}