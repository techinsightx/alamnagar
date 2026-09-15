"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Trophy, Play, RotateCcw, Volume2, VolumeX, Target, 
  MapPin, Trees, Building2, AlertTriangle, Mic, MicOff, Wind,
  RefreshCw, Zap, Skull, Crosshair
} from "lucide-react";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import { 
  doc, setDoc, onSnapshot, serverTimestamp, deleteDoc 
} from "firebase/firestore";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  updateProfile
} from "firebase/auth";

// ═══════════════════════════════════════════════════════════
// 🔊 ADVANCED AUDIO ENGINE WITH MULTIPLE SOUND EFFECTS
// ═══════════════════════════════════════════════════════════
const playSound = (type: string, volume: number = 1.0) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator(); 
    const gain = ctx.createGain();
    osc.connect(gain); 
    gain.connect(ctx.destination);
    gain.gain.value = volume;

    switch (type) {
      case 'pistol':
        osc.type = 'square'; 
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime); 
        osc.stop(ctx.currentTime + 0.1);
        break;
      case 'rifle':
        osc.type = 'sawtooth'; 
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime); 
        osc.stop(ctx.currentTime + 0.08);
        break;
      case 'shotgun':
        osc.type = 'sawtooth'; 
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime); 
        osc.stop(ctx.currentTime + 0.3);
        break;
      case 'sniper':
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime); 
        osc.stop(ctx.currentTime + 0.5);
        break;
      case 'reload':
        osc.type = 'triangle'; 
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1);
        osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime); 
        osc.stop(ctx.currentTime + 0.2);
        break;
      case 'hit':
        osc.type = 'sawtooth'; 
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime); 
        osc.stop(ctx.currentTime + 0.15);
        break;
      case 'kill':
        osc.type = 'triangle'; 
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime); 
        osc.stop(ctx.currentTime + 0.2);
        break;
      case 'explode':
        osc.type = 'sawtooth'; 
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime); 
        osc.stop(ctx.currentTime + 0.4);
        break;
      case 'roar':
        osc.type = 'sawtooth'; 
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime); 
        osc.stop(ctx.currentTime + 0.4);
        break;
      case 'ghost_wail':
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime); 
        osc.stop(ctx.currentTime + 0.5);
        break;
      case 'ambient_wind':
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 2);
        gain.gain.setValueAtTime(0.05, ctx.currentTime); 
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
        osc.start(ctx.currentTime); 
        osc.stop(ctx.currentTime + 2);
        break;
      case 'gameover':
        osc.type = 'sawtooth'; 
        osc.frequency.setValueAtTime(300, ctx.currentTime); 
        osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 1);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1);
        osc.start(ctx.currentTime); 
        osc.stop(ctx.currentTime + 1);
        break;
      case 'dash':
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime); 
        osc.stop(ctx.currentTime + 0.2);
        break;
      case 'combo':
        osc.type = 'square'; 
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime); 
        osc.stop(ctx.currentTime + 0.3);
        break;
      case 'boss_spawn':
        osc.type = 'sawtooth'; 
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.5);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1);
        osc.start(ctx.currentTime); 
        osc.stop(ctx.currentTime + 1);
        break;
    }
  } catch (e) {
    console.log('Audio error:', e);
  }
};

// ═══════════════════════════════════════════════════════════
// 🎮 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════
type Environment = 'gali' | 'jungle' | 'city';
type WeaponType = 'pistol' | 'rifle' | 'shotgun' | 'sniper';
type EnemyType = 'zombie' | 'thug' | 'tiger' | 'ghost' | 'alien';
type ParticleType = 'blood' | 'spark' | 'shell' | 'dust' | 'explosion';

interface WeaponStats {
  name: string;
  fireRate: number;
  damage: number;
  spread: number;
  speed: number;
  color: string;
  size: number;
  muzzleOffset: number;
  recoil: number;
  magSize: number;
  reloadTime: number;
}

const WEAPONS: Record<WeaponType, WeaponStats> = {
  pistol: { 
    name: "Pistol", fireRate: 250, damage: 1, spread: 0, speed: 2.5, 
    color: "#fbbf24", size: 6, muzzleOffset: 3.5, recoil: 2, 
    magSize: 12, reloadTime: 1000 
  },
  rifle: { 
    name: "Rifle", fireRate: 100, damage: 1, spread: 0.05, speed: 3.0, 
    color: "#3b82f6", size: 5, muzzleOffset: 4, recoil: 1.5, 
    magSize: 30, reloadTime: 1500 
  },
  shotgun: { 
    name: "Shotgun", fireRate: 800, damage: 1, spread: 0.3, speed: 2.0, 
    color: "#ef4444", size: 7, muzzleOffset: 4.5, recoil: 4, 
    magSize: 6, reloadTime: 2000 
  },
  sniper: { 
    name: "Sniper", fireRate: 1200, damage: 5, spread: 0, speed: 5.0, 
    color: "#a855f7", size: 10, muzzleOffset: 5, recoil: 5, 
    magSize: 5, reloadTime: 2500 
  },
};

interface GameObject {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hp: number;
  maxHp: number;
  isBoss: boolean;
  isHit: boolean;
  walkFrame: number;
  isAttacking: boolean;
  spawnTime: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: ParticleType;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  damage: number;
  trail: { x: number; y: number }[];
}

// ═══════════════════════════════════════════════════════════
// 🔫 MICRO-LEVEL HEAVY METAL GUN SVGs
// ═══════════════════════════════════════════════════════════
const PistolSVG = ({ angle, recoil }: { angle: number; recoil: number }) => (
  <g transform={`rotate(${angle}) translate(${-recoil * 0.5}, 0)`} style={{ filter: 'drop-shadow(0 0 8px #fbbf24)' }}>
    {/* Grip with texture */}
    <path d="M -15 5 L -15 25 Q -15 30 -10 30 L -5 30 L -5 5 Z" fill="#1a1a1a" />
    <path d="M -14 8 L -14 22 M -10 8 L -10 22" stroke="#333" strokeWidth="1" />
    {/* Frame & Trigger Guard */}
    <path d="M -15 5 L 15 5 L 15 10 L -5 10 L -5 25 L -15 25 Z" fill="#2a2a2a" />
    <path d="M -5 10 Q 0 20 5 10" stroke="#111" strokeWidth="2" fill="none" />
    {/* Slide */}
    <rect x="-15" y="-5" width="35" height="10" rx="2" fill="#3a3a3a" />
    <path d="M 15 -5 L 20 -2 L 20 2 L 15 5 Z" fill="#4a4a4a" />
    {/* Serrations */}
    <path d="M -10 -5 L -10 5 M -5 -5 L -5 5 M 0 -5 L 0 5" stroke="#111" strokeWidth="1" />
    {/* Front Sight */}
    <rect x="18" y="-7" width="2" height="2" fill="#111" />
    {/* Ejection Port */}
    <rect x="5" y="-4" width="8" height="4" rx="1" fill="#111" />
  </g>
);

const RifleSVG = ({ angle, recoil }: { angle: number; recoil: number }) => (
  <g transform={`rotate(${angle}) translate(${-recoil}, 0)`} style={{ filter: 'drop-shadow(0 0 10px #3b82f6)' }}>
    {/* Tactical Stock */}
    <path d="M -45 -5 L -30 -5 L -30 5 L -45 5 Q -50 5 -50 0 Q -50 -5 -45 -5 Z" fill="#2a2a2a" />
    <rect x="-42" y="-3" width="10" height="2" fill="#1a1a1a" />
    {/* Receiver */}
    <rect x="-30" y="-6" width="30" height="12" rx="1" fill="#1a1a1a" />
    <rect x="-25" y="-8" width="15" height="4" rx="1" fill="#333" />
    {/* Curved Magazine */}
    <path d="M -10 6 L -5 6 L -5 20 Q -5 22 -7 22 L -8 22 Q -10 22 -10 20 Z" fill="#111" />
    {/* Pistol Grip */}
    <path d="M -15 6 L -15 20 Q -15 24 -10 24 L -8 24 L -8 6 Z" fill="#2a2a2a" />
    {/* Handguard with Rails */}
    <rect x="0" y="-5" width="25" height="10" rx="1" fill="#3a3a3a" />
    <path d="M 5 -5 L 5 5 M 10 -5 L 10 5 M 15 -5 L 15 5" stroke="#111" strokeWidth="1" />
    {/* Barrel & Flash Hider */}
    <rect x="25" y="-3" width="25" height="6" fill="#4a4a4a" />
    <path d="M 50 -4 L 55 -2 L 55 2 L 50 4 Z" fill="#111" />
    {/* Front Sight */}
    <rect x="48" y="-6" width="2" height="3" fill="#111" />
    {/* Charging Handle */}
    <rect x="-20" y="-9" width="6" height="2" rx="1" fill="#444" />
  </g>
);

const ShotgunSVG = ({ angle, recoil }: { angle: number; recoil: number }) => (
  <g transform={`rotate(${angle}) translate(${-recoil * 1.2}, 0)`} style={{ filter: 'drop-shadow(0 0 10px #ef4444)' }}>
    {/* Wooden Stock */}
    <path d="M -45 -4 L -25 -4 L -25 4 L -45 4 Q -50 4 -50 0 Q -50 -4 -45 -4 Z" fill="#5c3a21" />
    <path d="M -45 0 L -40 0" stroke="#3e2716" strokeWidth="1" />
    <path d="M -42 -2 L -42 2" stroke="#3e2716" strokeWidth="0.5" />
    {/* Metal Receiver */}
    <rect x="-25" y="-7" width="20" height="14" rx="2" fill="#2a2a2a" />
    <rect x="-20" y="-5" width="10" height="2" fill="#1a1a1a" />
    {/* Pump Action Forend (Wood) */}
    <rect x="0" y="-5" width="15" height="10" rx="3" fill="#5c3a21" />
    <path d="M 2 -5 L 2 5 M 13 -5 L 13 5" stroke="#3e2716" strokeWidth="1" />
    {/* Barrel & Tube */}
    <rect x="15" y="-4" width="35" height="3" fill="#3a3a3a" />
    <rect x="15" y="1" width="35" height="3" fill="#3a3a3a" />
    {/* Wide Choke */}
    <rect x="50" y="-5" width="4" height="10" fill="#111" />
    {/* Bead Sight */}
    <circle cx="48" cy="-4" r="1" fill="#fbbf24" />
    {/* Shell Ejection Port */}
    <rect x="-15" y="-6" width="8" height="4" rx="1" fill="#111" />
  </g>
);

const SniperSVG = ({ angle, recoil }: { angle: number; recoil: number }) => (
  <g transform={`rotate(${angle}) translate(${-recoil * 1.5}, 0)`} style={{ filter: 'drop-shadow(0 0 12px #a855f7)' }}>
    {/* Heavy Stock with Cheek Rest */}
    <path d="M -50 -6 L -20 -6 L -20 6 L -50 6 Q -55 6 -55 0 Q -55 -6 -50 -6 Z" fill="#1a1a1a" />
    <rect x="-45" y="-2" width="20" height="4" fill="#2a2a2a" />
    <rect x="-48" y="-4" width="8" height="2" fill="#333" />
    {/* Receiver & Bolt */}
    <rect x="-20" y="-7" width="25" height="14" rx="1" fill="#222" />
    <rect x="-10" y="-9" width="8" height="3" rx="1" fill="#444" />
    {/* Box Magazine */}
    <rect x="-5" y="7" width="8" height="12" rx="1" fill="#111" />
    {/* High-Magnification Scope */}
    <rect x="-15" y="-14" width="30" height="8" rx="4" fill="#111" />
    <circle cx="-12" cy="-10" r="3" fill="#0a3a5c" opacity="0.8" />
    <circle cx="12" cy="-10" r="4" fill="#0a3a5c" opacity="0.8" />
    <circle cx="12" cy="-10" r="1.5" fill="rgba(255,255,255,0.4)" /> {/* Lens Reflection */}
    {/* Scope Mounts */}
    <rect x="-10" y="-12" width="3" height="4" fill="#333" />
    <rect x="7" y="-12" width="3" height="4" fill="#333" />
    {/* Heavy Barrel */}
    <rect x="5" y="-4" width="45" height="8" fill="#333" />
    <rect x="10" y="-3" width="35" height="6" fill="#444" />
    {/* Muzzle Brake */}
    <path d="M 50 -5 L 58 -3 L 58 3 L 50 5 Z" fill="#111" />
    <rect x="52" y="-4" width="2" height="8" fill="#000" />
    <rect x="55" y="-4" width="2" height="8" fill="#000" />
    {/* Bipod */}
    <line x1="15" y1="4" x2="10" y2="18" stroke="#444" strokeWidth="2" />
    <line x1="20" y1="4" x2="25" y2="18" stroke="#444" strokeWidth="2" />
    <circle cx="10" cy="18" r="1.5" fill="#333" />
    <circle cx="25" cy="18" r="1.5" fill="#333" />
  </g>
);

const GunSVG = ({ weapon, angle, recoil }: { weapon: WeaponType; angle: number; recoil: number }) => {
  switch (weapon) {
    case 'pistol': return <PistolSVG angle={angle} recoil={recoil} />;
    case 'rifle': return <RifleSVG angle={angle} recoil={recoil} />;
    case 'shotgun': return <ShotgunSVG angle={angle} recoil={recoil} />;
    case 'sniper': return <SniperSVG angle={angle} recoil={recoil} />;
  }
};

// ═══════════════════════════════════════════════════════════
// 👹 HYPER-DETAILED ENEMY SVGs WITH ANIMATIONS
// ═══════════════════════════════════════════════════════════
const ZombieEnemySVG = ({ isHit, isBoss, walkFrame }: { isHit: boolean; isBoss: boolean; walkFrame: number }) => {
  const size = isBoss ? 1.8 : 1;
  const legSwing = Math.sin(walkFrame * 8) * 15;
  const armSwing = Math.sin(walkFrame * 8) * 20;
  const bob = Math.abs(Math.sin(walkFrame * 8)) * 2;
  const breathe = Math.sin(walkFrame * 4) * 1;

  return (
    <g transform={`scale(${size}) translate(0, ${-bob})`} style={{ filter: isHit ? 'brightness(3) sepia(1) hue-rotate(-50deg) saturate(5)' : 'none', transition: 'filter 0.1s' }}>
      {/* Shadow */}
      <ellipse cx="0" cy="45" rx="20" ry="5" fill="rgba(0,0,0,0.5)" />
      
      {/* Back Leg */}
      <motion.rect x="-8" y={20 + breathe} width="8" height="25" rx="3" fill="#2d4a3e" 
        animate={{ rotate: legSwing }} style={{ transformOrigin: '16px 20px' }} />
      
      {/* Back Arm */}
      <motion.rect x="-18" y={-5 + breathe} width="8" height="22" rx="3" fill="#4a6b5e" 
        animate={{ rotate: -armSwing }} style={{ transformOrigin: '14px -5px' }} />
      
      {/* Body */}
      <rect x="-12" y={-10 + breathe} width="24" height="32" rx="4" fill="#3d5a4e" />
      <path d="M -12 -5 L 12 -5 L 12 5 L -12 5 Z" fill="#5a3d3d" />
      
      {/* Front Leg */}
      <motion.rect x="0" y={20 + breathe} width="8" height="25" rx="3" fill="#2d4a3e" 
        animate={{ rotate: -legSwing }} style={{ transformOrigin: '-16px 20px' }} />
      
      {/* Front Arm */}
      <motion.rect x="10" y={-5 + breathe} width="8" height="22" rx="3" fill="#4a6b5e" 
        animate={{ rotate: armSwing }} style={{ transformOrigin: '-14px -5px' }} />
      
      {/* Head */}
      <circle cx="0" cy={-20 + breathe} r="12" fill="#4a6b5e" />
      <path d="M -10 -25 Q -5 -30 0 -28 Q 5 -30 10 -25 Q 8 -28 0 -27 Q -8 -28 -10 -25 Z" fill="#2d3d2e" />
      
      {/* Glowing Eyes */}
      <motion.circle cx="-4" cy="-22" r="2.5" fill="#ff0000" 
        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} />
      <motion.circle cx="4" cy="-22" r="2.5" fill="#ff0000" 
        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} />
      
      {/* Mouth */}
      <path d="M -5 -16 Q 0 -14 5 -16" stroke="#2d3d2e" strokeWidth="1.5" fill="#1a1a1a" />
      
      {/* Wounds */}
      <circle cx="-6" cy="-10" r="2" fill="#8b0000" />
      <circle cx="6" cy="-5" r="1.5" fill="#8b0000" />
      
      {/* Boss Crown */}
      {isBoss && (
        <g>
          <path d="M -8 -30 L -6 -35 L -3 -32 L 0 -36 L 3 -32 L 6 -35 L 8 -30 Z" fill="#ffd700" />
          <motion.circle cx="-6" cy="-33" r="1" fill="#ff0000" 
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} />
          <motion.circle cx="0" cy="-34" r="1" fill="#00ff00" 
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} />
          <motion.circle cx="6" cy="-33" r="1" fill="#0000ff" 
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} />
        </g>
      )}
    </g>
  );
};

const ThugEnemySVG = ({ isHit, isBoss, walkFrame }: { isHit: boolean; isBoss: boolean; walkFrame: number }) => {
  const size = isBoss ? 2.0 : 1.3;
  const legSwing = Math.sin(walkFrame * 6) * 12;
  const armSwing = Math.sin(walkFrame * 6) * 15;
  const breathe = Math.sin(walkFrame * 4) * 1;

  return (
    <g transform={`scale(${size})`} style={{ filter: isHit ? 'brightness(3) sepia(1) hue-rotate(-50deg) saturate(5)' : 'none', transition: 'filter 0.1s' }}>
      <ellipse cx="0" cy="50" rx="25" ry="6" fill="rgba(0,0,0,0.6)" />
      <motion.rect x="-10" y={20 + breathe} width="10" height="30" rx="4" fill="#1a1a1a" 
        animate={{ rotate: legSwing }} style={{ transformOrigin: '10px 20px' }} />
      <motion.rect x="0" y={20 + breathe} width="10" height="30" rx="4" fill="#1a1a1a" 
        animate={{ rotate: -legSwing }} style={{ transformOrigin: '-10px 20px' }} />
      <rect x="-15" y={-10 + breathe} width="30" height="35" rx="5" fill="#333" />
      <motion.rect x="-22" y={-5 + breathe} width="10" height="25" rx="4" fill="#d4a373" 
        animate={{ rotate: -armSwing }} style={{ transformOrigin: '17px -5px' }} />
      <motion.rect x="12" y={-5 + breathe} width="10" height="25" rx="4" fill="#d4a373" 
        animate={{ rotate: armSwing }} style={{ transformOrigin: '-17px -5px' }} />
      <circle cx="0" cy={-25 + breathe} r="14" fill="#d4a373" />
      <path d="M -14 -30 Q 0 -35 14 -30 L 12 -25 Q 0 -28 -12 -25 Z" fill="#111" />
      <motion.circle cx="-5" cy="-26" r="2" fill="#000" 
        animate={{ scaleY: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 3 }} />
      <motion.circle cx="5" cy="-26" r="2" fill="#000" 
        animate={{ scaleY: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 3 }} />
      <path d="M -6 -18 Q 0 -15 6 -18" stroke="#000" strokeWidth="1.5" fill="none" />
      {isBoss && <motion.circle cx="0" cy="-38" r="3" fill="#f00" 
        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} />}
    </g>
  );
};

const TigerEnemySVG = ({ isHit, isBoss, walkFrame }: { isHit: boolean; isBoss: boolean; walkFrame: number }) => {
  const size = isBoss ? 2.2 : 1.4;
  const legSwing = Math.sin(walkFrame * 10) * 10;
  const bob = Math.abs(Math.sin(walkFrame * 10)) * 3;
  const breathe = Math.sin(walkFrame * 4) * 1;

  return (
    <g transform={`scale(${size}) translate(0, ${-bob})`} style={{ filter: isHit ? 'brightness(3) sepia(1) hue-rotate(-50deg) saturate(5)' : 'none', transition: 'filter 0.1s' }}>
      <ellipse cx="0" cy="40" rx="30" ry="8" fill="rgba(0,0,0,0.5)" />
      <ellipse cx="0" cy={10 + breathe} rx="25" ry="18" fill="#f97316" />
      <path d="M -15 0 L -10 10 M -5 0 L 0 10 M 5 0 L 10 10 M 15 0 L 20 10" stroke="#000" strokeWidth="3" />
      <motion.rect x="-15" y={20 + breathe} width="8" height="20" rx="3" fill="#f97316" 
        animate={{ rotate: legSwing }} style={{ transformOrigin: '11px 20px' }} />
      <motion.rect x="-5" y={20 + breathe} width="8" height="20" rx="3" fill="#f97316" 
        animate={{ rotate: -legSwing }} style={{ transformOrigin: '1px 20px' }} />
      <motion.rect x="5" y={20 + breathe} width="8" height="20" rx="3" fill="#f97316" 
        animate={{ rotate: legSwing }} style={{ transformOrigin: '-11px 20px' }} />
      <motion.rect x="15" y={20 + breathe} width="8" height="20" rx="3" fill="#f97316" 
        animate={{ rotate: -legSwing }} style={{ transformOrigin: '-21px 20px' }} />
      <circle cx="0" cy={-15 + breathe} r="16" fill="#f97316" />
      <path d="M -10 -25 L -12 -30 L -6 -28 M 10 -25 L 12 -30 L 6 -28" fill="#f97316" stroke="#000" strokeWidth="1" />
      <motion.circle cx="-6" cy="-18" r="3" fill="#fff" 
        animate={{ opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 2 }} />
      <motion.circle cx="6" cy="-18" r="3" fill="#fff" 
        animate={{ opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 2 }} />
      <circle cx="-6" cy="-18" r="1.5" fill="#000" />
      <circle cx="6" cy="-18" r="1.5" fill="#000" />
      <path d="M -4 -10 Q 0 -8 4 -10" stroke="#000" strokeWidth="1" fill="none" />
      <motion.path d={`M 25 10 Q 35 ${5 + Math.sin(walkFrame*5)*5} 40 0`} stroke="#f97316" strokeWidth="4" fill="none" />
    </g>
  );
};

const GhostEnemySVG = ({ isHit, isBoss, walkFrame }: { isHit: boolean; isBoss: boolean; walkFrame: number }) => {
  const size = isBoss ? 2.5 : 1.5;
  const floatY = Math.sin(walkFrame * 4) * 15;
  const floatX = Math.cos(walkFrame * 3) * 5;

  return (
    <g transform={`scale(${size}) translate(${floatX}, ${floatY})`} style={{ filter: isHit ? 'brightness(3) drop-shadow(0 0 20px #f00)' : 'drop-shadow(0 0 15px rgba(255,255,255,0.5))', transition: 'filter 0.1s' }}>
      <motion.path 
        d="M -20 -20 Q -20 -40 0 -40 Q 20 -40 20 -20 L 20 10 Q 10 0 0 10 Q -10 0 -20 10 Z" 
        fill="rgba(255, 255, 255, 0.8)" 
        animate={{ d: ["M -20 -20 Q -20 -40 0 -40 Q 20 -40 20 -20 L 20 10 Q 10 0 0 10 Q -10 0 -20 10 Z", "M -20 -15 Q -20 -35 0 -35 Q 20 -35 20 -15 L 20 15 Q 10 5 0 15 Q -10 5 -20 15 Z", "M -20 -20 Q -20 -40 0 -40 Q 20 -40 20 -20 L 20 10 Q 10 0 0 10 Q -10 0 -20 10 Z"] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      />
      <motion.circle cx="-8" cy="-25" r="4" fill="#000" 
        animate={{ scaleY: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 4 }} />
      <motion.circle cx="8" cy="-25" r="4" fill="#000" 
        animate={{ scaleY: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 4 }} />
      <motion.circle cx="-8" cy="-25" r="1.5" fill="#f00" 
        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} />
      <motion.circle cx="8" cy="-25" r="1.5" fill="#f00" 
        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} />
      <ellipse cx="0" cy="-15" rx="6" ry="8" fill="#000" />
      {isBoss && <motion.path d="M -15 -35 L 0 -50 L 15 -35" fill="none" stroke="#f00" strokeWidth="2" 
        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} />}
    </g>
  );
};

const AlienEnemySVG = ({ isHit, isBoss, walkFrame }: { isHit: boolean; isBoss: boolean; walkFrame: number }) => {
  const size = isBoss ? 2.0 : 1.3;
  const legSwing = Math.sin(walkFrame * 8) * 15;
  const breathe = Math.sin(walkFrame * 4) * 1;

  return (
    <g transform={`scale(${size})`} style={{ filter: isHit ? 'brightness(3) sepia(1) hue-rotate(-50deg) saturate(5)' : 'none', transition: 'filter 0.1s' }}>
      <ellipse cx="0" cy="45" rx="20" ry="5" fill="rgba(0,0,0,0.5)" />
      <motion.rect x="-8" y={20 + breathe} width="8" height="25" rx="3" fill="#4a6b5e" 
        animate={{ rotate: legSwing }} style={{ transformOrigin: '16px 20px' }} />
      <motion.rect x="0" y={20 + breathe} width="8" height="25" rx="3" fill="#4a6b5e" 
        animate={{ rotate: -legSwing }} style={{ transformOrigin: '-16px 20px' }} />
      <ellipse cx="0" cy={5 + breathe} rx="18" ry="22" fill="#8b5cf6" />
      <circle cx="0" cy={-20 + breathe} r="16" fill="#a78bfa" />
      <motion.ellipse cx="-6" cy="-22" rx="5" ry="7" fill="#000" 
        animate={{ scaleY: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 3 }} />
      <motion.ellipse cx="6" cy="-22" rx="5" ry="7" fill="#000" 
        animate={{ scaleY: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 3 }} />
      <motion.circle cx="-6" cy="-22" r="2" fill="#0f0" 
        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} />
      <motion.circle cx="6" cy="-22" r="2" fill="#0f0" 
        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} />
      <path d="M -10 -30 Q 0 -35 10 -30" stroke="#8b5cf6" strokeWidth="4" fill="none" />
      <motion.circle cx="0" cy="-32" r="3" fill="#0f0" 
        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} />
    </g>
  );
};

// ═══════════════════════════════════════════════════════════
// 🏮 ENVIRONMENTAL EFFECTS
// ═══════════════════════════════════════════════════════════
const FloatingLantern = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: [0.3, 0.8, 0.3], 
      y: [y, y - 20, y],
      x: [x, x + 10, x]
    }}
    transition={{ duration: 4, delay, repeat: Infinity, ease: "easeInOut" }}
    className="absolute w-4 h-6 bg-orange-500/80 rounded-full blur-sm pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    <div className="absolute inset-0 bg-yellow-300/50 rounded-full blur-md" />
  </motion.div>
);

const ENVIRONMENTS: Record<Environment, { 
  name: string; 
  hindiName: string; 
  icon: any; 
  bg: string; 
  overlay: string; 
  enemyTypes: EnemyType[];
}> = {
  gali: { 
    name: "Gali Muhalla", 
    hindiName: "गली मुहल्ला", 
    icon: MapPin, 
    bg: "https://images.unsplash.com/photo-1519810755548-39de2172b188?q=80&w=1920&auto=format&fit=crop",
    overlay: "bg-slate-950/80",
    enemyTypes: ['thug', 'zombie']
  },
  jungle: { 
    name: "Jadui Jungle", 
    hindiName: "जादुई जंगल", 
    icon: Trees, 
    bg: "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1920&auto=format&fit=crop",
    overlay: "bg-emerald-950/80",
    enemyTypes: ['tiger', 'ghost', 'zombie']
  },
  city: { 
    name: "City Center", 
    hindiName: "शहर का केंद्र", 
    icon: Building2, 
    bg: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1920&auto=format&fit=crop",
    overlay: "bg-slate-950/80",
    enemyTypes: ['alien', 'zombie']
  }
};

// ═══════════════════════════════════════════════════════════
// 🎮 MAIN GAME COMPONENT
// ═══════════════════════════════════════════════════════════
export default function AlamnagarStrike() {
  // Auth States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Game States
  const [gameState, setGameState] = useState<'auth' | 'menu' | 'select_env' | 'playing' | 'paused' | 'gameover'>('auth');
  const [selectedEnv, setSelectedEnv] = useState<Environment>('gali');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [wave, setWave] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ambientEnabled, setAmbientEnabled] = useState(true);
  const [screenShake, setScreenShake] = useState(0);
  const [warningText, setWarningText] = useState<string | null>(null);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('rifle');
  const [isMicOn, setIsMicOn] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [gunRecoil, setGunRecoil] = useState(0);
  
  // Premium Features State
  const [ammo, setAmmo] = useState(WEAPONS.rifle.magSize);
  const [isReloading, setIsReloading] = useState(false);
  const [isDashing, setIsDashing] = useState(false);
  const [dashCooldown, setDashCooldown] = useState(0);
  const [combo, setCombo] = useState(0);
  const [muzzleFlashOpacity, setMuzzleFlashOpacity] = useState(0);

  // Refs
  const gunPosRef = useRef({ x: 50, y: 80 });
  const gunAngleRef = useRef(0);
  const mousePosRef = useRef({ x: 50, y: 50 });
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<GameObject[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);
  const lastShotRef = useRef(0);
  const scoreRef = useRef(0);
  const healthRef = useRef(100);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [, setTick] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const playerPresenceRef = useRef<string | null>(null);
  const ambientIntervalRef = useRef<number | null>(null);
  const lastKillTimeRef = useRef(0);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem("alamnagarStrikeHighScore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Ambient sound loop
  useEffect(() => {
    if (gameState === 'playing' && ambientEnabled && soundEnabled) {
      ambientIntervalRef.current = window.setInterval(() => {
        if (Math.random() > 0.6) playSound('ambient_wind', 0.3);
        if (Math.random() > 0.85) playSound('ghost_wail', 0.2);
      }, 4000);
    }
    return () => {
      if (ambientIntervalRef.current) clearInterval(ambientIntervalRef.current);
    };
  }, [gameState, ambientEnabled, soundEnabled]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        setGameState('menu');
        const presenceId = `players_${user.uid}`;
        playerPresenceRef.current = presenceId;
        setDoc(doc(db, 'gamePresence', presenceId), {
          uid: user.uid,
          displayName: user.displayName || 'Player',
          email: user.email,
          photoURL: user.photoURL || '',
          online: true,
          lastSeen: serverTimestamp()
        });
        window.addEventListener('beforeunload', () => {
          deleteDoc(doc(db, 'gamePresence', presenceId)).catch(() => {});
        });
      } else {
        setGameState('auth');
      }
    });
    return () => unsubscribe();
  }, []);

  // Auth handlers
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    try {
      if (authPassword.length < 6) {
        setAuthError('पासवर्ड कम से कम 6 अक्षर का होना चाहिए');
        return;
      }
      const cred = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      await updateProfile(cred.user, { displayName: authName || authEmail.split('@')[0] });
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        displayName: authName || authEmail.split('@')[0],
        email: authEmail,
        createdAt: serverTimestamp(),
        highScore: 0,
        gamesPlayed: 0
      });
      setAuthSuccess('✅ अकाउंट बन गया!');
      setTimeout(() => {
        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
      }, 1500);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('यह ईमेल पहले से रजिस्टर्ड है');
      } else {
        setAuthError('साइनअप विफल: ' + err.message);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    try {
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
      setAuthSuccess('✅ लॉगिन सफल!');
      setTimeout(() => {
        setAuthEmail('');
        setAuthPassword('');
      }, 1500);
    } catch (err: any) {
      setAuthError('ईमेल या पासवर्ड गलत है');
    }
  };

  const handleLogout = async () => {
    if (playerPresenceRef.current) {
      try {
        await deleteDoc(doc(db, 'gamePresence', playerPresenceRef.current));
      } catch (e) {}
    }
    await signOut(auth);
    setGameState('auth');
  };

  const toggleMic = async () => {
    if (isMicOn) {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      }
      setIsMicOn(false);
      setIsSpeaking(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      setIsMicOn(true);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const detectVoice = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setIsSpeaking(average > 30);
        requestAnimationFrame(detectVoice);
      };
      detectVoice();
    } catch (err) {
      alert('Microphone access denied.');
    }
  };

  const startGame = (env?: Environment) => {
    if (env) setSelectedEnv(env);
    setGameState('playing');
    setScore(0);
    setHealth(100);
    setWave(1);
    setWarningText(null);
    setCurrentWeapon('rifle');
    setGunRecoil(0);
    setAmmo(WEAPONS.rifle.magSize);
    setIsReloading(false);
    setIsDashing(false);
    setDashCooldown(0);
    setCombo(0);
    scoreRef.current = 0;
    healthRef.current = 100;
    gunPosRef.current = { x: 50, y: 80 };
    gunAngleRef.current = 0;
    mousePosRef.current = { x: 50, y: 50 };
    bulletsRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    lastShotRef.current = 0;
    lastKillTimeRef.current = 0;
    if (soundEnabled) playSound('combo');
  };

  const spawnParticles = useCallback((x: number, y: number, color: string, count: number, type: ParticleType = 'spark') => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        id: Date.now() + Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * (type === 'blood' ? 5 : 2),
        vy: (Math.random() - 0.5) * (type === 'blood' ? 5 : 2) - (type === 'blood' ? 3 : 1),
        life: 1,
        maxLife: 1,
        color,
        size: Math.random() * (type === 'blood' ? 8 : 4) + 2,
        type
      });
    }
  }, []);

  const spawnEnemy = useCallback(() => {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const x = side === 'left' ? -10 : 110;
    const y = 60 + Math.random() * 20;
    const isBoss = wave >= 3 && Math.random() > 0.8;
    
    const availableTypes = ENVIRONMENTS[selectedEnv].enemyTypes;
    const enemyType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

    let warningName = "दुश्मन";
    if (enemyType === 'tiger') warningName = "खूंखार शेर";
    else if (enemyType === 'ghost') warningName = "डरावना भूत";
    else if (enemyType === 'thug') warningName = "खतरनाक गुंडा";
    else if (enemyType === 'alien') warningName = "एलियन";
    
    if (isBoss) warningName = "बॉस " + warningName;

    setWarningText(`⚠️ चेतावनी: ${side === 'left' ? "बाएं" : "दाएं"} से ${warningName} आ रहा है!`);
    
    if (isBoss && soundEnabled) {
      playSound('boss_spawn');
      if (enemyType === 'tiger') playSound('roar');
      else if (enemyType === 'ghost') playSound('ghost_wail');
    }
    
    setTimeout(() => setWarningText(null), 2500);

    enemiesRef.current.push({
      id: Date.now() + Math.random(),
      x,
      y,
      vx: 0,
      vy: 0,
      size: isBoss ? 90 : 60,
      hp: isBoss ? 5 + wave : 1 + Math.floor(wave / 2),
      maxHp: isBoss ? 5 + wave : 1 + Math.floor(wave / 2),
      type: enemyType,
      isBoss,
      isHit: false,
      walkFrame: Math.random() * 10,
      isAttacking: false,
      spawnTime: Date.now()
    });
  }, [wave, selectedEnv, soundEnabled]);

  const handleReload = useCallback(() => {
    if (isReloading || ammo === WEAPONS[currentWeapon].magSize) return;
    setIsReloading(true);
    if (soundEnabled) playSound('reload');
    setTimeout(() => {
      setAmmo(WEAPONS[currentWeapon].magSize);
      setIsReloading(false);
    }, WEAPONS[currentWeapon].reloadTime);
  }, [isReloading, ammo, currentWeapon, soundEnabled]);

  const handleDash = useCallback(() => {
    if (isDashing || dashCooldown > 0 || gameState !== 'playing') return;
    setIsDashing(true);
    setDashCooldown(2000);
    if (soundEnabled) playSound('dash');
    setTimeout(() => setIsDashing(false), 300);
  }, [isDashing, dashCooldown, gameState, soundEnabled]);

  // Main game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    let enemySpawnTimer = 0;
    let dashCooldownTimer = 0;
    let comboTimerInterval = 0;
    
    const loop = () => {
      const gunPos = gunPosRef.current;
      const mousePos = mousePosRef.current;
      const bullets = bulletsRef.current;
      const enemies = enemiesRef.current;
      const particles = particlesRef.current;

      // Dash cooldown
      if (dashCooldown > 0) {
        dashCooldownTimer += 16;
        if (dashCooldownTimer >= dashCooldown) {
          setDashCooldown(0);
          dashCooldownTimer = 0;
        }
      }

      // Combo timer
      if (combo > 0) {
        comboTimerInterval += 16;
        if (comboTimerInterval > 3000) {
          setCombo(0);
          comboTimerInterval = 0;
        }
      }

      // Gun movement
      const lerpFactor = isDashing ? 0.05 : 0.15;
      gunPos.x += (mousePos.x - gunPos.x) * lerpFactor;
      gunPos.y += (mousePos.y - gunPos.y) * lerpFactor;

      const dx = mousePos.x - gunPos.x;
      const dy = mousePos.y - gunPos.y;
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        let diff = targetAngle - gunAngleRef.current;
        while (diff < -180) diff += 360;
        while (diff > 180) diff -= 360;
        gunAngleRef.current += diff * 0.2;
      }

      if (gunRecoil > 0) setGunRecoil(r => Math.max(0, r - 0.3));
      if (muzzleFlashOpacity > 0) setMuzzleFlashOpacity(o => Math.max(0, o - 0.1));

      // Update bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 10) b.trail.shift();
        if (b.x < -10 || b.x > 110 || b.y < -10 || b.y > 110) bullets.splice(i, 1);
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.life -= (p.type === 'blood' ? 0.02 : 0.03);
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Update enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const edx = gunPos.x - e.x;
        const edy = gunPos.y - e.y;
        const dist = Math.sqrt(edx * edx + edy * edy);
        const speed = (0.08 + (wave * 0.01)) * (e.type === 'ghost' ? 1.3 : 1);
        
        // Aggressive lunge when close
        if (dist < 25) {
          e.vx = (edx / dist) * speed * 2.5;
          e.vy = (edy / dist) * speed * 2.5;
          e.isAttacking = true;
        } else {
          e.vx = (edx / dist) * speed;
          e.vy = (edy / dist) * speed;
          e.isAttacking = false;
        }
        
        e.x += e.vx;
        e.y += e.vy;
        e.walkFrame += 0.04;
        if (e.isHit) e.isHit = false;

        // Collision with player
        if (dist < (15 + e.size/2) && !isDashing) {
          healthRef.current -= (e.isBoss ? 20 : 10);
          setHealth(Math.max(0, healthRef.current));
          enemies.splice(i, 1);
          setScreenShake(15);
          if (soundEnabled) playSound('hit');
          spawnParticles(gunPos.x, gunPos.y, '#ef4444', 8, 'blood');
          
          if (healthRef.current <= 0) {
            setGameState('gameover');
            if (soundEnabled) playSound('gameover');
            if (scoreRef.current > highScore) {
              setHighScore(scoreRef.current);
              localStorage.setItem("alamnagarStrikeHighScore", scoreRef.current.toString());
            }
            return;
          }
        }
      }

      // Bullet-enemy collisions
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        let hit = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (Math.sqrt((b.x - e.x)**2 + (b.y - e.y)**2) < (b.size + e.size/2)) {
            e.hp -= b.damage;
            e.isHit = true;
            hit = true;
            
            if (soundEnabled) playSound('hit');
            spawnParticles(e.x, e.y, '#8b0000', 4, 'blood');

            if (e.hp <= 0) {
              enemies.splice(j, 1);
              
              // Combo logic
              const now = Date.now();
              if (now - lastKillTimeRef.current < 3000) {
                setCombo(c => c + 1);
                if (combo + 1 >= 3 && soundEnabled) playSound('combo');
              } else {
                setCombo(1);
              }
              lastKillTimeRef.current = now;
              comboTimerInterval = 0;

              const multiplier = combo >= 3 ? 2 : 1;
              scoreRef.current += (e.isBoss ? 100 : 20) * multiplier;
              setScore(scoreRef.current);
              
              if (soundEnabled) playSound('kill');
              setScreenShake(e.isBoss ? 15 : 8);
              
              // Massive blood explosion
              spawnParticles(e.x, e.y, '#ff0000', 15, 'blood');
              spawnParticles(e.x, e.y, '#8b0000', 10, 'blood');
            }
            break;
          }
        }
        if (hit) bullets.splice(i, 1);
      }

      // Spawn enemies
      enemySpawnTimer++;
      if (enemySpawnTimer > Math.max(30, 80 - wave * 5)) {
        spawnEnemy();
        enemySpawnTimer = 0;
      }

      // Wave progression
      if (scoreRef.current > wave * 150) setWave(w => w + 1);
      if (screenShake > 0) setScreenShake(s => Math.max(0, s - 0.5));

      setTick(t => t + 1);
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frameRef.current);
      setCombo(0);
    };
  }, [gameState, wave, highScore, soundEnabled, spawnEnemy, screenShake, spawnParticles, isDashing, dashCooldown, combo, muzzleFlashOpacity]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gameState === 'playing') setGameState('paused');
        else if (gameState === 'paused') setGameState('playing');
      }
      if ((e.key === 'r' || e.key === 'R') && gameState === 'playing') {
        handleReload();
      }
      if (e.key === 'Shift' && gameState === 'playing') {
        handleDash();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleReload, handleDash]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (gameState !== 'playing' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mousePosRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    };
  }, [gameState]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (gameState !== 'playing' || isReloading) return;
    e.preventDefault();
    
    const weapon = WEAPONS[currentWeapon];
    if (ammo <= 0) {
      handleReload();
      return;
    }

    const now = Date.now();
    if (now - lastShotRef.current < weapon.fireRate) return;
    lastShotRef.current = now;
    setAmmo(a => a - 1);

    const gunPos = gunPosRef.current;
    const angleRad = gunAngleRef.current * (Math.PI / 180);
    const muzzleX = gunPos.x + Math.cos(angleRad) * weapon.muzzleOffset;
    const muzzleY = gunPos.y + Math.sin(angleRad) * weapon.muzzleOffset;
    
    setMuzzleFlashOpacity(1);
    setGunRecoil(weapon.recoil);
    
    const shoot = (spreadOffset: number) => {
      const finalAngle = angleRad + spreadOffset;
      bulletsRef.current.push({
        id: Date.now() + Math.random(),
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(finalAngle) * weapon.speed,
        vy: Math.sin(finalAngle) * weapon.speed,
        size: weapon.size,
        color: weapon.color,
        damage: weapon.damage,
        trail: []
      });
    };

    if (currentWeapon === 'shotgun') {
      shoot(-0.2);
      shoot(-0.1);
      shoot(0);
      shoot(0.1);
      shoot(0.2);
      if (soundEnabled) playSound('shotgun');
    } else if (currentWeapon === 'sniper') {
      shoot(0);
      if (soundEnabled) playSound('sniper');
    } else if (currentWeapon === 'pistol') {
      shoot((Math.random() - 0.5) * weapon.spread);
      if (soundEnabled) playSound('pistol');
    } else {
      shoot((Math.random() - 0.5) * weapon.spread);
      if (soundEnabled) playSound('rifle');
    }
    
    // Shell casing
    const shellAngle = angleRad + Math.PI / 2 + (Math.random() - 0.5) * 0.3;
    particlesRef.current.push({
      id: Date.now(),
      x: gunPos.x,
      y: gunPos.y,
      vx: Math.cos(shellAngle) * 0.6,
      vy: Math.sin(shellAngle) * 0.6 - 0.4,
      life: 1,
      maxLife: 1,
      color: '#d4af37',
      size: 3,
      type: 'shell'
    });

    setScreenShake(currentWeapon === 'sniper' ? 10 : currentWeapon === 'shotgun' ? 5 : 2);
  }, [gameState, isReloading, ammo, currentWeapon, soundEnabled, handleReload]);

  const switchWeapon = (w: WeaponType) => {
    if (currentWeapon === w || isReloading) return;
    setCurrentWeapon(w);
    setAmmo(WEAPONS[w].magSize);
    if (soundEnabled) playSound('switch');
  };

  const env = ENVIRONMENTS[selectedEnv];

  // Loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Auth screen
  if (gameState === 'auth' || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-purple-950 to-stone-950 flex items-center justify-center p-4 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 bg-stone-900/90 backdrop-blur-xl border border-yellow-500/30 rounded-3xl p-8 md:p-10 max-w-md w-full shadow-[0_0_60px_rgba(234,179,8,0.2)]"
        >
          <div className="text-center mb-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-3"
            >
              🎯
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
              आलमनगर स्ट्राइक
            </h1>
            <p className="text-stone-400 text-sm mt-2">अपना अकाउंट बनाएं या लॉगिन करें</p>
          </div>

          <div className="flex gap-2 mb-6 bg-stone-800 p-1 rounded-xl">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
                authMode === 'login' ? 'bg-yellow-500 text-black' : 'text-stone-400'
              }`}
            >
              🔑 लॉगिन
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthSuccess(''); }}
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
                authMode === 'signup' ? 'bg-yellow-500 text-black' : 'text-stone-400'
              }`}
            >
              📝 साइनअप
            </button>
          </div>

          <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {authMode === 'signup' && (
              <input
                type="text"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                placeholder="पूरा नाम"
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-yellow-500 transition"
                required
              />
            )}
            <input
              type="email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              placeholder="ईमेल"
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-yellow-500 transition"
              required
            />
            <input
              type="password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              placeholder="पासवर्ड (कम से कम 6 अक्षर)"
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-yellow-500 transition"
              required
            />
            {authError && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg text-sm">
                {authError}
              </div>
            )}
            {authSuccess && (
              <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-2 rounded-lg text-sm">
                {authSuccess}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-black text-lg py-3 rounded-xl hover:scale-105 transition-transform"
            >
              {authMode === 'login' ? '🔑 लॉगिन करें' : '📝 अकाउंट बनाएं'}
            </button>
          </form>

          <Link href="/" className="block mt-4 text-center text-stone-500 hover:text-yellow-400 text-sm font-bold transition-colors">
            ← मुख्य पृष्ठ पर वापस जाएं
          </Link>
        </motion.div>
      </div>
    );
  }

  // Main game
  return (
    <div className="min-h-screen bg-black relative overflow-hidden select-none touch-none font-sans text-white">
      {/* Night atmosphere background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
          style={{ backgroundImage: `url(${env.bg})` }}
        />
        <div className={`absolute inset-0 ${env.overlay} transition-all duration-1000`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)]" />
        <motion.div
          className="absolute inset-0 bg-yellow-500/10 pointer-events-none"
          style={{ opacity: muzzleFlashOpacity * 0.3 }}
        />
        <FloatingLantern delay={0} x={15} y={30} />
        <FloatingLantern delay={1.5} x={85} y={25} />
        <FloatingLantern delay={3} x={50} y={15} />
      </div>

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <Link href="/" className="flex items-center gap-2 text-white bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 hover:bg-black/80 transition shadow-lg">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="" className="w-8 h-8 rounded-full border-2 border-yellow-500" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-xs font-black text-black">
                {(currentUser.displayName || currentUser.email || 'P')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{currentUser.displayName || 'Player'}</div>
              <div className="text-[10px] text-stone-400 truncate">{currentUser.email}</div>
            </div>
            <button onClick={handleLogout} className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors group">
              🚪
            </button>
          </div>

          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10">
            {soundEnabled ? <Volume2 className="w-5 h-5 text-green-400" /> : <VolumeX className="w-5 h-5 text-red-400" />}
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-xs text-white font-bold">SFX</button>
          </div>

          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10">
            {ambientEnabled ? <Wind className="w-5 h-5 text-purple-400" /> : <Wind className="w-5 h-5 text-stone-600" />}
            <button onClick={() => setAmbientEnabled(!ambientEnabled)} className="text-xs text-white font-bold">Ambient</button>
          </div>

          <button
            onClick={toggleMic}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
              isMicOn ? 'bg-green-600/60 border-green-400/50' : 'bg-black/60 border-white/10'
            }`}
          >
            {isMicOn ? <Mic className="w-5 h-5 text-green-400" /> : <MicOff className="w-5 h-5 text-red-400" />}
            <span className="text-xs text-white font-bold">{isMicOn ? 'MIC ON' : 'MIC OFF'}</span>
            {isSpeaking && <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
          </button>
        </div>

        {gameState === 'playing' && (
          <div className="flex flex-col items-end gap-3">
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex items-center gap-3 shadow-lg">
              <Target className="w-5 h-5 text-yellow-400" />
              <span className="text-2xl font-black text-white">{score}</span>
              {combo >= 3 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-sm font-black text-red-500 animate-pulse"
                >
                  x{combo} COMBO!
                </motion.span>
              )}
            </div>
            <div className="w-48 h-6 bg-black/60 rounded-full border border-white/10 overflow-hidden relative shadow-lg">
              <motion.div
                className="h-full bg-gradient-to-r from-red-600 to-red-400"
                initial={{ width: '100%' }}
                animate={{ width: `${health}%` }}
                transition={{ type: 'spring', bounce: 0 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-black text-white drop-shadow-md">HP {health}%</span>
              </div>
            </div>
            <div className="text-sm font-bold text-stone-300 bg-black/40 px-3 py-1 rounded-full border border-white/5 flex items-center gap-2">
              <env.icon className="w-4 h-4" /> {env.hindiName} • WAVE {wave}
            </div>
          </div>
        )}
      </div>

      {/* Game canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 z-10 cursor-crosshair"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        style={{
          transform: screenShake > 0
            ? `translate(${(Math.random()-0.5)*screenShake}px, ${(Math.random()-0.5)*screenShake}px)`
            : 'none'
        }}
      >
        {gameState === 'playing' && (
          <>
            {/* Particles */}
            {particlesRef.current.map(p => (
              <div
                key={p.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.size * 2}px`,
                  height: `${p.size * 2}px`,
                  marginLeft: `-${p.size}px`,
                  marginTop: `-${p.size}px`,
                  backgroundColor: p.color,
                  opacity: p.life,
                  boxShadow: p.type === 'blood' ? 'none' : `0 0 10px ${p.color}`
                }}
              />
            ))}

            {/* Bullets */}
            {bulletsRef.current.map(b => (
              <div key={b.id} className="absolute pointer-events-none">
                {b.trail.map((t, idx) => (
                  <div
                    key={idx}
                    className="absolute rounded-full"
                    style={{
                      left: `${t.x}%`,
                      top: `${t.y}%`,
                      width: `${b.size * 0.5}px`,
                      height: `${b.size * 0.5}px`,
                      marginLeft: `-${b.size * 0.25}px`,
                      marginTop: `-${b.size * 0.25}px`,
                      backgroundColor: b.color,
                      opacity: (idx / b.trail.length) * 0.7,
                      boxShadow: `0 0 6px ${b.color}`
                    }}
                  />
                ))}
                <div
                  className="absolute rounded-full"
                  style={{
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                    width: `${b.size * 2}px`,
                    height: `${b.size * 2}px`,
                    marginLeft: `-${b.size}px`,
                    marginTop: `-${b.size}px`,
                    backgroundColor: 'white',
                    boxShadow: `0 0 15px ${b.color}, 0 0 30px ${b.color}, 0 0 45px ${b.color}`
                  }}
                />
              </div>
            ))}

            {/* Enemies */}
            {enemiesRef.current.map(e => (
              <div
                key={e.id}
                className="absolute z-20 pointer-events-none"
                style={{
                  left: `${e.x}%`,
                  top: `${e.y}%`,
                  width: `${e.size}px`,
                  height: `${e.size * 1.5}px`,
                  marginLeft: `-${e.size/2}px`,
                  marginTop: `-${e.size * 0.75}px`,
                  transform: e.x < 50 ? 'scaleX(1)' : 'scaleX(-1)'
                }}
              >
                {e.maxHp > 1 && (
                  <div
                    className="w-full h-1.5 bg-black/50 rounded-full mb-1 overflow-hidden border border-white/20 absolute -top-3"
                    style={{ transform: e.x < 50 ? 'scaleX(1)' : 'scaleX(-1)' }}
                  >
                    <div
                      className="h-full bg-green-500 transition-all duration-100"
                      style={{ width: `${(e.hp / e.maxHp) * 100}%` }}
                    />
                  </div>
                )}
                <svg viewBox="-30 -40 60 90" className="w-full h-full overflow-visible">
                  {e.type === 'zombie' && <ZombieEnemySVG isHit={e.isHit} isBoss={e.isBoss} walkFrame={e.walkFrame} />}
                  {e.type === 'thug' && <ThugEnemySVG isHit={e.isHit} isBoss={e.isBoss} walkFrame={e.walkFrame} />}
                  {e.type === 'tiger' && <TigerEnemySVG isHit={e.isHit} isBoss={e.isBoss} walkFrame={e.walkFrame} />}
                  {e.type === 'ghost' && <GhostEnemySVG isHit={e.isHit} isBoss={e.isBoss} walkFrame={e.walkFrame} />}
                  {e.type === 'alien' && <AlienEnemySVG isHit={e.isHit} isBoss={e.isBoss} walkFrame={e.walkFrame} />}
                </svg>
              </div>
            ))}

            {/* Player gun */}
            <div
              className="absolute z-30 pointer-events-none"
              style={{
                left: `${gunPosRef.current.x}%`,
                top: `${gunPosRef.current.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <svg width="180" height="180" viewBox="-90 -90 180 180" className="overflow-visible">
                <GunSVG weapon={currentWeapon} angle={gunAngleRef.current} recoil={gunRecoil} />
                {isReloading && (
                  <text x="-20" y="5" fill="white" fontSize="12" fontWeight="bold">
                    RELOAD
                  </text>
                )}
              </svg>
            </div>

            {isMicOn && isSpeaking && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-green-500 rounded-full animate-pulse border-2 border-white" />
            )}
          </>
        )}
      </div>

      {/* Bottom controls */}
      {gameState === 'playing' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-4 pointer-events-auto">
          {(Object.keys(WEAPONS) as WeaponType[]).map((w) => (
            <button
              key={w}
              onClick={() => switchWeapon(w)}
              disabled={isReloading}
              className={`px-4 py-3 rounded-xl font-bold text-sm border transition-all flex flex-col items-center gap-1 ${
                currentWeapon === w
                  ? 'bg-white text-black border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                  : 'bg-black/60 text-white border-white/20 hover:bg-black/80'
              }`}
            >
              <span style={{ color: currentWeapon === w ? 'black' : WEAPONS[w].color }}>
                {WEAPONS[w].name}
              </span>
              <span className="text-xs font-mono">
                {w === currentWeapon ? `${ammo}/${WEAPONS[w].magSize}` : ''}
              </span>
            </button>
          ))}
          <button
            onClick={handleReload}
            disabled={isReloading || ammo === WEAPONS[currentWeapon].magSize}
            className="px-4 py-3 rounded-xl font-bold text-sm border border-white/20 bg-black/60 text-white hover:bg-black/80 transition-all flex flex-col items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
            <span>Reload (R)</span>
          </button>
          <button
            onClick={handleDash}
            disabled={dashCooldown > 0}
            className={`px-4 py-3 rounded-xl font-bold text-sm border transition-all flex flex-col items-center gap-1 ${
              dashCooldown > 0
                ? 'bg-black/40 text-stone-500 border-stone-700'
                : 'bg-blue-600/80 text-white border-blue-400 hover:bg-blue-500'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Dash (Shift)</span>
            {dashCooldown > 0 && <span className="text-[10px]">{(dashCooldown/1000).toFixed(1)}s</span>}
          </button>
        </div>
      )}

      {/* Warning banner */}
      <AnimatePresence>
        {warningText && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          >
            <div className="bg-red-900/90 backdrop-blur-md border-2 border-red-500 text-red-100 px-6 py-3 rounded-b-xl text-lg font-black shadow-[0_0_30px_rgba(239,68,68,0.6)] flex items-center gap-3 animate-pulse">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              {warningText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu screens */}
      <AnimatePresence>
        {(gameState === 'menu' || gameState === 'select_env') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-stone-900/90 border border-yellow-500/30 p-8 md:p-12 rounded-3xl text-center max-w-3xl w-full shadow-[0_0_50px_rgba(234,179,8,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
              
              {gameState === 'menu' ? (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-7xl mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                  >
                    🎯
                  </motion.div>
                  <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-2">
                    आलमनगर स्ट्राइक
                  </h1>
                  <p className="text-stone-400 mb-2 font-medium">
                    स्वागत है, <span className="text-yellow-400 font-bold">{currentUser.displayName || 'Player'}</span>!
                  </p>
                  <p className="text-stone-500 mb-8 text-sm">अंधेरी रातों में दुश्मनों का सफाया करें</p>
                  <button
                    onClick={() => setGameState('select_env')}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-black text-xl py-4 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-lg shadow-orange-500/30 group"
                  >
                    <Play className="w-6 h-6 fill-black group-hover:scale-110 transition-transform" /> खेल शुरू करें
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-2">
                    <MapPin className="text-yellow-400" /> युद्धक्षेत्र चुनें
                  </h2>
                  <p className="text-stone-400 mb-6 text-sm">3 locations • Premium Night Atmosphere</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {(['gali', 'jungle', 'city'] as Environment[]).map((envKey) => {
                      const e = ENVIRONMENTS[envKey];
                      return (
                        <button
                          key={envKey}
                          onClick={() => startGame(envKey)}
                          className="relative p-4 rounded-xl border border-white/10 bg-black/40 hover:bg-black/60 hover:border-yellow-500/50 transition-all group flex flex-col items-center gap-3"
                        >
                          <div
                            className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity rounded-xl"
                            style={{ backgroundImage: `url(${e.bg})` }}
                          />
                          <div className="relative z-10 w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/50">
                            <e.icon className="w-8 h-8 text-yellow-400" />
                          </div>
                          <div className="relative z-10 text-center">
                            <div className="font-black text-lg text-white">{e.hindiName}</div>
                            <div className="text-xs text-stone-400">{e.name}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setGameState('menu')}
                    className="text-stone-400 hover:text-white text-sm font-bold transition-colors"
                  >
                    ← वापस
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game over screen */}
      <AnimatePresence>
        {gameState === 'gameover' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-red-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-stone-900/90 border border-red-500/30 p-8 md:p-12 rounded-3xl text-center max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.2)]">
              <h1 className="text-5xl font-black text-red-500 mb-2">समाप्त</h1>
              <p className="text-stone-400 mb-2">अंधेरे ने आपको निगल लिया।</p>
              <p className="text-stone-500 mb-8 text-sm">दुश्मनों ने आपको घेर लिया।</p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
                  <div className="text-xs text-stone-400 font-bold uppercase mb-1">अंक</div>
                  <div className="text-3xl font-black text-white">{score}</div>
                </div>
                <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
                  <div className="text-xs text-stone-400 font-bold uppercase mb-1">वेव</div>
                  <div className="text-3xl font-black text-yellow-400">{wave}</div>
                </div>
              </div>
              <button
                onClick={() => setGameState('menu')}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-xl py-4 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-3"
              >
                <RotateCcw className="w-6 h-6" /> पुन प्रयास
              </button>
              <Link href="/" className="block mt-6 text-stone-400 hover:text-white font-bold text-sm">
                ← मुख्य पृष्ठ
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}