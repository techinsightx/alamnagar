"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Trophy, Volume2, VolumeX, 
  Trees, Building2, Route, Zap, Heart, Coins, ArrowLeft, Pause, Check, ChevronLeft, ChevronRight
} from "lucide-react";
import Link from "next/link";

// ✅ Sound Engine with Multiple Effects
const playSound = (type: 'coin' | 'crash' | 'nitro' | 'gameover' | 'countdown' | 'go' | 'select') => {
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
      osc.start(ctx.currentTime); 
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'crash') {
      osc.type = 'sawtooth'; 
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.5, ctx.currentTime); 
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime); 
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'nitro' || type === 'go') {
      osc.type = 'sine'; 
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, ctx.currentTime); 
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime); 
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'countdown') {
      osc.type = 'square'; 
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime); 
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime); 
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'gameover') {
      osc.type = 'sawtooth'; 
      osc.frequency.setValueAtTime(300, ctx.currentTime); 
      osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 1);
      gain.gain.setValueAtTime(0.4, ctx.currentTime); 
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1);
      osc.start(ctx.currentTime); 
      osc.stop(ctx.currentTime + 1);
    } else if (type === 'select') {
      osc.type = 'sine'; 
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime); 
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime); 
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch (e) {}
};

type GameMode = 'jungle' | 'city' | 'highway';
type CarModel = 'sports' | 'suv' | 'classic';
type RoadObjectType = 'traffic' | 'cone' | 'barrier' | 'coin' | 'heart' | 'nitro';
type SideObjectType = 'tree' | 'rock' | 'building' | 'lamp';

interface GameObject {
  id: number;
  type: RoadObjectType | SideObjectType;
  x: number; 
  y: number; 
  speed: number;
  isSide: boolean;
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

const CARS: Record<CarModel, { name: string; nameHi: string; color: string; accent: string }> = {
  sports: { name: "Thunder", nameHi: "थंडर (Sports)", color: "from-red-500 to-red-700", accent: "text-red-400" },
  suv: { name: "Beast", nameHi: "बीस्ट (SUV)", color: "from-blue-500 to-blue-700", accent: "text-blue-400" },
  classic: { name: "Flash", nameHi: "फ्लैश (Classic)", color: "from-yellow-400 to-yellow-600", accent: "text-yellow-400" },
};

const MODES: Record<GameMode, { 
  name: string; 
  icon: any; 
  sideBg: string; 
  roadBg: string; 
  roadObjects: RoadObjectType[]; 
  sideObjects: SideObjectType[] 
}> = {
  jungle: { 
    name: "Jungle Rush", 
    icon: Trees, 
    sideBg: "bg-green-900", 
    roadBg: "bg-stone-700", 
    roadObjects: ['traffic', 'cone', 'coin', 'heart', 'nitro'], 
    sideObjects: ['tree', 'rock', 'tree', 'tree'] 
  },
  city: { 
    name: "City Drift", 
    icon: Building2, 
    sideBg: "bg-slate-900", 
    roadBg: "bg-gray-800", 
    roadObjects: ['traffic', 'barrier', 'coin', 'heart', 'nitro'], 
    sideObjects: ['building', 'lamp', 'building', 'building'] 
  },
  highway: { 
    name: "Highway Speed", 
    icon: Route, 
    sideBg: "bg-blue-950", 
    roadBg: "bg-zinc-800", 
    roadObjects: ['traffic', 'cone', 'barrier', 'coin', 'heart', 'nitro'], 
    sideObjects: ['lamp', 'rock', 'tree'] 
  }
};

// ✅ World-Class 2D Car SVGs (Full Detail)
const CarSVG = ({ model, tilt, isNitro, isBlinking }: { model: CarModel; tilt: number; isNitro: boolean; isBlinking: boolean }) => {
  const isSports = model === 'sports';
  const isSuv = model === 'suv';
  const isClassic = model === 'classic';
  
  return (
    <svg viewBox="0 0 100 180" className="w-full h-full drop-shadow-2xl" style={{ transform: `rotate(${tilt}deg)`, transition: 'transform 0.15s ease-out', opacity: isBlinking ? 0.5 : 1 }}>
      {/* Nitro Flames */}
      {isNitro && (
        <motion.g animate={{ scaleY: [1, 1.8, 1], opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 0.15 }}>
          <path d="M 35 150 Q 50 200 65 150 Z" fill="#3b82f6" />
          <path d="M 40 150 Q 50 190 60 150 Z" fill="#60a5fa" />
          <path d="M 45 150 Q 50 180 55 150 Z" fill="#ffffff" />
        </motion.g>
      )}
      
      {/* Car Body Base */}
      {isSports && <path d="M 20 40 Q 15 90 20 130 Q 50 145 80 130 Q 85 90 80 40 Q 50 20 20 40 Z" fill="#ef4444" />}
      {isSuv && <path d="M 15 30 Q 10 90 15 140 Q 50 155 85 140 Q 90 90 85 30 Q 50 15 15 30 Z" fill="#3b82f6" />}
      {isClassic && <path d="M 20 30 Q 10 90 20 140 Q 50 150 80 140 Q 90 90 80 30 Q 50 10 20 30 Z" fill="#eab308" />}

      {/* Car Body Highlight */}
      {isSports && <path d="M 25 45 Q 20 90 25 125 Q 50 138 75 125 Q 80 90 75 45 Q 50 25 25 45 Z" fill="#dc2626" />}
      {isSuv && <path d="M 20 35 Q 15 90 20 135 Q 50 148 80 135 Q 85 90 80 35 Q 50 20 20 35 Z" fill="#2563eb" />}
      {isClassic && <path d="M 25 35 Q 15 90 25 135 Q 50 145 75 135 Q 85 90 75 35 Q 50 15 25 35 Z" fill="#ca8a04" />}

      {/* Roof / Cabin */}
      {isSports && <path d="M 30 60 Q 50 65 70 60 L 65 110 Q 50 115 35 110 Z" fill="#991b1b" />}
      {isSuv && <path d="M 25 50 Q 50 55 75 50 L 70 120 Q 50 125 30 120 Z" fill="#1e3a8a" />}
      {isClassic && <path d="M 30 50 Q 50 55 70 50 L 65 120 Q 50 125 35 120 Z" fill="#713f12" />}

      {/* Windshield */}
      <path d="M 32 62 Q 50 68 68 62 L 64 80 Q 50 85 36 80 Z" fill="#1e293b" opacity="0.9" />
      <path d="M 36 85 Q 50 90 64 85 L 66 105 Q 50 110 34 105 Z" fill="#1e293b" opacity="0.9" />

      {/* Windshield Reflection */}
      <path d="M 35 65 Q 45 68 55 65 L 53 75 Q 45 78 37 75 Z" fill="#ffffff" opacity="0.2" />

      {/* Headlights */}
      <circle cx="25" cy="45" r="5" fill="#fef08a" />
      <circle cx="75" cy="45" r="5" fill="#fef08a" />
      <circle cx="25" cy="45" r="3" fill="#ffffff" />
      <circle cx="75" cy="45" r="3" fill="#ffffff" />

      {/* Taillights */}
      <rect x="22" y="135" width="10" height="5" rx="2" fill="#991b1b" />
      <rect x="68" y="135" width="10" height="5" rx="2" fill="#991b1b" />
      <rect x="24" y="136" width="6" height="3" rx="1" fill="#ef4444" />
      <rect x="70" y="136" width="6" height="3" rx="1" fill="#ef4444" />

      {/* Wheels */}
      <rect x="8" y="50" width="14" height="25" rx="4" fill="#0f172a" />
      <rect x="78" y="50" width="14" height="25" rx="4" fill="#0f172a" />
      <rect x="8" y="100" width="14" height="25" rx="4" fill="#0f172a" />
      <rect x="78" y="100" width="14" height="25" rx="4" fill="#0f172a" />
      
      {/* Wheel Details */}
      <rect x="10" y="52" width="10" height="21" rx="3" fill="#1e293b" />
      <rect x="80" y="52" width="10" height="21" rx="3" fill="#1e293b" />
      <rect x="10" y="102" width="10" height="21" rx="3" fill="#1e293b" />
      <rect x="80" y="102" width="10" height="21" rx="3" fill="#1e293b" />
      
      {/* Rims */}
      <circle cx="15" cy="62" r="4" fill="#94a3b8" />
      <circle cx="85" cy="62" r="4" fill="#94a3b8" />
      <circle cx="15" cy="112" r="4" fill="#94a3b8" />
      <circle cx="85" cy="112" r="4" fill="#94a3b8" />
      <circle cx="15" cy="62" r="2" fill="#64748b" />
      <circle cx="85" cy="62" r="2" fill="#64748b" />
      <circle cx="15" cy="112" r="2" fill="#64748b" />
      <circle cx="85" cy="112" r="2" fill="#64748b" />

      {/* Racing Stripe (Sports) */}
      {isSports && <rect x="45" y="30" width="10" height="110" fill="#ffffff" opacity="0.8" />}

      {/* Classic Car Details */}
      {isClassic && <rect x="18" y="80" width="64" height="4" fill="#000000" opacity="0.3" />}
      {isClassic && <circle cx="30" cy="100" r="3" fill="#fbbf24" />}
      {isClassic && <circle cx="70" cy="100" r="3" fill="#fbbf24" />}

      {/* SUV Details */}
      {isSuv && <rect x="20" y="70" width="60" height="3" fill="#1e40af" />}
      {isSuv && <rect x="20" y="110" width="60" height="3" fill="#1e40af" />}
    </svg>
  );
};

// ✅ Scenery SVGs (Only for sides) - Full Detail
const ScenerySVG = ({ type }: { type: SideObjectType }) => {
  if (type === 'tree') return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
      <rect x="42" y="65" width="16" height="35" fill="#78350f" />
      <rect x="44" y="67" width="4" height="30" fill="#92400e" />
      <circle cx="50" cy="40" r="35" fill="#166534" />
      <circle cx="35" cy="55" r="25" fill="#15803d" />
      <circle cx="65" cy="55" r="25" fill="#15803d" />
      <circle cx="50" cy="30" r="20" fill="#22c55e" opacity="0.6" />
    </svg>
  );
  if (type === 'rock') return (
    <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-xl">
      <path d="M 10 70 L 30 30 L 60 20 L 90 50 L 80 70 Z" fill="#57534e" />
      <path d="M 30 30 L 50 40 L 40 60 Z" fill="#78716c" />
      <path d="M 60 20 L 70 35 L 55 45 Z" fill="#a8a29e" opacity="0.6" />
    </svg>
  );
  if (type === 'building') return (
    <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xl">
      <rect x="10" y="20" width="80" height="100" fill="#475569" />
      <rect x="15" y="15" width="70" height="10" fill="#334155" />
      <rect x="20" y="30" width="15" height="20" fill="#fcd34d" />
      <rect x="45" y="30" width="15" height="20" fill="#1e293b" />
      <rect x="70" y="30" width="15" height="20" fill="#fcd34d" />
      <rect x="20" y="60" width="15" height="20" fill="#1e293b" />
      <rect x="45" y="60" width="15" height="20" fill="#fcd34d" />
      <rect x="70" y="60" width="15" height="20" fill="#1e293b" />
      <rect x="40" y="95" width="20" height="25" fill="#1e293b" />
    </svg>
  );
  if (type === 'lamp') return (
    <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xl">
      <rect x="45" y="40" width="10" height="80" fill="#64748b" />
      <path d="M 20 40 Q 50 10 80 40" fill="none" stroke="#64748b" strokeWidth="8" />
      <circle cx="50" cy="35" r="12" fill="#fef08a" opacity="0.8" />
      <circle cx="50" cy="35" r="8" fill="#ffffff" opacity="0.6" />
    </svg>
  );
  return null;
};

// ✅ Road Obstacle SVGs - Full Detail
const ObstacleSVG = ({ type }: { type: RoadObjectType }) => {
  if (type === 'traffic') return (
    <svg viewBox="0 0 100 160" className="w-full h-full drop-shadow-xl">
      <path d="M 20 40 Q 15 80 20 120 Q 50 135 80 120 Q 85 80 80 40 Q 50 25 20 40 Z" fill="#3b82f6" />
      <path d="M 25 45 Q 20 80 25 115 Q 50 128 75 115 Q 80 80 75 45 Q 50 30 25 45 Z" fill="#2563eb" />
      <path d="M 30 55 Q 50 60 70 55 L 65 95 Q 50 100 35 95 Z" fill="#1e3a8a" />
      <path d="M 32 57 Q 50 62 68 57 L 65 75 Q 50 80 35 75 Z" fill="#1e293b" opacity="0.9" />
      <circle cx="28" cy="45" r="4" fill="#fef08a" />
      <circle cx="72" cy="45" r="4" fill="#fef08a" />
      <rect x="12" y="55" width="10" height="20" rx="3" fill="#0f172a" />
      <rect x="78" y="55" width="10" height="20" rx="3" fill="#0f172a" />
      <rect x="12" y="90" width="10" height="20" rx="3" fill="#0f172a" />
      <rect x="78" y="90" width="10" height="20" rx="3" fill="#0f172a" />
    </svg>
  );
  if (type === 'cone') return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
      <rect x="10" y="80" width="80" height="15" rx="4" fill="#f97316" />
      <path d="M 50 10 L 85 80 L 15 80 Z" fill="#f97316" />
      <path d="M 35 40 L 65 40 L 60 55 L 40 55 Z" fill="#ffffff" />
      <path d="M 30 60 L 70 60 L 65 70 L 35 70 Z" fill="#ffffff" />
    </svg>
  );
  if (type === 'barrier') return (
    <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-xl">
      <rect x="0" y="10" width="100" height="40" fill="#f97316" />
      <path d="M 10 10 L 30 50 M 50 10 L 70 50 M 90 10 L 90 50" stroke="#ffffff" strokeWidth="8" />
      <rect x="15" y="50" width="8" height="10" fill="#64748b" />
      <rect x="77" y="50" width="8" height="10" fill="#64748b" />
    </svg>
  );
  if (type === 'coin') return (
    <motion.svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" animate={{ rotateY: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
      <circle cx="50" cy="50" r="40" fill="#fbbf24" stroke="#d97706" strokeWidth="4" />
      <circle cx="50" cy="50" r="35" fill="#fcd34d" />
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
  const [gameState, setGameState] = useState<'menu' | 'carSelect' | 'countdown' | 'playing' | 'paused' | 'gameover'>('menu');
  const [mode, setMode] = useState<GameMode>('jungle');
  const [selectedCar, setSelectedCar] = useState<CarModel>('sports');
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
  const [crashFlash, setCrashFlash] = useState(false);
  const [isInvincible, setIsInvincible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [carTilt, setCarTilt] = useState(0);
  
  // ✅ On-Screen Controls State
  const [leftPressed, setLeftPressed] = useState(false);
  const [rightPressed, setRightPressed] = useState(false);

  const gameLoopRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);
  const playerXRef = useRef(50);
  const keysPressed = useRef<Set<string>>(new Set());
  const countdownRef = useRef<number | null>(null);
  const invincibleTimerRef = useRef<number | null>(null);

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
    setCrashFlash(false);
    setIsInvincible(false);
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

  const spawnParticles = useCallback((x: number, y: number, color: string, count: number, isCrash = false) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + Math.random(),
        x, y,
        vx: (Math.random() - 0.5) * (isCrash ? 4 : 2),
        vy: (Math.random() - 0.5) * (isCrash ? 4 : 2) - (isCrash ? 2 : 1),
        life: 1,
        color,
        size: Math.random() * (isCrash ? 6 : 4) + 2
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // ✅ Game Loop - Full Implementation with Fixed Collisions
  useEffect(() => {
    if (gameState !== 'playing') return;

    const loop = () => {
      const currentSpeed = isNitroActive ? speed * 2.5 : speed;
      
      // 1. Move Player (Smooth steering)
      let moving = false;
      const isLeft = keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a') || leftPressed;
      const isRight = keysPressed.current.has('ArrowRight') || keysPressed.current.has('d') || rightPressed;

      if (isLeft) {
        playerXRef.current = Math.max(28, playerXRef.current - 2.5);
        setCarTilt(-12);
        moving = true;
      } else if (isRight) {
        playerXRef.current = Math.min(72, playerXRef.current + 2.5);
        setCarTilt(12);
        moving = true;
      } else {
        setCarTilt(0);
      }
      setPlayerX(playerXRef.current);

      // 2. Spawn Objects
      lastSpawnRef.current += currentSpeed;
      const spawnRate = isNitroActive ? 20 : 35;
      
      if (lastSpawnRef.current > spawnRate) {
        lastSpawnRef.current = 0;
        const modeData = MODES[mode];
        
        // Spawn Side Scenery
        if (Math.random() > 0.3) {
          const isLeftSide = Math.random() > 0.5;
          const sideType = modeData.sideObjects[Math.floor(Math.random() * modeData.sideObjects.length)];
          setObjects(prev => [...prev, {
            id: Date.now() + Math.random(),
            type: sideType,
            x: isLeftSide ? (5 + Math.random() * 13) : (82 + Math.random() * 13),
            y: -20, // Spawn higher up for natural feel
            speed: currentSpeed * 0.8,
            isSide: true
          }]);
        }

        // Spawn Road Objects (Strictly on road: 30% to 70%)
        const roadType = modeData.roadObjects[Math.floor(Math.random() * modeData.roadObjects.length)];
        setObjects(prev => [...prev, {
          id: Date.now() + Math.random() + 1000,
          type: roadType,
          x: 32 + Math.random() * 36, // Keep away from extreme edges
          y: -20,
          speed: currentSpeed * (roadType === 'traffic' ? 0.6 : 1),
          isSide: false
        }]);
      }

      // 3. Update Objects & Smart Collision
      setObjects(prev => {
        const nextObjects: GameObject[] = [];
        let hitSomething = false;
        let collectedCoin = false, collectedHeart = false, collectedNitro = false;

        prev.forEach(obj => {
          const newY = obj.y + obj.speed;
          
          // Only check collisions for road objects, and only if not invincible
          if (!obj.isSide && !isInvincible) {
            const distX = Math.abs(obj.x - playerXRef.current);
            const distY = Math.abs(newY - 78); // Player center Y is around 78%

            // Tighter, fairer hitboxes
            const hitDistX = obj.type === 'traffic' ? 10 : 7;
            const hitDistY = 8;

            if (distX < hitDistX && distY < hitDistY) {
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
                // Real Crash!
                hitSomething = true;
                if (soundEnabled) playSound('crash');
                setScreenShake(20);
                setCrashFlash(true);
                setTimeout(() => setCrashFlash(false), 300);
                spawnParticles(obj.x, newY, '#ffffff', 20, true);
                spawnParticles(obj.x, newY, '#ef4444', 10, true);
                
                // Invincibility frames
                setIsInvincible(true);
                if (invincibleTimerRef.current) clearTimeout(invincibleTimerRef.current);
                invincibleTimerRef.current = window.setTimeout(() => setIsInvincible(false), 1500);
              }
            }
          }
          
          if (newY < 130) nextObjects.push({ ...obj, y: newY });
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
        ...p, x: p.x + p.vx, y: p.y + p.vy + (isNitroActive ? 1 : 0), life: p.life - 0.05
      })).filter(p => p.life > 0));

      // 5. Update Speed & Screen Shake
      setSpeed(s => Math.min(5, s + 0.0005));
      if (screenShake > 0) setScreenShake(s => Math.max(0, s - 0.5));

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [gameState, mode, score, highScore, isNitroActive, screenShake, soundEnabled, spawnParticles, isInvincible, leftPressed, rightPressed]);

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

  const ModeCard = ({ m, icon: Icon }: { m: GameMode, icon: any }) => (
    <motion.button
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => { setMode(m); setGameState('carSelect'); if(soundEnabled) playSound('select'); }}
      className="w-full bg-stone-800/80 backdrop-blur-md border border-stone-700 rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-emerald-500/50 transition-all group"
    >
      <div className="w-16 h-16 rounded-full bg-stone-700 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
        <Icon className="w-8 h-8 text-emerald-400" />
      </div>
      <h3 className="text-xl font-black text-white">{MODES[m].name}</h3>
      <p className="text-xs text-stone-400 text-center">Choose Car & Race</p>
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-stone-950 text-white relative overflow-hidden font-sans select-none">
      {/* Crash Flash Overlay */}
      <AnimatePresence>
        {crashFlash && (
          <motion.div 
            initial={{ opacity: 0.8 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-red-600 pointer-events-none" 
          />
        )}
      </AnimatePresence>

      {/* MENU SCREEN */}
      <AnimatePresence>
        {gameState === 'menu' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-stone-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8">
            <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="text-center mb-12">
              <div className="inline-block p-4 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 mb-4 shadow-2xl shadow-emerald-500/30">
                <Trophy className="w-16 h-16 text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 mb-2">
                टर्बो रेसर
              </h1>
              <p className="text-stone-400 text-lg">High Score: <span className="text-yellow-400 font-bold">{highScore}</span></p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-8">
              {(['jungle', 'city', 'highway'] as GameMode[]).map((m) => (
                <ModeCard key={m} m={m} icon={MODES[m].icon} />
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => setSoundEnabled(!soundEnabled)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-800 hover:bg-stone-700 transition-colors text-sm font-bold">
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

      {/* CAR SELECTION SCREEN */}
      <AnimatePresence>
        {gameState === 'carSelect' && (
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}
            className="absolute inset-0 z-50 bg-stone-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8">अपनी कार चुनें</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-10">
              {(Object.keys(CARS) as CarModel[]).map((car) => (
                <motion.button key={car} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCar(car)}
                  className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${
                    selectedCar === car ? 'border-emerald-500 bg-emerald-500/10' : 'border-stone-700 bg-stone-800/50 hover:border-stone-500'
                  }`}>
                  {selectedCar === car && (
                    <div className="absolute top-4 right-4 bg-emerald-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="w-32 h-48">
                    <CarSVG model={car} tilt={0} isNitro={false} isBlinking={false} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-black text-white">{car.toUpperCase()}</h3>
                    <p className={`text-sm font-bold ${CARS[car].accent}`}>{CARS[car].nameHi}</p>
                  </div>
                </motion.button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setGameState('menu')} className="px-8 py-4 bg-stone-700 hover:bg-stone-600 rounded-xl font-black text-xl flex items-center gap-2">
                <ArrowLeft className="w-6 h-6" /> वापस
              </button>
              <button onClick={() => startCountdown(mode)} className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 rounded-xl font-black text-xl flex items-center gap-2 shadow-lg shadow-emerald-500/30">
                <Play className="w-6 h-6 fill-white" /> रेस शुरू करें
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COUNTDOWN SCREEN */}
      <AnimatePresence>
        {gameState === 'countdown' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <motion.div key={countdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              className="text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
              {countdown === 0 ? "GO!" : countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAUSE SCREEN */}
      <AnimatePresence>
        {gameState === 'paused' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-6">
            <h2 className="text-6xl font-black text-white">रोका गया (Paused)</h2>
            <div className="flex gap-4">
              <button onClick={() => setGameState('playing')} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-black text-xl flex items-center gap-2">
                <Play className="w-6 h-6 fill-white" /> जारी रखें
              </button>
              <button onClick={() => setGameState('menu')} className="px-8 py-4 bg-stone-700 hover:bg-stone-600 rounded-xl font-black text-xl flex items-center gap-2">
                <ArrowLeft className="w-6 h-6" /> छोड़ें
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GAME OVER SCREEN */}
      <AnimatePresence>
        {gameState === 'gameover' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-red-950/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-stone-900 border-2 border-red-500/50 p-8 md:p-12 rounded-3xl text-center max-w-md w-full shadow-2xl">
              <h2 className="text-5xl font-black text-red-500 mb-2">टक्कर हो गई!</h2>
              <p className="text-stone-400 mb-6">आपकी कार का इंजन खराब हो गया।</p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-stone-800 rounded-xl p-4 border border-stone-700">
                  <div className="text-xs text-stone-400 font-bold uppercase mb-1">स्कोर</div>
                  <div className="text-3xl font-black text-yellow-400">{score}</div>
                </div>
                <div className="bg-stone-800 rounded-xl p-4 border border-stone-700">
                  <div className="text-xs text-stone-400 font-bold uppercase mb-1">बेस्ट</div>
                  <div className="text-3xl font-black text-emerald-400">{highScore}</div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => startCountdown(mode)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-black text-xl py-4 rounded-xl flex items-center justify-center gap-2">
                  <RotateCcw className="w-6 h-6" /> फिर से दौड़ें
                </motion.button>
                <button onClick={() => setGameState('menu')} className="w-full bg-stone-800 text-stone-300 font-bold py-3 rounded-xl hover:bg-stone-700 transition-colors">
                  कार बदलें
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ GAME VIEW */}
      {gameState === 'playing' && (
        <div className="relative w-full h-screen overflow-hidden"
          style={{ transform: `translate(${(Math.random()-0.5)*screenShake}px, ${(Math.random()-0.5)*screenShake}px)` }}>
          
          {/* Side Scenery Background */}
          <div className={`absolute left-0 top-0 bottom-0 w-[25%] ${MODES[mode].sideBg}`} />
          <div className={`absolute right-0 top-0 bottom-0 w-[25%] ${MODES[mode].sideBg}`} />

          {/* Moving Road */}
          <div className={`absolute left-[25%] right-[25%] top-0 bottom-0 ${MODES[mode].roadBg} flex justify-center overflow-hidden`}>
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-yellow-400" />
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-yellow-400" />
            <motion.div animate={{ y: isNitroActive ? [0, 100] : [0, 50] }}
              transition={{ repeat: Infinity, duration: isNitroActive ? 0.2 : 0.5, ease: "linear" }}
              className="w-full h-[200%] flex flex-col justify-between py-10">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-2 h-16 bg-white/80 mx-auto rounded-full" />
              ))}
            </motion.div>
          </div>

          {/* Speed Lines (Nitro Effect) */}
          {isNitroActive && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(15)].map((_, i) => (
                <motion.div key={i} initial={{ y: -100, x: `${Math.random() * 100}%` }}
                  animate={{ y: "120vh" }} transition={{ duration: 0.3, repeat: Infinity, ease: "linear", delay: i * 0.05 }}
                  className="absolute w-1 h-24 bg-white/40 rounded-full" />
              ))}
            </div>
          )}

          {/* Game Objects */}
          {objects.map(obj => (
            <motion.div key={obj.id} className="absolute"
              style={{ 
                left: `${obj.x}%`, top: `${obj.y}%`, transform: 'translate(-50%, -50%)',
                width: obj.isSide ? '15%' : '18%', height: obj.isSide ? '15%' : '18%'
              }}>
              {obj.isSide ? <ScenerySVG type={obj.type as SideObjectType} /> : <ObstacleSVG type={obj.type as RoadObjectType} />}
            </motion.div>
          ))}

          {/* Particles */}
          {particles.map(p => (
            <div key={p.id} className="absolute rounded-full pointer-events-none"
              style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size}px`,
                backgroundColor: p.color, opacity: p.life, transform: 'translate(-50%, -50%)' }} />
          ))}

          {/* Player Car */}
          <motion.div className="absolute w-20 h-36 md:w-24 md:h-40 z-20"
            style={{ left: `${playerX}%`, top: '78%', transform: 'translate(-50%, -50%)', transition: 'left 0.1s ease-out' }}>
            <CarSVG model={selectedCar} tilt={carTilt} isNitro={isNitroActive} isBlinking={isInvincible} />
          </motion.div>

          {/* ✅ HUD */}
          <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-start pointer-events-none">
            <div className="flex flex-col gap-2 pointer-events-auto">
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                <div className="w-24 h-3 bg-stone-700 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-red-500" initial={{ width: '100%' }} animate={{ width: `${health}%` }} />
                </div>
              </div>
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                <Zap className={`w-5 h-5 ${isNitroActive ? 'text-yellow-400 fill-yellow-400 animate-pulse' : 'text-blue-400'}`} />
                <div className="w-24 h-3 bg-stone-700 rounded-full overflow-hidden">
                  <motion.div className={`h-full ${isNitroActive ? 'bg-yellow-400' : 'bg-blue-500'}`} initial={{ width: '100%' }} animate={{ width: `${nitro}%` }} />
                </div>
              </div>
              <button onClick={() => setGameState('paused')} className="bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10 hover:bg-white/20 transition-colors">
                <Pause className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-yellow-500/30 flex items-center gap-3">
              <Coins className="w-6 h-6 text-yellow-400" />
              <span className="text-2xl font-black text-white">{score}</span>
            </div>
          </div>

          {/* ✅ ON-SCREEN CONTROLS (Mobile Friendly) */}
          <div className="absolute bottom-8 left-0 right-0 z-40 flex justify-between items-end px-6 pointer-events-none md:hidden">
            {/* Steering Buttons (Bottom Left) */}
            <div className="flex gap-4 pointer-events-auto">
              <button 
                className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/40 flex items-center justify-center active:scale-90 active:bg-white/40 transition-all"
                onTouchStart={(e) => { e.preventDefault(); setLeftPressed(true); }}
                onTouchEnd={(e) => { e.preventDefault(); setLeftPressed(false); }}
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
              <button 
                className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/40 flex items-center justify-center active:scale-90 active:bg-white/40 transition-all"
                onTouchStart={(e) => { e.preventDefault(); setRightPressed(true); }}
                onTouchEnd={(e) => { e.preventDefault(); setRightPressed(false); }}
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            </div>

            {/* Boost Button (Bottom Right) */}
            <button 
              className={`w-20 h-20 rounded-full border-2 flex items-center justify-center active:scale-90 transition-all pointer-events-auto ${
                nitro <= 0 || isNitroActive ? 'bg-gray-500/20 border-gray-500/40 opacity-50' : 'bg-blue-600/80 border-blue-400 active:bg-blue-500'
              }`}
              disabled={nitro <= 0 || isNitroActive}
              onTouchStart={(e) => {
                e.preventDefault();
                if (nitro > 0 && !isNitroActive) {
                  setIsNitroActive(true); setNitro(n => n - 100);
                  if (soundEnabled) playSound('nitro');
                  setTimeout(() => setIsNitroActive(false), 3000);
                }
              }}
            >
              <Zap className={`w-10 h-10 ${isNitroActive ? 'text-yellow-300 fill-yellow-300' : 'text-white'}`} />
            </button>
          </div>

          {/* Desktop Controls Hint */}
          <div className="absolute bottom-8 left-8 hidden md:block pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 text-xs text-stone-400 space-y-1">
              <div>️ ➡️ या A / D : स्टीयरिंग</div>
              <div>SPACE : नाइट्रो बूस्ट 🚀</div>
              <div>ESC : रोकें (Pause)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}