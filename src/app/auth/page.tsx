"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle, X, Phone, Smartphone } from "lucide-react";
import { auth, googleProvider, db } from "@/lib/firebase";
import { 
  signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  updateProfile, sendPasswordResetEmail, signInWithPhoneNumber, RecaptchaVerifier
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [authMethod, setAuthMethod] = useState<"email" | "google" | "phone">("email");
  
  // Email/Password states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Phone states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [otpSent, setOtpSent] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Initialize reCAPTCHA for Phone Auth
  useEffect(() => {
    if (authMethod === "phone" && !recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {},
          'expired-callback': () => {}
        });
      } catch (error) {
        console.error("reCAPTCHA init error:", error);
      }
    }
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, [authMethod]);

  const getErrorMessage = (code: string): string => {
    const messages: Record<string, string> = {
      "auth/email-already-in-use": "यह ईमेल पहले से उपयोग में है। कृपया लॉगिन करें।",
      "auth/invalid-email": "अमान्य ईमेल पता।",
      "auth/weak-password": "पासवर्ड कम से कम 6 अक्षर का होना चाहिए।",
      "auth/user-not-found": "कोई उपयोगकर्ता नहीं मिला।",
      "auth/wrong-password": "गलत पासवर्ड।",
      "auth/invalid-credential": "गलत ईमेल या पासवर्ड।",
      "auth/too-many-requests": "बहुत सारे प्रयास। कृपया बाद में पुनः प्रयास करें।",
      "auth/popup-closed-by-user": "लॉगिन रद्द किया गया।",
      "auth/invalid-phone-number": "अमान्य फ़ोन नंबर। कृपया सही नंबर दर्ज करें।",
      "auth/missing-phone-number": "कृपया फ़ोन नंबर दर्ज करें।",
      "auth/quota-exceeded": "OTP सीमा पार हो गई। कृपया बाद में पुनः प्रयास करें।",
      "auth/invalid-verification-code": "गलत OTP। कृपया पुनः प्रयास करें।",
      "auth/code-expired": "OTP समाप्त हो गया। कृपया नया OTP भेजें।",
    };
    return messages[code] || "एक त्रुटि हुई। कृपया पुनः प्रयास करें।";
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        bio: "आलमनगर समुदाय का हिस्सा",
        createdAt: serverTimestamp(),
        isVerified: true,
      }, { merge: true });
      
      setSuccess("लॉगिन सफल! रिडाइरेक्ट हो रहा है...");
      setTimeout(() => router.push("/community"), 1500);
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      setError(getErrorMessage(err.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  // Email/Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess("लॉगिन सफल! रिडाइरेक्ट हो रहा है...");
      setTimeout(() => router.push("/community"), 1500);
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Signup
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      await updateProfile(user, { displayName: name });
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: name,
        email: email,
        photoURL: "",
        bio: "आलमनगर समुदाय का हिस्सा",
        createdAt: serverTimestamp(),
        isVerified: false,
      });
      
      setSuccess("अकाउंट बन गया! रिडाइरेक्ट हो रहा है...");
      setTimeout(() => router.push("/community"), 2000);
    } catch (err: any) {
      console.error("Signup Error:", err);
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Phone: Send OTP
  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError("कृपया फ़ोन नंबर दर्ज करें।");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const fullPhoneNumber = `+91${phoneNumber}`;
      
      if (!recaptchaVerifierRef.current) {
        throw new Error("reCAPTCHA initialize नहीं हुआ।");
      }
      
      const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setSuccess("OTP भेज दिया गया है! कृपया अपने फ़ोन पर जांचें।");
    } catch (err: any) {
      console.error("Send OTP Error:", err);
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Phone: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError("कृपया 6 अंकों का OTP दर्ज करें।");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: `User ${phoneNumber.slice(-4)}`,
        phoneNumber: `+91${phoneNumber}`,
        photoURL: "",
        bio: "आलमनगर समुदाय का हिस्सा",
        createdAt: serverTimestamp(),
        isVerified: true,
      }, { merge: true });
      
      setSuccess("लॉगिन सफल! रिडाइरेक्ट हो रहा है...");
      setTimeout(() => router.push("/community"), 1500);
    } catch (err: any) {
      console.error("Verify OTP Error:", err);
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("पासवर्ड रीसेट लिंक आपके ईमेल पर भेज दिया गया है।");
      setTimeout(() => setMode("login"), 3000);
    } catch (err: any) {
      console.error("Reset Error:", err);
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-amber-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      
      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" /> <span className="text-sm font-medium">वापस जाएं</span>
        </Link>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="p-8 text-center border-b border-white/10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-white mb-2">
              {mode === "login" && "स्वागत है!"}
              {mode === "signup" && "अकाउंट बनाएं"}
              {mode === "reset" && "पासवर्ड रीसेट"}
            </h1>
          </div>

          {/* Auth Method Tabs (Only for Login/Signup) */}
          {(mode === "login" || mode === "signup") && (
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setAuthMethod("email")}
                className={`flex-1 py-3 text-sm font-semibold transition-all ${
                  authMethod === "email" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-white/50 hover:text-white/70"
                }`}
              >
                <Mail className="w-4 h-4 inline mr-2" />
                ईमेल
              </button>
              <button
                onClick={() => setAuthMethod("google")}
                className={`flex-1 py-3 text-sm font-semibold transition-all ${
                  authMethod === "google" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-white/50 hover:text-white/70"
                }`}
              >
                <svg className="w-4 h-4 inline mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/></svg>
                Google
              </button>
              <button
                onClick={() => setAuthMethod("phone")}
                className={`flex-1 py-3 text-sm font-semibold transition-all ${
                  authMethod === "phone" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-white/50 hover:text-white/70"
                }`}
              >
                <Phone className="w-4 h-4 inline mr-2" />
                फ़ोन
              </button>
            </div>
          )}

          <div className="p-8">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-300">{success}</p>
                </motion.div>
              )}

              {/* GOOGLE METHOD */}
              {authMethod === "google" && mode !== "reset" && (
                <motion.div key="google" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <button onClick={handleGoogleSignIn} disabled={googleLoading} className="w-full flex items-center justify-center gap-3 py-3.5 bg-white hover:bg-white/90 text-stone-900 font-bold rounded-xl transition-all disabled:opacity-50 mb-6">
                    {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
                    <span>Google से {mode === "login" ? "लॉगिन" : "साइन अप"} करें</span>
                  </button>
                </motion.div>
              )}

              {/* PHONE METHOD */}
              {authMethod === "phone" && mode !== "reset" && (
                <motion.div key="phone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {!otpSent ? (
                    <>
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <div className="flex">
                          <div className="flex items-center px-4 bg-white/5 border border-white/10 border-r-0 rounded-l-xl text-white/70">
                            +91
                          </div>
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="फ़ोन नंबर (10 अंक)"
                            className="flex-1 pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-r-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleSendOTP}
                        disabled={loading || phoneNumber.length !== 10}
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> OTP भेज रहा है...</> : <><Phone className="w-5 h-5" /> OTP भेजें</>}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="6 अंकों का OTP दर्ज करें"
                          className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-center text-lg tracking-widest"
                          maxLength={6}
                        />
                      </div>
                      <button
                        onClick={handleVerifyOTP}
                        disabled={loading || otp.length !== 6}
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> सत्यापित हो रहा है...</> : <><CheckCircle className="w-5 h-5" /> OTP सत्यापित करें</>}
                      </button>
                      <button
                        onClick={() => { setOtpSent(false); setOtp(""); }}
                        className="w-full py-2 text-white/60 hover:text-white text-sm transition-colors"
                      >
                        नया OTP भेजें
                      </button>
                    </>
                  )}
                </motion.div>
              )}

              {/* EMAIL METHOD - LOGIN */}
              {authMethod === "email" && mode === "login" && (
                <motion.div key="email-login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aapka@email.com" required className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> लॉगिन हो रहा है...</> : "लॉगिन करें"}
                    </button>
                  </form>
                  <div className="mt-6 text-center space-y-3">
                    <button onClick={() => setMode("reset")} className="text-sm text-white/60 hover:text-white">पासवर्ड भूल गए?</button>
                    <p className="text-sm text-white/60">अकाउंट नहीं है? <button onClick={() => setMode("signup")} className="text-emerald-400 hover:text-emerald-300 font-semibold">साइन अप करें</button></p>
                  </div>
                </motion.div>
              )}

              {/* EMAIL METHOD - SIGNUP */}
              {authMethod === "email" && mode === "signup" && (
                <motion.div key="email-signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <form onSubmit={handleEmailSignup} className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="आपका नाम" required className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aapka@email.com" required className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="कम से कम 6 अक्षर" required minLength={6} className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> अकाउंट बन रहा है...</> : "साइन अप करें"}
                    </button>
                  </form>
                  <p className="mt-6 text-center text-sm text-white/60">पहले से अकाउंट है? <button onClick={() => setMode("login")} className="text-emerald-400 hover:text-emerald-300 font-semibold">लॉगिन करें</button></p>
                </motion.div>
              )}

              {/* PASSWORD RESET */}
              {mode === "reset" && (
                <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aapka@email.com" required className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> भेज रहा है...</> : "रीसेट लिंक भेजें"}
                    </button>
                  </form>
                  <p className="mt-6 text-center text-sm text-white/60">याद आ गया? <button onClick={() => setMode("login")} className="text-emerald-400 hover:text-emerald-300 font-semibold">लॉगिन पर वापस जाएं</button></p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}