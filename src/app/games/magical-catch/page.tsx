"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Play, RotateCcw, Heart, Sparkles, Info } from "lucide-react";
import Link from "next/link";

const ITEM_TYPES = {
  star: { emoji: "⭐", score: 10, color: "text-yellow-400", particle: "✨", weight: 40, type: "good" },
  candy: { emoji: "🍬", score: 15, color: "text-pink-400", particle: "🍭", weight: 25, type: "good" },
  gift: { emoji: "🎁", score: 25, color: "text-purple-500", particle: "🎉", weight: 15, type: "good" },
  potion: { emoji: "🧪", score: 30, color: "text-cyan-400", particle: "🌟", weight: 10, type: "good" },
  diamond: { emoji: "💎", score: 50, color: "text-blue-400", particle: "💠", weight: 5, type: "good" },
  bomb: { emoji: "💣", score: 0, color: "text-gray-800", particle: "💥", weight: 5, type: "bad" },
} as const;

type ItemType = keyof typeof ITEM_TYPES;

interface GameItem {
  id: number;
  type: ItemType;
  x: number;
  y: number;
  speed: number;
  rotation: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji?: string;
  tx: number;
  ty: number;
  isText?: boolean;
  text?: string;
}

export default function MagicalCatchGame() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [items, setItems] = useState<GameItem[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [highScore, setHighScore] = useState(0);
  const [screenShake, setScreenShake] = useState(false);
  const [basketState, setBasketState] = useState<"idle" | "catch" | "hit">("idle");

  // ✅ 2D Movement refs and state (Basket can move ANYWHERE)
  const playerXRef = useRef(50);
  const playerYRef = useRef(80);
  const [playerX, setPlayerX] = useState(50);
  const [playerY, setPlayerY] = useState(80);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("magicalCatchHighScore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setTimeLeft(60);
    setItems([]);
    setParticles([]);
    setBasketState("idle");
    setIsPlaying(true);
  };

  // Timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Save High Score
  useEffect(() => {
    if (!isPlaying && score > 0) {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("magicalCatchHighScore", score.toString());
      }
    }
  }, [isPlaying, score, highScore]);

  // Spawner
  useEffect(() => {
    if (!isPlaying) return;
    const spawner = setInterval(() => {
      const rand = Math.random() * 100;
      let type: ItemType = "star";
      let cumulative = 0;
      
      for (const [key, value] of Object.entries(ITEM_TYPES)) {
        cumulative += value.weight;
        if (rand <= cumulative) {
          type = key as ItemType;
          break;
        }
      }

      setItems((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          type,
          x: Math.random() * 90 + 5,
          y: -10,
          speed: Math.random() * 1.2 + 0.8,
          rotation: Math.random() * 360,
        },
      ]);
    }, 600);
    return () => clearInterval(spawner);
  }, [isPlaying]);

  // Game Loop (Collision & Movement)
  useEffect(() => {
    if (!isPlaying) return;
    const loop = setInterval(() => {
      setItems((prevItems) => {
        const nextItems: GameItem[] = [];
        let scoreGained = 0;
        let livesLost = 0;
        const newParticles: Particle[] = [];

        prevItems.forEach((item) => {
          const newY = item.y + item.speed;
          
          // ✅ 2D Collision Logic: Checks distance in both X and Y
          const distX = Math.abs(item.x - playerXRef.current);
          const distY = Math.abs(newY - playerYRef.current);
          const isCaught = distX < 7 && distY < 7; // Generous catch radius

          if (isCaught) {
            const data = ITEM_TYPES[item.type];
            if (item.type === "bomb") {
              livesLost += 1;
              setBasketState("hit");
              setScreenShake(true);
              setTimeout(() => { setScreenShake(false); setBasketState("idle"); }, 400);
              newParticles.push({ 
                id: Date.now() + Math.random(), 
                x: item.x, 
                y: newY, 
                emoji: "💥", 
                tx: 0, 
                ty: 0 
              });
            } else {
              scoreGained += data.score;
              setBasketState("catch");
              setTimeout(() => setBasketState("idle"), 300);
              
              const isSpecial = item.type === "diamond" || item.type === "potion";
              const particleCount = isSpecial ? 16 : 8;
              
              for (let i = 0; i < particleCount; i++) {
                const angle = (Math.PI * 2 * i) / particleCount;
                const velocity = isSpecial ? 200 : 120;
                newParticles.push({
                  id: Date.now() + Math.random() + i,
                  x: item.x,
                  y: newY,
                  emoji: data.particle,
                  tx: Math.cos(angle) * velocity,
                  ty: Math.sin(angle) * velocity - 50,
                });
              }
              
              newParticles.push({
                id: Date.now() + 999,
                x: item.x,
                y: newY,
                isText: true,
                text: isSpecial ? "MAGICAL! ✨" : `+${data.score}`,
                tx: 0,
                ty: isSpecial ? -50 : -30,
              });
            }
          } else if (newY > 105) {
            // Missed
          } else {
            nextItems.push({ ...item, y: newY, rotation: item.rotation + 2 });
          }
        });

        if (scoreGained > 0) setScore((s) => s + scoreGained);
        if (livesLost > 0) {
          setLives((l) => {
            const newLives = l - livesLost;
            if (newLives <= 0) setIsPlaying(false);
            return newLives;
          });
        }
        if (newParticles.length > 0) {
          setParticles((prev) => [...prev, ...newParticles]);
          setTimeout(() => {
            setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
          }, 1000);
        }

        return nextItems;
      });
    }, 30);
    return () => clearInterval(loop);
  }, [isPlaying]);

  // ✅ 2D Movement Handler (Follows mouse/touch ANYWHERE on screen)
  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isPlayingRef.current) return;
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const x = (clientX / window.innerWidth) * 100;
    const y = (clientY / window.innerHeight) * 100;
    
    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(5, Math.min(95, y)); // Full screen freedom
    
    playerXRef.current = clampedX;
    playerYRef.current = clampedY;
    setPlayerX(clampedX);
    setPlayerY(clampedY);
  }, []);

  return (
    // ✅ Smooth, Transparent, Colored Glassmorphic Background
    <div 
      className={`min-h-screen bg-gradient-to-br from-sky-200/60 via-purple-200/60 to-pink-200/60 backdrop-blur-md relative overflow-hidden select-none font-sans ${screenShake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px) rotate(-1deg); }
          75% { transform: translateX(8px) rotate(1deg); }
        }
      `}</style>

      {/* Animated Soft Background Orbs for Depth */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: Math.random() * 150 + 100,
            height: Math.random() * 150 + 100,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(168, 85, 247, 0.25)' : 'rgba(236, 72, 153, 0.25)'} 0%, transparent 70%)`,
          }}
          animate={{ 
            y: [0, -40, 0], 
            x: [0, 30, 0],
            opacity: [0.3, 0.6, 0.3] 
          }}
          transition={{ duration: Math.random() * 6 + 6, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-stone-800 font-bold hover:bg-white/40 px-4 py-2 rounded-full transition bg-white/30 backdrop-blur-md border border-white/40 shadow-lg">
          <ArrowLeft className="w-5 h-5" /> Home
        </Link>
        
        {isPlaying && (
          <div className="flex gap-3">
            <motion.div 
              key={score}
              initial={{ scale: 1.4 }} animate={{ scale: 1 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-stone-900 px-5 py-2 rounded-full font-black text-2xl shadow-2xl flex items-center gap-2 border-4 border-white"
            >
              <Sparkles className="w-6 h-6 fill-white" /> {score}
            </motion.div>
            <div className="flex gap-1 bg-white/40 backdrop-blur-md px-4 py-2 rounded-full border-2 border-white/50 shadow-lg">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={lives <= i ? { scale: 0.8, opacity: 0.3 } : { scale: 1, opacity: 1 }}
                >
                  <Heart className={`w-6 h-6 ${lives > i ? "text-red-500 fill-red-500" : "text-stone-400"}`} />
                </motion.div>
              ))}
            </div>
            <div className="bg-white/40 backdrop-blur-md text-stone-900 px-4 py-2 rounded-full font-black text-xl border-2 border-white/50 shadow-lg flex items-center gap-2">
              ⏰ {timeLeft}s
            </div>
          </div>
        )}
      </div>

      {/* Game Area */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Falling Items with Strong Drop Shadows for Maximum Visibility */}
        <AnimatePresence>
          {items.map((item) => {
            const data = ITEM_TYPES[item.type];
            return (
              <motion.div
                key={item.id}
                initial={{ y: "-10vh", x: `${item.x}vw`, opacity: 0, scale: 0.5 }}
                animate={{ y: "110vh", opacity: 1, scale: 1 }}
                transition={{ duration: (100 / item.speed) * 0.1, ease: "linear" }}
                className="absolute pointer-events-auto cursor-pointer"
                style={{ left: 0, top: 0, rotate: item.rotation }}
              >
                <span className="text-5xl md:text-6xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]">{data.emoji}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Particles & Floating Text */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: p.isText ? 0.5 : 0.8 }}
              animate={{ x: p.tx, y: p.ty, opacity: 0, scale: p.isText ? 1.5 : 2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`absolute pointer-events-none flex items-center justify-center ${p.isText ? "text-3xl md:text-4xl font-black text-purple-700 drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)]" : "text-4xl md:text-5xl"}`}
              style={{ left: `${p.x}vw`, top: `${p.y}%` }}
            >
              {p.isText ? p.text : p.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ✅ Player Basket: Moves ANYWHERE, Rural Bamboo Feel with Magical Glow */}
        {isPlaying && (
          <motion.div
            className="absolute pointer-events-none z-20"
            style={{ left: `${playerX}%`, top: `${playerY}%` }}
            animate={{ x: "-50%", y: "-50%" }} // Centers the basket exactly on cursor/touch
          >
            <div className="relative">
              {/* Magical Bamboo Glow */}
              <motion.div 
                animate={basketState === "catch" ? { scale: 1.5, opacity: 0.8 } : basketState === "hit" ? { scale: 1.2, opacity: 0.6 } : { scale: 1, opacity: 0.4 }}
                className="absolute inset-0 bg-amber-400/50 rounded-full blur-2xl transition-all duration-300" 
              />
              
              {/* Basket Emoji with Dynamic Spring Animation */}
              <motion.div
                animate={
                  basketState === "catch" 
                    ? { scale: [1, 1.25, 0.95, 1], filter: "drop-shadow(0 0 25px rgba(251, 191, 36, 1))" }
                    : basketState === "hit"
                    ? { scale: [1, 0.9, 1.05, 1], x: [-8, 8, -8, 8, 0], filter: "drop-shadow(0 0 20px rgba(239, 68, 68, 0.9)) brightness(0.8)" }
                    : { y: [0, -6, 0], filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.2))" }
                }
                transition={{ duration: basketState === "idle" ? 2 : 0.4, type: "spring", bounce: 0.6 }}
                className="text-7xl md:text-8xl relative z-10"
              >
                🧺
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Start Screen */}
      {!isPlaying && timeLeft === 60 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white/90 p-6 md:p-10 rounded-[3rem] shadow-2xl text-center max-w-md w-full border-4 border-purple-200">
            <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-8xl mb-4 drop-shadow-lg">
              🧺
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 mb-3">
              Jadui Tokri!
            </h1>
            
            {/* ✅ Clear Game Logic for Kids */}
            <div className="bg-purple-50/80 border-2 border-purple-200 rounded-2xl p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-3 text-purple-900 font-bold text-sm">
                <Info className="w-4 h-4" /> Kaise Khelen (How to Play):
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl shadow-sm">
                  <span className="text-2xl">👆</span> 
                  <span className="font-semibold text-stone-700">Kahi bhi move karo</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl shadow-sm">
                  <span className="text-2xl">⭐🎁💎</span> 
                  <span className="font-semibold text-stone-700">Pakdo aur points lo</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl shadow-sm">
                  <span className="text-2xl">💣</span> 
                  <span className="font-semibold text-red-600">Bomb se bacho!</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl shadow-sm">
                  <span className="text-2xl">❤️</span> 
                  <span className="font-semibold text-stone-700">Sirf 3 Jaan (Lives)</span>
                </div>
              </div>
            </div>
            
            {highScore > 0 && (
              <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400 rounded-2xl p-3 mb-6 shadow-inner">
                <div className="flex items-center justify-center gap-2 text-yellow-700 font-black text-xl">
                  <Trophy className="w-6 h-6 fill-yellow-500" /> High Score: {highScore}
                </div>
              </div>
            )}
            
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame} className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white font-black text-xl md:text-2xl px-10 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 border-2 border-white/30">
              <Play className="w-7 h-7 fill-white" /> Play Game
            </motion.button>
            <p className="text-stone-500 text-xs mt-4 font-medium">⏱️ 60 seconds • Mouse ya Touch se kahin bhi move karo!</p>
          </motion.div>
        </motion.div>
      )}

      {/* Game Over Screen */}
      {!isPlaying && timeLeft < 60 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/30 backdrop-blur-md p-4">
          <motion.div initial={{ scale: 0.8, rotate: -5 }} animate={{ scale: 1, rotate: 0 }} className="bg-white/95 p-6 md:p-10 rounded-[3rem] shadow-2xl text-center max-w-md w-full border-4 border-yellow-300">
            <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Trophy className="w-24 h-24 md:w-28 md:h-28 text-yellow-500 mx-auto mb-4 drop-shadow-lg" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-black text-stone-800 mb-2">Game Over!</h2>
            
            {score >= highScore && score > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white font-black px-6 py-3 rounded-full inline-block mb-6 shadow-lg text-lg">
                🎉 New High Score! 🎉
              </motion.div>
            )}
            
            <p className="text-stone-600 mb-2 text-lg font-medium">Tumhara Score:</p>
            <motion.div key={score} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-purple-600 to-pink-600 mb-6 drop-shadow-sm">
              {score}
            </motion.div>
            
            <div className="flex flex-col gap-3">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-xl px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 border-2 border-white/30">
                <RotateCcw className="w-6 h-6" /> Play Again
              </motion.button>
              <Link href="/" className="text-stone-500 hover:text-stone-800 font-bold text-sm transition-colors py-2 text-center">← Back to Home</Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}