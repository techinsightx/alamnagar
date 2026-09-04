"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, Home, Users, Image, ShoppingBag, Phone, 
  Star, User, LogOut, Loader2
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState(true);

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-amber-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-white font-extrabold text-xl">आ</span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-stone-900">आलमनगर</h1>
              <p className="text-[10px] text-stone-500 font-medium">हमारा गाँव, हमारी पहचान</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-amber-600 text-white shadow-lg"
                      : "text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side: Users Count + Profile */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Joined Citizens Counter */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-amber-50 border border-emerald-200 rounded-xl">
              <Users className="w-5 h-5 text-emerald-600" />
              <div>
                {loadingCount ? (
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                ) : (
                  <span className="text-lg font-extrabold text-emerald-700">
                    {usersCount.toLocaleString('hi-IN')}
                  </span>
                )}
                <p className="text-[9px] text-stone-600 font-semibold">जुड़े नागरिक</p>
              </div>
            </div>

            {/* Profile Section */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2 px-3 py-2 hover:bg-stone-100 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-amber-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                      {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-stone-600">
                          {currentUser.displayName?.[0] || "U"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-stone-900">
                      {currentUser.displayName || "उपयोगकर्ता"}
                    </p>
                    <p className="text-[10px] text-stone-500">प्रोफ़ाइल देखें</p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="लॉगआउट"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-amber-700 transition-all shadow-lg"
              >
                लॉगिन
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-stone-200"
          >
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Users Count */}
              <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-50 to-amber-50 border border-emerald-200 rounded-xl mb-4">
                <Users className="w-5 h-5 text-emerald-600" />
                {loadingCount ? (
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                ) : (
                  <span className="text-lg font-extrabold text-emerald-700">
                    {usersCount.toLocaleString('hi-IN')} जुड़े नागरिक
                  </span>
                )}
              </div>

              {/* Mobile Nav Links */}
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-600 to-amber-600 text-white"
                        : "text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}

              {/* Mobile Profile Section */}
              {currentUser ? (
                <div className="pt-4 border-t border-stone-200 space-y-2">
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
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-semibold"
                  >
                    <LogOut className="w-5 h-5" />
                    लॉगआउट
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-xl"
                >
                  लॉगिन
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}