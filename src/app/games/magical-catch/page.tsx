"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Play, RotateCcw, Sparkles, Info, Zap, Flame, Target } from "lucide-react";
import Link from "next/link";

const ITEM_TYPES = {
  star: { emoji: "⭐", score: 10, particle: "✨", weight: 30, type: "good", rarity: "common" },
  candy: { emoji: "🍬", score: 15, particle: "🍭", weight: 22, type: "good", rarity: "common" },
  gift: { emoji: "🎁", score: 25, particle: "🎉", weight: 15, type: "good", rarity: "uncommon" },
  potion: { emoji: "🧪", score: 30, particle: "", weight: 10, type: "good", rarity: "uncommon" },
  diamond: { emoji: "💎", score: 50, particle: "💠", weight: 6, type: "good", rarity: "rare" },
  goldenStar: { emoji: "🌟", score: 100, particle: "⭐", weight: 2, type: "good", rarity: "legendary" },
  bomb: { emoji: "💣", score: 0, particle: "💥", weight: 10, type: "bad", rarity: "common" },
  slowmo: { emoji: "⏰", score: 0, particle: "⏳", weight: 2, type: "powerup", effect: "slowmo", rarity: "rare" },
  double: { emoji: "✨", score: 0, particle: "💫", weight: 2, type: "powerup", effect: "double", rarity: "rare" },
  magnet: { emoji: "🧲", score: 0, particle: "⚡", weight: 1, type: "powerup", effect: "magnet", rarity: "legendary" },
} as const;

type ItemType = keyof typeof ITEM_TYPES;

interface GameItem {
  id: number;
  type: ItemType;
  x: number;
  y: number;
  speed: number;
  rotation: number;
  glow?: boolean;
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
  color?: string;
}

interface SmokeParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
}

export default function MagicalCatchGame() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [items, setItems] = useState<GameItem[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [smokeParticles, setSmokeParticles] = useState<SmokeParticle[]>([]);
  const [highScore, setHighScore] = useState(0);
  const [screenShake, setScreenShake] = useState(false);
  const [basketState, setBasketState] = useState<"idle" | "catch" | "hit">("idle");
  const [combo, setCombo] = useState(0);
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
  const [powerUpTimer, setPowerUpTimer] = useState(0);
  const [streak, setStreak] = useState(0);
  const [screenFlash, setScreenFlash] = useState<string | null>(null);
  const [milestone, setMilestone] = useState(0);

  const playerXRef = useRef(50);
  const playerYRef = useRef(75);
  const [playerX, setPlayerX] = useState(50);
  const [playerY, setPlayerY] = useState(75);
  const isPlayingRef = useRef(false);
  const comboRef = useRef(0);
  const streakRef = useRef(0);
  const powerUpRef = useRef<string | null>(null);

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
    setCombo(0);
    setStreak(0);
    comboRef.current = 0;
    streakRef.current = 0;
    setActivePowerUp(null);
    powerUpRef.current = null;
    setMilestone(0);
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

  // Power-up Timer
  useEffect(() => {
    if (!activePowerUp || powerUpTimer <= 0) {
      if (powerUpTimer === 0 && activePowerUp) {
        setActivePowerUp(null);
        powerUpRef.current = null;
      }
      return;
    }
    const timer = setInterval(() => {
      setPowerUpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activePowerUp, powerUpTimer]);

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
    const spawnRate = activePowerUp === "slowmo" ? 900 : 600;
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

      const isRare = type === "diamond" || type === "goldenStar" || type === "magnet";

      setItems((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          type,
          x: Math.random() * 90 + 5,
          y: -10,
          speed: Math.random() * 1.2 + 0.8,
          rotation: Math.random() * 360,
          glow: isRare,
        },
      ]);
    }, spawnRate);
    return () => clearInterval(spawner);
  }, [isPlaying, activePowerUp]);

  // Smoke Particles Generator
  useEffect(() => {
    if (!isPlaying) return;
    const smokeSpawner = setInterval(() => {
      const newSmoke: SmokeParticle = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 150 + 100,
        duration: Math.random() * 8 + 6,
      };
      setSmokeParticles((prev) => [...prev.slice(-8), newSmoke]);
    }, 2000);
    return () => clearInterval(smokeSpawner);
  }, [isPlaying]);

  // Game Loop
  useEffect(() => {
    if (!isPlaying) return;
    const speedMultiplier = activePowerUp === "slowmo" ? 0.5 : 1;
    const loop = setInterval(() => {
      setItems((prevItems) => {
        const nextItems: GameItem[] = [];
        let scoreGained = 0;
        let livesLost = 0;
        const newParticles: Particle[] = [];

        prevItems.forEach((item) => {
          const newY = item.y + item.speed * speedMultiplier;
          
          const distX = Math.abs(item.x - playerXRef.current);
          const distY = Math.abs(newY - playerYRef.current);
          const isCaught = distX < 6 && distY < 5;

          if (isCaught) {
            const data = ITEM_TYPES[item.type];
            if (item.type === "bomb") {
              livesLost += 1;
              setBasketState("hit");
              setScreenShake(true);
              setCombo(0);
              setStreak(0);
              comboRef.current = 0;
              streakRef.current = 0;
              setScreenFlash("red");
              setTimeout(() => { setScreenShake(false); setBasketState("idle"); setScreenFlash(null); }, 400);
              newParticles.push({ 
                id: Date.now() + Math.random(), 
                x: item.x, 
                y: newY, 
                emoji: "💥", 
                tx: 0, 
                ty: 0 
              });
            } else if (data.type === "powerup") {
              setActivePowerUp(data.effect || null);
              powerUpRef.current = data.effect || null;
              setPowerUpTimer(10);
              setBasketState("catch");
              setScreenFlash("cyan");
              setTimeout(() => { setBasketState("idle"); setScreenFlash(null); }, 500);
              
              for (let i = 0; i < 16; i++) {
                const angle = (Math.PI * 2 * i) / 16;
                newParticles.push({
                  id: Date.now() + Math.random() + i,
                  x: item.x,
                  y: newY,
                  emoji: data.particle,
                  tx: Math.cos(angle) * 180,
                  ty: Math.sin(angle) * 180 - 30,
                });
              }
              newParticles.push({
                id: Date.now() + 999,
                x: item.x,
                y: newY,
                isText: true,
                text: data.effect === "slowmo" ? "⏰ SLOW MOTION!" : data.effect === "double" ? "✨ DOUBLE POINTS!" : "🧲 MAGNET POWER!",
                tx: 0,
                ty: -60,
                color: "cyan",
              });
            } else {
              const comboMultiplier = Math.min(Math.floor(comboRef.current / 5) + 1, 5);
              const baseScore = data.score;
              const finalScore = activePowerUp === "double" ? baseScore * 2 * comboMultiplier : baseScore * comboMultiplier;
              
              scoreGained += finalScore;
              setCombo((c) => {
                const newCombo = c + 1;
                comboRef.current = newCombo;
                return newCombo;
              });
              setStreak((s) => {
                const newStreak = s + 1;
                streakRef.current = newStreak;
                return newStreak;
              });
              setBasketState("catch");
              
              if (item.type === "goldenStar" || item.type === "diamond") {
                setScreenFlash("gold");
                setTimeout(() => setScreenFlash(null), 300);
              }
              
              setTimeout(() => setBasketState("idle"), 300);
              
              const isSpecial = item.type === "diamond" || item.type === "potion" || item.type === "goldenStar";
              const particleCount = isSpecial ? 20 : 10;
              
              for (let i = 0; i < particleCount; i++) {
                const angle = (Math.PI * 2 * i) / particleCount;
                const velocity = isSpecial ? 220 : 140;
                newParticles.push({
                  id: Date.now() + Math.random() + i,
                  x: item.x,
                  y: newY,
                  emoji: data.particle,
                  tx: Math.cos(angle) * velocity,
                  ty: Math.sin(angle) * velocity - 50,
                });
              }
              
              const comboText = comboMultiplier > 1 ? ` x${comboMultiplier}🔥` : "";
              const rarityText = item.type === "goldenStar" ? " LEGENDARY!" : item.type === "diamond" ? " RARE!" : "";
              newParticles.push({
                id: Date.now() + 999,
                x: item.x,
                y: newY,
                isText: true,
                text: `+${finalScore}${comboText}${rarityText}`,
                tx: 0,
                ty: isSpecial ? -70 : -40,
                color: item.type === "goldenStar" ? "gold" : item.type === "diamond" ? "cyan" : "white",
              });
            }
          } else if (newY > 105) {
            if (item.type !== "bomb" && ITEM_TYPES[item.type].type !== "powerup") {
              setCombo(0);
              setStreak(0);
              comboRef.current = 0;
              streakRef.current = 0;
            }
          } else {
            nextItems.push({ ...item, y: newY, rotation: item.rotation + 2 });
          }
        });

        if (scoreGained > 0) {
          setScore((s) => {
            const newScore = s + scoreGained;
            if (Math.floor(newScore / 500) > Math.floor(s / 500)) {
              setMilestone(Math.floor(newScore / 500));
              setScreenFlash("purple");
              setTimeout(() => setScreenFlash(null), 500);
            }
            return newScore;
          });
        }
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
          }, 1200);
        }

        return nextItems;
      });
    }, 30);
    return () => clearInterval(loop);
  }, [isPlaying, activePowerUp]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isPlayingRef.current) return;
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const x = (clientX / window.innerWidth) * 100;
    const y = (clientY / window.innerHeight) * 100;
    
    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(40, Math.min(95, y));
    
    playerXRef.current = clampedX;
    playerYRef.current = clampedY;
    setPlayerX(clampedX);
    setPlayerY(clampedY);
  }, []);

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-pink-900/30 backdrop-blur-sm relative overflow-hidden select-none font-sans ${screenShake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px) rotate(-1deg); }
          75% { transform: translateX(8px) rotate(1deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-30px) translateX(20px); }
        }
      `}</style>

      {/* ✅ Magical Smoke/Mist Particles */}
      <AnimatePresence>
        {smokeParticles.map((smoke) => (
          <motion.div
            key={smoke.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0, 0.25, 0.15, 0],
              scale: [0.5, 1.2, 1.5, 2],
              y: [0, -100, -200, -300],
              x: [0, 30, -20, 50]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: smoke.duration, ease: "easeOut" }}
            className="absolute rounded-full blur-3xl pointer-events-none"
            style={{
              width: smoke.size,
              height: smoke.size,
              left: `${smoke.x}%`,
              top: `${smoke.y}%`,
              background: `radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.15) 50%, transparent 70%)`,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Animated Background Orbs */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: Math.random() * 200 + 150,
            height: Math.random() * 200 + 150,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(251, 191, 36, 0.2)' : 'rgba(168, 85, 247, 0.2)'} 0%, transparent 70%)`,
          }}
          animate={{ 
            y: [0, -50, 0], 
            x: [0, 40, 0],
            opacity: [0.15, 0.3, 0.15] 
          }}
          transition={{ duration: Math.random() * 8 + 8, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* ✅ Screen Flash Effect */}
      <AnimatePresence>
        {screenFlash && (
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 z-50 pointer-events-none ${
              screenFlash === "red" ? "bg-red-500/40" :
              screenFlash === "gold" ? "bg-yellow-400/40" :
              screenFlash === "cyan" ? "bg-cyan-400/40" :
              "bg-purple-500/40"
            }`}
          />
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-white font-bold hover:bg-white/20 px-4 py-2 rounded-full transition bg-black/40 backdrop-blur-md border border-white/30 shadow-lg">
          <ArrowLeft className="w-5 h-5" /> Home
        </Link>
        
        {isPlaying && (
          <div className="flex gap-2 md:gap-3 flex-wrap justify-end">
            <motion.div 
              key={score}
              initial={{ scale: 1.4 }} animate={{ scale: 1 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-stone-900 px-4 py-2 rounded-full font-black text-xl md:text-2xl shadow-2xl flex items-center gap-2 border-4 border-white"
            >
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 fill-white" /> {score}
            </motion.div>
            {combo >= 5 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-full font-black text-lg shadow-2xl flex items-center gap-2 border-4 border-white"
              >
                <Flame className="w-5 h-5 fill-white animate-pulse" /> x{Math.min(Math.floor(combo / 5) + 1, 5)}
              </motion.div>
            )}
            {/* ✅ Life System: Stars instead of Hearts */}
            <div className="flex gap-1 bg-black/40 backdrop-blur-md px-3 py-2 rounded-full border-2 border-white/30">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={lives <= i ? { scale: 0.8, opacity: 0.3 } : { scale: 1, opacity: 1 }}
                >
                  <span className="text-2xl md:text-3xl">{lives > i ? "⭐" : "☆"}</span>
                </motion.div>
              ))}
            </div>
            <div className="bg-black/40 backdrop-blur-md text-white px-3 py-2 rounded-full font-black text-lg md:text-xl border-2 border-white/30 flex items-center gap-2">
              ⏰ {timeLeft}s
            </div>
          </div>
        )}
      </div>

      {/* ✅ Magical Progress Bar (Time) */}
      {isPlaying && (
        <div className="absolute top-20 left-0 right-0 z-30 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative h-3 bg-black/30 backdrop-blur-md rounded-full overflow-hidden border-2 border-white/30">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full shadow-lg"
                initial={{ width: "100%" }}
                animate={{ width: `${(timeLeft / 60) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              {/* Magical shimmer effect */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
            {/* Milestone markers */}
            <div className="flex justify-between mt-1 px-1">
              {[0, 15, 30, 45, 60].map((time) => (
                <div key={time} className="w-1 h-1 bg-white/50 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Power-up Indicator (Simple Text + Emoji, No Card) */}
      <AnimatePresence>
        {activePowerUp && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-28 left-1/2 -translate-x-1/2 z-30 text-white font-black text-xl md:text-2xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
            style={{ textShadow: "0 0 20px currentColor, 0 0 40px currentColor" }}
          >
            {activePowerUp === "slowmo" ? " SLOW MOTION!" : activePowerUp === "double" ? "✨ DOUBLE POINTS!" : "🧲 MAGNET POWER!"}
            <span className="block text-center text-base md:text-lg mt-1 opacity-80">{powerUpTimer}s remaining</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestone Progress */}
      {milestone > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }}
          className="absolute top-32 left-4 z-30 text-white font-black text-lg drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
          style={{ textShadow: "0 0 15px currentColor" }}
        >
          🎯 Level {milestone + 1}
        </motion.div>
      )}

      {/* Game Area */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* ✅ Falling Items (Enhanced Size) */}
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
                {item.glow && (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 bg-yellow-400/60 rounded-full blur-xl"
                  />
                )}
                <span className="text-6xl md:text-7xl filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.8)] relative z-10">{data.emoji}</span>
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
              animate={{ x: p.tx, y: p.ty, opacity: 0, scale: p.isText ? 1.8 : 2.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`absolute pointer-events-none flex items-center justify-center ${p.isText ? "text-2xl md:text-4xl font-black drop-shadow-[0_4px_8px_rgba(0,0,0,1)]" : "text-4xl md:text-6xl"}`}
              style={{ 
                left: `${p.x}vw`, 
                top: `${p.y}%`,
                color: p.color === "gold" ? "#fbbf24" : p.color === "cyan" ? "#06b6d4" : "white",
                textShadow: p.isText ? "0 0 20px currentColor, 0 0 40px currentColor" : "none"
              }}
            >
              {p.isText ? p.text : p.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ✅ Realistic Bamboo Basket (Rural Indian Style) */}
        {isPlaying && (
          <motion.div
            className="absolute pointer-events-none z-20"
            style={{ left: `${playerX}%`, top: `${playerY}%` }}
            animate={{ x: "-50%", y: "-50%" }}
          >
            <div className="relative">
              {/* Magical Glow */}
              <motion.div 
                animate={basketState === "catch" ? { scale: 2, opacity: 1 } : basketState === "hit" ? { scale: 1.5, opacity: 0.8 } : { scale: 1.2, opacity: 0.5 }}
                className="absolute inset-0 bg-amber-400/70 rounded-full blur-3xl transition-all duration-300" 
              />
              
              {/* ✅ Realistic Bamboo Basket SVG */}
              <motion.div
                animate={
                  basketState === "catch" 
                    ? { scale: [1, 1.35, 0.95, 1], filter: "drop-shadow(0 0 40px rgba(251, 191, 36, 1))" }
                    : basketState === "hit"
                    ? { scale: [1, 0.9, 1.05, 1], x: [-10, 10, -10, 10, 0], filter: "drop-shadow(0 0 30px rgba(239, 68, 68, 1)) brightness(0.8)" }
                    : { y: [0, -8, 0], filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.4))" }
                }
                transition={{ duration: basketState === "idle" ? 2 : 0.4, type: "spring", bounce: 0.6 }}
                className="relative z-10"
              >
                <svg width="140" height="120" viewBox="0 0 120 100" className="w-32 h-28 md:w-40 md:h-36">
                  {/* Handle */}
                  <path d="M 30 20 Q 60 -10 90 20" stroke="#8B6914" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  <path d="M 30 20 Q 60 -10 90 20" stroke="#A0822A" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  
                  {/* Basket Body (Open Top) */}
                  <path d="M 20 30 L 30 90 Q 60 100 90 90 L 100 30 Z" fill="url(#basketGradient)" stroke="#6B4E12" strokeWidth="2"/>
                  
                  {/* Woven Texture - Horizontal Lines */}
                  <path d="M 22 40 Q 60 45 98 40" stroke="#8B6914" strokeWidth="1.5" fill="none" opacity="0.7"/>
                  <path d="M 24 50 Q 60 55 96 50" stroke="#8B6914" strokeWidth="1.5" fill="none" opacity="0.7"/>
                  <path d="M 26 60 Q 60 65 94 60" stroke="#8B6914" strokeWidth="1.5" fill="none" opacity="0.7"/>
                  <path d="M 28 70 Q 60 75 92 70" stroke="#8B6914" strokeWidth="1.5" fill="none" opacity="0.7"/>
                  <path d="M 29 80 Q 60 85 91 80" stroke="#8B6914" strokeWidth="1.5" fill="none" opacity="0.7"/>
                  
                  {/* Woven Texture - Vertical Lines */}
                  <path d="M 35 30 L 40 95" stroke="#8B6914" strokeWidth="1" fill="none" opacity="0.6"/>
                  <path d="M 50 30 L 52 98" stroke="#8B6914" strokeWidth="1" fill="none" opacity="0.6"/>
                  <path d="M 60 30 L 60 100" stroke="#8B6914" strokeWidth="1" fill="none" opacity="0.6"/>
                  <path d="M 70 30 L 68 98" stroke="#8B6914" strokeWidth="1" fill="none" opacity="0.6"/>
                  <path d="M 85 30 L 80 95" stroke="#8B6914" strokeWidth="1" fill="none" opacity="0.6"/>
                  
                  {/* Rim */}
                  <ellipse cx="60" cy="30" rx="40" ry="8" fill="url(#rimGradient)" stroke="#6B4E12" strokeWidth="2"/>
                  
                  {/* Open Top (Dark Interior) */}
                  <ellipse cx="60" cy="30" rx="38" ry="6" fill="#3D2817" opacity="0.8"/>
                  
                  <defs>
                    <linearGradient id="basketGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#D4A574"/>
                      <stop offset="30%" stopColor="#A0822A"/>
                      <stop offset="70%" stopColor="#8B6914"/>
                      <stop offset="100%" stopColor="#6B4E12"/>
                    </linearGradient>
                    <linearGradient id="rimGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#E8C99B"/>
                      <stop offset="50%" stopColor="#C4A265"/>
                      <stop offset="100%" stopColor="#A0822A"/>
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Start Screen */}
      {!isPlaying && timeLeft === 60 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white/95 p-6 md:p-10 rounded-[3rem] shadow-2xl text-center max-w-md w-full border-4 border-purple-300">
            <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-8xl mb-4 drop-shadow-lg">
              🧺
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 mb-3">
              Jadui Tokri!
            </h1>
            
            <div className="bg-purple-50/80 border-2 border-purple-200 rounded-2xl p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-3 text-purple-900 font-bold text-sm">
                <Info className="w-4 h-4" /> Kaise Khelen:
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl shadow-sm">
                  <span className="text-2xl">👆</span> 
                  <span className="font-semibold text-stone-700">Kahi bhi move karo</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl shadow-sm">
                  <span className="text-2xl">⭐🎁</span> 
                  <span className="font-semibold text-stone-700">Pakdo aur points lo</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl shadow-sm">
                  <span className="text-2xl">💣</span> 
                  <span className="font-semibold text-red-600">Bomb se bacho!</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl shadow-sm">
                  <span className="text-2xl">🔥</span> 
                  <span className="font-semibold text-stone-700">Combo banao!</span>
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
            <p className="text-stone-500 text-xs mt-4 font-medium">⏱️ 60 seconds • Lagatar catch karo, combo banao!</p>
          </motion.div>
        </motion.div>
      )}

      {/* Game Over Screen */}
      {!isPlaying && timeLeft < 60 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/50 backdrop-blur-md p-4">
          <motion.div initial={{ scale: 0.8, rotate: -5 }} animate={{ scale: 1, rotate: 0 }} className="bg-white/95 p-6 md:p-10 rounded-[3rem] shadow-2xl text-center max-w-md w-full border-4 border-yellow-300">
            <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Trophy className="w-24 h-24 md:w-28 md:h-28 text-yellow-500 mx-auto mb-4 drop-shadow-lg" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-black text-stone-800 mb-2">Game Over!</h2>
            
            {score >= highScore && score > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white font-black px-6 py-3 rounded-full inline-block mb-6 shadow-lg text-lg">
                🎉 New High Score! 
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