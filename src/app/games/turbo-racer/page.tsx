"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, RotateCcw, Trophy, Volume2, VolumeX, 
  Trees, Building2, Route, Zap, Heart, Coins, 
  ArrowLeft, Pause, Check, ChevronLeft, ChevronRight
} from "lucide-react";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════
// 🔊 SOUND ENGINE - Web Audio API based sound effects
// ═══════════════════════════════════════════════════════════
const playSound = (type: 'coin' | 'crash' | 'nitro' | 'gameover' | 'countdown' | 'go' | 'select' | 'indicator') => {
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
    } else if (type === 'indicator') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    console.log('Audio error:', e);
  }
};

// ═══════════════════════════════════════════════════════════
// 🎮 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════
// 🚗 CAR & MODE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════
const CARS: Record<CarModel, { name: string; nameHi: string; color: string; accent: string }> = {
  sports: { 
    name: "Thunder", 
    nameHi: "थंडर (Sports)", 
    color: "from-red-500 to-red-700", 
    accent: "text-red-400" 
  },
  suv: { 
    name: "Beast", 
    nameHi: "बीस्ट (SUV)", 
    color: "from-blue-500 to-blue-700", 
    accent: "text-blue-400" 
  },
  classic: { 
    name: "Flash", 
    nameHi: "फ्लैश (Classic)", 
    color: "from-yellow-400 to-yellow-600", 
    accent: "text-yellow-400" 
  },
};

const MODES: Record<GameMode, { 
  name: string; 
  icon: any; 
  sideBg: string; 
  roadBg: string; 
  roadObjects: RoadObjectType[]; 
  sideObjects: SideObjectType[];
  description: string;
}> = {
  jungle: { 
    name: "Jungle Rush", 
    icon: Trees, 
    sideBg: "bg-green-900", 
    roadBg: "bg-stone-700", 
    roadObjects: ['traffic', 'cone', 'coin', 'heart', 'nitro'], 
    sideObjects: ['tree', 'rock', 'tree', 'tree'],
    description: "घने जंगल में तेज़ रफ़्तार"
  },
  city: { 
    name: "City Drift", 
    icon: Building2, 
    sideBg: "bg-slate-900", 
    roadBg: "bg-gray-800", 
    roadObjects: ['traffic', 'barrier', 'coin', 'heart', 'nitro'], 
    sideObjects: ['building', 'lamp', 'building', 'building'],
    description: "शहर की सड़कों पर ड्रिफ्ट"
  },
  highway: { 
    name: "Highway Speed", 
    icon: Route, 
    sideBg: "bg-blue-950", 
    roadBg: "bg-zinc-800", 
    roadObjects: ['traffic', 'cone', 'barrier', 'coin', 'heart', 'nitro'], 
    sideObjects: ['lamp', 'rock', 'tree'],
    description: "हाईवे पर असीम गति"
  }
};

// ═══════════════════════════════════════════════════════════
// 🚗 MICRO-DETAILED CAR SVG COMPONENT
// ═══════════════════════════════════════════════════════════
const CarSVG = ({ 
  model, 
  tilt, 
  isNitro, 
  isBlinking, 
  isTurningLeft, 
  isTurningRight 
}: { 
  model: CarModel; 
  tilt: number; 
  isNitro: boolean; 
  isBlinking: boolean;
  isTurningLeft: boolean;
  isTurningRight: boolean;
}) => {
  const isSports = model === 'sports';
  const isSuv = model === 'suv';
  const isClassic = model === 'classic';

  return (
    <svg 
      viewBox="0 0 100 180" 
      className="w-full h-full drop-shadow-2xl" 
      style={{ 
        transform: `rotate(${tilt}deg)`, 
        transition: 'transform 0.15s ease-out', 
        opacity: isBlinking ? 0.6 : 1 
      }}
    >
      {/* 🔥 Nitro Flames */}
      {isNitro && (
        <motion.g 
          animate={{ scaleY: [1, 1.8, 1], opacity: [0.7, 1, 0.7] }} 
          transition={{ repeat: Infinity, duration: 0.15 }}
        >
          <path d="M 35 150 Q 50 200 65 150 Z" fill="#3b82f6" />
          <path d="M 40 150 Q 50 190 60 150 Z" fill="#60a5fa" />
          <path d="M 45 150 Q 50 180 55 150 Z" fill="#ffffff" />
        </motion.g>
      )}

      {/* 🚗 Car Body Base */}
      {isSports && <path d="M 20 40 Q 15 90 20 130 Q 50 145 80 130 Q 85 90 80 40 Q 50 20 20 40 Z" fill="#ef4444" />}
      {isSuv && <path d="M 15 30 Q 10 90 15 140 Q 50 155 85 140 Q 90 90 85 30 Q 50 15 15 30 Z" fill="#3b82f6" />}
      {isClassic && <path d="M 20 30 Q 10 90 20 140 Q 50 150 80 140 Q 90 90 80 30 Q 50 10 20 30 Z" fill="#eab308" />}

      {/* ✨ Car Body Highlight */}
      {isSports && <path d="M 25 45 Q 20 90 25 125 Q 50 138 75 125 Q 80 90 75 45 Q 50 25 25 45 Z" fill="#dc2626" />}
      {isSuv && <path d="M 20 35 Q 15 90 20 135 Q 50 148 80 135 Q 85 90 80 35 Q 50 20 20 35 Z" fill="#2563eb" />}
      {isClassic && <path d="M 25 35 Q 15 90 25 135 Q 50 145 75 135 Q 85 90 75 35 Q 50 15 25 35 Z" fill="#ca8a04" />}

      {/* 🔧 Body Panel Lines */}
      <path d="M 20 60 L 80 60" stroke="#000000" strokeWidth="0.5" opacity="0.2" />
      <path d="M 20 100 L 80 100" stroke="#000000" strokeWidth="0.5" opacity="0.2" />

      {/* 🏠 Roof / Cabin */}
      {isSports && <path d="M 30 60 Q 50 65 70 60 L 65 110 Q 50 115 35 110 Z" fill="#991b1b" />}
      {isSuv && <path d="M 25 50 Q 50 55 75 50 L 70 120 Q 50 125 30 120 Z" fill="#1e3a8a" />}
      {isClassic && <path d="M 30 50 Q 50 55 70 50 L 65 120 Q 50 125 35 120 Z" fill="#713f12" />}

      {/* 🪟 Windshield */}
      <path d="M 32 62 Q 50 68 68 62 L 64 80 Q 50 85 36 80 Z" fill="#1e293b" opacity="0.9" />
      <path d="M 36 85 Q 50 90 64 85 L 66 105 Q 50 110 34 105 Z" fill="#1e293b" opacity="0.9" />

      {/* 💫 Windshield Reflection */}
      <path d="M 35 65 Q 45 68 55 65 L 53 75 Q 45 78 37 75 Z" fill="#ffffff" opacity="0.3" />
      <path d="M 40 90 Q 50 92 60 90 L 58 100 Q 50 102 42 100 Z" fill="#ffffff" opacity="0.2" />

      {/* 💡 Headlights with Glow */}
      <circle cx="25" cy="45" r="6" fill="#fef08a" opacity="0.3" />
      <circle cx="75" cy="45" r="6" fill="#fef08a" opacity="0.3" />
      <circle cx="25" cy="45" r="4" fill="#fef08a" />
      <circle cx="75" cy="45" r="4" fill="#fef08a" />
      <circle cx="25" cy="45" r="2" fill="#ffffff" />
      <circle cx="75" cy="45" r="2" fill="#ffffff" />

      {/* 🔴 Taillights with Glow */}
      <rect x="20" y="133" width="12" height="7" rx="2" fill="#991b1b" opacity="0.3" />
      <rect x="68" y="133" width="12" height="7" rx="2" fill="#991b1b" opacity="0.3" />
      <rect x="22" y="135" width="8" height="3" rx="1" fill="#ef4444" />
      <rect x="70" y="135" width="8" height="3" rx="1" fill="#ef4444" />

      {/* 🟠 TURN INDICATORS (Blink when turning) */}
      {isTurningLeft && (
        <>
          <motion.circle 
            cx="18" cy="50" r="3" fill="#f97316" 
            animate={{ opacity: [1, 0.3, 1] }} 
            transition={{ repeat: Infinity, duration: 0.5 }} 
          />
          <motion.circle 
            cx="18" cy="50" r="5" fill="#f97316" opacity="0.3" 
            animate={{ opacity: [0.5, 0.1, 0.5] }} 
            transition={{ repeat: Infinity, duration: 0.5 }} 
          />
        </>
      )}
      {isTurningRight && (
        <>
          <motion.circle 
            cx="82" cy="50" r="3" fill="#f97316" 
            animate={{ opacity: [1, 0.3, 1] }} 
            transition={{ repeat: Infinity, duration: 0.5 }} 
          />
          <motion.circle 
            cx="82" cy="50" r="5" fill="#f97316" opacity="0.3" 
            animate={{ opacity: [0.5, 0.1, 0.5] }} 
            transition={{ repeat: Infinity, duration: 0.5 }} 
          />
        </>
      )}

      {/* 🛞 Wheels - Detailed */}
      <rect x="8" y="50" width="14" height="25" rx="4" fill="#0f172a" />
      <rect x="10" y="52" width="10" height="21" rx="3" fill="#1e293b" />
      <circle cx="15" cy="62" r="4" fill="#94a3b8" />
      <circle cx="15" cy="62" r="2" fill="#64748b" />
      <line x1="15" y1="58" x2="15" y2="66" stroke="#475569" strokeWidth="0.5" />
      <line x1="11" y1="62" x2="19" y2="62" stroke="#475569" strokeWidth="0.5" />

      <rect x="78" y="50" width="14" height="25" rx="4" fill="#0f172a" />
      <rect x="80" y="52" width="10" height="21" rx="3" fill="#1e293b" />
      <circle cx="85" cy="62" r="4" fill="#94a3b8" />
      <circle cx="85" cy="62" r="2" fill="#64748b" />
      <line x1="85" y1="58" x2="85" y2="66" stroke="#475569" strokeWidth="0.5" />
      <line x1="81" y1="62" x2="89" y2="62" stroke="#475569" strokeWidth="0.5" />

      <rect x="8" y="100" width="14" height="25" rx="4" fill="#0f172a" />
      <rect x="10" y="102" width="10" height="21" rx="3" fill="#1e293b" />
      <circle cx="15" cy="112" r="4" fill="#94a3b8" />
      <circle cx="15" cy="112" r="2" fill="#64748b" />
      <line x1="15" y1="108" x2="15" y2="116" stroke="#475569" strokeWidth="0.5" />
      <line x1="11" y1="112" x2="19" y2="112" stroke="#475569" strokeWidth="0.5" />

      <rect x="78" y="100" width="14" height="25" rx="4" fill="#0f172a" />
      <rect x="80" y="102" width="10" height="21" rx="3" fill="#1e293b" />
      <circle cx="85" cy="112" r="4" fill="#94a3b8" />
      <circle cx="85" cy="112" r="2" fill="#64748b" />
      <line x1="85" y1="108" x2="85" y2="116" stroke="#475569" strokeWidth="0.5" />
      <line x1="81" y1="112" x2="89" y2="112" stroke="#475569" strokeWidth="0.5" />

      {/* 🏁 Racing Stripe (Sports) */}
      {isSports && <rect x="45" y="30" width="10" height="110" fill="#ffffff" opacity="0.8" />}

      {/* 🚙 Classic Car Details */}
      {isClassic && <rect x="18" y="80" width="64" height="4" fill="#000000" opacity="0.3" />}
      {isClassic && <circle cx="30" cy="100" r="3" fill="#fbbf24" />}
      {isClassic && <circle cx="70" cy="100" r="3" fill="#fbbf24" />}

      {/* 🚐 SUV Details */}
      {isSuv && <rect x="20" y="70" width="60" height="3" fill="#1e40af" />}
      {isSuv && <rect x="20" y="110" width="60" height="3" fill="#1e40af" />}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════
// 🌲 SCENERY SVG COMPONENTS (Side Objects)
// ═══════════════════════════════════════════════════════════
const ScenerySVG = ({ type }: { type: SideObjectType }) => {
  if (type === 'tree') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
        <rect x="42" y="65" width="16" height="35" fill="#78350f" />
        <rect x="44" y="67" width="4" height="30" fill="#92400e" />
        <circle cx="50" cy="40" r="35" fill="#166534" />
        <circle cx="35" cy="55" r="25" fill="#15803d" />
        <circle cx="65" cy="55" r="25" fill="#15803d" />
        <circle cx="50" cy="30" r="20" fill="#22c55e" opacity="0.6" />
        <circle cx="40" cy="35" r="8" fill="#16a34a" opacity="0.5" />
        <circle cx="60" cy="45" r="10" fill="#16a34a" opacity="0.5" />
      </svg>
    );
  }
  if (type === 'rock') {
    return (
      <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-xl">
        <path d="M 10 70 L 30 30 L 60 20 L 90 50 L 80 70 Z" fill="#57534e" />
        <path d="M 30 30 L 50 40 L 40 60 Z" fill="#78716c" />
        <path d="M 60 20 L 70 35 L 55 45 Z" fill="#a8a29e" opacity="0.6" />
        <path d="M 10 70 L 25 50 L 35 65 Z" fill="#44403c" />
        <circle cx="45" cy="45" r="3" fill="#57534e" />
        <circle cx="65" cy="55" r="2" fill="#57534e" />
      </svg>
    );
  }
  if (type === 'building') {
    return (
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
        <rect x="10" y="90" width="80" height="2" fill="#334155" />
      </svg>
    );
  }
  if (type === 'lamp') {
    return (
      <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xl">
        <rect x="45" y="40" width="10" height="80" fill="#64748b" />
        <rect x="47" y="42" width="3" height="75" fill="#94a3b8" opacity="0.5" />
        <path d="M 20 40 Q 50 10 80 40" fill="none" stroke="#64748b" strokeWidth="8" />
        <path d="M 25 38 Q 50 15 75 38" fill="none" stroke="#94a3b8" strokeWidth="3" opacity="0.5" />
        <circle cx="50" cy="35" r="15" fill="#fef08a" opacity="0.3" />
        <circle cx="50" cy="35" r="12" fill="#fef08a" opacity="0.8" />
        <circle cx="50" cy="35" r="8" fill="#ffffff" opacity="0.6" />
        <rect x="40" y="115" width="20" height="5" fill="#475569" />
      </svg>
    );
  }
  return null;
};

// ═══════════════════════════════════════════════════════════
// 🚧 ROAD OBSTACLE SVG COMPONENTS
// ═══════════════════════════════════════════════════════════
const ObstacleSVG = ({ type }: { type: RoadObjectType }) => {
  if (type === 'traffic') {
    return (
      <svg viewBox="0 0 100 160" className="w-full h-full drop-shadow-xl">
        <path d="M 20 40 Q 15 80 20 120 Q 50 135 80 120 Q 85 80 80 40 Q 50 25 20 40 Z" fill="#3b82f6" />
        <path d="M 25 45 Q 20 80 25 115 Q 50 128 75 115 Q 80 80 75 45 Q 50 30 25 45 Z" fill="#2563eb" />
        <path d="M 30 55 Q 50 60 70 55 L 65 95 Q 50 100 35 95 Z" fill="#1e3a8a" />
        <path d="M 32 57 Q 50 62 68 57 L 65 75 Q 50 80 35 75 Z" fill="#1e293b" opacity="0.9" />
        <path d="M 35 80 Q 50 85 65 80 L 67 95 Q 50 100 33 95 Z" fill="#1e293b" opacity="0.9" />
        <circle cx="28" cy="45" r="4" fill="#fef08a" />
        <circle cx="72" cy="45" r="4" fill="#fef08a" />
        <rect x="25" y="120" width="8" height="4" rx="2" fill="#991b1b" />
        <rect x="67" y="120" width="8" height="4" rx="2" fill="#991b1b" />
        <rect x="12" y="55" width="10" height="20" rx="3" fill="#0f172a" />
        <rect x="78" y="55" width="10" height="20" rx="3" fill="#0f172a" />
        <rect x="12" y="90" width="10" height="20" rx="3" fill="#0f172a" />
        <rect x="78" y="90" width="10" height="20" rx="3" fill="#0f172a" />
      </svg>
    );
  }
  if (type === 'cone') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
        <rect x="10" y="80" width="80" height="15" rx="4" fill="#f97316" />
        <rect x="15" y="82" width="70" height="11" rx="3" fill="#ea580c" />
        <path d="M 50 10 L 85 80 L 15 80 Z" fill="#f97316" />
        <path d="M 50 15 L 80 78 L 20 78 Z" fill="#fb923c" />
        <path d="M 35 40 L 65 40 L 60 55 L 40 55 Z" fill="#ffffff" />
        <path d="M 30 60 L 70 60 L 65 70 L 35 70 Z" fill="#ffffff" />
        <path d="M 50 15 L 55 78 L 45 78 Z" fill="#ffffff" opacity="0.3" />
      </svg>
    );
  }
  if (type === 'barrier') {
    return (
      <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-xl">
        <rect x="0" y="10" width="100" height="40" fill="#f97316" />
        <rect x="2" y="12" width="96" height="36" fill="#fb923c" />
        <path d="M 10 10 L 30 50 M 50 10 L 70 50 M 90 10 L 90 50" stroke="#ffffff" strokeWidth="8" />
        <rect x="0" y="10" width="100" height="3" fill="#ea580c" />
        <rect x="0" y="47" width="100" height="3" fill="#ea580c" />
        <rect x="15" y="50" width="8" height="10" fill="#64748b" />
        <rect x="77" y="50" width="8" height="10" fill="#64748b" />
      </svg>
    );
  }
  if (type === 'coin') {
    return (
      <motion.svg 
        viewBox="0 0 100 100" 
        className="w-full h-full drop-shadow-lg" 
        animate={{ rotateY: 360 }} 
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
      >
        <circle cx="50" cy="50" r="40" fill="#fbbf24" stroke="#d97706" strokeWidth="4" />
        <circle cx="50" cy="50" r="35" fill="#fcd34d" />
        <circle cx="50" cy="50" r="30" fill="#fbbf24" />
        <text x="50" y="65" fontSize="40" fontWeight="bold" fill="#92400e" textAnchor="middle">$</text>
        <circle cx="35" cy="35" r="8" fill="#ffffff" opacity="0.4" />
      </motion.svg>
    );
  }
  if (type === 'heart') {
    return (
      <motion.svg 
        viewBox="0 0 100 100" 
        className="w-full h-full drop-shadow-lg" 
        animate={{ scale: [1, 1.2, 1] }} 
        transition={{ repeat: Infinity, duration: 1 }}
      >
        <path d="M 50 85 C 20 60 5 40 5 25 C 5 10 20 5 35 15 C 45 22 50 30 50 30 C 50 30 55 22 65 15 C 80 5 95 10 95 25 C 95 40 80 60 50 85 Z" fill="#ef4444" />
        <path d="M 50 80 C 25 58 12 40 12 28 C 12 15 22 12 33 20 C 42 26 50 33 50 33" fill="#f87171" opacity="0.6" />
        <circle cx="30" cy="30" r="6" fill="#ffffff" opacity="0.5" />
      </motion.svg>
    );
  }
  if (type === 'nitro') {
    return (
      <motion.svg 
        viewBox="0 0 100 100" 
        className="w-full h-full drop-shadow-lg" 
        animate={{ scale: [1, 1.1, 1] }} 
        transition={{ repeat: Infinity, duration: 0.8 }}
      >
        <path d="M 30 80 L 50 10 L 70 50 L 90 40 L 50 90 Z" fill="#3b82f6" stroke="#ffffff" strokeWidth="3" />
        <path d="M 35 75 L 52 15 L 68 48 L 85 42 L 52 85 Z" fill="#60a5fa" opacity="0.7" />
        <path d="M 45 20 L 50 10 L 55 25 L 48 30 Z" fill="#ffffff" opacity="0.5" />
      </motion.svg>
    );
  }
  return null;
};

// ═══════════════════════════════════════════════════════════
// 🎮 MAIN GAME COMPONENT
// ═══════════════════════════════════════════════════════════
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
  const [isTurningLeft, setIsTurningLeft] = useState(false);
  const [isTurningRight, setIsTurningRight] = useState(false);
  const [leftPressed, setLeftPressed] = useState(false);
  const [rightPressed, setRightPressed] = useState(false);

  const gameLoopRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);
  const playerXRef = useRef(50);
  const keysPressed = useRef<Set<string>>(new Set());
  const countdownRef = useRef<number | null>(null);
  const invincibleTimerRef = useRef<number | null>(null);
  const lastIndicatorSoundRef = useRef(0);

  // ✅ Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("alamnagarRacerHighScore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // ✅ Prevent page scroll during gameplay - CRITICAL FIX
  useEffect(() => {
    if (gameState === 'playing' || gameState === 'countdown') {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
      document.documentElement.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.documentElement.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.documentElement.style.overflow = '';
    };
  }, [gameState]);

  // 🎬 Start countdown sequence
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
    setIsTurningLeft(false);
    setIsTurningRight(false);
    setLeftPressed(false);
    setRightPressed(false);
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

  // 💥 Spawn particles for effects
  const spawnParticles = useCallback((x: number, y: number, color: string, count: number, isCrash = false) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * (isCrash ? 4 : 2),
        vy: (Math.random() - 0.5) * (isCrash ? 4 : 2) - (isCrash ? 2 : 1),
        life: 1,
        color,
        size: Math.random() * (isCrash ? 6 : 4) + 2
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // 🎮 Main game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const loop = () => {
      const currentSpeed = isNitroActive ? speed * 2.5 : speed;

      // 1. Player movement with smooth steering
      const isLeft = keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a') || leftPressed;
      const isRight = keysPressed.current.has('ArrowRight') || keysPressed.current.has('d') || rightPressed;

      // Update turn indicators
      setIsTurningLeft(isLeft && !isRight);
      setIsTurningRight(isRight && !isLeft);

      // Play indicator sound every 0.5 seconds
      if ((isLeft || isRight) && Date.now() - lastIndicatorSoundRef.current > 500) {
        if (soundEnabled) playSound('indicator');
        lastIndicatorSoundRef.current = Date.now();
      }

      if (isLeft) {
        playerXRef.current = Math.max(28, playerXRef.current - 2.5);
        setCarTilt(-15);
      } else if (isRight) {
        playerXRef.current = Math.min(72, playerXRef.current + 2.5);
        setCarTilt(15);
      } else {
        setCarTilt(0);
      }
      setPlayerX(playerXRef.current);

      // 2. Spawn objects
      lastSpawnRef.current += currentSpeed;
      const spawnRate = isNitroActive ? 20 : 35;

      if (lastSpawnRef.current > spawnRate) {
        lastSpawnRef.current = 0;
        const modeData = MODES[mode];

        // Spawn side scenery (parallax effect)
        if (Math.random() > 0.3) {
          const isLeftSide = Math.random() > 0.5;
          const sideType = modeData.sideObjects[Math.floor(Math.random() * modeData.sideObjects.length)];
          setObjects(prev => [...prev, {
            id: Date.now() + Math.random(),
            type: sideType,
            x: isLeftSide ? (5 + Math.random() * 13) : (82 + Math.random() * 13),
            y: -20,
            speed: currentSpeed * 0.8,
            isSide: true
          }]);
        }

        // Spawn road objects
        const roadType = modeData.roadObjects[Math.floor(Math.random() * modeData.roadObjects.length)];
        setObjects(prev => [...prev, {
          id: Date.now() + Math.random() + 1000,
          type: roadType,
          x: 32 + Math.random() * 36,
          y: -20,
          speed: currentSpeed * (roadType === 'traffic' ? 0.6 : 1),
          isSide: false
        }]);
      }

      // 3. Update objects & smart collision detection
      setObjects(prev => {
        const nextObjects: GameObject[] = [];
        let hitSomething = false;
        let collectedCoin = false;
        let collectedHeart = false;
        let collectedNitro = false;

        prev.forEach(obj => {
          const newY = obj.y + obj.speed;

          // Only check collisions for road objects, and only if not invincible
          if (!obj.isSide && !isInvincible) {
            const distX = Math.abs(obj.x - playerXRef.current);
            const distY = Math.abs(newY - 78);

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

                // Invincibility frames after crash
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

      // 4. Update particles
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy + (isNitroActive ? 1 : 0),
        life: p.life - 0.05
      })).filter(p => p.life > 0));

      // 5. Update speed & screen shake decay
      setSpeed(s => Math.min(5, s + 0.0005));
      if (screenShake > 0) setScreenShake(s => Math.max(0, s - 0.5));

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [gameState, mode, score, highScore, isNitroActive, screenShake, soundEnabled, spawnParticles, isInvincible, leftPressed, rightPressed]);

  // ⌨️ Keyboard input handlers
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

  // 🎨 Mode selection card component
  const ModeCard = ({ m, icon: Icon }: { m: GameMode; icon: any }) => (
    <motion.button
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => { setMode(m); setGameState('carSelect'); if (soundEnabled) playSound('select'); }}
      className="w-full bg-stone-800/80 backdrop-blur-md border border-stone-700 rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-emerald-500/50 transition-all group"
    >
      <div className="w-16 h-16 rounded-full bg-stone-700 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
        <Icon className="w-8 h-8 text-emerald-400" />
      </div>
      <h3 className="text-xl font-black text-white">{MODES[m].name}</h3>
      <p className="text-xs text-stone-400 text-center">{MODES[m].description}</p>
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-stone-950 text-white relative overflow-hidden font-sans select-none">
      {/* 💥 Crash Flash Overlay */}
      <AnimatePresence>
        {crashFlash && (
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-red-600 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* 🏠 MAIN MENU SCREEN */}
      <AnimatePresence>
        {gameState === 'menu' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto"
          >
            <div className="w-full max-w-4xl flex flex-col items-center">
              <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="text-center mb-8 md:mb-12">
                <div className="inline-block p-4 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 mb-4 shadow-2xl shadow-emerald-500/30">
                  <Trophy className="w-12 h-12 md:w-16 md:h-16 text-white" />
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 mb-2">
                  टर्बो रेसर
                </h1>
                <p className="text-stone-400 text-base md:text-lg">
                  High Score: <span className="text-yellow-400 font-bold">{highScore}</span>
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full mb-6 md:mb-8">
                {(['jungle', 'city', 'highway'] as GameMode[]).map((m) => (
                  <ModeCard key={m} m={m} icon={MODES[m].icon} />
                ))}
              </div>

              <div className="flex items-center gap-3 md:gap-4">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-stone-800 hover:bg-stone-700 transition-colors text-xs md:text-sm font-bold"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                  <span className="hidden sm:inline">{soundEnabled ? "Sound On" : "Sound Off"}</span>
                </button>
                <Link
                  href="/"
                  className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-stone-800 hover:bg-stone-700 transition-colors text-xs md:text-sm font-bold"
                >
                  <ArrowLeft className="w-4 h-4" /> Home
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚗 CAR SELECTION SCREEN - FIXED: Scrollable on mobile */}
      <AnimatePresence>
        {gameState === 'carSelect' && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-xl overflow-y-auto"
          >
            <div className="min-h-full flex flex-col items-center justify-center p-4 py-8">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 md:mb-8 text-center">अपनी कार चुनें</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl mb-6 md:mb-10">
                {(Object.keys(CARS) as CarModel[]).map((car) => (
                  <motion.button
                    key={car}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCar(car)}
                    className={`relative p-4 md:p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 md:gap-4 ${
                      selectedCar === car
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-stone-700 bg-stone-800/50 hover:border-stone-500'
                    }`}
                  >
                    {selectedCar === car && (
                      <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-emerald-500 rounded-full p-1">
                        <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      </div>
                    )}
                    <div className="w-24 h-36 md:w-32 md:h-48">
                      <CarSVG
                        model={car}
                        tilt={0}
                        isNitro={false}
                        isBlinking={false}
                        isTurningLeft={false}
                        isTurningRight={false}
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl md:text-2xl font-black text-white">{car.toUpperCase()}</h3>
                      <p className={`text-xs md:text-sm font-bold ${CARS[car].accent}`}>{CARS[car].nameHi}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3 md:gap-4">
                <button
                  onClick={() => setGameState('menu')}
                  className="px-6 md:px-8 py-3 md:py-4 bg-stone-700 hover:bg-stone-600 rounded-xl font-bold md:font-black text-base md:text-xl flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" /> वापस
                </button>
                <button
                  onClick={() => startCountdown(mode)}
                  className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 rounded-xl font-bold md:font-black text-base md:text-xl flex items-center gap-2 shadow-lg shadow-emerald-500/30"
                >
                  <Play className="w-5 h-5 md:w-6 md:h-6 fill-white" /> रेस शुरू करें
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⏱️ COUNTDOWN SCREEN */}
      <AnimatePresence>
        {gameState === 'countdown' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
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

      {/* ⏸️ PAUSE SCREEN */}
      <AnimatePresence>
        {gameState === 'paused' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-6"
          >
            <h2 className="text-5xl md:text-6xl font-black text-white">रोका गया</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setGameState('playing')}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-black text-xl flex items-center gap-2"
              >
                <Play className="w-6 h-6 fill-white" /> जारी रखें
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="px-8 py-4 bg-stone-700 hover:bg-stone-600 rounded-xl font-black text-xl flex items-center gap-2"
              >
                <ArrowLeft className="w-6 h-6" /> छोड़ें
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💀 GAME OVER SCREEN */}
      <AnimatePresence>
        {gameState === 'gameover' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-red-950/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-stone-900 border-2 border-red-500/50 p-6 md:p-12 rounded-3xl text-center max-w-md w-full shadow-2xl my-8">
              <h2 className="text-4xl md:text-5xl font-black text-red-500 mb-2">टक्कर हो गई!</h2>
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startCountdown(mode)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-black text-xl py-4 rounded-xl flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-6 h-6" /> फिर से दौड़ें
                </motion.button>
                <button
                  onClick={() => setGameState('menu')}
                  className="w-full bg-stone-800 text-stone-300 font-bold py-3 rounded-xl hover:bg-stone-700 transition-colors"
                >
                  कार बदलें
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎮 GAME VIEW - FIXED: Proper viewport height, no scroll */}
      {gameState === 'playing' && (
        <div
          className="fixed inset-0 w-screen h-[100dvh] overflow-hidden bg-stone-950"
          style={{ touchAction: 'none' }}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: screenShake > 0
                ? `translate(${(Math.random() - 0.5) * screenShake}px, ${(Math.random() - 0.5) * screenShake}px)`
                : 'none'
            }}
          >
            {/* 🌲 Side Scenery Background */}
            <div className={`absolute left-0 top-0 bottom-0 w-[25%] ${MODES[mode].sideBg}`} />
            <div className={`absolute right-0 top-0 bottom-0 w-[25%] ${MODES[mode].sideBg}`} />

            {/* 🛣️ Moving Road */}
            <div className={`absolute left-[25%] right-[25%] top-0 bottom-0 ${MODES[mode].roadBg} flex justify-center overflow-hidden`}>
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-yellow-400" />
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-yellow-400" />
              <motion.div
                animate={{ y: isNitroActive ? [0, 100] : [0, 50] }}
                transition={{
                  repeat: Infinity,
                  duration: isNitroActive ? 0.2 : 0.5,
                  ease: "linear"
                }}
                className="w-full h-[200%] flex flex-col justify-between py-10"
              >
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="w-2 h-16 bg-white/80 mx-auto rounded-full" />
                ))}
              </motion.div>
            </div>

            {/* ⚡ Speed Lines (Nitro Effect) */}
            {isNitroActive && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -100, x: `${Math.random() * 100}%` }}
                    animate={{ y: "120vh" }}
                    transition={{
                      duration: 0.3,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.05
                    }}
                    className="absolute w-1 h-24 bg-white/40 rounded-full"
                  />
                ))}
              </div>
            )}

            {/* 🎯 Game Objects */}
            {objects.map(obj => (
              <div
                key={obj.id}
                className="absolute"
                style={{
                  left: `${obj.x}%`,
                  top: `${obj.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: obj.isSide ? '15%' : '18%',
                  height: obj.isSide ? '15%' : '18%'
                }}
              >
                {obj.isSide ? (
                  <ScenerySVG type={obj.type as SideObjectType} />
                ) : (
                  <ObstacleSVG type={obj.type as RoadObjectType} />
                )}
              </div>
            ))}

            {/* 💫 Particles */}
            {particles.map(p => (
              <div
                key={p.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.color,
                  opacity: p.life,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}

            {/* 🚗 Player Car with Indicators */}
            <div
              className="absolute w-20 h-36 md:w-24 md:h-40 z-20 pointer-events-none"
              style={{
                left: `${playerX}%`,
                top: '78%',
                transform: 'translate(-50%, -50%)',
                transition: 'left 0.1s ease-out'
              }}
            >
              <CarSVG
                model={selectedCar}
                tilt={carTilt}
                isNitro={isNitroActive}
                isBlinking={isInvincible}
                isTurningLeft={isTurningLeft}
                isTurningRight={isTurningRight}
              />
            </div>
          </div>

          {/* 📊 HUD */}
          <div className="absolute top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 z-50 flex justify-between items-start pointer-events-none">
            <div className="flex flex-col gap-1.5 md:gap-2 pointer-events-auto">
              <div className="bg-black/70 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/20 flex items-center gap-2">
                <Heart className="w-4 h-4 md:w-5 md:h-5 text-red-500 fill-red-500" />
                <div className="w-20 md:w-24 h-2.5 md:h-3 bg-stone-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-red-500"
                    animate={{ width: `${health}%` }}
                  />
                </div>
              </div>
              <div className="bg-black/70 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/20 flex items-center gap-2">
                <Zap
                  className={`w-4 h-4 md:w-5 md:h-5 ${isNitroActive ? 'text-yellow-400 fill-yellow-400' : 'text-blue-400'}`}
                />
                <div className="w-20 md:w-24 h-2.5 md:h-3 bg-stone-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${isNitroActive ? 'bg-yellow-400' : 'bg-blue-500'}`}
                    animate={{ width: `${nitro}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => setGameState('paused')}
                className="bg-black/70 backdrop-blur-md p-2 md:p-3 rounded-full border border-white/20"
                style={{ touchAction: 'manipulation' }}
              >
                <Pause className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </button>
            </div>

            <div className="bg-black/70 backdrop-blur-md px-4 md:px-6 py-2 md:py-3 rounded-full border border-yellow-500/30 flex items-center gap-2 md:gap-3">
              <Coins className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              <span className="text-xl md:text-2xl font-black text-white">{score}</span>
            </div>
          </div>

          {/* 🎮 STEERING CONTROLS - FIXED: Left arrow LEFT side, Right arrow RIGHT side */}
          {/* Left Steering Button - Bottom Left */}
          <button
            className={`fixed bottom-6 left-4 z-50 w-20 h-20 md:w-24 md:h-24 rounded-full border-[3px] flex items-center justify-center transition-all ${
              leftPressed
                ? 'bg-white/50 border-white scale-90 shadow-lg shadow-white/30'
                : 'bg-black/50 border-white/40'
            }`}
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            onTouchStart={(e) => { e.preventDefault(); setLeftPressed(true); }}
            onTouchEnd={(e) => { e.preventDefault(); setLeftPressed(false); }}
            onTouchCancel={() => setLeftPressed(false)}
            onMouseDown={() => setLeftPressed(true)}
            onMouseUp={() => setLeftPressed(false)}
            onMouseLeave={() => setLeftPressed(false)}
          >
            <ChevronLeft className="w-12 h-12 md:w-14 md:h-14 text-white" strokeWidth={3} />
          </button>

          {/* Right Steering Button - Bottom Right */}
          <button
            className={`fixed bottom-6 right-4 z-50 w-20 h-20 md:w-24 md:h-24 rounded-full border-[3px] flex items-center justify-center transition-all ${
              rightPressed
                ? 'bg-white/50 border-white scale-90 shadow-lg shadow-white/30'
                : 'bg-black/50 border-white/40'
            }`}
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            onTouchStart={(e) => { e.preventDefault(); setRightPressed(true); }}
            onTouchEnd={(e) => { e.preventDefault(); setRightPressed(false); }}
            onTouchCancel={() => setRightPressed(false)}
            onMouseDown={() => setRightPressed(true)}
            onMouseUp={() => setRightPressed(false)}
            onMouseLeave={() => setRightPressed(false)}
          >
            <ChevronRight className="w-12 h-12 md:w-14 md:h-14 text-white" strokeWidth={3} />
          </button>

          {/* 🚀 BOOST BUTTON - Above Right Steering */}
          <button
            className={`fixed bottom-32 right-6 z-50 w-16 h-16 md:w-20 md:h-20 rounded-full border-[3px] flex items-center justify-center transition-all ${
              nitro <= 0 || isNitroActive
                ? 'bg-gray-800/50 border-gray-600 opacity-40'
                : 'bg-blue-600/80 border-blue-400 shadow-lg shadow-blue-500/50'
            }`}
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              pointerEvents: 'auto'
            }}
            disabled={nitro <= 0 || isNitroActive}
            onTouchStart={(e) => {
              e.preventDefault();
              if (nitro > 0 && !isNitroActive) {
                setIsNitroActive(true);
                setNitro(n => n - 100);
                if (soundEnabled) playSound('nitro');
                setTimeout(() => setIsNitroActive(false), 3000);
              }
            }}
            onMouseDown={() => {
              if (nitro > 0 && !isNitroActive) {
                setIsNitroActive(true);
                setNitro(n => n - 100);
                if (soundEnabled) playSound('nitro');
                setTimeout(() => setIsNitroActive(false), 3000);
              }
            }}
          >
            <Zap
              className={`w-10 h-10 md:w-12 md:h-12 ${isNitroActive ? 'text-yellow-300' : 'text-white'}`}
              strokeWidth={3}
            />
          </button>
        </div>
      )}
    </div>
  );
}