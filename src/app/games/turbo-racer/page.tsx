"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Trophy, Volume2, VolumeX, 
  Trees, Building2, Route, Zap, Heart, Coins, ArrowLeft, Pause, Gamepad2
} from "lucide-react";
import Link from "next/link";

// ✅ Sound Engine
const playSound = (type: 'engine' | 'coin' | 'crash' | 'nitro' | 'gameover' | 'countdown' | 'go') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator(); 
    const gain = ctx.createGain();
    osc.connect(gain); 
    gain.connect(ctx.destination);
    
    if (type === 'coin') {
      osc.type = 'sine'; 
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime); 
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'crash') {
      osc.type = 'sawtooth'; 
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.4, ctx.currentTime); 
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'nitro' || type === 'go') {
      osc.type = 'sine'; 
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, ctx.currentTime); 
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'countdown') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'gameover') {
      osc.type = 'sawtooth'; 
      osc.frequency.setValueAtTime(300, ctx.currentTime); 
      osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 1);
      gain.gain.setValueAtTime(0.4, ctx.currentTime); 
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 1);
    }
  } catch (e) {}
};

type GameMode = 'jungle' | 'city' | 'highway';
type GameObjectType = 'tree' | 'rock' | 'building' | 'barrier' | 'traffic' | 'cone' | 'coin' | 'heart' | 'nitro';

interface GameObject {
  id: number;
  type: GameObjectType;
  x: number; 
  y: number; 
  speed: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

const MODES: Record<GameMode, { name: string; icon: any; bg: string; road: string; obstacles: GameObjectType[]; accent: string; sideColor: string }> = {
  jungle: { 
    name: "Jungle Rush", icon: Trees, bg: "bg-green-800", road: "bg-stone-700", 
    obstacles: ['tree', 'rock', 'coin', 'heart', 'nitro'], accent: "text-green-400", sideColor: "bg-green-900/50"
  },
  city: { 
    name: "City Drift", icon: Building2, bg: "bg-slate-900", road: "bg-gray-800", 
    obstacles: ['building', 'barrier', 'traffic', 'coin', 'heart', 'nitro'], accent: "text-cyan-400", sideColor: "bg-slate-800/50"
  },
  highway: { 
    name: "Highway Speed", icon: Route, bg: "bg-blue-950", road: "bg-zinc-800", 
    obstacles: ['traffic', 'cone', 'coin', 'heart', 'nitro'], accent: "text-yellow-400", sideColor: "bg-blue-900/50"
  }
};

// ✅ World-Class 2D SVG Assets
const PlayerCarSVG = ({ isNitro, tilt }: { isNitro: boolean; tilt: number }) => (
  <svg viewBox="0 0 100 160" className="w-full h-full drop-shadow-2xl" style={{ transform: `rotate(${tilt}deg)`, transition: 'transform 0.2s' }}>
    {/* Nitro Flames */}
    {isNitro && (
      <motion.g animate={{ scaleY: [1, 1.8, 1], opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 0.15 }}>
        <path d="M 35 140 Q 50 190 65 140 Z" fill="#3b82f6" />
        <path d="M 40 140 Q 50 180 60 140 Z" fill="#60a5fa" />
        <path d="M 45 140 Q 50 170 55 140 Z" fill="#ffffff" />
      </motion.g>
    )}
    {/* Car Body */}
    <path d="M 20 40 Q 15 80 20 120 Q 50 135 80 120 Q 85 80 80 40 Q 50 25 20 40 Z" fill="#ef4444" />
    <path d="M 25 50 Q 50 60 75 50 L 75 110 Q 50 120 25 110 Z" fill="#dc2626" />
    {/* Racing Stripe */}
    <rect x="45" y="30" width="10" height="100" fill="#ffffff" opacity="0.8" />
    {/* Windshield */}
    <path d="M 30 55 Q 50 62 70 55 L 65 80 Q 50 85 35 80 Z" fill="#1e293b" opacity="0.9" />
    <path d="M 35 85 Q 50 90 65 85 L 68 105 Q 50 110 32 105 Z" fill="#1e293b" opacity="0.9" />
    {/* Headlights */}
    <circle cx="25" cy="45" r="5" fill="#fef08a" />
    <circle cx="75" cy="45" r="5" fill="#fef08a" />
    {/* Taillights */}
    <rect x="22" y="115" width="10" height="5" rx="2" fill="#991b1b" />
    <rect x="68" y="115" width="10" height="5" rx="2" fill="#991b1b" />
    {/* Wheels */}
    <rect x="8" y="50" width="14" height="25" rx="4" fill="#0f172a" />
    <rect x="78" y="50" width="14" height="25" rx="4" fill="#0f172a" />
    <rect x="8" y="90" width="14" height="25" rx="4" fill="#0f172a" />
    <rect x="78" y="90" width="14" height="25" rx="4" fill="#0f172a" />
    {/* Rims */}
    <circle cx="15" cy="62" r="4" fill="#94a3b8" />
    <circle cx="85" cy="62" r="4" fill="#94a3b8" />
    <circle cx="15" cy="102" r="4" fill="#94a3b8" />
    <circle cx="85" cy="102" r="4" fill="#94a3b8" />
  </svg>
);

const ObstacleSVG = ({ type }: { type: GameObjectType }) => {
  if (type === 'tree') return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
      <circle cx="50" cy="40" r="35" fill="#166534" />
      <circle cx="35" cy="55" r="25" fill="#15803d" />
      <circle cx="65" cy="55" r="25" fill="#15803d" />
      <rect x="42" y="65" width="16" height="35" fill="#78350f" />
    </svg>
  );
  if (type === 'rock') return (
    <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-xl">
      <path d="M 10 70 L 30 30 L 60 20 L 90 50 L 80 70 Z" fill="#57534e" />
      <path d="M 30 30 L 50 40 L 40 60 Z" fill="#78716c" />
    </svg>
  );
  if (type === 'building') return (
    <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xl">
      <rect x="10" y="20" width="80" height="100" fill="#475569" />
      <rect x="20" y="30" width="15" height="20" fill="#fcd34d" />
      <rect x="45" y="30" width="15" height="20" fill="#1e293b" />
      <rect x="70" y="30" width="15" height="20" fill="#fcd34d" />
      <rect x="20" y="60" width="15" height="20" fill="#1e293b" />
      <rect x="45" y="60" width="15" height="20" fill="#fcd34d" />
      <rect x="70" y="60" width="15" height="20" fill="#1e293b" />
    </svg>
  );
  if (type === 'barrier') return (
    <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-xl">
      <rect x="0" y="10" width="100" height="40" fill="#f97316" />
      <path d="M 10 10 L 30 50 M 50 10 L 70 50 M 90 10 L 90 50" stroke="#ffffff" strokeWidth="8" />
    </svg>
  );
  if (type === 'traffic') return (
    <svg viewBox="0 0 100 160" className="w-full h-full drop-shadow-xl">
      <path d="M 20 40 Q 15 80 20 120 Q 50 135 80 120 Q 85 80 80 40 Q 50 25 20 40 Z" fill="#3b82f6" />
      <path d="M 30 55 Q 50 62 70 55 L 65 80 Q 50 85 35 80 Z" fill="#1e293b" opacity="0.9" />
      <rect x="10" y="50" width="12" height="25" rx="4" fill="#0f172a" />
      <rect x="78" y="50" width="12" height="25" rx="4" fill="#0f172a" />
      <rect x="10" y="90" width="12" height="25" rx="4" fill="#0f172a" />
      <rect x="78" y="90" width="12" height="25" rx="4" fill="#0f172a" />
    </svg>
  );
  if (type === 'cone') return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
      <path d="M 50 10 L 85 80 L 15 80 Z" fill="#f97316" />
      <rect x="10" y="80" width="80" height="15" rx="4" fill="#f97316" />
      <path d="M 35 40 L 65 40 L 60 55 L 40 55 Z" fill="#ffffff" />
    </svg>
  );
  if (type === 'coin') return (
    <motion.svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" animate={{ rotateY: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
      <circle cx="50" cy="50" r="40" fill="#fbbf24" stroke="#d97706" strokeWidth="4" />
      <text x="50" y="65" fontSize="40" fontWeight="bold" fill="#92400e" textAnchor="middle">$</text>
    </motion.svg>
  );
  if (type === 'heart') return (
    <motion.svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
      <path d="M 50 85 C 20 60 5 40 5 25 C 5 10 20 5 35 15 C 45 22 50 30 50 30 C 50 30 55 22 65 15 C 80 5 95 10 95 25 C 95 40 80 60 50 85 Z" fill="#ef4444" />
    </motion.svg>
  );
  if (type === 'nitro') return (
    <motion.svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
      <path d="M 30 80 L 50 10 L 70 50 L 90 40 L 50 90 Z" fill="#3b82f6" stroke="#ffffff" strokeWidth="3" />
    </motion.svg>
  );
  return null;
};

export default function AlamnagarTurboRacer() {
  const [gameState, setGameState] = useState<'menu' | 'countdown' | 'playing' | 'paused' | 'gameover'>('menu');
  const [mode, setMode] = useState<GameMode>('jungle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [speed, setSpeed] = useState(1);
  const [nitro, setNitro] = useState(100);
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [playerX, setPlayerX] = useState(50);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [screenShake, setScreenShake] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [carTilt, setCarTilt] = useState(0);

  const gameLoopRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);
  const playerXRef = useRef(50);
  const keysPressed = useRef<Set<string>>(new Set());
  const countdownRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("alamnagarRacerHighScore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startCountdown = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setScore(0);
    setHealth(100);
    setSpeed(1);
    setNitro(100);
    setIsNitroActive(false);
    setPlayerX(50);
    playerXRef.current = 50;
    setObjects([]);
    setParticles([]);
    setScreenShake(0);
    lastSpawnRef.current = 0;
    setGameState('countdown');
    setCountdown(3);
    
    if (soundEnabled) playSound('countdown');

    let count = 3;
    countdownRef.current = window.setInterval(() => {
      count--;
      setCountdown(count);
      if (count > 0 && soundEnabled) playSound('countdown');
      if (count === 0) {
        if (soundEnabled) playSound('go');
        setGameState('playing');
        if (countdownRef.current) clearInterval(countdownRef.current);
      }
    }, 1000);
  };

  const spawnParticles = useCallback((x: number, y: number, color: string, count: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + Math.random(),
        x, y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2 - 1,
        life: 1,
        color,
        size: Math.random() * 4 + 2
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // ✅ Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const loop = () => {
      const currentSpeed = isNitroActive ? speed * 1.8 : speed;
      
      // 1. Move Player
      let moving = false;
      if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a')) {
        playerXRef.current = Math.max(20, playerXRef.current - 2);
        setCarTilt(-15);
        moving = true;
      } else if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d')) {
        playerXRef.current = Math.min(80, playerXRef.current + 2);
        setCarTilt(15);
        moving = true;
      } else {
        setCarTilt(0);
      }
      setPlayerX(playerXRef.current);

      // 2. Spawn Objects
      lastSpawnRef.current += currentSpeed;
      const spawnRate = isNitroActive ? 30 : 40;
      if (lastSpawnRef.current > spawnRate) {
        lastSpawnRef.current = 0;
        const availableObstacles = MODES[mode].obstacles;
        // Weighted random: more coins/obstacles than powerups
        const rand = Math.random();
        let type: GameObjectType;
        if (rand < 0.4) type = availableObstacles.find(o => o === 'coin' || o === 'traffic' || o === 'tree' || o === 'building') || availableObstacles[0];
        else if (rand < 0.7) type = availableObstacles.find(o => o === 'rock' || o === 'barrier' || o === 'cone') || availableObstacles[1];
        else type = availableObstacles[Math.floor(Math.random() * availableObstacles.length)];
        
        const lane = 25 + Math.random() * 50; 
        
        setObjects(prev => [...prev, {
          id: Date.now() + Math.random(),
          type,
          x: lane,
          y: -10,
          speed: currentSpeed * (type === 'traffic' ? 0.6 : 1)
        }]);
      }

      // 3. Update Objects & Collision
      setObjects(prev => {
        const nextObjects: GameObject[] = [];
        let hitSomething = false;
        let collectedCoin = false;
        let collectedHeart = false;
        let collectedNitro = false;

        prev.forEach(obj => {
          const newY = obj.y + obj.speed;
          
          const distX = Math.abs(obj.x - playerXRef.current);
          const distY = Math.abs(newY - 80); 

          if (distX < 10 && distY < 12) {
            if (obj.type === 'coin') {
              collectedCoin = true;
              if (soundEnabled) playSound('coin');
              spawnParticles(obj.x, newY, '#fbbf24', 8);
            } else if (obj.type === 'heart') {
              collectedHeart = true;
              spawnParticles(obj.x, newY, '#ef4444', 8);
            } else if (obj.type === 'nitro') {
              collectedNitro = true;
              if (soundEnabled) playSound('nitro');
              spawnParticles(obj.x, newY, '#3b82f6', 12);
            } else {
              hitSomething = true;
              if (soundEnabled) playSound('crash');
              setScreenShake(15);
              spawnParticles(obj.x, newY, '#ffffff', 15);
            }
          } else {
            if (newY < 120) {
              nextObjects.push({ ...obj, y: newY });
            }
          }
        });

        if (collectedCoin) setScore(s => s + 50);
        if (collectedHeart) setHealth(h => Math.min(100, h + 30));
        if (collectedNitro) {
          setNitro(n => Math.min(100, n + 50));
          setIsNitroActive(true);
          setTimeout(() => setIsNitroActive(false), 3000);
        }

        if (hitSomething) {
          setHealth(h => {
            const newHealth = h - 34; 
            if (newHealth <= 0) {
              setGameState('gameover');
              if (soundEnabled) playSound('gameover');
              const finalScore = score + 50; 
              if (finalScore > highScore) {
                setHighScore(finalScore);
                localStorage.setItem("alamnagarRacerHighScore", finalScore.toString());
              }
            }
            return newHealth;
          });
        }

        return nextObjects;
      });

      // 4. Update Particles
      setParticles(prev => prev.map(p => ({
        ...p, x: p.x + p.vx, y: p.y + p.vy + (isNitroActive ? 0.5 : 0), life: p.life - 0.05
      })).filter(p => p.life > 0));

      // 5. Update Speed & Screen Shake decay
      setSpeed(s => Math.min(4, s + 0.0005));
      if (screenShake > 0) setScreenShake(s => Math.max(0, s - 0.5));

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [gameState, mode, score, highScore, isNitroActive, screenShake, soundEnabled, spawnParticles]);

  // ✅ Input Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
      if (e.key === 'Escape') {
        if (gameState === 'playing') setGameState('paused');
        else if (gameState === 'paused') setGameState('playing');
      }
      if (e.code === 'Space' && nitro > 0 && !isNitroActive && gameState === 'playing') {
        setIsNitroActive(true);
        setNitro(n => n - 100);
        if (soundEnabled) playSound('nitro');
        setTimeout(() => setIsNitroActive(false), 3000);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key);
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nitro, isNitroActive, soundEnabled, gameState]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (gameState !== 'playing') return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    const prevX = playerXRef.current;
    playerXRef.current = Math.max(20, Math.min(80, x));
    setPlayerX(playerXRef.current);
    setCarTilt(playerXRef.current > prevX ? 15 : playerXRef.current < prevX ? -15 : 0);
  }, [gameState]);

  const ModeCard = ({ m, icon: Icon }: { m: GameMode, icon: any }) => (
    <motion.button
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => startCountdown(m)}
      className="w-full bg-stone-800/80 backdrop-blur-md border border-stone-700 rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-emerald-500/50 transition-all group"
    >
      <div className={`w-16 h-16 rounded-full bg-stone-700 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors`}>
        <Icon className={`w-8 h-8 ${MODES[m].accent}`} />
      </div>
      <h3 className="text-xl font-black text-white">{MODES[m].name}</h3>
      <p className="text-xs text-stone-400 text-center">Click to Start Race</p>
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-stone-950 text-white relative overflow-hidden font-sans select-none">
      {/* MENU SCREEN */}
      <AnimatePresence>
        {gameState === 'menu' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-stone-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8"
          >
            <motion.div 
              initial={{ y: -50 }} animate={{ y: 0 }} 
              className="text-center mb-12"
            >
              <div className="inline-block p-4 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 mb-4 shadow-2xl shadow-emerald-500/30">
                <Trophy className="w-16 h-16 text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 mb-2">
                TURBO RACER
              </h1>
              <p className="text-stone-400 text-lg">High Score: <span className="text-yellow-400 font-bold">{highScore}</span></p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-8">
              <ModeCard m="jungle" icon={Trees} />
              <ModeCard m="city" icon={Building2} />
              <ModeCard m="highway" icon={Route} />
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-800 hover:bg-stone-700 transition-colors text-sm font-bold"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                {soundEnabled ? "Sound On" : "Sound Off"}
              </button>
              <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-800 hover:bg-stone-700 transition-colors text-sm font-bold">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COUNTDOWN SCREEN */}
      <AnimatePresence>
        {gameState === 'countdown' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]"
            >
              {countdown === 0 ? "GO!" : countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAUSE SCREEN */}
      <AnimatePresence>
        {gameState === 'paused' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-6"
          >
            <h2 className="text-6xl font-black text-white">PAUSED</h2>
            <div className="flex gap-4">
              <button 
                onClick={() => setGameState('playing')}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-black text-xl flex items-center gap-2"
              >
                <Play className="w-6 h-6" /> Resume
              </button>
              <button 
                onClick={() => setGameState('menu')}
                className="px-8 py-4 bg-stone-700 hover:bg-stone-600 rounded-xl font-black text-xl flex items-center gap-2"
              >
                <ArrowLeft className="w-6 h-6" /> Quit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GAME OVER SCREEN */}
      <AnimatePresence>
        {gameState === 'gameover' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-red-950/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div className="bg-stone-900 border-2 border-red-500/50 p-8 md:p-12 rounded-3xl text-center max-w-md w-full shadow-2xl">
              <h2 className="text-5xl font-black text-red-500 mb-2">CRASHED!</h2>
              <p className="text-stone-400 mb-6">Your engine stopped working.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-stone-800 rounded-xl p-4 border border-stone-700">
                  <div className="text-xs text-stone-400 font-bold uppercase mb-1">Score</div>
                  <div className="text-3xl font-black text-yellow-400">{score}</div>
                </div>
                <div className="bg-stone-800 rounded-xl p-4 border border-stone-700">
                  <div className="text-xs text-stone-400 font-bold uppercase mb-1">Best</div>
                  <div className="text-3xl font-black text-emerald-400">{highScore}</div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <motion.button 
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => startCountdown(mode)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-black text-xl py-4 rounded-xl flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-6 h-6" /> Race Again
                </motion.button>
                <button 
                  onClick={() => setGameState('menu')}
                  className="w-full bg-stone-800 text-stone-300 font-bold py-3 rounded-xl hover:bg-stone-700 transition-colors"
                >
                  Change Mode
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ GAME VIEW */}
      {gameState === 'playing' && (
        <div 
          className="relative w-full h-screen overflow-hidden"
          onTouchMove={handleTouchMove}
          style={{ transform: `translate(${(Math.random()-0.5)*screenShake}px, ${(Math.random()-0.5)*screenShake}px)` }}
        >
          {/* Background & Road */}
          <div className={`absolute inset-0 ${MODES[mode].bg}`} />
          
          {/* Side Scenery (Simple blocks for performance) */}
          <div className={`absolute left-0 top-0 bottom-0 w-1/4 ${MODES[mode].sideColor}`} />
          <div className={`absolute right-0 top-0 bottom-0 w-1/4 ${MODES[mode].sideColor}`} />

          {/* Moving Road */}
          <div className={`absolute left-1/4 right-1/4 top-0 bottom-0 ${MODES[mode].road} flex justify-center overflow-hidden`}>
            {/* Road Borders */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-yellow-400" />
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-yellow-400" />
            
            {/* Moving Lane Markers */}
            <motion.div 
              animate={{ y: isNitroActive ? [0, 100] : [0, 50] }}
              transition={{ repeat: Infinity, duration: isNitroActive ? 0.3 : 0.6, ease: "linear" }}
              className="w-full h-[200%] flex flex-col justify-between py-10"
            >
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-2 h-16 bg-white/80 mx-auto rounded-full" />
              ))}
            </motion.div>
          </div>

          {/* Speed Lines (Nitro Effect) */}
          {isNitroActive && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -100, x: Math.random() * 100 + "%" }}
                  animate={{ y: "120vh" }}
                  transition={{ duration: 0.5, repeat: Infinity, ease: "linear", delay: i * 0.1 }}
                  className="absolute w-1 h-20 bg-white/30 rounded-full"
                />
              ))}
            </div>
          )}

          {/* Game Objects */}
          {objects.map(obj => (
            <motion.div
              key={obj.id}
              className="absolute w-16 h-16 md:w-20 md:h-20"
              style={{ 
                left: `${obj.x}%`, 
                top: `${obj.y}%`, 
                transform: 'translate(-50%, -50%)' 
              }}
            >
              <ObstacleSVG type={obj.type} />
            </motion.div>
          ))}

          {/* Particles */}
          {particles.map(p => (
            <div 
              key={p.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: `${p.x}%`, top: `${p.y}%`,
                width: `${p.size}px`, height: `${p.size}px`,
                backgroundColor: p.color,
                opacity: p.life,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}

          {/* Player Car */}
          <motion.div 
            className="absolute w-20 h-32 md:w-24 md:h-36 z-20"
            style={{ 
              left: `${playerX}%`, 
              top: '80%', 
              transform: 'translate(-50%, -50%)',
              transition: 'left 0.1s ease-out'
            }}
          >
            <PlayerCarSVG isNitro={isNitroActive} tilt={carTilt} />
          </motion.div>

          {/* ✅ HUD (Heads Up Display) */}
          <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-start pointer-events-none">
            <div className="flex flex-col gap-2 pointer-events-auto">
              {/* Health Bar */}
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                <div className="w-24 h-3 bg-stone-700 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-red-500" 
                    initial={{ width: '100%' }} 
                    animate={{ width: `${health}%` }} 
                  />
                </div>
              </div>
              {/* Nitro Bar */}
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                <Zap className={`w-5 h-5 ${isNitroActive ? 'text-yellow-400 fill-yellow-400 animate-pulse' : 'text-blue-400'}`} />
                <div className="w-24 h-3 bg-stone-700 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full ${isNitroActive ? 'bg-yellow-400' : 'bg-blue-500'}`} 
                    initial={{ width: '100%' }} 
                    animate={{ width: `${nitro}%` }} 
                  />
                </div>
              </div>
              {/* Pause Button */}
              <button 
                onClick={() => setGameState('paused')}
                className="bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10 hover:bg-white/20 transition-colors"
              >
                <Pause className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Score */}
            <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-yellow-500/30 flex items-center gap-3">
              <Coins className="w-6 h-6 text-yellow-400" />
              <span className="text-2xl font-black text-white">{score}</span>
            </div>
          </div>

          {/* Mobile Controls Hint */}
          <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none md:hidden">
            <p className="text-white/50 text-sm font-bold bg-black/40 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
              👆 Touch left/right to steer
            </p>
          </div>
          
          {/* Desktop Controls Hint */}
          <div className="absolute bottom-8 left-8 hidden md:block pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 text-xs text-stone-400 space-y-1">
              <div>⬅️ ➡️ or A / D : Steer</div>
              <div>SPACE : Nitro Boost</div>
              <div>ESC : Pause</div>
            </div>
          </div>

          {/* Nitro Button for Mobile */}
          <button 
            className="absolute bottom-8 right-8 md:hidden w-20 h-20 bg-blue-600/80 backdrop-blur-md rounded-full border-2 border-blue-400 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
            disabled={nitro <= 0 || isNitroActive}
            onTouchStart={(e) => {
              e.stopPropagation();
              if (nitro > 0 && !isNitroActive) {
                setIsNitroActive(true);
                setNitro(n => n - 100);
                if (soundEnabled) playSound('nitro');
                setTimeout(() => setIsNitroActive(false), 3000);
              }
            }}
          >
            <Zap className={`w-8 h-8 ${isNitroActive ? 'text-yellow-300 fill-yellow-300' : 'text-white'}`} />
          </button>
        </div>
      )}
    </div>
  );
}