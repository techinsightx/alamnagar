"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, MapPin, Star, Clock, Package, User, 
  Loader2, CheckCircle, Shield, BadgeCheck, Calendar,
  CreditCard, ShoppingBag
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/app/actions/razorpay";
import { sendOrderEmail } from "@/app/actions/email";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  sellerEmail: string;
  sellerBio: string;
  sellerLocation: string;
  sellerVerified: boolean;
  status: string;
  createdAt: any;
}

const PLATFORM_FEE_PERCENTAGE = 15;

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [processing, setProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(db, "listings", listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing({ id: docSnap.id, ...docSnap.data() } as Listing);
      }
      setLoading(false);
    };
    fetchListing();
  }, [listingId]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Load Razorpay script
  useEffect(() => {
    if (!document.getElementById("razorpay-script")) {
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);
    }
  }, []);

  const handleBuyNow = async () => {
    if (!currentUser) {
      router.push("/auth");
      return;
    }

    if (!listing) return;

    if (listing.category === "service" && !selectedSlot) {
      alert("कृपया एक समय स्लॉट चुनें।");
      return;
    }

    setProcessing(true);

    try {
      // 1. Create Razorpay Order
      const orderResult = await createRazorpayOrder(listing.price);
      if (!orderResult.success || !orderResult.order) {
        throw new Error("ऑर्डर बनाने में त्रुटि");
      }

      const order = orderResult.order;

      // 2. Calculate amounts
      const platformFee = Math.round((listing.price * PLATFORM_FEE_PERCENTAGE) / 100);
      const sellerAmount = listing.price - platformFee;

      // 3. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "आलमनगर बाज़ार",
        description: listing.title,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // 4. Verify Payment
            const verifyResult = await verifyRazorpayPayment(
              order.id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (!verifyResult.success) {
              throw new Error("भुगतान सत्यापन विफल");
            }

            // 5. Get buyer details
            const buyerDoc = await getDoc(doc(db, "users", currentUser.uid));
            const buyerData = buyerDoc.exists() ? buyerDoc.data() : {};

            // 6. Create Order in Firestore
            const orderRef = await addDoc(collection(db, "orders"), {
              listingId: listing.id,
              listingTitle: listing.title,
              listingImage: listing.images[0],
              buyerId: currentUser.uid,
              buyerName: buyerData.displayName || currentUser.displayName || "User",
              buyerEmail: buyerData.email || currentUser.email,
              buyerPhone: buyerData.phone || "",
              sellerId: listing.sellerId,
              sellerName: listing.sellerName,
              sellerEmail: listing.sellerEmail,
              amount: listing.price,
              platformFee: platformFee,
              sellerAmount: sellerAmount,
              selectedSlot: selectedSlot || null,
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: order.id,
              status: "confirmed",
              createdAt: serverTimestamp(),
            });

            // 7. Update listing if service (mark slot as booked)
            if (listing.category === "service" && selectedSlot) {
              const listingRef = doc(db, "listings", listing.id);
              const updatedSlots = listing.slots.filter(s => s !== selectedSlot);
              await updateDoc(listingRef, { slots: updatedSlots });
            }

            // 8. Send Emails
            await sendOrderEmail(
              buyerData.email || currentUser.email || "",
              buyerData.displayName || currentUser.displayName || "Customer",
              listing.sellerEmail,
              listing.sellerName,
              listing.title,
              listing.price,
              platformFee,
              sellerAmount,
              orderRef.id
            );

            alert("ऑर्डर सफलतापूर्वक पूरा हो गया! ईमेल जांचें।");
            router.push("/marketplace");
          } catch (error) {
            console.error("Order processing error:", error);
            alert("ऑर्डर प्रोसेस करने में त्रुटि।");
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: currentUser.displayName || "",
          email: currentUser.email || "",
        },
        theme: {
          color: "#059669",
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("भुगतान प्रक्रिया में त्रुटि।");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-600">लिस्टिंग नहीं मिली।</p>
          <Link href="/marketplace" className="text-emerald-600 font-bold mt-4 inline-block">
            बाज़ार पर वापस जाएं
          </Link>
        </div>
      </div>
    );
  }

  const platformFee = Math.round((listing.price * PLATFORM_FEE_PERCENTAGE) / 100);
  const sellerAmount = listing.price - platformFee;

  return (
    <main className="min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-xl border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4">
          <Link href="/marketplace" className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </Link>
          <h1 className="font-bold text-stone-900 truncate">{listing.title}</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Images */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm mb-4"
            >
              <img
                src={listing.images[selectedImage]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
            {listing.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? "border-emerald-500" : "border-stone-200"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div>
            {/* Category Badge */}
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
              listing.category === "product"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}>
              {listing.category === "product" ? "उत्पाद" : "सेवा"}
            </span>

            <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 mb-4">
              {listing.title}
            </h1>

            <p className="text-4xl font-extrabold text-emerald-600 mb-6">
              ₹{listing.price.toLocaleString('hi-IN')}
            </p>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 mb-6">
              <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                विवरण
              </h3>
              <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            {/* Slot Selection (for Services) */}
            {listing.category === "service" && listing.slots.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-stone-200 mb-6">
                <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  उपलब्ध समय स्लॉट
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {listing.slots.map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        selectedSlot === slot
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-semibold text-stone-900">{slot}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Info */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 mb-6">
              <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                विक्रेता जानकारी
              </h3>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-amber-500 p-[2px] flex-shrink-0">
                  <div className="w-full h-full rounded-2xl bg-white overflow-hidden">
                    {listing.sellerPhoto ? (
                      <img src={listing.sellerPhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-stone-400 m-3" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-stone-900">{listing.sellerName}</p>
                    {listing.sellerVerified && (
                      <BadgeCheck className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>
                  {listing.sellerLocation && (
                    <p className="text-sm text-stone-600 flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3" />
                      {listing.sellerLocation}
                    </p>
                  )}
                  {listing.sellerBio && (
                    <p className="text-sm text-stone-600 line-clamp-2">{listing.sellerBio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-700">उत्पाद मूल्य:</span>
                  <span className="font-bold text-stone-900">₹{listing.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">प्लेटफ़ॉर्म शुल्क ({PLATFORM_FEE_PERCENTAGE}%):</span>
                  <span className="font-bold text-stone-900">₹{platformFee}</span>
                </div>
                <div className="border-t border-emerald-300 pt-2 flex justify-between">
                  <span className="font-bold text-stone-900">विक्रेता को मिलेगा:</span>
                  <span className="font-extrabold text-emerald-700">₹{sellerAmount}</span>
                </div>
              </div>
            </div>

            {/* Buy Button */}
            <button
              onClick={handleBuyNow}
              disabled={processing}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-amber-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {processing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> प्रोसेस हो रहा है...</>
              ) : (
                <><CreditCard className="w-5 h-5" /> अभी खरीदें - ₹{listing.price}</>
              )}
            </button>

            <p className="text-xs text-stone-500 text-center mt-3 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              सुरक्षित भुगतान Razorpay द्वारा
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}