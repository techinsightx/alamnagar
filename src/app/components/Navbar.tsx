"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MapPin } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "मुख्य पृष्ठ" },
  { href: "/about", label: "हमारे बारे में" },
  { href: "/gallery", label: "गैलरी" },
  { href: "/community", label: "समुदाय" },
  { href: "/marketplace", label: "बाज़ार" },
  { href: "/contact", label: "संपर्क" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-lg shadow-lg border-b border-stone-200"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              scrolled 
                ? "bg-gradient-to-br from-emerald-600 to-green-700" 
                : "bg-white/20 backdrop-blur-sm border border-white/30"
            }`}>
              <MapPin className={`w-5 h-5 ${scrolled ? "text-white" : "text-amber-300"}`} />
            </div>
            <div>
              <h1 className={`text-xl font-extrabold tracking-tight transition-colors ${
                scrolled ? "text-stone-900" : "text-white"
              }`}>
                आलम<span className={scrolled ? "text-amber-600" : "text-amber-400"}>नगर</span>
              </h1>
              <p className={`text-xs transition-colors ${
                scrolled ? "text-stone-500" : "text-white/70"
              }`}>
                मधेपुरा, बिहार
              </p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? scrolled
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-white/20 text-white"
                      : scrolled
                      ? "text-stone-700 hover:bg-stone-100"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled
                ? "text-stone-900 hover:bg-stone-100"
                : "text-white hover:bg-white/10"
            }`}
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
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-stone-200 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-2">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                        isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}