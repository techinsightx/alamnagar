"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, X, Loader2, CheckCircle2, AlertCircle, 
  Image as ImageIcon, Clock, Info, Zap, Cloud, CreditCard
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/app/actions/razorpay";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CreateListingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<"product" | "service">("product");
  const [slots, setSlots] = useState<string[]>([]);
  const [currentSlot, setCurrentSlot] = useState("");
  
  // File & Upload States
  const [adFile, setAdFile] = useState<File | null>(null);
  const [adPreview, setAdPreview] = useState<string>("");
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Processing States (Createra Style)
  const [submitting, setSubmitting] = useState(false);
  const [submittingMessage, setSubmittingMessage] = useState("");
  const [uploadStage, setUploadStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load Razorpay script on mount
  useEffect(() => {
    if (!document.getElementById("razorpay-script")) {
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragActive(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragActive(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("File bahut badi hai. Maximum size 5MB honi chahiye.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Keval image files (JPG, PNG, WebP) allow hain.");
      return;
    }
    
    setAdFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAdPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const addSlot = () => {
    if (currentSlot.trim() && !slots.includes(currentSlot.trim())) {
      setSlots([...slots, currentSlot.trim()]);
      setCurrentSlot("");
    }
  };

  // ✅ FIXED: removeSlot function properly defined here
  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  // 🚀 WORLD-CLASS CLOUDINARY UPLOAD
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "alamnagar-uploads");
    formData.append("folder", "alamnagar/marketplace/images");
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Cloudinary Exact Error:", errorData);
      throw new Error(`Upload failed: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    let optimizedUrl = data.secure_url;
    if (optimizedUrl.includes('/image/upload/')) {
      optimizedUrl = optimizedUrl.replace('/image/upload/', '/image/upload/q_auto,f_auto,w_1200/');
    }
    return optimizedUrl;
  };

  const handlePublish = async () => {
    if (!auth.currentUser) {
      router.push("/auth");
      return;
    }

    const numPrice = parseFloat(price);
    if (!title || !description || !price || isNaN(numPrice) || numPrice <= 0 || !adFile) {
      setError("Kripya sabhi required fields bharein aur ek image upload karein.");
      return;
    }

    if (category === "service" && slots.length === 0) {
      setError("Services ke liye kam se kam ek time slot add karein.");
      return;
    }

    const listingFee = Math.max(100, Math.round(numPrice * 0.10));
    setSubmitting(true);
    setError(null);

    try {
      // Stage 1: Upload to Cloudinary
      setUploadStage(1);
      setSubmittingMessage("Media cloud par upload ho raha hai...");
      setProgress(30);
      
      const imageUrl = await uploadToCloudinary(adFile);
      setProgress(60);

      // Stage 2: Razorpay Order Creation
      setUploadStage(2);
      setSubmittingMessage("Secure payment initialize ho raha hai...");
      setProgress(75);

      const orderResult = await createRazorpayOrder(listingFee);
      if (!orderResult.success || !orderResult.order) {
        throw new Error(orderResult.error || "Payment order banane mein truti.");
      }

      const order = orderResult.order;

      // Stage 3: Open Razorpay
      setUploadStage(3);
      setSubmittingMessage("Payment complete karein...");
      setProgress(85);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Alamnagar Marketplace",
        description: `Listing Fee: ${title}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            setUploadStage(4);
            setSubmittingMessage("Payment verify aur listing save ho rahi hai...");
            setProgress(95);

            const verifyResult = await verifyRazorpayPayment(
              order.id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (!verifyResult.success) {
              throw new Error("Payment verification failed.");
            }

            const userDoc = await getDoc(doc(db, "users", auth.currentUser!.uid));
            const userData = userDoc.exists() ? userDoc.data() : {};

            await addDoc(collection(db, "listings"), {
              title: title.trim(),
              description: description.trim(),
              price: numPrice,
              listingFeePaid: listingFee,
              category,
              images: [imageUrl],
              slots: category === "service" ? slots : [],
              sellerId: auth.currentUser!.uid,
              sellerName: userData.displayName || auth.currentUser!.displayName || "User",
              sellerPhoto: userData.photoURL || auth.currentUser!.photoURL || "",
              sellerEmail: userData.email || auth.currentUser!.email || "",
              sellerBio: userData.bio || "",
              sellerLocation: userData.location || "Alamnagar",
              sellerVerified: userData.isVerified || false,
              status: "active",
              deliveryMethod: "seller_managed",
              createdAt: serverTimestamp(),
            });

            setProgress(100);
            setTimeout(() => {
              alert("🎉 Bhugtan safal! Aapki listing successfully publish ho gayi hai.");
              router.push("/marketplace");
            }, 1000);

          } catch (dbError: any) {
            console.error("DB Save Error:", dbError);
            setError(`Payment successful lekin save karne mein error. Support se contact karein.`);
            setSubmitting(false);
            setUploadStage(0);
            setProgress(0);
          }
        },
        prefill: {
          name: auth.currentUser.displayName || "",
          email: auth.currentUser.email || "",
        },
        theme: { color: "#059669" },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
            setSubmittingMessage("");
            setUploadStage(0);
            setProgress(0);
            setError("Payment cancel kar diya gaya.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setError(`Payment failed: ${response.error.description || 'Unknown error'}`);
        setSubmitting(false);
        setSubmittingMessage("");
        setUploadStage(0);
        setProgress(0);
      });
      rzp.open();

    } catch (err: any) {
      console.error("Process Error:", err);
      setError(err.message || "Listing publish karne mein truti.");
      setSubmitting(false);
      setSubmittingMessage("");
      setUploadStage(0);
      setProgress(0);
    }
  };

  const numPrice = parseFloat(price) || 0;
  const estimatedFee = numPrice > 0 ? Math.max(100, Math.round(numPrice * 0.10)) : 100;

  return (
    <main className="min-h-screen bg-stone-50 py-12 px-6 relative">
      <AnimatePresence>
        {submitting && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 bg-stone-900/95 backdrop-blur-xl flex items-center justify-center"
          >
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} 
                transition={{ duration: 4, repeat: Infinity }} 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/30 via-amber-500/30 to-emerald-500/30 rounded-full blur-[120px]" 
              />
            </div>
            
            <div className="relative z-10 max-w-md w-full mx-4 text-center">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }} 
                animate={{ scale: 1, rotate: 0 }} 
                transition={{ duration: 0.8, type: "spring" }} 
                className="flex justify-center mb-8"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }} 
                    className="w-24 h-24 rounded-full border-4 border-emerald-500/30 border-t-emerald-500" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {uploadStage === 1 && <Cloud className="w-10 h-10 text-emerald-500" />}
                    {uploadStage === 2 && <CreditCard className="w-10 h-10 text-amber-500" />}
                    {uploadStage === 3 && <Zap className="w-10 h-10 text-amber-500" />}
                    {uploadStage === 4 && <CheckCircle2 className="w-10 h-10 text-emerald-500" />}
                  </div>
                </div>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <motion.h2 key={uploadStage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-white mb-2">
                  {uploadStage === 1 && "Media Upload Ho Raha Hai"}
                  {uploadStage === 2 && "Payment Initialize Ho Raha Hai"}
                  {uploadStage === 3 && "Payment Complete Karein"}
                  {uploadStage === 4 && "Listing Save Ho Rahi Hai!"}
                </motion.h2>
                <p className="text-stone-400 text-sm font-mono uppercase tracking-wider">{submittingMessage}</p>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-4">
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500 rounded-full" 
                    initial={{ width: 0 }} 
                    animate={{ width: `${progress}%` }} 
                    transition={{ duration: 0.5 }} 
                  />
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-stone-500 font-mono uppercase">Stage {uploadStage} of 4</span>
                  <span className="text-sm text-white font-mono font-bold">{Math.round(progress)}%</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden"
        >
          <div className="p-8 border-b border-stone-100 bg-gradient-to-r from-emerald-50 to-amber-50">
            <h1 className="text-3xl font-extrabold text-stone-900 mb-2">नई लिस्टिंग बनाएं</h1>
            <p className="text-stone-600">अपना उत्पाद या सेवा बाज़ार में सूचीबद्ध करें</p>
          </div>

          <div className="p-8 space-y-8">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }} 
                  className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 flex-1">{error}</p>
                  <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-3">लिस्टिंग प्रकार *</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setCategory("product")}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    category === "product" ? "border-emerald-500 bg-emerald-50" : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${category === "product" ? "bg-emerald-200" : "bg-stone-200"}`}>
                    <ImageIcon className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-stone-900">उत्पाद (Product)</p>
                    <p className="text-xs text-stone-500 mt-1">भौतिक वस्तु बेचें</p>
                  </div>
                </button>
                <button
                  onClick={() => setCategory("service")}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    category === "service" ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${category === "service" ? "bg-amber-200" : "bg-stone-200"}`}>
                    <Clock className="w-6 h-6 text-amber-700" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-stone-900">सेवा (Service)</p>
                    <p className="text-xs text-stone-500 mt-1">स्लॉट बुकिंग के साथ</p>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-3">छवि अपलोड करें (Max 5MB) *</label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !adPreview && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragActive 
                    ? "border-emerald-500 bg-emerald-50" 
                    : adPreview 
                      ? "border-emerald-500 bg-emerald-50/50" 
                      : "border-stone-300 hover:border-emerald-500 hover:bg-stone-50"
                }`}
              >
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                
                {adPreview ? (
                  <div className="relative inline-block">
                    <img src={adPreview} alt="Preview" className="max-h-64 rounded-lg shadow-md mx-auto" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setAdFile(null); setAdPreview(""); }}
                      className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-stone-600 bg-white px-3 py-1.5 rounded-full shadow-sm border border-stone-200 mx-auto w-fit">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="truncate max-w-[200px]">{adFile?.name}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-stone-100 rounded-full">
                      <UploadCloud className="w-8 h-8 text-stone-500" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-700">छवि चुनें या यहाँ ड्रैग करें</p>
                      <p className="text-sm text-stone-500 mt-1">PNG, JPG, WebP (अधिकतम 5MB)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">शीर्षक *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="जैसे: जैविक आम, गृह सेवा, आदि"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">मूल्य (₹) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
              <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900">लिस्टिंग शुल्क जानकारी</p>
                <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                  सफल लिस्टिंग के लिए न्यूनतम <strong>₹100</strong> या उत्पाद मूल्य का <strong>10%</strong> (जो भी अधिक हो) शुल्क लगेगा।
                </p>
                {numPrice > 0 && (
                  <p className="text-base font-black text-amber-700 mt-3 bg-amber-100 inline-block px-3 py-1 rounded-lg">
                    अनुमानित शुल्क: ₹{estimatedFee}
                  </p>
                )}
                <p className="text-xs text-amber-700 mt-3 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  भुगतान सफल होने के बाद ही आपकी लिस्टिंग प्रकाशित होगी। डिलीवरी की पूरी जिम्मेदारी विक्रेता (Seller) की होगी।
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">विवरण *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="अपने उत्पाद या सेवा का विस्तृत विवरण दें..."
                rows={5}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
              />
            </div>

            {category === "service" && (
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-3">उपलब्ध समय स्लॉट *</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={currentSlot}
                    onChange={(e) => setCurrentSlot(e.target.value)}
                    placeholder="जैसे: Saturday 10 AM - 12 PM"
                    className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <button
                    onClick={addSlot}
                    className="px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors"
                  >
                    जोड़ें
                  </button>
                </div>
                {slots.length > 0 && (
                  <div className="space-y-2">
                    {slots.map((slot, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-medium text-stone-700">{slot}</span>
                        </div>
                        {/* ✅ FIXED: removeSlot is now properly recognized */}
                        <button onClick={() => removeSlot(index)} className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handlePublish}
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-black rounded-xl hover:from-emerald-700 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-lg"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> प्रक्रिया चल रही है...</>
              ) : (
                <><Zap className="w-5 h-5" /> भुगतान करें और प्रकाशित करें (₹{estimatedFee})</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}