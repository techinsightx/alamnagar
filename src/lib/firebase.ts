import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// .env.local file se configuration load karo
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Debugging ke liye: Check karo ki .env variables load hue hain ya nahi
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.warn("⚠️ Firebase config missing! Please check your .env.local file.");
}

// Next.js mein hot-reloading ke time multiple initialization se bachne ke liye ye check zaroori hai
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Services export karo taaki pura project mein use kar sako
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);