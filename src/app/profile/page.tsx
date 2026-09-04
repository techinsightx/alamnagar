"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Camera, Loader2, Save, ArrowLeft, Image as ImageIcon,
  Edit3, X, Heart, Eye, MessageSquare, Star, LogOut, Calendar,
  MapPin, Link as LinkIcon, CheckCircle, AlertCircle
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { 
  doc, getDoc, updateDoc, serverTimestamp, 
  collection, query, where, onSnapshot 
} from "firebase/firestore";
import { updateProfile, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  bio: string;
  location: string;
  website: string;
  createdAt: any;
  isVerified: boolean;
}

interface PostStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
}

interface UserPost {
  id: string;
  title: string;
  content: string;
  mediaUrl: string;
  mediaType: string;
  likes: number;
  comments: number;
  views: number;
  shares: number;
  hashtags: string[];
  createdAt: any;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState<PostStats>({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0
  });
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        router.push("/auth");
        return;
      }
      
      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setUser(data);
        setName(data.displayName || "");
        setBio(data.bio || "");
        setLocation(data.location || "");
        setWebsite(data.website || "");
        setPhotoURL(data.photoURL || currentUser.photoURL || "");
      } else {
        await updateDoc(docRef, {
          uid: currentUser.uid,
          displayName: currentUser.displayName || "User",
          email: currentUser.email,
          photoURL: currentUser.photoURL || "",
          bio: "आलमनगर समुदाय का हिस्सा",
          location: "",
          website: "",
          createdAt: serverTimestamp(),
          isVerified: false,
        });
        const newDoc = await getDoc(docRef);
        if (newDoc.exists()) {
          setUser(newDoc.data() as UserProfile);
        }
      }
      
      setLoading(false);
    };
    
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (!user?.uid) return;
    
    const postsQuery = query(
      collection(db, "spotlights"),
      where("userId", "==", user.uid)
    );
    
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const posts: UserPost[] = snapshot.docs.map((d) => ({
        id: d.id,
        title: d.data().title || "",
        content: d.data().content || "",
        mediaUrl: d.data().mediaUrl || "",
        mediaType: d.data().mediaType || "",
        likes: d.data().likes || 0,
        comments: d.data().comments || 0,
        views: d.data().views || 0,
        shares: d.data().shares || 0,
        hashtags: d.data().hashtags || [],
        createdAt: d.data().createdAt || null,
      }));
      
      setUserPosts(posts);
      
      const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
      const totalComments = posts.reduce((sum, post) => sum + post.comments, 0);
      const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
      
      setStats({
        totalPosts: posts.length,
        totalLikes,
        totalComments,
        totalViews
      });
    });
    
    return () => unsubscribe();
  }, [user?.uid]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: "छवि 5MB से कम होनी चाहिए।", type: "error" });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "alamnagar_unsigned");
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      
      const data = await response.json();
      setPhotoURL(data.secure_url);
      setToast({ message: "छवि सफलतापूर्वक अपलोड हो गई!", type: "success" });
    } catch (error) {
      console.error("Image upload error:", error);
      setToast({ message: "छवि अपलोड करने में त्रुटि हुई।", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    try {
      await updateProfile(auth.currentUser!, { 
        displayName: name, 
        photoURL: photoURL 
      });
      
      await updateDoc(doc(db, "users", user.uid), {
        displayName: name,
        photoURL: photoURL,
        bio: bio,
        location: location,
        website: website,
        updatedAt: serverTimestamp(),
      });
      
      setUser({
        ...user,
        displayName: name,
        photoURL: photoURL,
        bio: bio,
        location: location,
        website: website,
      });
      
      setEditing(false);
      setToast({ message: "प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!", type: "success" });
    } catch (error) {
      console.error("Profile update error:", error);
      setToast({ message: "प्रोफ़ाइल अपडेट करने में त्रुटि हुई।", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      setToast({ message: "लॉगआउट करने में त्रुटि हुई।", type: "error" });
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-600">उपयोगकर्ता नहीं मिला।</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 pb-20">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-semibold text-sm">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/community" className="inline-flex items-center gap-2 text-emerald-700 font-bold mb-8 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="w-5 h-5" /> वापस जाएं
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden mb-6"
        >
          <div className="h-40 bg-gradient-to-r from-emerald-600 via-green-600 to-amber-500 relative">
            <div className="absolute inset-0 bg-black/10" />
          </div>
          
          <div className="px-8 pb-8 relative">
            <div className="relative -mt-20 mb-6 flex justify-between items-end">
              <div className="relative group">
                <div className="w-36 h-36 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-stone-100 flex items-center justify-center">
                  {photoURL ? (
                    <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-20 h-20 text-stone-400" />
                  )}
                </div>
                {editing && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-2 right-2 p-3 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>

              <div className="flex gap-3">
                {editing ? (
                  <>
                    <button onClick={() => setEditing(false)} className="px-6 py-2.5 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200 transition-colors flex items-center gap-2">
                      <X className="w-4 h-4" /> रद्द करें
                    </button>
                    <button onClick={handleSave} disabled={saving || uploading} className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-amber-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg">
                      {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> सेव हो रहा है...</> : <><Save className="w-4 h-4" /> सेव करें</>}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditing(true)} className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-amber-700 transition-all flex items-center gap-2 shadow-lg">
                      <Edit3 className="w-4 h-4" /> प्रोफ़ाइल संपादित करें
                    </button>
                    <button onClick={handleLogout} className="px-6 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> लॉगआउट
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center gap-2"><User className="w-4 h-4" /> पूरा नाम</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center gap-2"><Mail className="w-4 h-4" /> ईमेल (अपरिवर्तनीय)</label>
                      <input type="email" value={user.email || ""} disabled className="w-full px-4 py-3 bg-stone-100 border border-stone-200 rounded-xl text-stone-500 cursor-not-allowed" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-extrabold text-stone-900">{name}</h1>
                      {user.isVerified && (
                        <div className="p-1 bg-emerald-500 rounded-full"><CheckCircle className="w-5 h-5 text-white" /></div>
                      )}
                    </div>
                    <p className="text-stone-500 flex items-center gap-2"><Mail className="w-4 h-4" /> {user.email}</p>
                  </>
                )}
              </div>

              {editing ? (
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">अपने बारे में</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="आलमनगर के बारे में आपकी सोच..." className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none" />
                </div>
              ) : (
                bio && <p className="text-stone-700 text-lg leading-relaxed">{bio}</p>
              )}

              {editing ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" /> स्थान</label>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="आलमनगर, मधेपुरा" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center gap-2"><LinkIcon className="w-4 h-4" /> वेबसाइट</label>
                    <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://alamnagar.in" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" />
                  </div>
                </div>
              ) : (
                (location || website) && (
                  <div className="flex flex-wrap gap-4 text-stone-600">
                    {location && <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {location}</span>}
                    {website && (
                      <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors">
                        <LinkIcon className="w-4 h-4" /> {website}
                      </a>
                    )}
                  </div>
                )
              )}

              <div className="flex items-center gap-2 text-stone-500 text-sm">
                <Calendar className="w-4 h-4" />
                <span>सदस्य बने: {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-emerald-600" />
              <span className="text-3xl font-extrabold text-stone-900">{stats.totalPosts}</span>
            </div>
            <p className="text-stone-600 font-medium">पोस्ट</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-8 h-8 text-red-500" />
              <span className="text-3xl font-extrabold text-stone-900">{stats.totalLikes}</span>
            </div>
            <p className="text-stone-600 font-medium">लाइक</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-extrabold text-stone-900">{stats.totalComments}</span>
            </div>
            <p className="text-stone-600 font-medium">टिप्पणियाँ</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-amber-500" />
              <span className="text-3xl font-extrabold text-stone-900">{stats.totalViews}</span>
            </div>
            <p className="text-stone-600 font-medium">व्यूज़</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden"
        >
          <div className="p-6 border-b border-stone-100">
            <h2 className="text-2xl font-extrabold text-stone-900 flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-500" /> मेरी पोस्ट
            </h2>
          </div>

          {userPosts.length === 0 ? (
            <div className="p-12 text-center">
              <Star className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500 text-lg mb-4">अभी तक कोई पोस्ट नहीं</p>
              <Link href="/community" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-amber-700 transition-all">
                पहली पोस्ट करें
              </Link>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {userPosts.map((post) => (
                <div key={post.id} className="border border-stone-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  {post.title && <h3 className="text-lg font-bold text-stone-900 mb-2">{post.title}</h3>}
                  {post.content && <p className="text-stone-700 mb-3 line-clamp-2">{post.content}</p>}
                  {post.mediaUrl && (
                    <div className="mb-3 rounded-lg overflow-hidden">
                      {post.mediaType === "video" ? (
                        <video src={post.mediaUrl} className="w-full max-h-64 object-cover" controls />
                      ) : (
                        <img src={post.mediaUrl} alt="" className="w-full max-h-64 object-cover" />
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-stone-500">
                    <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {post.likes}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {post.comments}</span>
                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {post.views}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}