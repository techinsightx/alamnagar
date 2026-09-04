"use client";

import { useState, useRef, DragEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "@/app/actions/upload";
import { Image as ImageIcon, Video, Send, X, UploadCloud, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreatePost() {
  const { user, signInWithGoogle } = useAuth();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File handle karne ka function
  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    
    // Check file type (image or video)
    if (selectedFile.type.startsWith("image/") || selectedFile.type.startsWith("video/")) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      alert("कृपया केवल छवि (Image) या वीडियो (Video) फ़ाइल चुनें।");
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!text.trim() && !file) return;

    setUploading(true);
    let mediaUrl = "";
    let mediaType = "";

    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadResult = await uploadToCloudinary(formData);
        
        if (uploadResult.success) {
          // ✅ FIX: TypeScript error resolved by adding fallback ""
          mediaUrl = uploadResult.url || "";
          mediaType = uploadResult.type || "";
        } else {
          throw new Error(uploadResult.error || "Media upload failed");
        }
      }

      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        userName: user.displayName || "आलमनगर वासी",
        userPhoto: user.photoURL || "/default-avatar.png",
        text: text,
        mediaUrl: mediaUrl,
        mediaType: mediaType,
        createdAt: serverTimestamp(),
        likes: 0,
      });

      // Reset form
      setText("");
      removeFile();
      
    } catch (error) {
      console.error("Post creation error:", error);
      alert("पोस्ट करने में त्रुटि हुई। कृपया पुनः प्रयास करें।");
    } finally {
      setUploading(false);
    }
  };

  // Agar user logged in nahi hai
  if (!user) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-stone-200 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500" />
        <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-stone-900 mb-2">समुदाय में आपका स्वागत है!</h3>
        <p className="text-stone-600 mb-6">पोस्ट करने और आलमनगर से जुड़ने के लिए कृपया लॉगिन करें</p>
        <button
          onClick={signInWithGoogle}
          className="bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 px-8 rounded-full transition-all flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google से लॉगिन करें
        </button>
      </motion.div>
    );
  }

  // Logged in User ke liye Spotlight Upload UI
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-stone-200 overflow-hidden mb-8"
    >
      {/* Top Gradient Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />

      <form onSubmit={handleSubmit} className="p-6">
        {/* User Info & Text Input */}
        <div className="flex gap-4 mb-4">
          <img 
            src={user.photoURL || "/default-avatar.png"} 
            alt="User" 
            className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-sm" 
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="आलमनगर के लिए आज क्या विशेष है? (विचार, समाचार या यादें साझा करें...)"
            className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all text-stone-800 text-lg placeholder:text-stone-400"
            rows={3}
          />
        </div>

        {/* Spotlight Drag & Drop Zone */}
        <AnimatePresence>
          {!previewUrl ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 mb-4 group
                ${isDragging 
                  ? "border-amber-500 bg-amber-50 scale-[1.02]" 
                  : "border-stone-300 hover:border-amber-400 hover:bg-stone-50"
                }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                accept="image/*,video/*"
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-3">
                <div className={`p-4 rounded-full transition-colors ${isDragging ? "bg-amber-100 text-amber-600" : "bg-stone-100 text-stone-500 group-hover:bg-amber-100 group-hover:text-amber-600"}`}>
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-stone-700 group-hover:text-amber-700 transition-colors">
                    यहाँ क्लिक करें या फ़ाइल खींचें (Drag & Drop)
                  </p>
                  <p className="text-sm text-stone-500 mt-1">
                    समर्थित: JPG, PNG, MP4 (अधिकतम 50MB)
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-2xl overflow-hidden border border-stone-200 mb-4 group bg-black"
            >
              {file?.type.startsWith("video/") ? (
                <video src={previewUrl} className="w-full max-h-[400px] object-contain" controls />
              ) : (
                <img src={previewUrl} alt="Preview" className="w-full max-h-[400px] object-contain" />
              )}
              
              {/* Remove Button */}
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-3 right-3 bg-black/60 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* File Info Badge */}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
                {file?.type.startsWith("video/") ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                <span className="truncate max-w-[200px]">{file?.name}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-full transition-all font-medium"
            >
              <ImageIcon className="w-5 h-5" />
              <span className="hidden sm:inline">फोटो</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 text-stone-600 hover:bg-amber-50 hover:text-amber-700 rounded-full transition-all font-medium"
            >
              <Video className="w-5 h-5" />
              <span className="hidden sm:inline">वीडियो</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={uploading || (!text.trim() && !file)}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-stone-300 disabled:to-stone-300 text-white font-bold py-3 px-8 rounded-full transition-all flex items-center gap-2 shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 disabled:translate-y-0 disabled:shadow-none"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>अपलोड हो रहा है...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Spotlight में पोस्ट करें</span>
                <Send className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}