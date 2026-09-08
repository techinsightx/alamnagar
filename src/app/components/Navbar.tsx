"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, Home, Users, Image, ShoppingBag, Phone, 
  Star, User, LogOut, Loader2, Globe
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useRouter } from "next/navigation";

// ═══════════════════════════════════════════════════════════
// 🧲 MAGNETIC LINK COMPONENT (Desktop Nav)
// ═══════════════════════════════════════════════════════════
const MagneticNavItem = ({ href, label, icon: Icon, isActive }: { href: string; label: string; icon: any; isActive: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    // 0.25 is the magnetic strength
    setPosition({ x: middleX * 0.25, y: middleY * 0.25 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <Link href={href} className="relative z-10">
      <motion.div
        ref={ref}
        onMouseMove={handleMouse}
        onMouseLeave={reset}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors duration-300 ${
          isActive ? "text-stone-900" : "text-stone-600 hover:text-stone-900"
        }`}
      >
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="absolute inset-0 bg-white rounded-xl shadow-sm border border-stone-200/60"
            transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
          />
        )}
        <Icon className={`w-4 h-4 relative z-10 transition-colors ${isActive ? "text-emerald-600" : ""}`} />
        <span className="relative z-10">{label}</span>
      </motion.div>
    </Link>
  );
};

// ═══════════════════════════════════════════════════════════
// 🧲 MAGNETIC BUTTON COMPONENT (Actions)
// ═══════════════════════════════════════════════════════════
const MagneticButton = ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.25, y: middleY * 0.25 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Fetch current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch total users count (real-time)
  useEffect(() => {
    const usersQuery = query(collection(db, "users"));
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      setUsersCount(snapshot.size);
      setLoadingCount(false);
    }, (error) => {
      console.error("Users count error:", error);
      setLoadingCount(false);
    });
    return () => unsubscribe();
  }, []);

  // Scroll effect for premium navbar transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navLinks = [
    { href: "/", label: "होम", icon: Home },
    { href: "/about", label: "परिचय", icon: Users },
    { href: "/gallery", label: "गैलरी", icon: Image },
    { href: "/community", label: "समुदाय", icon: Star },
    { href: "/marketplace", label: "बाज़ार", icon: ShoppingBag },
    { href: "/contact", label: "संपर्क", icon: Phone },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out">
        {/* Dynamic Background with Perfect Visibility */}
        <div 
          className={`absolute inset-0 transition-all duration-500 border-b ${
            scrolled 
              ? "bg-white/85 backdrop-blur-2xl shadow-lg shadow-stone-900/5 border-stone-200/60" 
              : "bg-white/70 backdrop-blur-xl border-white/40"
          }`} 
        />
        
        {/* Premium Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500 opacity-80 z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* 🌟 Animated Globe Logo Section */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div 
                className="relative w-10 h-10 bg-gradient-to-br from-emerald-500 via-amber-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-amber-500/30 transition-all overflow-hidden"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 text-white drop-shadow-md relative z-10"
                >
                  <Globe className="w-full h-full" strokeWidth={2.5} />
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-white/40 rounded-xl blur-md"
                />
              </motion.div>
              
              <div>
                <h1 className="text-lg font-extrabold text-stone-900 tracking-tight leading-none">
                  आलम<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">नगर</span>
                </h1>
                <p className="text-[9px] text-stone-500 font-semibold tracking-wider uppercase mt-0.5">हमारा गाँव, हमारी पहचान</p>
              </div>
            </Link>

            {/* 🖥️ Desktop Navigation (Magnetic Pills) */}
            <div className="hidden lg:flex items-center gap-1 relative bg-stone-100/50 p-1.5 rounded-2xl border border-stone-200/50 backdrop-blur-sm">
              {navLinks.map((link) => (
                <MagneticNavItem
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={link.icon}
                  isActive={pathname === link.href}
                />
              ))}
            </div>

            {/* 🖥️ Desktop Right Side: Live Counter + Profile */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Live Joined Citizens Counter */}
              <div className="flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-emerald-50/80 to-amber-50/80 border border-emerald-200/60 rounded-xl backdrop-blur-sm">
                <div className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
                </div>
                <div className="flex flex-col">
                  {loadingCount ? (
                    <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                  ) : (
                    <span className="text-sm font-extrabold text-emerald-800 leading-none">
                      {usersCount.toLocaleString('hi-IN')}
                    </span>
                  )}
                  <span className="text-[9px] text-emerald-700/80 font-bold uppercase tracking-wider">नागरिक</span>
                </div>
              </div>

              {/* Profile / Login Section */}
              {currentUser ? (
                <div className="flex items-center gap-3 pl-3 border-l border-stone-200">
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-stone-100 rounded-xl transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-amber-500 p-[2px] shadow-md group-hover:shadow-lg transition-shadow">
                      <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                        {currentUser.photoURL ? (
                          <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-stone-700">
                            {currentUser.displayName?.[0] || "U"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-sm font-bold text-stone-900 leading-tight">
                        {currentUser.displayName || "उपयोगकर्ता"}
                      </p>
                      <p className="text-[10px] text-stone-500 font-medium">प्रोफ़ाइल</p>
                    </div>
                  </Link>
                  <MagneticButton
                    onClick={handleLogout}
                    className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                  </MagneticButton>
                </div>
              ) : (
                <Link href="/auth">
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-amber-700 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    लॉगिन
                  </motion.div>
                </Link>
              )}
            </div>

            {/* 📱 Mobile Menu Button */}
            <MagneticButton
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2.5 text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </MagneticButton>
          </div>
        </div>
      </nav>

      {/* 📱 Mobile Menu (Staggered Premium Animation) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed inset-0 z-40 pt-20 bg-white/95 backdrop-blur-2xl"
          >
            <div className="px-6 py-6 space-y-3 max-h-[85vh] overflow-y-auto">
              
              {/* Mobile Live Counter */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-50 to-amber-50 border border-emerald-200 rounded-xl mb-6"
              >
                <div className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-2 w-2 rounded-full bg-emerald-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
                </div>
                {loadingCount ? (
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                ) : (
                  <span className="text-base font-extrabold text-emerald-800">
                    {usersCount.toLocaleString('hi-IN')} जुड़े नागरिक
                  </span>
                )}
              </motion.div>

              {/* Mobile Nav Links */}
              <div className="space-y-2">
                {navLinks.map((link, index) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-emerald-600 to-amber-600 text-white shadow-md"
                            : "text-stone-700 hover:bg-stone-100"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Mobile Profile Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pt-6 mt-6 border-t border-stone-200 space-y-3"
              >
                {currentUser ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 bg-stone-50 hover:bg-stone-100 rounded-xl transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-amber-500 p-[2px]">
                        <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                          {currentUser.photoURL ? (
                            <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-stone-600" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{currentUser.displayName || "उपयोगकर्ता"}</p>
                        <p className="text-xs text-stone-500">प्रोफ़ाइल संपादित करें</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-semibold border border-red-100"
                    >
                      <LogOut className="w-5 h-5" />
                      लॉगआउट
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-xl shadow-lg"
                  >
                    लॉगिन करें
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}