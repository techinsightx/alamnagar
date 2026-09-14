"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Trophy, Play, RotateCcw, Volume2, VolumeX, Target, 
  MapPin, Trees, Building2, AlertTriangle, Mic, MicOff, Users, 
  User, LogIn, UserPlus, Mail, Lock, LogOut, Gamepad2
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

// ✅ Audio Engine with Enemy-Specific Sounds
const playSound = (type: 'shoot' | 'shotgun' | 'sniper' | 'pistol' | 'rifle' | 'hit' | 'kill' | 'explode' | 'boss_hit' | 'gameover' | 'booyah' | 'switch' | 'login' | 'shell' | 'roar' | 'ghost_wail') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    
    switch (type) {
      case 'pistol':
        osc.type = 'square'; osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
        break;
      case 'rifle':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.25, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.08);
        break;
      case 'shotgun':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.4, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
        break;
      case 'sniper':
        osc.type = 'sine'; osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.5, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
        break;
      case 'hit':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15);
        break;
      case 'boss_hit':
        osc.type = 'square'; osc.frequency.setValueAtTime(80, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.4, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
        break;
      case 'kill':
        osc.type = 'triangle'; osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
        break;
      case 'explode':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.5, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
        break;
      case 'roar': // Tiger/Boss sound
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
        break;
      case 'ghost_wail': // Ghost sound
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.15, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
        break;
      case 'switch':
      case 'login':
        osc.type = 'sine'; osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
        break;
      case 'gameover':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, ctx.currentTime); osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 1);
        gain.gain.setValueAtTime(0.4, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 1);
        break;
      case 'booyah':
        osc.type = 'square'; osc.frequency.setValueAtTime(400, ctx.currentTime); osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.6);
        break;
      case 'shell':
        osc.type = 'sine'; osc.frequency.setValueAtTime(2000, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.05, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.05);
        break;
    }
  } catch (e) {}
};

type Environment = 'gali' | 'jungle' | 'city';
type WeaponType = 'pistol' | 'rifle' | 'shotgun' | 'sniper';
type EnemyType = 'zombie' | 'thug' | 'tiger' | 'ghost' | 'alien';

const WEAPONS: Record<WeaponType, { name: string; fireRate: number; damage: number; spread: number; speed: number; color: string; size: number; muzzleOffset: number; recoil: number }> = {
  pistol: { name: "Pistol", fireRate: 250, damage: 1, spread: 0, speed: 2.5, color: "#fbbf24", size: 6, muzzleOffset: 3.5, recoil: 2 },
  rifle: { name: "Rifle", fireRate: 100, damage: 1, spread: 0.05, speed: 3.0, color: "#3b82f6", size: 5, muzzleOffset: 4, recoil: 1.5 },
  shotgun: { name: "Shotgun", fireRate: 800, damage: 1, spread: 0.3, speed: 2.0, color: "#ef4444", size: 7, muzzleOffset: 4.5, recoil: 4 },
  sniper: { name: "Sniper", fireRate: 1200, damage: 5, spread: 0, speed: 5.0, color: "#a855f7", size: 10, muzzleOffset: 5, recoil: 5 },
};

// ✅ Unique Gun SVGs for Each Weapon (Full Detail)
const PistolSVG = ({ angle, recoil }: { angle: number; recoil: number }) => (
  <g transform={`rotate(${angle}) translate(${-recoil}, 0)`} style={{ filter: 'drop-shadow(0 0 10px #fbbf24)' }}>
    <rect x="-20" y="5" width="15" height="25" rx="3" fill="#2a2a2a" />
    <rect x="-17" y="8" width="9" height="18" rx="2" fill="#3a3a3a" />
    <rect x="-15" y="-8" width="35" height="16" rx="3" fill="#444" />
    <rect x="-10" y="-6" width="25" height="12" rx="2" fill="#555" />
    <rect x="20" y="-5" width="20" height="10" rx="2" fill="#666" />
    <circle cx="40" cy="0" r="3" fill="#222" />
    <rect x="-5" y="-4" width="8" height="8" rx="1" fill="#777" />
    <circle cx="5" cy="0" r="1.5" fill="#888" />
    <path d="M -10 8 Q -8 12 -5 8" stroke="#333" strokeWidth="1" fill="none" />
  </g>
);

const RifleSVG = ({ angle, recoil }: { angle: number; recoil: number }) => (
  <g transform={`rotate(${angle}) translate(${-recoil}, 0)`} style={{ filter: 'drop-shadow(0 0 10px #3b82f6)' }}>
    <rect x="-40" y="-6" width="25" height="12" rx="3" fill="#4a3b2a" />
    <rect x="-35" y="-4" width="15" height="8" rx="2" fill="#6b5344" />
    <rect x="-15" y="-8" width="40" height="16" rx="3" fill="#333" />
    <rect x="-10" y="-6" width="30" height="12" rx="2" fill="#444" />
    <rect x="-8" y="8" width="12" height="18" rx="2" fill="#222" />
    <rect x="25" y="-5" width="35" height="10" rx="2" fill="#555" />
    <rect x="-5" y="-14" width="20" height="6" rx="2" fill="#222" />
    <circle cx="5" cy="-11" r="2" fill="#444" />
    <circle cx="60" cy="0" r="3" fill="#222" />
    <rect x="10" y="-3" width="10" height="6" rx="1" fill="#666" />
    <circle cx="-5" cy="0" r="2" fill="#777" />
  </g>
);

const ShotgunSVG = ({ angle, recoil }: { angle: number; recoil: number }) => (
  <g transform={`rotate(${angle}) translate(${-recoil}, 0)`} style={{ filter: 'drop-shadow(0 0 10px #ef4444)' }}>
    <rect x="-45" y="-7" width="30" height="14" rx="4" fill="#4a3b2a" />
    <rect x="-40" y="-5" width="20" height="10" rx="2" fill="#6b5344" />
    <rect x="-15" y="-9" width="35" height="18" rx="3" fill="#333" />
    <rect x="-10" y="-7" width="25" height="14" rx="2" fill="#444" />
    <rect x="5" y="-6" width="15" height="12" rx="2" fill="#555" />
    <rect x="20" y="-7" width="40" height="6" rx="2" fill="#666" />
    <rect x="20" y="1" width="40" height="6" rx="2" fill="#666" />
    <circle cx="60" cy="-4" r="2.5" fill="#222" />
    <circle cx="60" cy="4" r="2.5" fill="#222" />
    <rect x="-5" y="-4" width="10" height="8" rx="1" fill="#777" />
  </g>
);

const SniperSVG = ({ angle, recoil }: { angle: number; recoil: number }) => (
  <g transform={`rotate(${angle}) translate(${-recoil}, 0)`} style={{ filter: 'drop-shadow(0 0 10px #a855f7)' }}>
    <rect x="-50" y="-7" width="30" height="14" rx="4" fill="#2a2a2a" />
    <rect x="-45" y="-5" width="20" height="10" rx="2" fill="#3a3a3a" />
    <rect x="-20" y="-8" width="45" height="16" rx="3" fill="#333" />
    <rect x="-15" y="-6" width="35" height="12" rx="2" fill="#444" />
    <rect x="-10" y="8" width="15" height="20" rx="2" fill="#222" />
    <rect x="25" y="-5" width="50" height="10" rx="2" fill="#555" />
    <rect x="30" y="-3" width="40" height="6" rx="1" fill="#666" />
    <rect x="-10" y="-16" width="30" height="8" rx="3" fill="#222" />
    <circle cx="5" cy="-12" r="3" fill="#444" />
    <circle cx="5" cy="-12" r="1.5" fill="#666" />
    <rect x="70" y="-6" width="8" height="12" rx="1" fill="#333" />
    <circle cx="75" cy="0" r="2" fill="#222" />
    <line x1="20" y1="8" x2="15" y2="18" stroke="#555" strokeWidth="2" />
    <line x1="20" y1="8" x2="25" y2="18" stroke="#555" strokeWidth="2" />
    <rect x="0" y="-3" width="12" height="6" rx="1" fill="#777" />
    <circle cx="-5" cy="0" r="2" fill="#888" />
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

// ✅ Realistic 2D Enemy SVGs (Full Detail)
const ZombieEnemy = ({ isHit, isBoss, walkFrame }: { isHit: boolean; isBoss: boolean; walkFrame: number }) => {
  const size = isBoss ? 1.8 : 1;
  const legSwing = Math.sin(walkFrame * 8) * 15;
  const armSwing = Math.sin(walkFrame * 8) * 20;
  const bob = Math.abs(Math.sin(walkFrame * 8)) * 2;
  
  return (
    <g transform={`scale(${size}) translate(0, ${-bob})`} style={{ filter: isHit ? 'brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)' : 'none' }}>
      <ellipse cx="0" cy="45" rx="20" ry="5" fill="rgba(0,0,0,0.5)" />
      <rect x="-8" y="20" width="8" height="25" rx="3" fill="#2d4a3e" transform={`rotate(${legSwing} -4 20)`} />
      <rect x="-18" y="-5" width="8" height="22" rx="3" fill="#4a6b5e" transform={`rotate(${-armSwing} -14 -5)`} />
      <rect x="-12" y="-10" width="24" height="32" rx="4" fill="#3d5a4e" />
      <path d="M -12 -5 L 12 -5 L 12 5 L -12 5 Z" fill="#5a3d3d" />
      <path d="M -10 0 L -5 8 M 5 0 L 10 8" stroke="#3d5a4e" strokeWidth="1" />
      <rect x="0" y="20" width="8" height="25" rx="3" fill="#2d4a3e" transform={`rotate(${-legSwing} 4 20)`} />
      <rect x="10" y="-5" width="8" height="22" rx="3" fill="#4a6b5e" transform={`rotate(${armSwing} 14 -5)`} />
      <circle cx="0" cy="-20" r="12" fill="#4a6b5e" />
      <path d="M -10 -25 Q -5 -30 0 -28 Q 5 -30 10 -25 Q 8 -28 0 -27 Q -8 -28 -10 -25 Z" fill="#2d3d2e" />
      <circle cx="-4" cy="-22" r="2.5" fill="#ff0000" />
      <circle cx="4" cy="-22" r="2.5" fill="#ff0000" />
      <circle cx="-4" cy="-22" r="1" fill="#ff6666" />
      <circle cx="4" cy="-22" r="1" fill="#ff6666" />
      <path d="M -5 -16 Q 0 -14 5 -16" stroke="#2d3d2e" strokeWidth="1.5" fill="#1a1a1a" />
      <path d="M -4 -16 L -3 -14 M 0 -16 L 0 -14 M 4 -16 L 3 -14" stroke="white" strokeWidth="0.8" />
      <circle cx="-6" cy="-10" r="2" fill="#8b0000" />
      <circle cx="6" cy="-5" r="1.5" fill="#8b0000" />
      {isBoss && (
        <g>
          <path d="M -8 -30 L -6 -35 L -3 -32 L 0 -36 L 3 -32 L 6 -35 L 8 -30 Z" fill="#ffd700" />
          <circle cx="-6" cy="-33" r="1" fill="#ff0000" />
          <circle cx="0" cy="-34" r="1" fill="#00ff00" />
          <circle cx="6" cy="-33" r="1" fill="#0000ff" />
        </g>
      )}
    </g>
  );
};

const ThugEnemy = ({ isHit, isBoss, walkFrame }: { isHit: boolean; isBoss: boolean; walkFrame: number }) => {
  const size = isBoss ? 2.0 : 1.3;
  const legSwing = Math.sin(walkFrame * 6) * 12;
  const armSwing = Math.sin(walkFrame * 6) * 15;
  return (
    <g transform={`scale(${size})`} style={{ filter: isHit ? 'brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)' : 'none' }}>
      <ellipse cx="0" cy="50" rx="25" ry="6" fill="rgba(0,0,0,0.6)" />
      <rect x="-10" y="20" width="10" height="30" rx="4" fill="#1a1a1a" transform={`rotate(${legSwing} -5 20)`} />
      <rect x="0" y="20" width="10" height="30" rx="4" fill="#1a1a1a" transform={`rotate(${-legSwing} 5 20)`} />
      <rect x="-15" y="-10" width="30" height="35" rx="5" fill="#333" />
      <rect x="-22" y="-5" width="10" height="25" rx="4" fill="#d4a373" transform={`rotate(${-armSwing} -17 -5)`} />
      <rect x="12" y="-5" width="10" height="25" rx="4" fill="#d4a373" transform={`rotate(${armSwing} 17 -5)`} />
      <circle cx="0" cy="-25" r="14" fill="#d4a373" />
      <path d="M -14 -30 Q 0 -35 14 -30 L 12 -25 Q 0 -28 -12 -25 Z" fill="#111" />
      <circle cx="-5" cy="-26" r="2" fill="#000" />
      <circle cx="5" cy="-26" r="2" fill="#000" />
      <path d="M -6 -18 Q 0 -15 6 -18" stroke="#000" strokeWidth="1.5" fill="none" />
      {isBoss && <circle cx="0" cy="-38" r="3" fill="#f00" />}
    </g>
  );
};

const TigerEnemy = ({ isHit, isBoss, walkFrame }: { isHit: boolean; isBoss: boolean; walkFrame: number }) => {
  const size = isBoss ? 2.2 : 1.4;
  const legSwing = Math.sin(walkFrame * 10) * 10;
  const bob = Math.abs(Math.sin(walkFrame * 10)) * 3;
  return (
    <g transform={`scale(${size}) translate(0, ${-bob})`} style={{ filter: isHit ? 'brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)' : 'none' }}>
      <ellipse cx="0" cy="40" rx="30" ry="8" fill="rgba(0,0,0,0.5)" />
      <ellipse cx="0" cy="10" rx="25" ry="18" fill="#f97316" />
      <path d="M -15 0 L -10 10 M -5 0 L 0 10 M 5 0 L 10 10 M 15 0 L 20 10" stroke="#000" strokeWidth="3" />
      <rect x="-15" y="20" width="8" height="20" rx="3" fill="#f97316" transform={`rotate(${legSwing} -11 20)`} />
      <rect x="-5" y="20" width="8" height="20" rx="3" fill="#f97316" transform={`rotate(${-legSwing} -1 20)`} />
      <rect x="5" y="20" width="8" height="20" rx="3" fill="#f97316" transform={`rotate(${legSwing} 9 20)`} />
      <rect x="15" y="20" width="8" height="20" rx="3" fill="#f97316" transform={`rotate(${-legSwing} 19 20)`} />
      <circle cx="0" cy="-15" r="16" fill="#f97316" />
      <path d="M -10 -25 L -12 -30 L -6 -28 M 10 -25 L 12 -30 L 6 -28" fill="#f97316" stroke="#000" strokeWidth="1" />
      <circle cx="-6" cy="-18" r="3" fill="#fff" />
      <circle cx="6" cy="-18" r="3" fill="#fff" />
      <circle cx="-6" cy="-18" r="1.5" fill="#000" />
      <circle cx="6" cy="-18" r="1.5" fill="#000" />
      <path d="M -4 -10 Q 0 -8 4 -10" stroke="#000" strokeWidth="1" fill="none" />
      <path d="M -6 -8 L -8 -5 M 6 -8 L 8 -5" stroke="#fff" strokeWidth="1" />
      <path d={`M 25 10 Q 35 ${5 + Math.sin(walkFrame*5)*5} 40 0`} stroke="#f97316" strokeWidth="4" fill="none" />
    </g>
  );
};

const GhostEnemy = ({ isHit, isBoss, walkFrame }: { isHit: boolean; isBoss: boolean; walkFrame: number }) => {
  const size = isBoss ? 2.5 : 1.5;
  const floatY = Math.sin(walkFrame * 4) * 15;
  return (
    <g transform={`scale(${size}) translate(0, ${floatY})`} style={{ filter: isHit ? 'brightness(3) drop-shadow(0 0 10px #fff)' : 'drop-shadow(0 0 15px rgba(255,255,255,0.3))' }}>
      <path d="M -20 -20 Q -20 -40 0 -40 Q 20 -40 20 -20 L 20 10 Q 10 0 0 10 Q -10 0 -20 10 Z" fill="rgba(255, 255, 255, 0.8)" />
      <circle cx="-8" cy="-25" r="4" fill="#000" />
      <circle cx="8" cy="-25" r="4" fill="#000" />
      <circle cx="-8" cy="-25" r="1.5" fill="#f00" />
      <circle cx="8" cy="-25" r="1.5" fill="#f00" />
      <ellipse cx="0" cy="-15" rx="6" ry="8" fill="#000" />
      {isBoss && <path d="M -15 -35 L 0 -50 L 15 -35" fill="none" stroke="#f00" strokeWidth="2" />}
    </g>
  );
};

const AlienEnemy = ({ isHit, isBoss, walkFrame }: { isHit: boolean; isBoss: boolean; walkFrame: number }) => {
  const size = isBoss ? 2.0 : 1.3;
  const legSwing = Math.sin(walkFrame * 8) * 15;
  return (
    <g transform={`scale(${size})`} style={{ filter: isHit ? 'brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)' : 'none' }}>
      <ellipse cx="0" cy="45" rx="20" ry="5" fill="rgba(0,0,0,0.5)" />
      <rect x="-8" y="20" width="8" height="25" rx="3" fill="#4a6b5e" transform={`rotate(${legSwing} -4 20)`} />
      <rect x="0" y="20" width="8" height="25" rx="3" fill="#4a6b5e" transform={`rotate(${-legSwing} 4 20)`} />
      <ellipse cx="0" cy="5" rx="18" ry="22" fill="#8b5cf6" />
      <circle cx="0" cy="-20" r="16" fill="#a78bfa" />
      <ellipse cx="-6" cy="-22" rx="5" ry="7" fill="#000" />
      <ellipse cx="6" cy="-22" rx="5" ry="7" fill="#000" />
      <circle cx="-6" cy="-22" r="2" fill="#0f0" />
      <circle cx="6" cy="-22" r="2" fill="#0f0" />
      <path d="M -10 -30 Q 0 -35 10 -30" stroke="#8b5cf6" strokeWidth="4" fill="none" />
      <circle cx="0" cy="-32" r="3" fill="#0f0" />
    </g>
  );
};

const ENVIRONMENTS: Record<Environment, { 
  name: string; hindiName: string; icon: any; bg: string; overlay: string; enemyTypes: EnemyType[];
}> = {
  gali: { 
    name: "Gali Muhalla", hindiName: "गली मुहल्ला", icon: MapPin, 
    bg: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1920&auto=format&fit=crop",
    overlay: "bg-amber-950/60",
    enemyTypes: ['thug', 'zombie']
  },
  jungle: { 
    name: "Jadui Jungle", hindiName: "जादुई जंगल", icon: Trees, 
    bg: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1920&auto=format&fit=crop",
    overlay: "bg-emerald-950/70",
    enemyTypes: ['tiger', 'ghost', 'zombie']
  },
  city: { 
    name: "City Center", hindiName: "शहर का केंद्र", icon: Building2, 
    bg: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1920&auto=format&fit=crop",
    overlay: "bg-slate-900/70",
    enemyTypes: ['alien', 'zombie']
  }
};

export default function AlamnagarStrike() {
  // ✅ Auth States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // ✅ Game States
  const [gameState, setGameState] = useState<'auth' | 'menu' | 'select_env' | 'playing' | 'gameover'>('auth');
  const [selectedEnv, setSelectedEnv] = useState<Environment>('gali');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [wave, setWave] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [screenShake, setScreenShake] = useState(0);
  const [warningText, setWarningText] = useState<string | null>(null);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('rifle');
  const [isMicOn, setIsMicOn] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [gunRecoil, setGunRecoil] = useState(0);

  // Game refs
  const gunPosRef = useRef({ x: 50, y: 80 });
  const gunAngleRef = useRef(0);
  const mousePosRef = useRef({ x: 50, y: 50 });
  const bulletsRef = useRef<any[]>([]);
  const enemiesRef = useRef<any[]>([]);
  const particlesRef = useRef<any[]>([]);
  const muzzleFlashesRef = useRef<any[]>([]);
  const shellCasingsRef = useRef<any[]>([]);
  const frameRef = useRef<number>(0);
  const lastShotRef = useRef(0);
  const scoreRef = useRef(0);
  const healthRef = useRef(100);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [, setTick] = useState(0);

  // Voice chat refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const playerPresenceRef = useRef<string | null>(null);

  // ✅ Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        setGameState('menu');
        const presenceId = `players_${user.uid}`;
        playerPresenceRef.current = presenceId;
        const presenceRef = doc(db, 'gamePresence', presenceId);
        setDoc(presenceRef, {
          uid: user.uid,
          displayName: user.displayName || 'Player',
          email: user.email,
          photoURL: user.photoURL || '',
          online: true,
          lastSeen: serverTimestamp()
        });
        window.addEventListener('beforeunload', () => {
          deleteDoc(presenceRef).catch(() => {});
        });
      } else {
        setGameState('auth');
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Auth Handlers
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
      setAuthSuccess('✅ अकाउंट बन गया! लॉगिन हो रहा है...');
      if (soundEnabled) playSound('login');
      setTimeout(() => { setAuthEmail(''); setAuthPassword(''); setAuthName(''); }, 1500);
    } catch (err: any) {
      const code = err.code;
      if (code === 'auth/email-already-in-use') setAuthError('यह ईमेल पहले से रजिस्टर्ड है');
      else if (code === 'auth/invalid-email') setAuthError('अमान्य ईमेल पता');
      else if (code === 'auth/weak-password') setAuthError('कमजोर पासवर्ड');
      else setAuthError('साइनअप विफल: ' + err.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    try {
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
      setAuthSuccess('✅ लॉगिन सफल! स्वागत है...');
      if (soundEnabled) playSound('login');
      setTimeout(() => { setAuthEmail(''); setAuthPassword(''); }, 1500);
    } catch (err: any) {
      const code = err.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setAuthError('ईमेल या पासवर्ड गलत है');
      } else if (code === 'auth/invalid-email') {
        setAuthError('अमान्य ईमेल');
      } else {
        setAuthError('लॉगिन विफल: ' + err.message);
      }
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

  // ✅ Voice Chat
  const toggleMic = async () => {
    if (isMicOn) {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (currentUser && playerPresenceRef.current) {
        try {
          await setDoc(doc(db, 'gamePresence', playerPresenceRef.current), {
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'Player',
            online: true,
            micOn: false,
            lastSeen: serverTimestamp()
          }, { merge: true });
        } catch (e) {}
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
      if (soundEnabled) playSound('switch');

      if (currentUser && playerPresenceRef.current) {
        try {
          await setDoc(doc(db, 'gamePresence', playerPresenceRef.current), {
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'Player',
            online: true,
            micOn: true,
            lastSeen: serverTimestamp()
          }, { merge: true });
        } catch (e) {}
      }

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
      console.error('Mic access denied:', err);
      alert('Microphone access denied. Please allow mic access.');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("alamnagarStrikeHighScore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = (env?: Environment) => {
    if (env) setSelectedEnv(env);
    setGameState('playing');
    setScore(0); setHealth(100); setWave(1);
    setWarningText(null); setCurrentWeapon('rifle');
    setGunRecoil(0);
    scoreRef.current = 0; healthRef.current = 100;
    gunPosRef.current = { x: 50, y: 80 };
    gunAngleRef.current = 0;
    mousePosRef.current = { x: 50, y: 50 };
    bulletsRef.current = []; enemiesRef.current = []; particlesRef.current = []; 
    muzzleFlashesRef.current = []; shellCasingsRef.current = [];
    if (soundEnabled) playSound('booyah');
  };

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

    const directionText = side === 'left' ? "बाएं (Left)" : "दाएं (Right)";
    setWarningText(`⚠️ चेतावनी: ${directionText} से ${warningName} आ रहा है!`);
    
    if (isBoss && soundEnabled) {
        if (enemyType === 'tiger') playSound('roar');
        else if (enemyType === 'ghost') playSound('ghost_wail');
    }

    setTimeout(() => setWarningText(null), 2500);

    enemiesRef.current.push({
      id: Date.now() + Math.random(), x, y, vx: 0, vy: 0,
      size: isBoss ? 90 : 60, color: "#4a6b5e", 
      hp: isBoss ? 5 + wave : 1 + Math.floor(wave / 2), 
      maxHp: isBoss ? 5 + wave : 1 + Math.floor(wave / 2), 
      side, isBoss, type: enemyType,
      walkFrame: Math.random() * 10, isHit: false
    });
  }, [wave, selectedEnv, soundEnabled]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    let enemySpawnTimer = 0;
    
    const loop = () => {
      const gunPos = gunPosRef.current;
      const mousePos = mousePosRef.current;
      const bullets = bulletsRef.current;
      const enemies = enemiesRef.current;
      const particles = particlesRef.current;
      const muzzleFlashes = muzzleFlashesRef.current;
      const shellCasings = shellCasingsRef.current;

      gunPos.x += (mousePos.x - gunPos.x) * 0.15;
      gunPos.y += (mousePos.y - gunPos.y) * 0.15;

      const dx = mousePos.x - gunPos.x;
      const dy = mousePos.y - gunPos.y;
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        let diff = targetAngle - gunAngleRef.current;
        while (diff < -180) diff += 360;
        while (diff > 180) diff -= 360;
        gunAngleRef.current += diff * 0.2;
      }

      if (gunRecoil > 0) {
        setGunRecoil(r => Math.max(0, r - 0.3));
      }

      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx; b.y += b.vy;
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 10) b.trail.shift();
        if (b.x < -10 || b.x > 110 || b.y < -10 || b.y > 110) bullets.splice(i, 1);
      }

      for (let i = muzzleFlashes.length - 1; i >= 0; i--) {
        muzzleFlashes[i].life -= 0.2;
        if (muzzleFlashes[i].life <= 0) muzzleFlashes.splice(i, 1);
      }

      for (let i = shellCasings.length - 1; i >= 0; i--) {
        const s = shellCasings[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.15;
        s.rotation += s.rotationSpeed;
        s.life -= 0.02;
        if (s.life <= 0 || s.y > 110) shellCasings.splice(i, 1);
      }

      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const edx = gunPos.x - e.x;
        const edy = gunPos.y - e.y;
        const dist = Math.sqrt(edx * edx + edy * edy);
        const speed = (0.08 + (wave * 0.01)) * (e.type === 'ghost' ? 1.3 : 1);
        
        e.vx = (edx / dist) * speed;
        e.vy = (edy / dist) * speed;
        e.x += e.vx;
        e.y += e.vy;
        e.walkFrame += 0.04;
        if (e.isHit) e.isHit = false;

        if (dist < (15 + e.size/2)) {
          healthRef.current -= (e.isBoss ? 20 : 10);
          setHealth(Math.max(0, healthRef.current));
          enemies.splice(i, 1);
          setScreenShake(10);
          if (soundEnabled) playSound('hit');
          
          for (let p = 0; p < 8; p++) {
            particles.push({ id: Math.random(), x: gunPos.x, y: gunPos.y, vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5, life: 1, color: '#ef4444', size: 4 });
          }
          if (healthRef.current <= 0) {
            setGameState('gameover');
            if (soundEnabled) playSound('gameover');
            if (currentUser && scoreRef.current > highScore) {
              setDoc(doc(db, 'users', currentUser.uid), {
                highScore: scoreRef.current,
                gamesPlayed: (currentUser.gamesPlayed || 0) + 1,
                lastPlayed: serverTimestamp()
              }, { merge: true }).catch(() => {});
              setHighScore(scoreRef.current);
              localStorage.setItem("alamnagarStrikeHighScore", scoreRef.current.toString());
            }
            return;
          }
        }
      }

      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        let hit = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          const bdx = b.x - e.x; const bdy = b.y - e.y;
          if (Math.sqrt(bdx * bdx + bdy * bdy) < (b.size + e.size/2)) {
            e.hp -= b.damage;
            e.isHit = true;
            hit = true;
            
            if (soundEnabled) {
              if (e.isBoss) playSound('boss_hit');
              else playSound('hit');
            }
            
            for (let p = 0; p < 6; p++) {
              particles.push({ 
                id: Math.random(), x: e.x, y: e.y, 
                vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, 
                life: 0.6, color: '#8b0000', size: 3 
              });
            }

            if (e.hp <= 0) {
              enemies.splice(j, 1);
              const points = e.isBoss ? 100 : 20;
              scoreRef.current += points;
              setScore(scoreRef.current);
              if (soundEnabled) playSound('explode');
              setScreenShake(e.isBoss ? 12 : 8);
              
              for (let p = 0; p < 25; p++) {
                const angle = (Math.PI * 2 * p) / 25;
                const speed = 1 + Math.random() * 2.5;
                particles.push({
                  id: Math.random(), x: e.x, y: e.y,
                  vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                  life: 1.5, color: e.isBoss ? '#ffd700' : (e.type === 'tiger' ? '#f97316' : e.type === 'ghost' ? '#fff' : '#4a6b5e'), size: 4 + Math.random() * 4
                });
              }
            }
            break;
          }
        }
        if (hit) bullets.splice(i, 1);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.95; p.vy *= 0.95;
        p.life -= 0.03;
        if (p.life <= 0) particles.splice(i, 1);
      }

      enemySpawnTimer++;
      if (enemySpawnTimer > Math.max(30, 80 - wave * 5)) {
        spawnEnemy();
        enemySpawnTimer = 0;
      }

      if (scoreRef.current > wave * 150) setWave(w => w + 1);
      if (screenShake > 0) setScreenShake(s => Math.max(0, s - 1));

      setTick(t => t + 1);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameState, wave, highScore, soundEnabled, spawnEnemy, screenShake, currentUser, gunRecoil]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (gameState !== 'playing' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mousePosRef.current = { 
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100 
    };
  }, [gameState]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (gameState !== 'playing') return;
    e.preventDefault();
    const now = Date.now();
    const weapon = WEAPONS[currentWeapon];
    if (now - lastShotRef.current < weapon.fireRate) return;
    lastShotRef.current = now;

    const gunPos = gunPosRef.current;
    const angleRad = gunAngleRef.current * (Math.PI / 180);
    
    const muzzleX = gunPos.x + Math.cos(angleRad) * weapon.muzzleOffset;
    const muzzleY = gunPos.y + Math.sin(angleRad) * weapon.muzzleOffset;
    
    muzzleFlashesRef.current.push({
      id: Date.now(),
      x: muzzleX,
      y: muzzleY,
      life: 1,
      size: currentWeapon === 'shotgun' ? 3 : 2
    });
    
    const shellAngle = angleRad + Math.PI / 2 + (Math.random() - 0.5) * 0.3;
    shellCasingsRef.current.push({
      id: Date.now() + Math.random(),
      x: gunPos.x,
      y: gunPos.y,
      vx: Math.cos(shellAngle) * 0.6,
      vy: Math.sin(shellAngle) * 0.6 - 0.4,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 25,
      life: 1
    });
    
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
      shoot(-0.2); shoot(-0.1); shoot(0); shoot(0.1); shoot(0.2);
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
    
    if (soundEnabled) playSound('shell');
    setScreenShake(currentWeapon === 'sniper' ? 10 : currentWeapon === 'shotgun' ? 5 : 2);
  }, [gameState, soundEnabled, currentWeapon]);

  const switchWeapon = (w: WeaponType) => {
    setCurrentWeapon(w);
    if (soundEnabled) playSound('switch');
  };

  const env = ENVIRONMENTS[selectedEnv];
  const EnvIcon = env.icon;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (gameState === 'auth' || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-purple-950 to-stone-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-600 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 bg-stone-900/90 backdrop-blur-xl border border-yellow-500/30 rounded-3xl p-8 md:p-10 max-w-md w-full shadow-[0_0_60px_rgba(234,179,8,0.2)]"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-t-3xl" />
          
          <div className="text-center mb-6">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-3">🎯</motion.div>
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
              <LogIn className="w-4 h-4 inline mr-1" /> लॉगिन
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthSuccess(''); }}
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
                authMode === 'signup' ? 'bg-yellow-500 text-black' : 'text-stone-400'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-1" /> साइनअप
            </button>
          </div>

          <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="text-xs font-bold text-stone-400 mb-1 block">पूरा नाम</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="अपना नाम दर्ज करें"
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-yellow-500 transition"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-stone-400 mb-1 block">ईमेल</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-yellow-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-400 mb-1 block">पासवर्ड</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="कम से कम 6 अक्षर"
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-yellow-500 transition"
                  required
                />
              </div>
            </div>

            {authError && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {authError}
              </motion.div>
            )}

            {authSuccess && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-2 rounded-lg text-sm">
                {authSuccess}
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-black text-lg py-3 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
            >
              {authMode === 'login' ? <><LogIn className="w-5 h-5" /> लॉगिन करें</> : <><UserPlus className="w-5 h-5" /> अकाउंट बनाएं</>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-800">
            <div className="flex items-center justify-center gap-4 text-xs text-stone-500">
              <span className="flex items-center gap-1"><Gamepad2 className="w-3 h-3" /> 4 Weapons</span>
              <span className="flex items-center gap-1"><Mic className="w-3 h-3" /> Voice Chat</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Multiplayer</span>
            </div>
            <p className="text-center text-xs text-stone-600 mt-3">
              🔒 आपका डेटा सुरक्षित है • Parents can create accounts for kids
            </p>
          </div>

          <Link href="/" className="block mt-4 text-center text-stone-500 hover:text-yellow-400 text-sm font-bold transition-colors">
            ← मुख्य पृष्ठ पर वापस जाएं
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden select-none touch-none font-sans text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000" style={{ backgroundImage: `url(${env.bg})` }} />
        <div className={`absolute inset-0 ${env.overlay} transition-all duration-1000`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      </div>

      {/* Top HUD */}
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
            <button 
              onClick={handleLogout}
              className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors group"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-stone-400 group-hover:text-red-400" />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10">
            {soundEnabled ? <Volume2 className="w-5 h-5 text-green-400" /> : <VolumeX className="w-5 h-5 text-red-400" />}
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-xs text-white font-bold">SOUND</button>
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
            </div>
            <div className="w-48 h-6 bg-black/60 rounded-full border border-white/10 overflow-hidden relative shadow-lg">
              <motion.div className="h-full bg-gradient-to-r from-red-600 to-red-400" initial={{ width: '100%' }} animate={{ width: `${health}%` }} transition={{ type: 'spring', bounce: 0 }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-black text-white drop-shadow-md">HP {health}%</span>
              </div>
            </div>
            <div className="text-sm font-bold text-stone-300 bg-black/40 px-3 py-1 rounded-full border border-white/5 flex items-center gap-2">
              <EnvIcon className="w-4 h-4" /> {env.hindiName} • WAVE {wave}
            </div>
          </div>
        )}
      </div>

      {/* Weapon Selector */}
      {gameState === 'playing' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2 pointer-events-auto">
          {(Object.keys(WEAPONS) as WeaponType[]).map((w) => (
            <button
              key={w}
              onClick={() => switchWeapon(w)}
              className={`px-4 py-2 rounded-lg font-bold text-xs md:text-sm border transition-all ${
                currentWeapon === w 
                  ? 'bg-white text-black border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                  : 'bg-black/60 text-white border-white/20 hover:bg-black/80'
              }`}
            >
              <span style={{ color: currentWeapon === w ? 'black' : WEAPONS[w].color }}>{WEAPONS[w].name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Warning Banner */}
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

      {/* Game Canvas */}
      <div 
        ref={canvasRef}
        className="absolute inset-0 z-10 cursor-crosshair"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        style={{ transform: screenShake > 0 ? `translate(${(Math.random()-0.5)*screenShake}px, ${(Math.random()-0.5)*screenShake}px)` : 'none' }}
      >
        {gameState === 'playing' && (
          <>
            {particlesRef.current.map(p => (
              <div key={p.id} className="absolute rounded-full pointer-events-none"
                style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.size * 2}px`, height: `${p.size * 2}px`, marginLeft: `-${p.size}px`, marginTop: `-${p.size}px`, backgroundColor: p.color, opacity: p.life, boxShadow: `0 0 10px ${p.color}` }} />
            ))}

            {/* Fast Bullets with Long Trails */}
            {bulletsRef.current.map(b => (
              <div key={b.id} className="absolute pointer-events-none">
                {b.trail.map((t: any, idx: number) => (
                  <div key={idx} className="absolute rounded-full"
                    style={{ 
                      left: `${t.x}%`, top: `${t.y}%`, 
                      width: `${b.size * 0.5}px`, height: `${b.size * 0.5}px`, 
                      marginLeft: `-${b.size * 0.25}px`, marginTop: `-${b.size * 0.25}px`, 
                      backgroundColor: b.color, 
                      opacity: (idx / b.trail.length) * 0.7,
                      boxShadow: `0 0 6px ${b.color}`
                    }} />
                ))}
                <div className="absolute rounded-full"
                  style={{ 
                    left: `${b.x}%`, top: `${b.y}%`, 
                    width: `${b.size * 2}px`, height: `${b.size * 2}px`, 
                    marginLeft: `-${b.size}px`, marginTop: `-${b.size}px`, 
                    backgroundColor: 'white',
                    boxShadow: `0 0 15px ${b.color}, 0 0 30px ${b.color}, 0 0 45px ${b.color}`
                  }} />
              </div>
            ))}

            {/* Muzzle Flashes */}
            {muzzleFlashesRef.current.map(m => (
              <div key={m.id} className="absolute pointer-events-none"
                style={{ 
                  left: `${m.x}%`, top: `${m.y}%`, 
                  width: `${m.size * 20}px`, height: `${m.size * 20}px`, 
                  marginLeft: `-${m.size * 10}px`, marginTop: `-${m.size * 10}px`,
                  background: 'radial-gradient(circle, rgba(255,255,200,1) 0%, rgba(255,200,50,0.8) 30%, rgba(255,100,0,0.4) 60%, transparent 80%)',
                  opacity: m.life,
                  transform: `scale(${1 + (1 - m.life) * 3})`
                }} />
            ))}

            {/* Shell Casings */}
            {shellCasingsRef.current.map(s => (
              <div key={s.id} className="absolute pointer-events-none"
                style={{ 
                  left: `${s.x}%`, top: `${s.y}%`, 
                  width: '6px', height: '10px', 
                  marginLeft: '-3px', marginTop: '-5px',
                  backgroundColor: '#d4af37',
                  border: '1px solid #8b7355',
                  borderRadius: '2px',
                  opacity: s.life,
                  transform: `rotate(${s.rotation}deg)`
                }} />
            ))}

            {/* Realistic 2D Enemies */}
            {enemiesRef.current.map(e => (
              <div key={e.id} className="absolute z-20 pointer-events-none"
                style={{ left: `${e.x}%`, top: `${e.y}%`, width: `${e.size}px`, height: `${e.size * 1.5}px`, marginLeft: `-${e.size/2}px`, marginTop: `-${e.size * 0.75}px`, transform: e.side === 'left' ? 'scaleX(1)' : 'scaleX(-1)' }}>
                {e.maxHp > 1 && (
                  <div className="w-full h-1.5 bg-black/50 rounded-full mb-1 overflow-hidden border border-white/20 absolute -top-3" style={{ transform: e.side === 'left' ? 'scaleX(1)' : 'scaleX(-1)' }}>
                    <div className="h-full bg-green-500 transition-all duration-100" style={{ width: `${(e.hp / e.maxHp) * 100}%` }} />
                  </div>
                )}
                <svg viewBox="-30 -40 60 90" className="w-full h-full overflow-visible">
                  {e.type === 'zombie' && <ZombieEnemy isHit={e.isHit} isBoss={e.isBoss} walkFrame={e.walkFrame} />}
                  {e.type === 'thug' && <ThugEnemy isHit={e.isHit} isBoss={e.isBoss} walkFrame={e.walkFrame} />}
                  {e.type === 'tiger' && <TigerEnemy isHit={e.isHit} isBoss={e.isBoss} walkFrame={e.walkFrame} />}
                  {e.type === 'ghost' && <GhostEnemy isHit={e.isHit} isBoss={e.isBoss} walkFrame={e.walkFrame} />}
                  {e.type === 'alien' && <AlienEnemy isHit={e.isHit} isBoss={e.isBoss} walkFrame={e.walkFrame} />}
                </svg>
              </div>
            ))}

            {/* Large Realistic Gun */}
            <div className="absolute z-30 pointer-events-none" style={{ left: `${gunPosRef.current.x}%`, top: `${gunPosRef.current.y}%`, transform: 'translate(-50%, -50%)' }}>
              <svg width="180" height="180" viewBox="-90 -90 180 180" className="overflow-visible">
                <GunSVG weapon={currentWeapon} angle={gunAngleRef.current} recoil={gunRecoil} />
              </svg>
            </div>

            {isMicOn && isSpeaking && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-green-500 rounded-full animate-pulse border-2 border-white" />
            )}
          </>
        )}
      </div>

      {/* Menu */}
      <AnimatePresence>
        {(gameState === 'menu' || gameState === 'select_env') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-stone-900/90 border border-yellow-500/30 p-8 md:p-12 rounded-3xl text-center max-w-3xl w-full shadow-[0_0_50px_rgba(234,179,8,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
              
              {gameState === 'menu' ? (
                <>
                  <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-7xl mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">🎯</motion.div>
                  <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-2">आलमनगर स्ट्राइक</h1>
                  <p className="text-stone-400 mb-2 font-medium">स्वागत है, <span className="text-yellow-400 font-bold">{currentUser.displayName || 'Player'}</span>!</p>
                  <p className="text-stone-500 mb-8 text-sm">युद्धक्षेत्र चुनें और दुश्मनों को खत्म करें</p>
                  <button onClick={() => setGameState('select_env')}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-black text-xl py-4 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-lg shadow-orange-500/30 group">
                    <Play className="w-6 h-6 fill-black group-hover:scale-110 transition-transform" /> खेल शुरू करें
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-2"><MapPin className="text-yellow-400" /> युद्धक्षेत्र चुनें</h2>
                  <p className="text-stone-400 mb-6 text-sm">3 locations • Voice Chat enabled</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {(['gali', 'jungle', 'city'] as Environment[]).map((envKey) => {
                      const e = ENVIRONMENTS[envKey];
                      const Icon = e.icon;
                      return (
                        <button key={envKey} onClick={() => startGame(envKey)}
                          className="relative p-4 rounded-xl border border-white/10 bg-black/40 hover:bg-black/60 hover:border-yellow-500/50 transition-all group flex flex-col items-center gap-3">
                          <div className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity rounded-xl" style={{ backgroundImage: `url(${e.bg})` }} />
                          <div className="relative z-10 w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/50">
                            <Icon className="w-8 h-8 text-yellow-400" />
                          </div>
                          <div className="relative z-10 text-center">
                            <div className="font-black text-lg text-white">{e.hindiName}</div>
                            <div className="text-xs text-stone-400">{e.name}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => setGameState('menu')} className="text-stone-400 hover:text-white text-sm font-bold transition-colors">← वापस</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over */}
      <AnimatePresence>
        {gameState === 'gameover' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-red-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-stone-900/90 border border-red-500/30 p-8 md:p-12 rounded-3xl text-center max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.2)]">
              <h1 className="text-5xl font-black text-red-500 mb-2">समाप्त</h1>
              <p className="text-stone-400 mb-2">अच्छा प्रयास, <span className="text-yellow-400">{currentUser.displayName || 'Player'}</span>!</p>
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
              <button onClick={() => setGameState('menu')}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-xl py-4 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-3">
                <RotateCcw className="w-6 h-6" /> पुन प्रयास
              </button>
              <Link href="/" className="block mt-6 text-stone-400 hover:text-white font-bold text-sm">← मुख्य पृष्ठ</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}