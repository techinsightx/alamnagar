"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, MapPin, Phone, Send, Clock, MessageSquare, 
  ArrowLeft, CheckCircle, Loader2, User, AlertCircle
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
        setTimeout(() => setSubmitStatus("idle"), 6000);
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
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      icon: MapPin,
      title: "हमारा पता",
      details: "आलमनगर, मधेपुरा, बिहार - 852113",
      link: "https://maps.google.com/?q=Alamnagar+Madhepura+Bihar",
      color: "bg-amber-100 text-amber-600"
    },
    {
      icon: Clock,
      title: "कार्यालय समय",
      details: "सोमवार - शनिवार: 9:00 AM - 6:00 PM",
      link: "#",
      color: "bg-blue-100 text-blue-600"
    }
  ];

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
            हमसे <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">संपर्क करें</span>
          </h1>
          <p className="text-stone-300 text-lg max-w-2xl leading-relaxed">
            आलमनगर समुदाय से जुड़े कोई भी प्रश्न, सुझाव या सहयोग के लिए हमसे बेझिझक संपर्क करें। हम आपकी सहायता के लिए हमेशा तत्पर हैं।
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Left: Contact Info Cards */}
          <div className="md:col-span-1 space-y-6">
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
                  className="block bg-white p-6 rounded-2xl shadow-lg border border-stone-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 mb-1">{item.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed break-all">{item.details}</p>
                </motion.a>
              );
            })}

            {/* Quick Support Note */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-emerald-600 to-amber-600 p-6 rounded-2xl shadow-lg text-white"
            >
              <MessageSquare className="w-8 h-8 mb-3 opacity-80" />
              <h3 className="text-lg font-bold mb-2">त्वरित सहायता</h3>
              <p className="text-sm text-white/90 leading-relaxed">
                क्या आपको प्लेटफॉर्म का उपयोग करने में कोई तकनीकी दिक्कत आ रही है? हमारा सपोर्ट टीम 24 घंटे के भीतर जवाब देने का प्रयास करती है।
              </p>
            </motion.div>
          </div>

          {/* Right: Contact Form */}
          <div className="md:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-xl border border-stone-100 p-8 md:p-10"
            >
              <h2 className="text-2xl font-black text-stone-900 mb-6 flex items-center gap-2">
                <Send className="w-6 h-6 text-emerald-600" />
                संदेश भेजें
              </h2>

              {submitStatus === "success" ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center"
                >
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-900 mb-2">संदेश सफलतापूर्वक भेज दिया गया!</h3>
                  <p className="text-emerald-700 mb-4">धन्यवाद! हम जल्द ही आपसे संपर्क करेंगे।</p>
                  <p className="text-sm text-emerald-600">
                    सभी उत्तर <span className="font-semibold">{CONTACT_EMAIL}</span> के माध्यम से भेजे जाएंगे।
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
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
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
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
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
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
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
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
                      rows={6}
                      placeholder="अपना प्रश्न या सुझाव यहाँ विस्तार से लिखें..."
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> भेजा जा रहा है...</>
                    ) : (
                      <><Send className="w-5 h-5" /> संदेश भेजें</>
                    )}
                  </button>

                  <p className="text-xs text-stone-500 pt-2">
                    🔒 आपकी जानकारी सुरक्षित है और कभी भी तीसरे पक्ष के साथ साझा नहीं की जाएगी।
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}