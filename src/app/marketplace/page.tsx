"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, Plus, Search, Filter, MapPin, Star, 
  Loader2, Package, Clock, Heart, Eye
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: "product" | "service";
  images: string[];
  slots: string[];
  sellerId: string;
  sellerName: string;
  sellerPhoto: string;
  sellerLocation: string;
  sellerVerified: boolean;
  status: string;
  createdAt: any;
  views: number;
}

export default function MarketplacePage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "product" | "service">("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high">("newest");

  useEffect(() => {
    const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
      setListings(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredListings = listings
    .filter(listing => listing.status === "active")
    .filter(listing => categoryFilter === "all" || listing.category === categoryFilter)
    .filter(listing => 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return 0;
    });

  return (
    <main className="min-h-screen bg-stone-50 pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-green-800 to-amber-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-6">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-bold uppercase tracking-wider">स्थानीय बाज़ार</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
              अपना गाँव, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-emerald-300">
                अपना बाज़ार
              </span>
            </h1>
            <p className="text-lg text-stone-200 max-w-2xl mb-8">
              अपने गाँव के किसानों, कारीगरों और स्थानीय व्यवसायों से सीधे खरीदें। 
              हर खरीदारी में स्थानीय अर्थव्यवस्था को मज़बूत करें।
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/marketplace/create"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-stone-100 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                अपनी लिस्टिंग बनाएं
              </Link>
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="उत्पाद या सेवा खोजें..."
                  className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-20 z-30 bg-white/95 backdrop-blur-xl border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-stone-600">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-semibold">फ़िल्टर:</span>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "all", label: "सभी", icon: ShoppingBag },
                { id: "product", label: "उत्पाद", icon: Package },
                { id: "service", label: "सेवाएं", icon: Clock },
              ].map(cat => {
                const Icon = cat.icon;
                const isActive = categoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-stone-900 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <div className="ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-stone-100 border border-stone-200 rounded-full text-sm font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="newest">नवीनतम</option>
                <option value="price-low">मूल्य: कम से ज़्यादा</option>
                <option value="price-high">मूल्य: ज़्यादा से कम</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
            <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-stone-900 mb-2">कोई लिस्टिंग नहीं मिली</h3>
            <p className="text-stone-500 mb-6">पहली लिस्टिंग बनाकर बाज़ार की शुरुआत करें!</p>
            <Link
              href="/marketplace/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              लिस्टिंग बनाएं
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-stone-500 mb-4">
              {filteredListings.length} लिस्टिंग मिली
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredListings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/marketplace/${listing.id}`}>
                      <div className="group bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300">
                        {/* Image */}
                        <div className="relative aspect-square overflow-hidden bg-stone-100">
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute top-3 left-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              listing.category === "product"
                                ? "bg-emerald-500 text-white"
                                : "bg-amber-500 text-white"
                            }`}>
                              {listing.category === "product" ? "उत्पाद" : "सेवा"}
                            </span>
                          </div>
                          {listing.sellerVerified && (
                            <div className="absolute top-3 right-3">
                              <div className="p-1.5 bg-white rounded-full shadow-md">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-bold text-stone-900 text-lg mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                            {listing.title}
                          </h3>
                          <p className="text-sm text-stone-600 line-clamp-2 mb-3">
                            {listing.description}
                          </p>

                          <div className="flex items-center justify-between mb-3">
                            <p className="text-2xl font-extrabold text-emerald-600">
                              ₹{listing.price.toLocaleString('hi-IN')}
                            </p>
                            {listing.category === "service" && listing.slots.length > 0 && (
                              <span className="text-xs text-stone-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {listing.slots.length} स्लॉट
                              </span>
                            )}
                          </div>

                          {/* Seller Info */}
                          <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 p-[2px]">
                              <div className="w-full h-full rounded-full bg-white overflow-hidden">
                                {listing.sellerPhoto ? (
                                  <img src={listing.sellerPhoto} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-stone-600">
                                    {listing.sellerName[0]}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-stone-900 truncate">
                                {listing.sellerName}
                              </p>
                              {listing.sellerLocation && (
                                <p className="text-[10px] text-stone-500 flex items-center gap-1 truncate">
                                  <MapPin className="w-2.5 h-2.5" />
                                  {listing.sellerLocation}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </section>

      {/* Floating Create Button (Mobile) */}
      <Link
        href="/marketplace/create"
        className="fixed bottom-6 right-6 md:hidden z-40 w-14 h-14 bg-gradient-to-br from-emerald-600 to-amber-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </main>
  );
}