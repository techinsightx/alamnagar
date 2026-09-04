"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { UploadCloud, X, Loader2, CheckCircle, Clock, Info, ShieldCheck } from "lucide-react";
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
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<"product" | "service">("product");
  const [slots, setSlots] = useState<string[]>([]);
  const [currentSlot, setCurrentSlot] = useState("");
  const [uploading, setUploading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Razorpay script on mount
  useEffect(() => {
    if (!document.getElementById("razorpay-script")) {
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);
    }
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      alert("अधिकतम 5 छवियाँ अनुमति हैं।");
      return;
    }
    setImages([...images, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const addSlot = () => {
    if (currentSlot && !slots.includes(currentSlot)) {
      setSlots([...slots, currentSlot]);
      setCurrentSlot("");
    }
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "alamnagar_unsigned");
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await response.json();
    if (!response.ok) throw new Error("Upload failed");
    return data.secure_url;
  };

  const handlePublish = async () => {
    if (!auth.currentUser) {
      router.push("/auth");
      return;
    }

    const numPrice = parseFloat(price);
    if (!title || !description || !price || isNaN(numPrice) || numPrice <= 0 || images.length === 0) {
      alert("कृपया सभी आवश्यक फ़ील्ड भरें और कम से कम एक छवि जोड़ें।");
      return;
    }

    if (category === "service" && slots.length === 0) {
      alert("सेवाओं के लिए कृपया कम से कम एक समय स्लॉट जोड़ें।");
      return;
    }

    // 🎯 Calculate Listing Fee: Minimum ₹100 OR 10% of product cost (whichever is higher)
    const listingFee = Math.max(100, Math.round(numPrice * 0.10));

    setProcessingPayment(true);

    try {
      // 1. Create Razorpay Order for the Listing Fee
      const orderResult = await createRazorpayOrder(listingFee);
      if (!orderResult.success || !orderResult.order) {
        throw new Error("भुगतान ऑर्डर बनाने में त्रुटि।");
      }

      const order = orderResult.order;

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount, // Amount in paise
        currency: order.currency,
        name: "आलमनगर बाज़ार",
        description: "लिस्टिंग शुल्क भुगतान",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment on Server
            const verifyResult = await verifyRazorpayPayment(
              order.id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (!verifyResult.success) {
              throw new Error("भुगतान सत्यापन विफल।");
            }

            setUploading(true);

            // 4. Upload Images to Cloudinary (Only after successful payment)
            const imageUrls = await Promise.all(images.map(img => uploadToCloudinary(img)));

            // 5. Get Seller Details
            const userDoc = await getDoc(doc(db, "users", auth.currentUser!.uid));
            const userData = userDoc.exists() ? userDoc.data() : {};

            // 6. Save Listing to Firestore
            await addDoc(collection(db, "listings"), {
              title: title.trim(),
              description: description.trim(),
              price: numPrice,
              listingFeePaid: listingFee, // Record the fee paid
              category,
              images: imageUrls,
              slots: category === "service" ? slots : [],
              sellerId: auth.currentUser!.uid,
              sellerName: userData.displayName || auth.currentUser!.displayName || "User",
              sellerPhoto: userData.photoURL || auth.currentUser!.photoURL || "",
              sellerEmail: userData.email || auth.currentUser!.email || "",
              sellerBio: userData.bio || "",
              sellerLocation: userData.location || "आलमनगर",
              sellerVerified: userData.isVerified || false,
              status: "active",
              deliveryMethod: "seller_managed", // Seller will handle delivery
              createdAt: serverTimestamp(),
            });

            alert("भुगतान सफल! आपकी लिस्टिंग सफलतापूर्वक प्रकाशित हो गई है।");
            router.push("/marketplace");
          } catch (error: any) {
            console.error("Post-payment processing error:", error);
            alert("लिस्टिंग सहेजने में त्रुटि: " + error.message);
          } finally {
            setUploading(false);
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: auth.currentUser.displayName || "",
          email: auth.currentUser.email || "",
        },
        theme: {
          color: "#059669", // Emerald 600
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      alert("भुगतान प्रक्रिया शुरू करने में त्रुटि: " + error.message);
      setProcessingPayment(false);
    }
  };

  const numPrice = parseFloat(price) || 0;
  const estimatedFee = numPrice > 0 ? Math.max(100, Math.round(numPrice * 0.10)) : 100;

  return (
    <main className="min-h-screen bg-stone-50 py-12 px-6">
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
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-3">लिस्टिंग प्रकार *</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setCategory("product")}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    category === "product"
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${category === "product" ? "bg-emerald-200" : "bg-stone-200"}`}>
                    <ShieldCheck className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-stone-900">उत्पाद (Product)</p>
                    <p className="text-xs text-stone-500 mt-1">भौतिक वस्तु बेचें</p>
                  </div>
                </button>
                <button
                  onClick={() => setCategory("service")}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    category === "service"
                      ? "border-amber-500 bg-amber-50"
                      : "border-stone-200 hover:border-stone-300"
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

            {/* Images Upload */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-3">छवियाँ (अधिकतम 5) *</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-stone-50 transition-all"
              >
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                <UploadCloud className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                <p className="font-semibold text-stone-700">छवियाँ चुनें या यहाँ ड्रैग करें</p>
                <p className="text-sm text-stone-500 mt-1">PNG, JPG (अधिकतम 5MB प्रति छवि)</p>
              </div>

              {previews.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img src={preview} alt="" className="w-full h-full object-cover rounded-lg border border-stone-200" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Price */}
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

            {/* 🎯 Listing Fee Info Box */}
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
                  <ShieldCheck className="w-3 h-3" />
                  भुगतान सफल होने के बाद ही आपकी लिस्टिंग प्रकाशित होगी। डिलीवरी की पूरी जिम्मेदारी विक्रेता (Seller) की होगी।
                </p>
              </div>
            </div>

            {/* Description */}
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

            {/* Slots (Only for Services) */}
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
                        <button onClick={() => removeSlot(index)} className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handlePublish}
              disabled={processingPayment || uploading}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-black rounded-xl hover:from-emerald-700 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-lg"
            >
              {processingPayment || uploading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> प्रक्रिया चल रही है...</>
              ) : (
                <><CheckCircle className="w-5 h-5" /> भुगतान करें और प्रकाशित करें (₹{estimatedFee})</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}