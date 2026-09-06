"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Image as ImageIcon, UploadCloud, X, Heart, MapPin, 
  Calendar, User, Camera, Sparkles, Loader2, CheckCircle,
  Filter, Star, MessageCircle, Cloud, Zap, CheckCircle2, AlertCircle
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, doc, getDoc, updateDoc, increment, arrayUnion, arrayRemove
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

// ══════════════════════════════════════════════════════════
// 🍞 CUSTOM TOAST NOTIFICATION COMPONENT
// ══════════════════════════════════════════════════════════
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border ${
        type === 'success' 
          ? 'bg-emerald-900/90 border-emerald-500/30 text-emerald-100 backdrop-blur-md' 
          : 'bg-red-900/90 border-red-500/30 text-red-100 backdrop-blur-md'
      }`}
    >
      {type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
      <span className="font-semibold text-sm">{message}</span>
    </motion.div>
  );
};

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  story: string;
  category: "event" | "space" | "adventure" | "legacy";
  uploadedBy: string;
  uploaderName: string;
  uploaderPhoto: string;
  location: string;
  likes: number;
  likedBy: string[];
  createdAt: any;
}

const CATEGORIES = [
  { id: "all", label: "सभी", icon: Sparkles },
  { id: "event", label: "कार्यक्रम", icon: Calendar },
  { id: "space", label: "स्थान", icon: MapPin },
  { id: "adventure", label: "रोमांच", icon: Camera },
  { id: "legacy", label: "विरासत", icon: Star },
];

export default function GalleryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  
  // Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadStory, setUploadStory] = useState("");
  const [uploadCategory, setUploadCategory] = useState<"event" | "space" | "adventure" | "legacy">("event");
  const [uploadLocation, setUploadLocation] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // Cinematic Upload State
  const [uploadStage, setUploadStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const imgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage));
      setImages(imgs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragActive(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragActive(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelectFile(file);
  };

  const handleFileSelectFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("कृपया केवल छवि (Image) फ़ाइल चुनें।", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("छवि 10MB से कम होनी चाहिए।", "error");
      return;
    }
    setUploadFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setUploadPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelectFile(file);
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "alamnagar-uploads");
    formData.append("folder", "alamnagar/gallery");
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Upload failed");
    }
    
    const data = await response.json();
    let optimizedUrl = data.secure_url;
    if (optimizedUrl.includes('/image/upload/')) {
      optimizedUrl = optimizedUrl.replace('/image/upload/', '/image/upload/q_auto,f_auto,w_1200/');
    }
    return optimizedUrl;
  };

  const handleUpload = async () => {
    if (!user || !uploadFile || !uploadTitle.trim() || !uploadStory.trim()) {
      showToast("कृपया सभी आवश्यक फ़ील्ड भरें और एक छवि चुनें।", "error");
      return;
    }

    setUploading(true);
    setUploadStage(1);
    setProgress(20);
    setUploadMessage("छवि क्लाउड पर अपलोड हो रही है...");

    try {
      const imageUrl = await uploadToCloudinary(uploadFile);
      setProgress(60);
      setUploadStage(2);
      setUploadMessage("विरासत में सहेजा जा रहा है...");

      await addDoc(collection(db, "gallery"), {
        url: imageUrl,
        title: uploadTitle.trim(),
        story: uploadStory.trim(),
        category: uploadCategory,
        uploadedBy: user.uid,
        uploaderName: user.displayName || "आलमनगर वासी",
        uploaderPhoto: user.photoURL || "",
        location: uploadLocation.trim() || "आलमनगर",
        likes: 0,
        likedBy: [],
        createdAt: serverTimestamp(),
      });

      setProgress(100);
      setUploadStage(3);
      
      setTimeout(() => {
        showToast("तस्वीर सफलतापूर्वक विरासत में जोड़ दी गई!", "success");
        setUploadFile(null);
        setUploadPreview("");
        setUploadTitle("");
        setUploadStory("");
        setUploadLocation("");
        setShowUploadModal(false);
        setUploading(false);
        setUploadStage(0);
        setProgress(0);
      }, 1000);

    } catch (error: any) {
      console.error("Upload error:", error);
      showToast(error.message || "अपलोड करने में त्रुटि हुई।", "error");
      setUploading(false);
      setUploadStage(0);
      setProgress(0);
    }
  };

  const handleLike = async (imageId: string, currentLikes: number, currentLikedBy: string[]) => {
    if (!user) {
      router.push("/auth");
      return;
    }
    const isLiked = currentLikedBy.includes(user.uid);
    const imageRef = doc(db, "gallery", imageId);
    
    try {
      if (isLiked) {
        await updateDoc(imageRef, {
          likes: increment(-1),
          likedBy: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(imageRef, {
          likes: increment(1),
          likedBy: arrayUnion(user.uid)
        });
      }
    } catch (error) {
      console.error("Like error:", error);
      showToast("सराहना व्यक्त करने में त्रुटि हुई।", "error");
    }
  };

  const filteredImages = activeCategory === "all" 
    ? images 
    : images.filter(img => img.category === activeCategory);

  return (
    <main className="min-h-screen bg-stone-50 relative">
      <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>

      {/* 🎬 CINEMATIC UPLOAD OVERLAY */}
      <AnimatePresence>
        {uploading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-stone-900/95 backdrop-blur-xl flex items-center justify-center"
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
                    {uploadStage === 2 && <Zap className="w-10 h-10 text-amber-500" />}
                    {uploadStage === 3 && <CheckCircle2 className="w-10 h-10 text-emerald-500" />}
                  </div>
                </div>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <motion.h2 key={uploadStage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-white mb-2">
                  {uploadStage === 1 && "छवि अपलोड हो रही है"}
                  {uploadStage === 2 && "विरासत में सहेजा जा रहा है"}
                  {uploadStage === 3 && "सफलतापूर्वक जोड़ दिया गया!"}
                </motion.h2>
                <p className="text-stone-400 text-sm font-mono uppercase tracking-wider">{uploadMessage}</p>
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
                  <span className="text-xs text-stone-500 font-mono uppercase">Stage {uploadStage} of 3</span>
                  <span className="text-sm text-white font-mono font-bold">{Math.round(progress)}%</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🌟 Cinematic Hero Section */}
      <section className="relative bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518176258769-f227c798150e?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/50 via-stone-900/80 to-stone-50" />
        
        <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-bold uppercase tracking-wider">आलमनगर की डिजिटल विरासत</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              हमारा गाँव, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">हमारी कहानियाँ</span>
            </h1>
            <p className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              अपने सर्वश्रेष्ठ क्षणों, सुंदर स्थानों और रोमांचक अनुभवों को साझा करें। 
              आपकी हर तस्वीर आलमनगर की अमिट विरासत का एक नया पन्ना है।
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => user ? setShowUploadModal(true) : router.push("/auth")}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all"
            >
              <UploadCloud className="w-5 h-5" />
              अपनी तस्वीर से विरासत रचें
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* 🖼️ Gallery Content */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all ${
                  isActive
                    ? "bg-stone-900 text-white shadow-lg"
                    : "bg-white text-stone-600 border border-stone-200 hover:border-emerald-500 hover:text-emerald-600"
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ✅ FIXED: Descriptive Loading State & Premium Empty State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-600 mb-4"
            />
            <p className="text-stone-500 font-medium animate-pulse">आलमनगर की यादें लोड हो रही हैं...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-3xl border border-stone-200 shadow-sm"
          >
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-10 h-10 text-stone-400" />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-3">अभी विरासत में कोई तस्वीर नहीं जुड़ी है</h3>
            <p className="text-stone-500 mb-8 max-w-md mx-auto">
              {activeCategory === "all" 
                ? "सबसे पहली तस्वीर अपलोड करके आलमनगर की डिजिटल विरासत की शुरुआत आप करें!" 
                : `इस श्रेणी में अभी कोई तस्वीर नहीं है। "${CATEGORIES.find(c => c.id === activeCategory)?.label}" की पहली याद साझा करें!`}
            </p>
            <button
              onClick={() => user ? setShowUploadModal(true) : router.push("/auth")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <UploadCloud className="w-5 h-5" />
              तस्वीर अपलोड करें
            </button>
          </motion.div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            <AnimatePresence>
              {filteredImages.map((img, index) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="break-inside-avoid group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-stone-100"
                  onClick={() => setSelectedImage(img)}
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={img.url} 
                      alt={img.title} 
                      className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span className="text-xs font-medium">{img.location}</span>
                      </div>
                      <h3 className="font-bold text-lg leading-tight">{img.title}</h3>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-stone-200 overflow-hidden">
                          {img.uploaderPhoto ? (
                            <img src={img.uploaderPhoto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-stone-500" />
                          )}
                        </div>
                        <span className="text-xs text-stone-600 font-medium truncate max-w-[100px]">
                          {img.uploaderName}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(img.id, img.likes, img.likedBy);
                        }}
                        className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                          user && img.likedBy.includes(user.uid) ? "text-red-500" : "text-stone-500 hover:text-red-500"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${user && img.likedBy.includes(user.uid) ? "fill-current" : ""}`} />
                        {img.likes}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* 📤 Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !uploading && setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-white/95 backdrop-blur z-10 p-6 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-stone-900">विरासत में अपना योगदान दें</h2>
                  <p className="text-sm text-stone-500">अपनी तस्वीर और उसके पीछे की कहानी साझा करें</p>
                </div>
                <button onClick={() => !uploading && setShowUploadModal(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-stone-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !uploadPreview && fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    isDragActive 
                      ? "border-emerald-500 bg-emerald-50" 
                      : uploadPreview 
                        ? "border-emerald-500 bg-emerald-50/50" 
                        : "border-stone-300 hover:border-emerald-500 hover:bg-stone-50"
                  }`}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  {uploadPreview ? (
                    <div className="relative inline-block">
                      <img src={uploadPreview} alt="Preview" className="max-h-64 mx-auto rounded-xl shadow-md" />
                      <button
                        onClick={(e) => { e.stopPropagation(); setUploadFile(null); setUploadPreview(""); }}
                        className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-stone-600 bg-white px-3 py-1.5 rounded-full shadow-sm border border-stone-200 mx-auto w-fit">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="truncate max-w-[200px]">{uploadFile?.name}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-stone-100 rounded-full">
                        <UploadCloud className={`w-8 h-8 ${isDragActive ? "text-emerald-600" : "text-stone-500"}`} />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{isDragActive ? "यहाँ छोड़ें (Drop)" : "तस्वीर चुनें या यहाँ ड्रैग करें"}</p>
                        <p className="text-sm text-stone-500 mt-1">PNG, JPG अधिकतम 10MB</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">शीर्षक *</label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="जैसे: दीपावली का भव्य आयोजन"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-2">श्रेणी *</label>
                      <select
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value as any)}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none"
                      >
                        <option value="event">कार्यक्रम (Event)</option>
                        <option value="space">स्थान (Space)</option>
                        <option value="adventure">रोमांच (Adventure)</option>
                        <option value="legacy">विरासत (Legacy)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-2">स्थान (Location)</label>
                      <input
                        type="text"
                        value={uploadLocation}
                        onChange={(e) => setUploadLocation(e.target.value)}
                        placeholder="जैसे: ग्राम सभा भवन"
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" /> इस तस्वीर के पीछे की कहानी *
                    </label>
                    <textarea
                      value={uploadStory}
                      onChange={(e) => setUploadStory(e.target.value)}
                      placeholder="यह तस्वीर कब और क्यों ली गई थी? इसमें क्या खास है?"
                      rows={4}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={uploading || !uploadFile || !uploadTitle.trim() || !uploadStory.trim()}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {uploading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> प्रक्रिया चल रही है...</>
                  ) : (
                    <><CheckCircle className="w-5 h-5" /> विरासत में जोड़ें</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔍 Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10">
              <X className="w-6 h-6 text-white" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-stone-900 rounded-3xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-2xl"
            >
              <div className="md:w-3/5 bg-black flex items-center justify-center p-4 md:p-8">
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.title} 
                  className="max-h-[60vh] md:max-h-[80vh] w-auto object-contain rounded-lg"
                />
              </div>

              <div className="md:w-2/5 p-6 md:p-8 flex flex-col overflow-y-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-stone-800 overflow-hidden flex items-center justify-center">
                      {selectedImage.uploaderPhoto ? (
                        <img src={selectedImage.uploaderPhoto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-stone-400" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-white">{selectedImage.uploaderName}</p>
                    <p className="text-xs text-stone-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {selectedImage.location}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                    {CATEGORIES.find(c => c.id === selectedImage.category)?.label}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 leading-tight">
                    {selectedImage.title}
                  </h2>
                  <p className="text-stone-300 leading-relaxed whitespace-pre-wrap">
                    {selectedImage.story}
                  </p>
                </div>

                <div className="mt-auto pt-6 border-t border-stone-800 flex items-center justify-between">
                  <button
                    onClick={() => handleLike(selectedImage.id, selectedImage.likes, selectedImage.likedBy)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                      user && selectedImage.likedBy.includes(user.uid)
                        ? "bg-red-500/20 text-red-400"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${user && selectedImage.likedBy.includes(user.uid) ? "fill-current" : ""}`} />
                    {selectedImage.likes} सराहना
                  </button>
                  <p className="text-xs text-stone-500">
                    {selectedImage.createdAt?.toDate ? selectedImage.createdAt.toDate().toLocaleDateString('hi-IN') : ""}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}