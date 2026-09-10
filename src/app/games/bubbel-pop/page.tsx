// src/app/games/bubble-pop/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Play, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";

// Bright, kid-friendly colors
const BUBBLE_COLORS = [
  "bg-pink-400", "bg-blue-400", "bg-yellow-400", 
  "bg-green-400", "bg-purple-400", "bg-orange-400"
];

interface Bubble {
  id: number;
  x: number; // percentage 0-100
  size: number; // pixels
  color: string;
  duration: number; // seconds to float up
  delay: number;
}

export default function BubblePopGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [nextId, setNextId] = useState(0);
  const [poppedEffects, setPoppedEffects] = useState<{id: number, x: number, y: number}[]>([]);

  // Start Game
  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setBubbles([]);
    setIsPlaying(true);
  };

  // Timer Logic
  useEffect(() => {
    if (!isPlaying) return;
    if (timeLeft <= 0) {
      setIsPlaying(false);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  // Spawn Bubbles
  useEffect(() => {
    if (!isPlaying) return;
    
    const spawnInterval = setInterval(() => {
      // Limit max bubbles on screen for performance
      setBubbles((prev) => {
        if (prev.length >= 12) return prev; 
        
        const newBubble: Bubble = {
          id: nextId,
          x: Math.random() * 90 + 5, // 5% to 95% width
          size: Math.random() * 40 + 60, // 60px to 100px
          color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
          duration: Math.random() * 3 + 4, // 4 to 7 seconds float time
          delay: 0,
        };
        setNextId((id) => id + 1);
        return [...prev, newBubble];
      });
    }, 600); // New bubble every 600ms

    return () => clearInterval(spawnInterval);
  }, [isPlaying, nextId]);

  // Pop Bubble
  const popBubble = (id: number, x: number) => {
    setScore((s) => s + 10);
    
    // Add pop effect
    setPoppedEffects(prev => [...prev, { id: Date.now(), x, y: 0 }]); // y doesn't matter much for simple effect
    setTimeout(() => {
        setPoppedEffects(prev => prev.filter(e => e.id !== Date.now())); // cleanup would be better with unique IDs, but this is fine for simple effect
    }, 500);

    // Remove bubble
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-500 relative overflow-hidden select-none">
      {/* Background Clouds (Decorative) */}
      <div className="absolute top-10 left-10 w-32 h-16 bg-white/40 rounded-full blur-xl" />
      <div className="absolute top-20 right-20 w-48 h-24 bg-white/30 rounded-full blur-2xl" />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-black/10 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2 text-white font-bold hover:bg-white/20 px-4 py-2 rounded-full transition">
          <ArrowLeft className="w-5 h-5" /> Home
        </Link>
        
        {isPlaying && (
          <div className="flex gap-4">
            <div className="bg-white/90 text-sky-600 px-6 py-2 rounded-full font-black text-xl shadow-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              {score}
            </div>
            <div className="bg-white/90 text-rose-500 px-6 py-2 rounded-full font-black text-xl shadow-lg">
              ⏰ {timeLeft}s
            </div>
          </div>
        )}
      </div>

      {/* Game Area */}
      <div className="absolute inset-0 z-10">
        <AnimatePresence>
          {bubbles.map((bubble) => (
            <motion.div
              key={bubble.id}
              initial={{ y: "110vh", x: `${bubble.x}vw` }}
              animate={{ y: "-20vh" }}
              transition={{ duration: bubble.duration, ease: "linear" }}
              onHoverStart={() => {}} // Optional: pop on hover for desktop
              onClick={() => popBubble(bubble.id, bubble.x)}
              className={`absolute rounded-full ${bubble.color} shadow-lg cursor-pointer border-4 border-white/30 flex items-center justify-center`}
              style={{ width: bubble.size, height: bubble.size, left: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {/* Bubble Shine */}
              <div className="absolute top-2 left-3 w-1/3 h-1/3 bg-white/60 rounded-full blur-sm" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pop Effects (Stars/Confetti) */}
        <AnimatePresence>
           {/* Simple visual feedback could be added here, but the tap scale effect is often enough for kids */}
        </AnimatePresence>
      </div>

      {/* Start Screen Overlay */}
      {!isPlaying && timeLeft === 60 && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/30 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }}
            className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-md mx-4"
          >
            <div className="text-6xl mb-4">🫧</div>
            <h1 className="text-4xl font-black text-sky-600 mb-2">Bubble Pop!</h1>
            <p className="text-gray-600 mb-8 text-lg">Bubbles ko pop karo aur stars jama karo!</p>
            
            <button 
              onClick={startGame}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black text-2xl px-10 py-5 rounded-full shadow-xl hover:scale-105 transition-transform flex items-center gap-3 mx-auto"
            >
              <Play className="w-6 h-6 fill-white" /> Play Game
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Game Over Overlay */}
      {!isPlaying && timeLeft === 0 && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-md mx-4"
          >
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4 fill-yellow-500" />
            <h2 className="text-4xl font-black text-gray-800 mb-2">Time Up!</h2>
            <p className="text-gray-600 mb-2 text-lg">Tumhara Score:</p>
            <div className="text-6xl font-black text-sky-600 mb-8">{score}</div>
            
            <button 
              onClick={startGame}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-xl px-8 py-4 rounded-full shadow-xl hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-5 h-5" /> Play Again
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}