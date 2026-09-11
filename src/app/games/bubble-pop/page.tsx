"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Play, RotateCcw, Sparkles, Star } from "lucide-react";
import Link from "next/link";

// 11+ Vibrant Balloon Gradients for a premium 3D look
const BALLOON_STYLES = [
  "bg-gradient-to-br from-pink-400 via-pink-500 to-rose-600",
  "bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600",
  "bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500",
  "bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600",
  "bg-gradient-to-br from-purple-400 via-purple-500 to-fuchsia-600",
  "bg-gradient-to-br from-orange-400 via-orange-500 to-red-600",
  "bg-gradient-to-br from-cyan-300 via-cyan-400 to-blue-500",
  "bg-gradient-to-br from-lime-400 via-lime-500 to-green-600",
  "bg-gradient-to-br from-rose-400 via-rose-500 to-pink-600",
  "bg-gradient-to-br from-violet-400 via-violet-500 to-purple-600",
  "bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500",
];

const POP_EMOJIS = ["🌟", "🍬", "🧸", "🎈", "🍭", "🎁", "🦋", "💎", "🍉", "🎀", "🍕", "🚀"];

interface Balloon {
  id: number;
  x: number;
  size: number;
  style: string;
  duration: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  tx: number;
  ty: number;
  rotate: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
}

interface Shockwave {
  id: number;
  x: number;
  y: number;
  size: number;
}

export default function BubblePopGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [shockwaves, setShockwaves] = useState<Shockwave[]>([]);
  const [nextId, setNextId] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("bubblePopHighScore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setBalloons([]);
    setParticles([]);
    setFloatingTexts([]);
    setShockwaves([]);
    setIsPlaying(true);
  };

  // Timer Logic
  useEffect(() => {
    if (!isPlaying) return;
    if (timeLeft <= 0) {
      setIsPlaying(false);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("bubblePopHighScore", score.toString());
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, score, highScore]);

  // ✅ FIXED: Balanced Spawn Rate (800ms, max 8 balloons)
  useEffect(() => {
    if (!isPlaying) return;
    const spawnInterval = setInterval(() => {
      setBalloons((prev) => {
        if (prev.length >= 8) return prev; // Reduced max from 15 to 8
        const newBalloon: Balloon = {
          id: nextId,
          x: Math.random() * 80 + 10, // 10% to 90% screen width
          size: Math.random() * 50 + 80, // 80px to 130px (slightly bigger)
          style: BALLOON_STYLES[Math.floor(Math.random() * BALLOON_STYLES.length)],
          duration: Math.random() * 3 + 5, // 5 to 8 seconds (slightly slower for better tracking)
        };
        setNextId((id) => id + 1);
        return [...prev, newBalloon];
      });
    }, 800); // Increased from 400ms to 800ms
    return () => clearInterval(spawnInterval);
  }, [isPlaying, nextId]);

  // ✅ FIXED: Ultra Explosive Burst with Shockwave + 16 Particles
  const popBalloon = useCallback((id: number, x: number, size: number) => {
    setScore((s) => s + 10);
    setBalloons((prev) => prev.filter((b) => b.id !== id));

    const centerX = x;
    const centerY = 50; 

    // 1. Shockwave Ring Effect
    const waveId = Date.now();
    setShockwaves((prev) => [...prev, { id: waveId, x: centerX, y: centerY, size }]);
    setTimeout(() => {
      setShockwaves((prev) => prev.filter((w) => w.id !== waveId));
    }, 500);

    // 2. Rich Particle Explosion (16 particles)
    const newParticles: Particle[] = [];
    const particleCount = 16;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 120 + Math.random() * 180; // Wider explosion radius
      newParticles.push({
        id: Date.now() + i,
        x: centerX,
        y: centerY,
        emoji: POP_EMOJIS[Math.floor(Math.random() * POP_EMOJIS.length)],
        tx: Math.cos(angle) * velocity,
        ty: Math.sin(angle) * velocity - 80, // Upward bias for gravity feel
        rotate: Math.random() * 720 - 360,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);

    // 3. Floating "+10" Text
    const textId = Date.now() + 999;
    setFloatingTexts((prev) => [...prev, { id: textId, x: centerX, y: centerY, text: "+10" }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== textId));
    }, 800);

    // Cleanup particles
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-400 to-indigo-500 relative overflow-hidden select-none font-sans">
      {/* Animated Background Clouds */}
      <motion.div animate={{ x: [0, 50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-10 left-10 w-40 h-20 bg-white/30 rounded-full blur-2xl" />
      <motion.div animate={{ x: [0, -70, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-20 right-20 w-60 h-32 bg-white/20 rounded-full blur-3xl" />
      <motion.div animate={{ x: [0, 30, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 left-1/4 w-48 h-24 bg-white/25 rounded-full blur-2xl" />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-white font-bold hover:bg-white/20 px-4 py-2 rounded-full transition bg-black/30 backdrop-blur-md border border-white/30 shadow-lg">
          <ArrowLeft className="w-5 h-5" /> Home
        </Link>
        
        {isPlaying && (
          <div className="flex gap-3">
            {/* ✅ FIXED: High Contrast Score Display */}
            <motion.div 
              key={score}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-black px-5 py-2 rounded-full font-black text-2xl shadow-2xl flex items-center gap-2 border-4 border-white"
            >
              <Sparkles className="w-6 h-6 text-white fill-white" />
              {score}
            </motion.div>
            <div className="bg-black/40 backdrop-blur-md text-white px-5 py-2 rounded-full font-black text-xl shadow-lg border-2 border-white/50 flex items-center gap-2">
              <span className="animate-pulse text-yellow-400">⏰</span> {timeLeft}s
            </div>
          </div>
        )}
      </div>

      {/* Game Area */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <AnimatePresence>
          {balloons.map((balloon) => (
            <motion.div
              key={balloon.id}
              initial={{ y: "110vh", opacity: 0 }}
              animate={{ 
                y: "-20vh", 
                opacity: 1,
                x: [
                  `${balloon.x}vw`,
                  `${balloon.x + 4}vw`,
                  `${balloon.x - 4}vw`,
                  `${balloon.x}vw`
                ]
              }}
              transition={{ 
                y: { duration: balloon.duration, ease: "linear" },
                x: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
              }}
              onClick={() => popBalloon(balloon.id, balloon.x, balloon.size)}
              className="absolute pointer-events-auto cursor-pointer flex flex-col items-center"
              style={{ width: balloon.size, height: balloon.size * 1.2, left: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {/* Glossy Balloon Body */}
              <div className={`relative w-full h-5/6 rounded-[50%] ${balloon.style} shadow-2xl border-2 border-white/40`}>
                <div className="absolute top-3 left-4 w-1/3 h-1/3 bg-white/50 rounded-full blur-md transform -rotate-12" />
                <div className="absolute top-6 left-7 w-1/5 h-1/5 bg-white/80 rounded-full" />
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 ${balloon.style} rotate-45 border border-white/30`} />
              </div>
              <div className="w-0.5 h-16 bg-white/70 mt-1 rounded-full" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ✅ FIXED: Shockwave Ring Effect */}
        <AnimatePresence>
          {shockwaves.map((wave) => (
            <motion.div
              key={wave.id}
              initial={{ scale: 0.5, opacity: 1, borderWidth: 6 }}
              animate={{ scale: 4, opacity: 0, borderWidth: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute rounded-full border-white pointer-events-none shadow-[0_0_20px_rgba(255,255,255,0.8)]"
              style={{ 
                width: wave.size, 
                height: wave.size, 
                left: `${wave.x}vw`, 
                top: `${wave.y}%`, 
                marginLeft: -(wave.size / 2), 
                marginTop: -(wave.size / 2) 
              }}
            />
          ))}
        </AnimatePresence>

        {/* ✅ FIXED: Rich Particle Explosions */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.5, rotate: 0 }}
              animate={{ 
                x: p.tx, 
                y: p.ty, 
                opacity: 0, 
                scale: 1.8, 
                rotate: p.rotate 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }} // Custom bezier for snappy explosion
              className="absolute pointer-events-none text-3xl md:text-5xl flex items-center justify-center drop-shadow-lg"
              style={{ left: `${p.x}vw`, top: `${p.y}%` }}
            >
              {p.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Floating Score Text */}
        <AnimatePresence>
          {floatingTexts.map((ft) => (
            <motion.div
              key={ft.id}
              initial={{ y: 0, opacity: 1, scale: 0.5 }}
              animate={{ y: -100, opacity: 0, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute pointer-events-none font-black text-4xl text-yellow-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)]"
              style={{ left: `${ft.x}vw`, top: `${ft.y}%`, WebkitTextStroke: "2px black" }}
            >
              {ft.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Start Screen */}
      {!isPlaying && timeLeft === 60 && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/30 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }}
            className="bg-white/95 p-8 md:p-12 rounded-[3rem] shadow-2xl text-center max-w-md mx-4 border-4 border-sky-200"
          >
            <motion.div 
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-4 drop-shadow-lg"
            >
              🎈
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-3">
              Bubble Pop!
            </h1>
            <p className="text-gray-600 mb-6 text-lg font-medium">Balloons ko pop karo aur magical items collect karo!</p>
            
            {highScore > 0 && (
              <motion.div 
                initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                className="bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400 rounded-2xl p-4 mb-8 shadow-inner"
              >
                <div className="flex items-center justify-center gap-2 text-yellow-700 font-black text-xl">
                  <Trophy className="w-6 h-6 fill-yellow-500" />
                  High Score: {highScore}
                </div>
              </motion.div>
            )}
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-black text-xl md:text-2xl px-10 py-5 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 mx-auto border-2 border-white/30"
            >
              <Play className="w-7 h-7 fill-white" /> Play Game
            </motion.button>
            
            <p className="text-gray-400 text-sm mt-6 font-medium">⏱️ 60 seconds • Tap balloons to pop!</p>
          </motion.div>
        </motion.div>
      )}

      {/* Game Over Screen */}
      {!isPlaying && timeLeft === 0 && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/50 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.8, rotate: -5 }} animate={{ scale: 1, rotate: 0 }}
            className="bg-white/95 p-8 md:p-12 rounded-[3rem] shadow-2xl text-center max-w-md mx-4 border-4 border-yellow-300"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Trophy className="w-28 h-28 text-yellow-500 mx-auto mb-4 drop-shadow-lg" />
            </motion.div>
            <h2 className="text-4xl font-black text-gray-800 mb-2">Time Up!</h2>
            
            {score >= highScore && score > 0 && (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white font-black px-6 py-3 rounded-full inline-block mb-6 shadow-lg text-lg"
              >
                🎉 New High Score! 🎉
              </motion.div>
            )}
            
            <p className="text-gray-600 mb-2 text-lg font-medium">Tumhara Score:</p>
            <motion.div 
              key={score}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-sky-500 to-indigo-600 mb-6 drop-shadow-sm"
            >
              {score}
            </motion.div>
            
            <div className="text-sm text-gray-500 mb-8 font-medium">
              Best Score: <span className="font-black text-yellow-600 text-lg">{highScore}</span>
            </div>
            
            <div className="flex flex-col gap-3">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-xl px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 border-2 border-white/30"
              >
                <RotateCcw className="w-6 h-6" /> Play Again
              </motion.button>
              
              <Link href="/" className="text-gray-500 hover:text-gray-800 font-bold text-sm transition-colors py-2">
                ← Back to Home
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}