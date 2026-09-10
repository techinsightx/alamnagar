"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Play, RotateCcw, Sparkles, Star } from "lucide-react";
import Link from "next/link";

const BUBBLE_COLORS = [
  "bg-pink-400", "bg-blue-400", "bg-yellow-400", 
  "bg-green-400", "bg-purple-400", "bg-orange-400"
];

interface Bubble {
  id: number;
  x: number;
  size: number;
  color: string;
  duration: number;
}

interface PopEffect {
  id: number;
  x: number;
  y: number;
  color: string;
}

export default function BubblePopGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [nextId, setNextId] = useState(0);
  const [popEffects, setPopEffects] = useState<PopEffect[]>([]);
  const [highScore, setHighScore] = useState(0);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("bubblePopHighScore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setBubbles([]);
    setPopEffects([]);
    setIsPlaying(true);
  };

  // Timer
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

  // Spawn bubbles
  useEffect(() => {
    if (!isPlaying) return;
    const spawnInterval = setInterval(() => {
      setBubbles((prev) => {
        if (prev.length >= 10) return prev;
        const newBubble: Bubble = {
          id: nextId,
          x: Math.random() * 85 + 5,
          size: Math.random() * 40 + 60,
          color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
          duration: Math.random() * 3 + 4,
        };
        setNextId((id) => id + 1);
        return [...prev, newBubble];
      });
    }, 500);
    return () => clearInterval(spawnInterval);
  }, [isPlaying, nextId]);

  const popBubble = (id: number, x: number, color: string) => {
    setScore((s) => s + 10);
    setPopEffects((prev) => [...prev, { id: Date.now(), x, y: 0, color }]);
    setTimeout(() => {
      setPopEffects((prev) => prev.filter((e) => e.id !== Date.now()));
    }, 600);
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-400 to-sky-600 relative overflow-hidden select-none">
      {/* Decorative Clouds */}
      <div className="absolute top-10 left-10 w-32 h-16 bg-white/40 rounded-full blur-xl" />
      <div className="absolute top-20 right-20 w-48 h-24 bg-white/30 rounded-full blur-2xl" />
      <div className="absolute top-40 left-1/3 w-40 h-20 bg-white/25 rounded-full blur-xl" />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-white font-bold hover:bg-white/20 px-4 py-2 rounded-full transition bg-black/20 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5" /> Home
        </Link>
        
        {isPlaying && (
          <div className="flex gap-3">
            <div className="bg-white/90 text-sky-600 px-5 py-2 rounded-full font-black text-lg shadow-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              {score}
            </div>
            <div className="bg-white/90 text-rose-500 px-5 py-2 rounded-full font-black text-lg shadow-lg">
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
              onClick={() => popBubble(bubble.id, bubble.x, bubble.color)}
              className={`absolute rounded-full ${bubble.color} shadow-lg cursor-pointer border-4 border-white/30 flex items-center justify-center`}
              style={{ width: bubble.size, height: bubble.size, left: 0 }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.8 }}
            >
              {/* Bubble Shine */}
              <div className="absolute top-3 left-4 w-1/3 h-1/3 bg-white/60 rounded-full blur-sm" />
              <div className="absolute top-6 left-8 w-1/6 h-1/6 bg-white/80 rounded-full" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pop Effects */}
        <AnimatePresence>
          {popEffects.map((effect) => (
            <motion.div
              key={effect.id}
              initial={{ opacity: 1, scale: 0.5 }}
              animate={{ opacity: 0, scale: 2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute pointer-events-none"
              style={{ left: `${effect.x}vw`, top: "50%" }}
            >
              <Star className="w-12 h-12 text-yellow-400 fill-yellow-400" />
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
            className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl text-center max-w-md mx-4"
          >
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-7xl mb-4"
            >
              
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-sky-600 mb-2">Bubble Pop!</h1>
            <p className="text-gray-600 mb-4 text-lg">Bubbles ko pop karo aur stars jama karo!</p>
            
            {highScore > 0 && (
              <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl p-3 mb-6">
                <div className="flex items-center justify-center gap-2 text-yellow-700 font-bold">
                  <Trophy className="w-5 h-5 fill-yellow-500" />
                  High Score: {highScore}
                </div>
              </div>
            )}
            
            <button 
              onClick={startGame}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black text-xl md:text-2xl px-8 md:px-10 py-4 md:py-5 rounded-full shadow-xl hover:scale-105 transition-transform flex items-center gap-3 mx-auto"
            >
              <Play className="w-6 h-6 fill-white" /> Play Game
            </button>
            
            <p className="text-gray-400 text-sm mt-4">60 seconds • Tap bubbles to pop!</p>
          </motion.div>
        </motion.div>
      )}

      {/* Game Over Screen */}
      {!isPlaying && timeLeft === 0 && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl text-center max-w-md mx-4"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-4 fill-yellow-500" />
            </motion.div>
            <h2 className="text-4xl font-black text-gray-800 mb-2">Time Up!</h2>
            
            {score >= highScore && score > 0 && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-black px-4 py-2 rounded-full inline-block mb-4">
                🎉 New High Score! 🎉
              </div>
            )}
            
            <p className="text-gray-600 mb-2 text-lg">Tumhara Score:</p>
            <div className="text-6xl md:text-7xl font-black text-sky-600 mb-4">{score}</div>
            
            <div className="text-sm text-gray-500 mb-6">
              Best Score: <span className="font-bold text-yellow-600">{highScore}</span>
            </div>
            
            <button 
              onClick={startGame}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-xl px-8 py-4 rounded-full shadow-xl hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-5 h-5" /> Play Again
            </button>
            
            <Link href="/" className="inline-block mt-4 text-gray-500 hover:text-gray-700 text-sm">
              ← Back to Home
            </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}