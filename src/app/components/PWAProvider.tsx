// components/PWAProvider.tsx
"use client";

import { useEffect } from "react";

export default function PWAProvider() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("✅ PWA Service Worker registered successfully:", registration.scope);
          })
          .catch((registrationError) => {
            console.log("❌ PWA Service Worker registration failed:", registrationError);
          });
      });
    }
  }, []);

  return null; // Ye component UI render nahi karta, sirf background mein kaam karta hai
}