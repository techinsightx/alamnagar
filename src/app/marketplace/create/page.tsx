"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { UploadCloud, X, Loader2, CheckCircle, Calendar, Clock } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function CreateListingPage() {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("product");
  const [slots, setSlots] = useState<string[]>([]);
  const [currentSlot, setCurrentSlot] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      alert("Maximum 5 images allowed");
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
    return data.secure_url;
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      router.push("/auth");
      return;
    }

    if (!title || !description || !price || images.length === 0) {
      alert("Please fill all required fields and add at least one image");
      return;
    }

    if (category === "service" && slots.length === 0) {
      alert("Please add at least one time slot for services");
      return;
    }

    setUploading(true);
    try {
      // Upload images to Cloudinary
      const imageUrls = await Promise.all(images.map(img => uploadToCloudinary(img)));

      // Get seller details
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

      // Create listing
      await addDoc(collection(db, "listings"), {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category,
        images: imageUrls,
        slots: category === "service" ? slots : [],
        sellerId: auth.currentUser.uid,
        sellerName: userData.displayName || auth.currentUser.displayName || "User",
        sellerPhoto: userData.photoURL || auth.currentUser.photoURL || "",
        sellerEmail: userData.email || auth.currentUser.email || "",
        sellerBio: userData.bio || "",
        sellerLocation: userData.location || "",
        sellerVerified: userData.isVerified || false,
        status: "active",
        createdAt: serverTimestamp(),
      });

      alert("Listing created successfully!");
      router.push("/marketplace");
    } catch (error) {
      console.error("Listing creation error:", error);
      alert("Failed to create listing");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden"
        >
          <div className="p-8 border-b border-stone-100">
            <h1 className="text-3xl font-extrabold text-stone-900 mb-2">नई लिस्टिंग बनाएं</h1>
            <p className="text-stone-500">अपना उत्पाद या सेवा बाज़ार में सूचीबद्ध करें</p>
          </div>

          <div className="p-8 space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-3">लिस्टिंग प्रकार *</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setCategory("product")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    category === "product"
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <p className="font-bold text-stone-900">उत्पाद (Product)</p>
                  <p className="text-sm text-stone-500 mt-1">भौतिक वस्तु बेचें</p>
                </button>
                <button
                  onClick={() => setCategory("service")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    category === "service"
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <p className="font-bold text-stone-900">सेवा (Service)</p>
                  <p className="text-sm text-stone-500 mt-1">स्लॉट बुकिंग के साथ</p>
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
                    <div key={index} className="relative group">
                      <img src={preview} alt="" className="w-full h-24 object-cover rounded-lg" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
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

            {/* Price */}
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
                    className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <button
                    onClick={addSlot}
                    className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    जोड़ें
                  </button>
                </div>
                {slots.length > 0 && (
                  <div className="space-y-2">
                    {slots.map((slot, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium text-stone-700">{slot}</span>
                        </div>
                        <button onClick={() => removeSlot(index)} className="text-red-500 hover:text-red-600">
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
              onClick={handleSubmit}
              disabled={uploading}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-amber-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            >
              {uploading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> अपलोड हो रहा है...</>
              ) : (
                <><CheckCircle className="w-5 h-5" /> लिस्टिंग प्रकाशित करें</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}