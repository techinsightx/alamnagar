"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, Plus, Search, Filter, MapPin, Star, 
  Loader2, Package, Clock, Heart, Eye, ArrowUpRight,
  Sparkles, TrendingUp, SlidersHorizontal
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
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

// 🦴 Premium Skeleton Loader
const ListingSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm animate-pulse">
    <div className="aspect-[4/3] bg-stone-200" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-stone-200 rounded-lg w-3/4" />
      <div className="h-4 bg-stone-200 rounded-lg w-full" />
      <div className="h-4 bg-stone-200 rounded-lg w-1/2" />
      <div className="flex items-center gap-3 pt-4 border-t border-stone-100 mt-4">
        <div className="w-9 h-9 rounded-full bg-stone-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-stone-200 rounded w-1/2" />
          <div className="h-2 bg-stone-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  </div>
);

export default function MarketplacePage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "product" | "service">("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high" | "popular">("newest");
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
      setListings(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Dynamic Filtering & Sorting
  const filteredListings = useMemo(() => {
    return listings
      .filter(listing => listing.status === "active")
      .filter(listing => categoryFilter === "all" || listing.category === categoryFilter)
      .filter(listing => 
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.sellerLocation.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "popular") return (b.views || 0) - (a.views || 0);
        return 0; // newest is default from Firestore query
      });
  }, [listings, categoryFilter, searchQuery, sortBy]);

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-stone-50 pb-24">
      {/* 🌟 Cinematic Hero Section */}
      <section className="relative bg-stone-900 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-bold uppercase tracking-wider">आलमनगर का अपना हाट</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1]">
              अपना गाँव, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-amber-300">
                अपना बाज़ार
              </span>
            </h1>
            <p className="text-lg md:text-xl text-stone-300 max-w-2xl mb-10 leading-relaxed">
              अपने गाँव के किसानों, कारीगरों और स्थानीय व्यवसायों से सीधे जुड़ें। 
              हर खरीदारी स्थानीय अर्थव्यवस्था को मज़बूत बनाती है।
            </p>

            <div className="flex flex-col md:flex-row gap-4 max-w-3xl">
              <Link 
                href="/marketplace/create"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-2xl hover:from-emerald-500 hover:to-amber-500 transition-all shadow-xl shadow-emerald-900/20 hover:shadow-emerald-900/40 hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                अपनी लिस्टिंग बनाएं
              </Link>
              
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="उत्पाद, सेवा या स्थान खोजें..."
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/15 transition-all"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🎛️ Sticky Glassmorphic Filters */}
      <section className="sticky top-20 z-30 bg-stone-50/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <Filter className="w-4 h-4 text-stone-500 flex-shrink-0 mr-1" />
              {[
                { id: "all", label: "सभी", icon: ShoppingBag },
                { id: "product", label: "उत्पाद", icon: Package },
                { id: "service", label: "सेवाएं", icon: Clock },
              ].map(cat => {
                const Icon = cat.icon;
                const isActive = categoryFilter === cat.id;
                return (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCategoryFilter(cat.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-stone-900 text-white shadow-md"
                        : "bg-white text-stone-600 border border-stone-200 hover:border-emerald-500 hover:text-emerald-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </motion.button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="md:ml-auto flex items-center gap-3">
              <SlidersHorizontal className="w-4 h-4 text-stone-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-white border border-stone-200 rounded-full text-sm font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer hover:border-emerald-500 transition-colors appearance-none pr-10"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
              >
                <option value="newest">नवीनतम</option>
                <option value="popular">सबसे लोकप्रिय</option>
                <option value="price-low">मूल्य: कम से ज़्यादा</option>
                <option value="price-high">मूल्य: ज़्यादा से कम</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 🛍️ Listings Grid */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <ListingSkeleton key={i} />)}
          </div>
        ) : filteredListings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-white rounded-3xl border border-stone-200 shadow-sm"
          >
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-stone-400" />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-3">कोई लिस्टिंग नहीं मिली</h3>
            <p className="text-stone-500 mb-8 max-w-md mx-auto">
              {searchQuery 
                ? `"${searchQuery}" के लिए कोई परिणाम नहीं मिला। कृपया कोई अन्य शब्द आजमाएं।` 
                : "इस श्रेणी में अभी कोई लिस्टिंग नहीं है। पहली लिस्टिंग बनाकर बाज़ार की शुरुआत करें!"}
            </p>
            <Link
              href="/marketplace/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-5 h-5" />
              नई लिस्टिंग बनाएं
            </Link>
          </motion.div>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mb-6"
            >
              <p className="text-sm font-medium text-stone-500">
                <span className="font-bold text-stone-900">{filteredListings.length}</span> लिस्टिंग उपलब्ध
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredListings.map((listing, index) => {
                  const isHot = (listing.views || 0) > 50;
                  const isLiked = likedItems.has(listing.id);

                  return (
                    <motion.div
                      key={listing.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                    >
                      <Link href={`/marketplace/${listing.id}`}>
                        <div className="group bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                          {/* Image Container */}
                          <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                            <img
                              src={listing.images[0] || "https://via.placeholder.com/400x300?text=No+Image"}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                              loading="lazy"
                            />
                            
                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm ${
                                listing.category === "product"
                                  ? "bg-emerald-500/90 text-white"
                                  : "bg-amber-500/90 text-white"
                              }`}>
                                {listing.category === "product" ? "उत्पाद" : "सेवा"}
                              </span>
                              {isHot && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/90 text-white backdrop-blur-md shadow-sm flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" /> Trending
                                </span>
                              )}
                            </div>

                            {/* Wishlist Button */}
                            <button
                              onClick={(e) => toggleLike(e, listing.id)}
                              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors group/btn"
                            >
                              <Heart className={`w-4 h-4 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-stone-600 group-hover/btn:text-red-500"}`} />
                            </button>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <div className="bg-white/90 backdrop-blur-md text-stone-900 px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                विवरण देखें <ArrowUpRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-5">
                            <h3 className="font-bold text-stone-900 text-lg mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                              {listing.title}
                            </h3>
                            <p className="text-sm text-stone-600 line-clamp-2 mb-4 leading-relaxed">
                              {listing.description}
                            </p>

                            <div className="flex items-end justify-between mb-4">
                              <div>
                                <p className="text-xs text-stone-500 font-medium mb-1">मूल्य</p>
                                <p className="text-2xl font-extrabold text-emerald-600">
                                  ₹{listing.price.toLocaleString('hi-IN')}
                                </p>
                              </div>
                              {listing.category === "service" && listing.slots?.length > 0 && (
                                <span className="text-xs text-stone-500 flex items-center gap-1.5 bg-stone-100 px-2.5 py-1.5 rounded-lg">
                                  <Clock className="w-3.5 h-3.5" />
                                  {listing.slots.length} स्लॉट उपलब्ध
                                </span>
                              )}
                            </div>

                            {/* Seller Info */}
                            <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 p-[2px] flex-shrink-0">
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
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-bold text-stone-900 truncate">
                                    {listing.sellerName}
                                  </p>
                                  {listing.sellerVerified && (
                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                                  )}
                                </div>
                                {listing.sellerLocation && (
                                  <p className="text-[11px] text-stone-500 flex items-center gap-1 truncate mt-0.5">
                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                    {listing.sellerLocation}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </section>

      {/* 📱 Floating Create Button (Mobile) */}
      <AnimatePresence>
        {!loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 md:hidden z-40"
          >
            <Link
              href="/marketplace/create"
              className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-amber-600 text-white rounded-full shadow-2xl shadow-emerald-900/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            >
              <Plus className="w-7 h-7" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}