"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Trophy, Play, RotateCcw, Volume2, VolumeX, Target, 
  MapPin, Trees, Building2, AlertTriangle, Mic, MicOff, Wind,
  RefreshCw, Zap, Crosshair, ChevronUp, ChevronDown, Music, Music2,
  Menu, X, User
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

// ═══════════════════════════════════════════════════════════════════════════════
// 🔊 GLOBAL AUDIO CONTEXT - Persistent audio context
// ═══════════════════════════════════════════════════════════════════════════════
let globalAudioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!globalAudioContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    globalAudioContext = new AudioContextClass();
  }
  if (globalAudioContext.state === 'suspended') {
    globalAudioContext.resume();
  }
  return globalAudioContext;
};

const playSound = (soundType: string, volume: number = 1.0) => {
  try {
    const audioContext = getAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const currentTime = audioContext.currentTime;
    gainNode.gain.value = volume;

    switch (soundType) {
      case 'pistol':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(900, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, currentTime + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.1);
        break;
        
      case 'rifle':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(700, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(60, currentTime + 0.06);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.08);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.08);
        break;
        
      case 'shotgun': {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(120, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(30, currentTime + 0.35);
        gainNode.gain.setValueAtTime(0.5, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.35);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.35);
        
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        oscillator2.type = 'square';
        oscillator2.frequency.setValueAtTime(200, currentTime);
        oscillator2.frequency.exponentialRampToValueAtTime(40, currentTime + 0.2);
        gainNode2.gain.setValueAtTime(0.3, currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);
        oscillator2.start(currentTime);
        oscillator2.stop(currentTime + 0.2);
        break;
      }
        
      case 'sniper': {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1400, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, currentTime + 0.6);
        gainNode.gain.setValueAtTime(0.5, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.6);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.6);
        
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        oscillator2.type = 'sawtooth';
        oscillator2.frequency.setValueAtTime(80, currentTime);
        oscillator2.frequency.exponentialRampToValueAtTime(20, currentTime + 0.4);
        gainNode2.gain.setValueAtTime(0.4, currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.4);
        oscillator2.start(currentTime);
        oscillator2.stop(currentTime + 0.4);
        break;
      }
        
      case 'reload':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(300, currentTime);
        oscillator.frequency.linearRampToValueAtTime(500, currentTime + 0.08);
        oscillator.frequency.linearRampToValueAtTime(300, currentTime + 0.15);
        oscillator.frequency.linearRampToValueAtTime(600, currentTime + 0.25);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.3);
        break;
        
      case 'hit':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(120, currentTime);
        gainNode.gain.setValueAtTime(0.25, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.12);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.12);
        break;
        
      case 'kill':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(500, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1000, currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.15);
        break;
        
      case 'explode': {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(250, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(20, currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.6, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.5);
        
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        oscillator2.type = 'square';
        oscillator2.frequency.setValueAtTime(80, currentTime);
        oscillator2.frequency.exponentialRampToValueAtTime(15, currentTime + 0.6);
        gainNode2.gain.setValueAtTime(0.5, currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.6);
        oscillator2.start(currentTime);
        oscillator2.stop(currentTime + 0.6);
        break;
      }
        
      case 'roar':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(180, currentTime);
        oscillator.frequency.linearRampToValueAtTime(60, currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.4, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.5);
        break;
        
      case 'ghost_wail':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(900, currentTime);
        oscillator.frequency.linearRampToValueAtTime(350, currentTime + 0.6);
        gainNode.gain.setValueAtTime(0.2, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.6);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.6);
        break;
        
      case 'ambient_wind':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(90, currentTime);
        oscillator.frequency.linearRampToValueAtTime(70, currentTime + 2);
        gainNode.gain.setValueAtTime(0.04, currentTime);
        gainNode.gain.linearRampToValueAtTime(0, currentTime + 2);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 2);
        break;
        
      case 'ambient_night':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(60, currentTime);
        oscillator.frequency.linearRampToValueAtTime(80, currentTime + 3);
        oscillator.frequency.linearRampToValueAtTime(60, currentTime + 6);
        gainNode.gain.setValueAtTime(0.03, currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, currentTime + 3);
        gainNode.gain.linearRampToValueAtTime(0, currentTime + 6);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 6);
        break;
        
      case 'ambient_crickets':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(4000, currentTime);
        oscillator.frequency.setValueAtTime(4200, currentTime + 0.05);
        oscillator.frequency.setValueAtTime(4000, currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.02, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.15);
        break;
        
      case 'gameover':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, currentTime);
        oscillator.frequency.linearRampToValueAtTime(40, currentTime + 1.2);
        gainNode.gain.setValueAtTime(0.5, currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, currentTime + 1.2);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 1.2);
        break;
        
      case 'dash':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(250, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(40, currentTime + 0.25);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.25);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.25);
        break;
        
      case 'combo':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(600, currentTime);
        oscillator.frequency.setValueAtTime(800, currentTime + 0.08);
        oscillator.frequency.setValueAtTime(1100, currentTime + 0.16);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.3);
        break;
        
      case 'boss_spawn':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(60, currentTime);
        oscillator.frequency.linearRampToValueAtTime(130, currentTime + 0.6);
        oscillator.frequency.linearRampToValueAtTime(60, currentTime + 1.2);
        gainNode.gain.setValueAtTime(0.4, currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, currentTime + 1.2);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 1.2);
        break;
        
      case 'zombie_die':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(180, currentTime);
        oscillator.frequency.linearRampToValueAtTime(40, currentTime + 0.35);
        gainNode.gain.setValueAtTime(0.45, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.35);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.35);
        break;
        
      case 'thug_die':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(250, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(60, currentTime + 0.4);
        gainNode.gain.setValueAtTime(0.5, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.4);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.4);
        break;
        
      case 'tiger_die':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(350, currentTime);
        oscillator.frequency.linearRampToValueAtTime(80, currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.6, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.5);
        break;
        
      case 'ghost_die':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1100, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, currentTime + 0.7);
        gainNode.gain.setValueAtTime(0.35, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.7);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.7);
        break;
        
      case 'alien_die':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(900, currentTime);
        oscillator.frequency.setValueAtTime(350, currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1300, currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.4, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.35);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.35);
        break;
        
      case 'snake_die':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(500, currentTime);
        oscillator.frequency.linearRampToValueAtTime(120, currentTime + 0.5);
        oscillator.frequency.linearRampToValueAtTime(700, currentTime + 0.7);
        gainNode.gain.setValueAtTime(0.5, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.7);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.7);
        break;
        
      case 'snake_hiss':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(2200, currentTime);
        oscillator.frequency.linearRampToValueAtTime(1400, currentTime + 0.25);
        gainNode.gain.setValueAtTime(0.2, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.25);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.25);
        break;
        
      case 'bullet_impact':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(180, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(40, currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.3, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.15);
        break;
        
      case 'bird_tweet':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1600, currentTime);
        oscillator.frequency.setValueAtTime(2100, currentTime + 0.04);
        oscillator.frequency.setValueAtTime(1600, currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.08, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.12);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.12);
        break;
        
      case 'empty_click':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(1200, currentTime);
        gainNode.gain.setValueAtTime(0.1, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.03);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.03);
        break;
    }
  } catch (error) {
    console.log('Audio error:', error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🎵 CRYSTAL CLEAR CONTINUOUS BACKGROUND AMBIENT SOUND ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
let bgSoundNodes: { oscillators: OscillatorNode[]; gains: GainNode[] } | null = null;

const startBgAmbient = (environment: EnvironmentType, volume: number = 0.15) => {
  stopBgAmbient();
  try {
    const ctx = getAudioContext();
    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    const createLayer = (type: OscillatorType, freq: number, vol: number, detune: number = 0) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      filter.Q.value = 1;
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      gain.gain.value = vol * volume;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscillators.push(osc);
      gains.push(gain);
    };

    switch (environment) {
      case 'gali':
        createLayer('sine', 55, 0.4);
        createLayer('sine', 82, 0.2, 5);
        createLayer('triangle', 110, 0.1, -3);
        createLayer('sine', 40, 0.3, 2);
        createLayer('triangle', 220, 0.03, 10);
        break;
      case 'jungle':
        createLayer('sine', 65, 0.3);
        createLayer('sine', 98, 0.15, 7);
        createLayer('triangle', 130, 0.08, -5);
        createLayer('sine', 45, 0.25, 3);
        createLayer('sine', 3200, 0.008, 50);
        createLayer('sine', 3800, 0.006, -30);
        createLayer('triangle', 480, 0.015, 20);
        break;
      case 'city':
        createLayer('sawtooth', 35, 0.15);
        createLayer('sine', 60, 0.3, 2);
        createLayer('triangle', 90, 0.1, -4);
        createLayer('sine', 120, 0.05, 8);
        createLayer('sine', 440, 0.01, 15);
        break;
    }

    bgSoundNodes = { oscillators, gains };
  } catch (e) {
    console.log('BG sound error:', e);
  }
};

const stopBgAmbient = () => {
  if (bgSoundNodes) {
    bgSoundNodes.oscillators.forEach(osc => {
      try { osc.stop(); } catch {}
    });
    bgSoundNodes = null;
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🎮 TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════
type EnvironmentType = 'gali' | 'jungle' | 'city';
type WeaponType = 'pistol' | 'rifle' | 'shotgun' | 'sniper';
type EnemyType = 'zombie' | 'thug' | 'tiger' | 'ghost' | 'alien' | 'snake';
type ParticleType = 'blood' | 'spark' | 'shell' | 'dust' | 'smoke' | 'debris' | 'fire' | 'fragment' | 'leaf' | 'light';

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
  magazineSize: number;
  reloadTime: number;
  blastPower: 'small' | 'medium' | 'large' | 'massive';
}

const WEAPONS: Record<WeaponType, WeaponStats> = {
  pistol: { 
    name: "Pistol", 
    fireRate: 250, 
    damage: 1, 
    spread: 0.02, 
    speed: 3.0, 
    color: "#fbbf24", 
    size: 5, 
    muzzleOffset: 55, 
    recoil: 3, 
    magazineSize: 12, 
    reloadTime: 1000,
    blastPower: 'small'
  },
  rifle: { 
    name: "Rifle", 
    fireRate: 100, 
    damage: 1, 
    spread: 0.04, 
    speed: 3.5, 
    color: "#60a5fa", 
    size: 4, 
    muzzleOffset: 65, 
    recoil: 2, 
    magazineSize: 30, 
    reloadTime: 1500,
    blastPower: 'medium'
  },
  shotgun: { 
    name: "Shotgun", 
    fireRate: 800, 
    damage: 1, 
    spread: 0.25, 
    speed: 2.5, 
    color: "#f87171", 
    size: 6, 
    muzzleOffset: 60, 
    recoil: 6, 
    magazineSize: 6, 
    reloadTime: 2000,
    blastPower: 'large'
  },
  sniper: { 
    name: "Sniper", 
    fireRate: 1200, 
    damage: 5, 
    spread: 0, 
    speed: 6.0, 
    color: "#c084fc", 
    size: 8, 
    muzzleOffset: 75, 
    recoil: 8, 
    magazineSize: 5, 
    reloadTime: 2500,
    blastPower: 'massive'
  },
};

interface EnemyObject {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  size: number;
  health: number;
  maxHealth: number;
  isBoss: boolean;
  isHit: boolean;
  hitTime: number;
  walkFrame: number;
  isAttacking: boolean;
  spawnTime: number;
  isDying: boolean;
  deathFrame: number;
  stumbleX: number;
  stumbleY: number;
  woundCount: number;
}

interface ParticleObject {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: ParticleType;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  fragmentType?: string;
}

interface BulletObject {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  size: number;
  color: string;
  damage: number;
  trail: { x: number; y: number }[];
  weaponType: WeaponType;
}

interface ImpactEffect {
  id: number;
  x: number;
  y: number;
  life: number;
  size: number;
  type: 'bullet' | 'explosion' | 'death';
  color?: string;
}

interface BirdObject {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  wingPhase: number;
  size: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 💥 ENEMY FRAGMENT SVGs - Real Body Parts
// ═══════════════════════════════════════════════════════════════════════════════
const HeadFragment = ({ color, size }: { color: string; size: number }) => (
  <svg width={size} height={size} viewBox="-20 -20 40 40">
    <circle cx="0" cy="0" r="12" fill={color} />
    <circle cx="-4" cy="-2" r="2" fill="#ff0000" />
    <circle cx="4" cy="-2" r="2" fill="#ff0000" />
    <path d="M-3 4 Q0 6 3 4" stroke="#000" strokeWidth="1" fill="none" />
    <circle cx="-2" cy="6" r="1" fill="#8b0000" />
  </svg>
);

const TorsoFragment = ({ color, size }: { color: string; size: number }) => (
  <svg width={size} height={size * 1.5} viewBox="-15 -25 30 50">
    <rect x="-12" y="-20" width="24" height="35" rx="4" fill={color} />
    <path d="M-10 -15 L-8 -10 M-5 -16 L-4 -11 M0 -15 L1 -10" stroke="#4a2d2d" strokeWidth="0.5" />
    <circle cx="-5" cy="0" r="3" fill="#8b0000" opacity="0.8" />
    <circle cx="6" cy="5" r="2" fill="#8b0000" opacity="0.7" />
  </svg>
);

const ArmFragment = ({ color, size }: { color: string; size: number }) => (
  <svg width={size} height={size * 2} viewBox="-8 -20 16 40">
    <rect x="-6" y="-15" width="12" height="30" rx="3" fill={color} />
    <circle cx="0" cy="15" r="4" fill={color} opacity="0.8" />
    <path d="M-4 -10 L-3 -5 M2 -12 L3 -7" stroke="#4a2d2d" strokeWidth="0.5" />
  </svg>
);

const LegFragment = ({ color, size }: { color: string; size: number }) => (
  <svg width={size} height={size * 2} viewBox="-8 -20 16 40">
    <rect x="-6" y="-15" width="12" height="30" rx="3" fill={color} />
    <rect x="-8" y="12" width="16" height="6" rx="2" fill="#1a1a1a" />
    <path d="M-4 -5 L-3 0 M3 -8 L4 -3" stroke="#4a2d2d" strokeWidth="0.5" />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════════
// 🌙 WORLD-CLASS NATURAL ANIMATED BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════════
const AnimatedBackground = ({ environment }: { environment: EnvironmentType }) => {
  const stars = useMemo(() => Array.from({ length: 150 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 60,
    size: Math.random() * 2.5 + 0.5,
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 3,
  })), []);

  const fireflies = useMemo(() => environment === 'jungle' ? Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: 30 + Math.random() * 50,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
  })) : [], [environment]);

  const leaves = useMemo(() => environment === 'jungle' ? Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 4,
    size: 8 + Math.random() * 6,
  })) : [], [environment]);

  const dustMotes = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 4,
    size: 2 + Math.random() * 3,
  })), []);

  const houses = useMemo(() => environment === 'gali' ? Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: i * 14 + 2,
    height: 120 + Math.random() * 80,
    width: 60 + Math.random() * 50,
    lightDelay: Math.random() * 4,
  })) : [], [environment]);

  const trees = useMemo(() => environment === 'jungle' ? Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: i * 8 + 1,
    height: 150 + Math.random() * 100,
    delay: Math.random() * 2,
  })) : [], [environment]);

  const buildings = useMemo(() => environment === 'city' ? Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: i * 10 + 1,
    height: 150 + Math.random() * 150,
    width: 50 + Math.random() * 50,
  })) : [], [environment]);

  const getTheme = () => {
    switch (environment) {
      case 'gali':
        return {
          sky: 'linear-gradient(to bottom, #050510 0%, #1a1025 40%, #2a1535 70%, #0a0810 100%)',
          mountain: '#151020',
          fog: 'rgba(150, 120, 180, 0.15)',
          house: '#1a1525',
          roof: '#251d35',
          light: '#ffaa44',
          ambient: 'rgba(255, 170, 68, 0.05)',
        };
      case 'jungle':
        return {
          sky: 'linear-gradient(to bottom, #000a05 0%, #051a0f 40%, #0a2515 70%, #030d06 100%)',
          mountain: '#0a2515',
          fog: 'rgba(50, 180, 100, 0.2)',
          treeBack: '#05150a',
          treeFront: '#0a2515',
          ambient: 'rgba(50, 180, 100, 0.08)',
        };
      case 'city':
        return {
          sky: 'linear-gradient(to bottom, #050515 0%, #10102a 40%, #1a1a3a 70%, #050510 100%)',
          mountain: '#151535',
          fog: 'rgba(100, 120, 200, 0.15)',
          building: '#12122a',
          buildingTop: '#1a1a3a',
          window: '#fbbf24',
          ambient: 'rgba(100, 120, 200, 0.06)',
        };
    }
  };

  const theme = getTheme();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: theme.sky }} />

      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {stars.map(star => (
          <circle key={star.id} cx={`${star.x}%`} cy={`${star.y}%`} r={star.size} fill="#ffffff"
            style={{ animation: `twinkle ${star.duration}s ease-in-out infinite`, animationDelay: `${star.delay}s` }} />
        ))}
      </svg>

      <div className="absolute" style={{ right: '12%', top: '10%' }}>
        <div className="rounded-full relative" style={{ width: '90px', height: '90px', background: 'radial-gradient(circle at 35% 35%, #fffdf5, #f0e6c8, #d4c59a)', boxShadow: '0 0 80px rgba(255, 253, 245, 0.3), 0 0 150px rgba(255, 253, 245, 0.1)' }}>
          <div className="absolute w-5 h-5 bg-stone-400/20 rounded-full" style={{ top: '25%', left: '30%' }} />
          <div className="absolute w-3 h-3 bg-stone-400/15 rounded-full" style={{ top: '55%', left: '60%' }} />
          <div className="absolute w-4 h-4 bg-stone-400/25 rounded-full" style={{ top: '40%', left: '20%' }} />
          <div className="absolute w-2 h-2 bg-stone-400/20 rounded-full" style={{ top: '70%', left: '40%' }} />
        </div>
      </div>

      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse at 88% 10%, ${theme.ambient} 0%, transparent 50%)`,
        animation: 'lightRayPulse 8s ease-in-out infinite',
      }} />

      <div className="absolute inset-0 opacity-20" style={{ animation: 'floatClouds 120s linear infinite' }}>
        <svg className="w-[200%] h-full" preserveAspectRatio="none">
          <defs><linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="white" stopOpacity="0.8"/><stop offset="100%" stopColor="white" stopOpacity="0"/></linearGradient></defs>
          <path d="M100 80 Q150 40 200 80 T300 80 T400 80" fill="url(#cloudGrad)" />
          <path d="M600 120 Q650 80 700 120 T800 120" fill="url(#cloudGrad)" />
          <path d="M1100 60 Q1150 20 1200 60 T1300 60" fill="url(#cloudGrad)" />
          <path d="M1600 90 Q1650 50 1700 90 T1800 90" fill="url(#cloudGrad)" />
        </svg>
      </div>

      <svg className="absolute bottom-0 w-full" style={{ height: '40%' }} preserveAspectRatio="none" viewBox="0 0 1200 300">
        <path d="M0 300 L0 180 Q150 120 300 160 Q450 90 600 140 Q750 80 900 150 Q1050 100 1200 170 L1200 300 Z" fill={theme.mountain} opacity="0.7" />
      </svg>

      {environment === 'gali' && (
        <svg className="absolute bottom-0 w-full" style={{ height: '45%' }} preserveAspectRatio="none" viewBox="0 0 1200 300">
          {houses.map(h => (
            <g key={h.id}>
              <rect x={h.x * 10} y={300 - h.height} width={h.width} height={h.height} fill={theme.house} />
              <polygon points={`${h.x * 10},${300 - h.height} ${h.x * 10 + h.width / 2},${300 - h.height - 25} ${h.x * 10 + h.width},${300 - h.height}`} fill={theme.roof} />
              <rect x={h.x * 10 + 15} y={300 - h.height + 30} width="12" height="15" fill={theme.light} style={{ animation: `flickerLight 3s ease-in-out infinite`, animationDelay: `${h.lightDelay}s` }} />
              <rect x={h.x * 10 + h.width - 25} y={300 - h.height + 50} width="12" height="15" fill={theme.light} style={{ animation: `flickerLight 4s ease-in-out infinite`, animationDelay: `${h.lightDelay + 1}s` }} />
              <path d={`M${h.x * 10 + h.width/2},${300 - h.height - 25} Q${h.x * 10 + h.width/2 + 30},${300 - h.height + 20} ${h.x * 10 + h.width + 20},${300 - h.height - 20}`} stroke="#0a0810" strokeWidth="1" fill="none" opacity="0.5" />
            </g>
          ))}
        </svg>
      )}

      {environment === 'jungle' && (
        <svg className="absolute bottom-0 w-full" style={{ height: '50%' }} preserveAspectRatio="none" viewBox="0 0 1200 300">
          {trees.map(t => (
            <g key={t.id} style={{ transformOrigin: `${t.x * 10}px 300px`, animation: `swayTree 4s ease-in-out infinite`, animationDelay: `${t.delay}s` }}>
              <rect x={t.x * 10 - 4} y={300 - t.height} width="8" height={t.height} fill={theme.treeBack} />
              <ellipse cx={t.x * 10} cy={300 - t.height - 20} rx="35" ry="45" fill={theme.treeFront} />
              <ellipse cx={t.x * 10 - 20} cy={300 - t.height} rx="25" ry="35" fill={theme.treeFront} opacity="0.8" />
              <ellipse cx={t.x * 10 + 20} cy={300 - t.height} rx="25" ry="35" fill={theme.treeFront} opacity="0.8" />
            </g>
          ))}
          <path d="M0 300 Q50 280 100 300 T200 300 T300 300 T400 300 T500 300 T600 300 T700 300 T800 300 T900 300 T1000 300 T1100 300 T1200 300" fill="#030d06" />
        </svg>
      )}

      {environment === 'city' && (
        <svg className="absolute bottom-0 w-full" style={{ height: '55%' }} preserveAspectRatio="none" viewBox="0 0 1200 300">
          {buildings.map(b => (
            <g key={b.id}>
              <rect x={b.x * 10} y={300 - b.height} width={b.width} height={b.height} fill={theme.building} />
              <rect x={b.x * 10} y={300 - b.height} width={b.width} height="3" fill={theme.buildingTop} />
              {Array.from({ length: Math.floor(b.height / 25) }, (_, j) => (
                <rect key={j} x={b.x * 10 + 10} y={300 - b.height + j * 25 + 8} width={b.width - 20} height="12" fill={theme.window} opacity={Math.random() > 0.7 ? 0.8 : 0.2} style={{ animation: `blinkWindow ${3 + Math.random() * 4}s ease-in-out infinite`, animationDelay: `${Math.random() * 5}s` }} />
              ))}
            </g>
          ))}
        </svg>
      )}

      <div className="absolute bottom-0 w-full h-1/3 overflow-hidden">
        <div className="absolute w-[200%] h-full" style={{ background: `radial-gradient(ellipse at 50% 100%, ${theme.fog}, transparent 70%)`, animation: 'moveFog 20s ease-in-out infinite alternate' }} />
      </div>

      {leaves.map(leaf => (
        <div key={leaf.id} className="absolute" style={{
          left: `${leaf.x}%`,
          top: '-5%',
          width: `${leaf.size}px`,
          height: `${leaf.size}px`,
          animation: `fallLeaf ${leaf.duration}s linear infinite`,
          animationDelay: `${leaf.delay}s`,
        }}>
          <svg width={leaf.size} height={leaf.size} viewBox="0 0 20 20">
            <path d="M10 2 Q15 5 15 10 Q15 15 10 18 Q5 15 5 10 Q5 5 10 2" fill="#4ade80" opacity="0.6" />
            <path d="M10 2 L10 18" stroke="#2d5016" strokeWidth="0.5" />
          </svg>
        </div>
      ))}

      {dustMotes.map(mote => (
        <div key={mote.id} className="absolute rounded-full" style={{
          left: `${mote.x}%`,
          top: `${mote.y}%`,
          width: `${mote.size}px`,
          height: `${mote.size}px`,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          animation: `floatDust ${mote.duration}s ease-in-out infinite`,
          animationDelay: `${mote.delay}s`,
        }} />
      ))}

      {fireflies.map(fly => (
        <div key={fly.id} className="absolute rounded-full" style={{ left: `${fly.x}%`, top: `${fly.y}%`, width: '4px', height: '4px', backgroundColor: '#fbbf24', boxShadow: '0 0 8px #fbbf24, 0 0 16px #f59e0b', animation: `floatFirefly ${fly.duration}s ease-in-out infinite`, animationDelay: `${fly.delay}s` }} />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.6)_80%,rgba(0,0,0,0.9)_100%)]" />

      <style jsx global>{`
        @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        @keyframes floatClouds { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes swayTree { 0%, 100% { transform: rotate(-1.5deg); } 50% { transform: rotate(1.5deg); } }
        @keyframes floatFirefly { 0%, 100% { opacity: 0; transform: translate(0, 0); } 25% { opacity: 1; transform: translate(10px, -15px); } 50% { opacity: 0.8; transform: translate(-5px, -25px); } 75% { opacity: 1; transform: translate(15px, -10px); } }
        @keyframes flickerLight { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } 70% { opacity: 0.3; } 80% { opacity: 0.7; } }
        @keyframes moveFog { 0% { transform: translateX(-10%) scale(1); opacity: 0.3; } 100% { transform: translateX(10%) scale(1.1); opacity: 0.5; } }
        @keyframes blinkWindow { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.8; } }
        @keyframes fallLeaf {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          100% { transform: translate(50px, 100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes floatDust {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          50% { transform: translate(20px, -30px); opacity: 0.6; }
        }
        @keyframes lightRayPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🔫 ENHANCED GUN SVGs
// ═══════════════════════════════════════════════════════════════════════════════
const PistolSVG = ({ recoilAmount }: { recoilAmount: number }) => (
  <g transform={`translate(${-recoilAmount}, 0)`}>
    <defs>
      <linearGradient id="pistolMetal" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#555" /><stop offset="50%" stopColor="#2a2a2a" /><stop offset="100%" stopColor="#111" />
      </linearGradient>
    </defs>
    <path d="M -8 8 L -12 28 Q -12 32 -8 32 L 0 32 L 2 8 Z" fill="#1a1a1a" stroke="#111" strokeWidth="0.5" />
    <line x1="-9" y1="12" x2="-9" y2="26" stroke="#2a2a2a" strokeWidth="0.8" />
    <line x1="-6" y1="12" x2="-6" y2="26" stroke="#2a2a2a" strokeWidth="0.8" />
    <line x1="-3" y1="12" x2="-3" y2="26" stroke="#2a2a2a" strokeWidth="0.8" />
    <path d="M 2 8 Q 6 18 10 8" stroke="#111" strokeWidth="1.5" fill="none" />
    <path d="M 5 10 L 4 15" stroke="#333" strokeWidth="1.5" />
    <rect x="-12" y="-2" width="30" height="10" rx="1" fill="url(#pistolMetal)" stroke="#111" strokeWidth="0.5" />
    <rect x="-14" y="-6" width="36" height="8" rx="1.5" fill="#3a3a3a" stroke="#222" strokeWidth="0.5" />
    <line x1="-14" y1="-5" x2="22" y2="-5" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
    <line x1="-8" y1="-6" x2="-8" y2="-2" stroke="#222" strokeWidth="0.8" />
    <line x1="-4" y1="-6" x2="-4" y2="-2" stroke="#222" strokeWidth="0.8" />
    <line x1="0" y1="-6" x2="0" y2="-2" stroke="#222" strokeWidth="0.8" />
    <line x1="4" y1="-6" x2="4" y2="-2" stroke="#222" strokeWidth="0.8" />
    <line x1="8" y1="-6" x2="8" y2="-2" stroke="#222" strokeWidth="0.8" />
    <rect x="22" y="-4" width="22" height="4" rx="1" fill="#444" stroke="#333" strokeWidth="0.5" />
    <line x1="22" y1="-3" x2="44" y2="-3" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />
    <rect x="44" y="-5" width="3" height="6" rx="0.5" fill="#222" />
    <rect x="42" y="-7" width="2" height="3" fill="#111" />
    <rect x="-10" y="-8" width="4" height="2" fill="#111" />
    <rect x="8" y="-5" width="6" height="3" rx="0.5" fill="#111" />
    <rect x="-14" y="-8" width="3" height="4" rx="0.5" fill="#333" />
  </g>
);

const RifleSVG = ({ recoilAmount }: { recoilAmount: number }) => (
  <g transform={`translate(${-recoilAmount}, 0)`}>
    <defs>
      <linearGradient id="rifleMetal" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4a4a4a" /><stop offset="50%" stopColor="#2a2a2a" /><stop offset="100%" stopColor="#0a0a0a" />
      </linearGradient>
    </defs>
    <path d="M -50 -4 L -30 -4 L -28 4 L -50 4 Q -54 4 -54 0 Q -54 -4 -50 -4 Z" fill="#2a2a2a" stroke="#111" strokeWidth="0.5" />
    <rect x="-48" y="-2" width="16" height="1.5" fill="#222" />
    <rect x="-48" y="1" width="16" height="1.5" fill="#222" />
    <rect x="-30" y="-3" width="8" height="6" rx="1" fill="#333" stroke="#222" strokeWidth="0.5" />
    <rect x="-22" y="-6" width="28" height="12" rx="1" fill="url(#rifleMetal)" stroke="#111" strokeWidth="0.5" />
    <line x1="-22" y1="-5" x2="6" y2="-5" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
    <rect x="-10" y="-5" width="8" height="4" rx="0.5" fill="#111" />
    <rect x="-22" y="-8" width="8" height="2" rx="0.5" fill="#444" />
    <path d="M -8 6 L -10 22 Q -10 26 -6 26 L -2 26 L 0 6 Z" fill="#2a2a2a" stroke="#111" strokeWidth="0.5" />
    <path d="M 0 6 Q 4 14 8 6" stroke="#111" strokeWidth="1.2" fill="none" />
    <path d="M -4 6 L -6 24 Q -6 26 -4 26 L 2 26 Q 4 26 4 24 L 2 6 Z" fill="#111" stroke="#0a0a0a" strokeWidth="0.5" />
    <rect x="6" y="-5" width="28" height="10" rx="1" fill="#333" stroke="#222" strokeWidth="0.5" />
    <line x1="10" y1="-5" x2="10" y2="5" stroke="#222" strokeWidth="0.6" />
    <line x1="14" y1="-5" x2="14" y2="5" stroke="#222" strokeWidth="0.6" />
    <line x1="18" y1="-5" x2="18" y2="5" stroke="#222" strokeWidth="0.6" />
    <line x1="22" y1="-5" x2="22" y2="5" stroke="#222" strokeWidth="0.6" />
    <line x1="26" y1="-5" x2="26" y2="5" stroke="#222" strokeWidth="0.6" />
    <line x1="30" y1="-5" x2="30" y2="5" stroke="#222" strokeWidth="0.6" />
    <rect x="34" y="-3" width="22" height="6" rx="1" fill="#444" stroke="#333" strokeWidth="0.5" />
    <line x1="34" y1="-2" x2="56" y2="-2" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />
    <path d="M 56 -4 L 62 -2 L 62 2 L 56 4 Z" fill="#222" stroke="#111" strokeWidth="0.5" />
    <line x1="58" y1="-3" x2="58" y2="3" stroke="#111" strokeWidth="0.5" />
    <line x1="60" y1="-3" x2="60" y2="3" stroke="#111" strokeWidth="0.5" />
    <rect x="54" y="-6" width="2" height="3" fill="#111" />
  </g>
);

const ShotgunSVG = ({ recoilAmount }: { recoilAmount: number }) => (
  <g transform={`translate(${-recoilAmount}, 0)`}>
    <defs>
      <linearGradient id="shotgunWood" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#5a3820" /><stop offset="50%" stopColor="#6b4226" /><stop offset="100%" stopColor="#4a2e18" />
      </linearGradient>
    </defs>
    <path d="M -50 -3 L -28 -3 L -26 3 L -50 3 Q -54 3 -54 0 Q -54 -3 -50 -3 Z" fill="url(#shotgunWood)" stroke="#4a2e18" strokeWidth="0.5" />
    <line x1="-48" y1="-1" x2="-30" y2="-1" stroke="#5a3820" strokeWidth="0.5" />
    <line x1="-48" y1="1" x2="-30" y2="1" stroke="#5a3820" strokeWidth="0.5" />
    <rect x="-28" y="-6" width="22" height="12" rx="1.5" fill="#2a2a2a" stroke="#111" strokeWidth="0.5" />
    <rect x="-22" y="-4" width="10" height="2" fill="#1a1a1a" />
    <path d="M -6 6 Q -2 14 2 6" stroke="#111" strokeWidth="1.2" fill="none" />
    <rect x="-2" y="-5" width="18" height="10" rx="2" fill="url(#shotgunWood)" stroke="#4a2e18" strokeWidth="0.5" />
    <line x1="2" y1="-5" x2="2" y2="5" stroke="#5a3820" strokeWidth="0.6" />
    <line x1="6" y1="-5" x2="6" y2="5" stroke="#5a3820" strokeWidth="0.6" />
    <line x1="10" y1="-5" x2="10" y2="5" stroke="#5a3820" strokeWidth="0.6" />
    <line x1="14" y1="-5" x2="14" y2="5" stroke="#5a3820" strokeWidth="0.6" />
    <rect x="16" y="-5" width="38" height="4" rx="1" fill="#3a3a3a" stroke="#222" strokeWidth="0.5" />
    <rect x="16" y="1" width="38" height="4" rx="1" fill="#3a3a3a" stroke="#222" strokeWidth="0.5" />
    <line x1="16" y1="-4" x2="54" y2="-4" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
    <line x1="16" y1="2" x2="54" y2="2" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
    <rect x="54" y="-6" width="4" height="12" rx="0.5" fill="#222" stroke="#111" strokeWidth="0.5" />
    <circle cx="52" cy="-5" r="1.2" fill="#e5e5e5" />
    <rect x="-18" y="-5" width="6" height="3" rx="0.5" fill="#111" />
  </g>
);

const SniperSVG = ({ recoilAmount }: { recoilAmount: number }) => (
  <g transform={`translate(${-recoilAmount}, 0)`}>
    <defs>
      <linearGradient id="sniperMetal" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3a3a3a" /><stop offset="50%" stopColor="#1a1a1a" /><stop offset="100%" stopColor="#050505" />
      </linearGradient>
      <radialGradient id="scopeLens" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(100,180,255,0.4)" /><stop offset="100%" stopColor="#0a2a4a" />
      </radialGradient>
    </defs>
    <path d="M -55 -5 L -25 -5 L -23 5 L -55 5 Q -60 5 -60 0 Q -60 -5 -55 -5 Z" fill="#1a1a1a" stroke="#111" strokeWidth="0.5" />
    <rect x="-52" y="-2" width="22" height="4" fill="#222" />
    <rect x="-48" y="-5" width="14" height="3" rx="1" fill="#2a2a2a" />
    <rect x="-25" y="-6" width="30" height="12" rx="1" fill="url(#sniperMetal)" stroke="#111" strokeWidth="0.5" />
    <line x1="-25" y1="-5" x2="5" y2="-5" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
    <rect x="-12" y="-9" width="10" height="3" rx="1" fill="#444" />
    <circle cx="-2" cy="-8" r="2" fill="#555" />
    <rect x="-8" y="6" width="10" height="14" rx="1" fill="#111" stroke="#0a0a0a" strokeWidth="0.5" />
    <rect x="-18" y="-14" width="35" height="8" rx="4" fill="#111" stroke="#0a0a0a" strokeWidth="0.5" />
    <circle cx="-14" cy="-10" r="3.5" fill="url(#scopeLens)" stroke="#111" strokeWidth="0.5" />
    <circle cx="13" cy="-10" r="4.5" fill="url(#scopeLens)" stroke="#111" strokeWidth="0.5" />
    <circle cx="13" cy="-10" r="2" fill="rgba(200,220,255,0.3)" />
    <rect x="-12" y="-12" width="4" height="4" fill="#333" />
    <rect x="8" y="-12" width="4" height="4" fill="#333" />
    <rect x="5" y="-4" width="50" height="8" rx="1" fill="#333" stroke="#222" strokeWidth="0.5" />
    <rect x="10" y="-3" width="40" height="6" rx="0.5" fill="#3a3a3a" />
    <line x1="10" y1="-2" x2="50" y2="-2" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
    <line x1="15" y1="-2" x2="45" y2="-2" stroke="#2a2a2a" strokeWidth="0.5" />
    <line x1="15" y1="0" x2="45" y2="0" stroke="#2a2a2a" strokeWidth="0.5" />
    <line x1="15" y1="2" x2="45" y2="2" stroke="#2a2a2a" strokeWidth="0.5" />
    <path d="M 55 -5 L 64 -3 L 64 3 L 55 5 Z" fill="#222" stroke="#111" strokeWidth="0.5" />
    <line x1="57" y1="-4" x2="57" y2="4" stroke="#111" strokeWidth="0.8" />
    <line x1="60" y1="-4" x2="60" y2="4" stroke="#111" strokeWidth="0.8" />
    <line x1="62" y1="-4" x2="62" y2="4" stroke="#111" strokeWidth="0.8" />
    <line x1="18" y1="4" x2="12" y2="20" stroke="#444" strokeWidth="2" />
    <line x1="24" y1="4" x2="30" y2="20" stroke="#444" strokeWidth="2" />
    <circle cx="12" cy="20" r="1.5" fill="#333" />
    <circle cx="30" cy="20" r="1.5" fill="#333" />
  </g>
);

const GunSVG = ({ weapon, angle, recoil }: { weapon: WeaponType; angle: number; recoil: number }) => {
  const normalizedAngle = ((angle % 360) + 360) % 360;
  const isPointingLeft = normalizedAngle > 90 && normalizedAngle < 270;
  const verticalScale = isPointingLeft ? -1 : 1;
  
  return (
    <g transform={`rotate(${angle}) scale(1, ${verticalScale})`}>
      {weapon === 'pistol' && <PistolSVG recoilAmount={recoil} />}
      {weapon === 'rifle' && <RifleSVG recoilAmount={recoil} />}
      {weapon === 'shotgun' && <ShotgunSVG recoilAmount={recoil} />}
      {weapon === 'sniper' && <SniperSVG recoilAmount={recoil} />}
    </g>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 👹 MICRO-LEVEL ENHANCED ENEMY SVGs
// ═══════════════════════════════════════════════════════════════════════════════
const ZombieSVG = ({ isHit, isBoss, walkFrame, isDying, deathFrame, hitTime, woundCount }: { isHit: boolean; isBoss: boolean; walkFrame: number; isDying: boolean; deathFrame: number; hitTime: number; woundCount: number }) => {
  const scale = isBoss ? 1.8 : 1;
  const legSwing = Math.sin(walkFrame * 8) * 15;
  const armSwing = Math.sin(walkFrame * 8) * 20;
  const bob = Math.abs(Math.sin(walkFrame * 8)) * 2;
  const breathe = Math.sin(walkFrame * 4) * 1;
  const hitFlash = isHit ? Math.min(1, (Date.now() - hitTime) / 100) : 0;
  const deathRotation = isDying ? Math.min(90, deathFrame * 5) : 0;
  const deathScale = isDying ? Math.max(0.5, 1 - deathFrame * 0.02) : 1;
  
  return (
    <g transform={`scale(${scale * deathScale}) translate(0,${-bob}) rotate(${deathRotation}, 0, 30)`} style={{ filter: isHit ? `brightness(${3 - hitFlash * 2}) saturate(${3 - hitFlash * 2}) hue-rotate(${hitFlash * 30}deg)` : 'none', transition: 'filter 0.08s', opacity: isDying ? Math.max(0, 1 - deathFrame * 0.03) : 1 }}>
      <ellipse cx="0" cy="45" rx="20" ry="5" fill="rgba(0,0,0,0.5)" />
      <g transform={`rotate(${legSwing})`} style={{ transformOrigin: '16px 20px' }}>
        <rect x="-8" y={20+breathe} width="8" height="12" rx="2" fill="#2d4a3e" />
        <circle cx="-4" cy="32" r="3" fill="#1a3028" />
        <rect x="-8" y="32" width="8" height="13" rx="2" fill="#2d4a3e" />
        <rect x="-10" y="43" width="12" height="4" rx="1" fill="#1a2018" />
      </g>
      <g transform={`rotate(${-armSwing})`} style={{ transformOrigin: '14px -5px' }}>
        <rect x="-18" y={-5+breathe} width="8" height="11" rx="2" fill="#4a6b5e" />
        <circle cx="-14" cy="6" r="3" fill="#3a5b4e" />
        <rect x="-18" y="6" width="8" height="11" rx="2" fill="#4a6b5e" />
        <circle cx="-14" cy="17" r="2.5" fill="#3a5b4e" />
      </g>
      <rect x="-12" y={-10+breathe} width="24" height="32" rx="4" fill="#3d5a4e" />
      <path d="M-12 -5 L12 -5 L12 5 L-12 5Z" fill="#5a3d3d" />
      <path d="M-10 -3 L-8 2 M-6 -4 L-5 1 M-2 -3 L-1 2" stroke="#4a2d2d" strokeWidth="0.5" />
      <path d="M10 -3 L8 2 M6 -4 L5 1 M2 -3 L1 2" stroke="#4a2d2d" strokeWidth="0.5" />
      {woundCount > 0 && <circle cx="-5" cy="0" r="3" fill="#8b0000" opacity="0.8" />}
      {woundCount > 1 && <circle cx="6" cy="8" r="2" fill="#8b0000" opacity="0.7" />}
      {woundCount > 2 && <path d="M-3 10 L0 14 L3 10" stroke="#ff0000" strokeWidth="1" fill="none" opacity="0.6" />}
      <g transform={`rotate(${-legSwing})`} style={{ transformOrigin: '-16px 20px' }}>
        <rect x="0" y={20+breathe} width="8" height="12" rx="2" fill="#2d4a3e" />
        <circle cx="4" cy="32" r="3" fill="#1a3028" />
        <rect x="0" y="32" width="8" height="13" rx="2" fill="#2d4a3e" />
        <rect x="-2" y="43" width="12" height="4" rx="1" fill="#1a2018" />
      </g>
      <g transform={`rotate(${armSwing})`} style={{ transformOrigin: '-14px -5px' }}>
        <rect x="10" y={-5+breathe} width="8" height="11" rx="2" fill="#4a6b5e" />
        <circle cx="14" cy="6" r="3" fill="#3a5b4e" />
        <rect x="10" y="6" width="8" height="11" rx="2" fill="#4a6b5e" />
        <circle cx="14" cy="17" r="2.5" fill="#3a5b4e" />
      </g>
      <circle cx="0" cy={-20+breathe} r="12" fill="#4a6b5e" />
      <path d="M-10 -25 Q-5 -30 0 -28 Q5 -30 10 -25 Q8 -28 0 -27 Q-8 -28 -10 -25Z" fill="#2d3d2e" />
      <circle cx="-4" cy="-22" r="2.5" fill="#ff0000" />
      <circle cx="4" cy="-22" r="2.5" fill="#ff0000" />
      <circle cx="-4" cy="-22" r="1.5" fill="#ff6666" />
      <circle cx="4" cy="-22" r="1.5" fill="#ff6666" />
      <circle cx="-4" cy="-22" r="0.8" fill="#ffffff" />
      <circle cx="4" cy="-22" r="0.8" fill="#ffffff" />
      <path d="M-5 -16 Q0 -14 5 -16" stroke="#2d3d2e" strokeWidth="1.5" fill="#1a1a1a" />
      <path d="M-4 -16 L-3 -14 M-2 -16 L-1 -14 M0 -16 L0 -14 M2 -16 L3 -14 M4 -16 L3 -14" stroke="white" strokeWidth="0.8" />
      <circle cx="-6" cy="-10" r="2" fill="#8b0000" />
      <circle cx="6" cy="-5" r="1.5" fill="#8b0000" />
      <circle cx="-6" cy="-10" r="1" fill="#ff0000" opacity="0.6" />
      {isBoss && (<g><path d="M-8 -30 L-6 -35 L-3 -32 L0 -36 L3 -32 L6 -35 L8 -30 Z" fill="#ffd700" /><circle cx="-6" cy="-33" r="1" fill="#ff0000" /><circle cx="0" cy="-34" r="1" fill="#00ff00" /><circle cx="6" cy="-33" r="1" fill="#0000ff" /><circle cx="-6" cy="-33" r="0.5" fill="#ffffff" opacity="0.5" /><circle cx="0" cy="-34" r="0.5" fill="#ffffff" opacity="0.5" /><circle cx="6" cy="-33" r="0.5" fill="#ffffff" opacity="0.5" /></g>)}
    </g>
  );
};

const ThugSVG = ({ isHit, isBoss, walkFrame, isDying, deathFrame, hitTime, woundCount }: { isHit: boolean; isBoss: boolean; walkFrame: number; isDying: boolean; deathFrame: number; hitTime: number; woundCount: number }) => {
  const scale = isBoss ? 2.0 : 1.3;
  const legSwing = Math.sin(walkFrame * 6) * 12;
  const armSwing = Math.sin(walkFrame * 6) * 15;
  const breathe = Math.sin(walkFrame * 4) * 1;
  const hitFlash = isHit ? Math.min(1, (Date.now() - hitTime) / 100) : 0;
  const deathRotation = isDying ? Math.min(90, deathFrame * 5) : 0;
  const deathScale = isDying ? Math.max(0.5, 1 - deathFrame * 0.02) : 1;
  
  return (
    <g transform={`scale(${scale * deathScale}) rotate(${deathRotation}, 0, 30)`} style={{ filter: isHit ? `brightness(${3 - hitFlash * 2}) saturate(${3 - hitFlash * 2})` : 'none', transition: 'filter 0.08s', opacity: isDying ? Math.max(0, 1 - deathFrame * 0.03) : 1 }}>
      <ellipse cx="0" cy="50" rx="25" ry="6" fill="rgba(0,0,0,0.6)" />
      <g transform={`rotate(${legSwing})`} style={{ transformOrigin: '10px 20px' }}>
        <rect x="-10" y={20+breathe} width="10" height="15" rx="3" fill="#1a1a1a" />
        <circle cx="-5" cy="35" r="4" fill="#0a0a0a" />
        <rect x="-10" y="35" width="10" height="15" rx="3" fill="#1a1a1a" />
        <rect x="-12" y="48" width="14" height="5" rx="2" fill="#0a0a0a" />
      </g>
      <g transform={`rotate(${-legSwing})`} style={{ transformOrigin: '-10px 20px' }}>
        <rect x="0" y={20+breathe} width="10" height="15" rx="3" fill="#1a1a1a" />
        <circle cx="5" cy="35" r="4" fill="#0a0a0a" />
        <rect x="0" y="35" width="10" height="15" rx="3" fill="#1a1a1a" />
        <rect x="-2" y="48" width="14" height="5" rx="2" fill="#0a0a0a" />
      </g>
      <rect x="-15" y={-10+breathe} width="30" height="35" rx="5" fill="#333" />
      <rect x="-13" y="-8" width="26" height="10" rx="2" fill="#222" />
      <path d="M-15 -5 L-13 5 M15 -5 L13 5" stroke="#1a1a1a" strokeWidth="1" />
      {woundCount > 0 && <circle cx="-8" cy="5" r="3" fill="#8b0000" opacity="0.7" />}
      {woundCount > 1 && <circle cx="5" cy="-2" r="2.5" fill="#8b0000" opacity="0.6" />}
      <g transform={`rotate(${-armSwing})`} style={{ transformOrigin: '17px -5px' }}>
        <rect x="-22" y={-5+breathe} width="10" height="12" rx="3" fill="#d4a373" />
        <circle cx="-17" cy="7" r="4" fill="#c49363" />
        <rect x="-22" y="7" width="10" height="13" rx="3" fill="#d4a373" />
        <circle cx="-17" cy="20" r="3.5" fill="#c49363" />
      </g>
      <g transform={`rotate(${armSwing})`} style={{ transformOrigin: '-17px -5px' }}>
        <rect x="12" y={-5+breathe} width="10" height="12" rx="3" fill="#d4a373" />
        <circle cx="17" cy="7" r="4" fill="#c49363" />
        <rect x="12" y="7" width="10" height="13" rx="3" fill="#d4a373" />
        <circle cx="17" cy="20" r="3.5" fill="#c49363" />
      </g>
      <circle cx="0" cy={-25+breathe} r="14" fill="#d4a373" />
      <path d="M-14 -30 Q0 -35 14 -30 L12 -25 Q0 -28 -12 -25Z" fill="#111" />
      <path d="M-7 -27 L-3 -26" stroke="#000" strokeWidth="1.5" />
      <path d="M7 -27 L3 -26" stroke="#000" strokeWidth="1.5" />
      <motion.circle cx="-5" cy="-26" r="2" fill="#000" animate={{ scaleY: [1,0.2,1] }} transition={{ repeat: Infinity, duration: 3 }} />
      <motion.circle cx="5" cy="-26" r="2" fill="#000" animate={{ scaleY: [1,0.2,1] }} transition={{ repeat: Infinity, duration: 3 }} />
      <circle cx="-5" cy="-26" r="0.8" fill="#ffffff" opacity="0.6" />
      <circle cx="5" cy="-26" r="0.8" fill="#ffffff" opacity="0.6" />
      <path d="M-6 -18 Q0 -15 6 -18" stroke="#000" strokeWidth="1.5" fill="none" />
      <path d="M-5 -18 L-4 -16 M-3 -18 L-2 -16 M-1 -18 L0 -16 M1 -18 L2 -16 M3 -18 L4 -16" stroke="#fff" strokeWidth="0.8" />
      <path d="M-8 -22 L-6 -20" stroke="#8b0000" strokeWidth="1" />
      {isBoss && <motion.circle cx="0" cy="-38" r="3" fill="#f00" animate={{ opacity: [0.5,1,0.5] }} transition={{ repeat: Infinity, duration: 1 }} />}
    </g>
  );
};

const TigerSVG = ({ isHit, isBoss, walkFrame, isDying, deathFrame, hitTime, woundCount }: { isHit: boolean; isBoss: boolean; walkFrame: number; isDying: boolean; deathFrame: number; hitTime: number; woundCount: number }) => {
  const scale = isBoss ? 2.2 : 1.4;
  const legSwing = Math.sin(walkFrame * 10) * 10;
  const bob = Math.abs(Math.sin(walkFrame * 10)) * 3;
  const breathe = Math.sin(walkFrame * 4) * 1;
  const hitFlash = isHit ? Math.min(1, (Date.now() - hitTime) / 100) : 0;
  const deathRotation = isDying ? Math.min(90, deathFrame * 4) : 0;
  const deathScale = isDying ? Math.max(0.5, 1 - deathFrame * 0.02) : 1;
  
  return (
    <g transform={`scale(${scale * deathScale}) translate(0,${-bob}) rotate(${deathRotation}, 0, 30)`} style={{ filter: isHit ? `brightness(${3 - hitFlash * 2}) saturate(${3 - hitFlash * 2})` : 'none', transition: 'filter 0.08s', opacity: isDying ? Math.max(0, 1 - deathFrame * 0.03) : 1 }}>
      <ellipse cx="0" cy="40" rx="30" ry="8" fill="rgba(0,0,0,0.5)" />
      <ellipse cx="0" cy={10+breathe} rx="25" ry="18" fill="#f97316" />
      <path d="M-15 0 L-10 10 M-5 0 L0 10 M5 0 L10 10 M15 0 L20 10" stroke="#000" strokeWidth="3" />
      <path d="M-20 5 L-15 15 M-10 5 L-5 15 M0 5 L5 15 M10 5 L15 15" stroke="#000" strokeWidth="2" />
      {woundCount > 0 && <circle cx="-8" cy="5" r="4" fill="#8b0000" opacity="0.6" />}
      <g transform={`rotate(${legSwing})`} style={{ transformOrigin: '11px 20px' }}>
        <rect x="-15" y={20+breathe} width="8" height="10" rx="2" fill="#f97316" /><circle cx="-11" cy="30" r="3" fill="#e96306" /><rect x="-15" y="30" width="8" height="10" rx="2" fill="#f97316" /><rect x="-17" y="38" width="12" height="4" rx="1" fill="#e96306" />
      </g>
      <g transform={`rotate(${-legSwing})`} style={{ transformOrigin: '1px 20px' }}>
        <rect x="-5" y={20+breathe} width="8" height="10" rx="2" fill="#f97316" /><circle cx="-1" cy="30" r="3" fill="#e96306" /><rect x="-5" y="30" width="8" height="10" rx="2" fill="#f97316" /><rect x="-7" y="38" width="12" height="4" rx="1" fill="#e96306" />
      </g>
      <g transform={`rotate(${legSwing})`} style={{ transformOrigin: '-11px 20px' }}>
        <rect x="5" y={20+breathe} width="8" height="10" rx="2" fill="#f97316" /><circle cx="9" cy="30" r="3" fill="#e96306" /><rect x="5" y="30" width="8" height="10" rx="2" fill="#f97316" /><rect x="3" y="38" width="12" height="4" rx="1" fill="#e96306" />
      </g>
      <g transform={`rotate(${-legSwing})`} style={{ transformOrigin: '-21px 20px' }}>
        <rect x="15" y={20+breathe} width="8" height="10" rx="2" fill="#f97316" /><circle cx="19" cy="30" r="3" fill="#e96306" /><rect x="15" y="30" width="8" height="10" rx="2" fill="#f97316" /><rect x="13" y="38" width="12" height="4" rx="1" fill="#e96306" />
      </g>
      <circle cx="0" cy={-15+breathe} r="16" fill="#f97316" />
      <path d="M-10 -25 L-12 -30 L-6 -28 M10 -25 L12 -30 L6 -28" fill="#f97316" stroke="#000" strokeWidth="1" />
      <motion.circle cx="-6" cy="-18" r="3" fill="#fff" animate={{ opacity: [0.7,1,0.7] }} transition={{ repeat: Infinity, duration: 2 }} />
      <motion.circle cx="6" cy="-18" r="3" fill="#fff" animate={{ opacity: [0.7,1,0.7] }} transition={{ repeat: Infinity, duration: 2 }} />
      <circle cx="-6" cy="-18" r="1.5" fill="#000" /><circle cx="6" cy="-18" r="1.5" fill="#000" />
      <circle cx="-6" cy="-18" r="0.6" fill="#ffffff" opacity="0.6" /><circle cx="6" cy="-18" r="0.6" fill="#ffffff" opacity="0.6" />
      <ellipse cx="0" cy="-14" rx="2" ry="1.5" fill="#000" />
      <path d="M-4 -10 Q0 -8 4 -10" stroke="#000" strokeWidth="1" fill="none" />
      <path d="M-6 -8 L-8 -5 M6 -8 L8 -5" stroke="#fff" strokeWidth="1" />
      <path d="M-8 -12 L-12 -11 M-8 -10 L-12 -10 M-8 -8 L-12 -9" stroke="#000" strokeWidth="0.5" />
      <path d="M8 -12 L12 -11 M8 -10 L12 -10 M8 -8 L12 -9" stroke="#000" strokeWidth="0.5" />
      <motion.path d={`M25 10 Q35 ${5+Math.sin(walkFrame*5)*5} 40 0`} stroke="#f97316" strokeWidth="4" fill="none" />
      <motion.path d={`M25 10 Q35 ${5+Math.sin(walkFrame*5)*5} 40 0`} stroke="#000" strokeWidth="1" fill="none" />
      {isBoss && (<g><path d="M-8 -28 L-6 -33 L-3 -30 L0 -34 L3 -30 L6 -33 L8 -28 Z" fill="#ffd700" /><circle cx="-6" cy="-31" r="1" fill="#ff0000" /><circle cx="0" cy="-32" r="1" fill="#00ff00" /><circle cx="6" cy="-31" r="1" fill="#0000ff" /></g>)}
    </g>
  );
};

const GhostSVG = ({ isHit, isBoss, walkFrame, isDying, deathFrame, hitTime, woundCount }: { isHit: boolean; isBoss: boolean; walkFrame: number; isDying: boolean; deathFrame: number; hitTime: number; woundCount: number }) => {
  const scale = isBoss ? 2.5 : 1.5;
  const floatY = Math.sin(walkFrame * 4) * 15;
  const floatX = Math.cos(walkFrame * 3) * 5;
  const hitFlash = isHit ? Math.min(1, (Date.now() - hitTime) / 100) : 0;
  const deathScale = isDying ? Math.max(0, 1 - deathFrame * 0.05) : 1;
  const deathOpacity = isDying ? Math.max(0, 0.8 - deathFrame * 0.04) : 0.8;
  
  return (
    <g transform={`scale(${scale * deathScale}) translate(${floatX},${floatY})`} style={{ filter: isHit ? `brightness(${3 - hitFlash * 2})` : `drop-shadow(0 0 10px rgba(255,255,255,0.3))`, transition: 'filter 0.08s', opacity: deathOpacity }}>
      <motion.path d="M-20 -20 Q-20 -40 0 -40 Q20 -40 20 -20 L20 10 Q10 0 0 10 Q-10 0 -20 10 Z" fill="rgba(255,255,255,0.8)" animate={{ d: ["M-20 -20 Q-20 -40 0 -40 Q20 -40 20 -20 L20 10 Q10 0 0 10 Q-10 0 -20 10 Z","M-20 -15 Q-20 -35 0 -35 Q20 -35 20 -15 L20 15 Q10 5 0 15 Q-10 5 -20 15 Z","M-20 -20 Q-20 -40 0 -40 Q20 -40 20 -20 L20 10 Q10 0 0 10 Q-10 0 -20 10 Z"] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} />
      <motion.circle cx="-8" cy="-25" r="4" fill="#000" animate={{ scaleY: [1,0.2,1] }} transition={{ repeat: Infinity, duration: 4 }} />
      <motion.circle cx="8" cy="-25" r="4" fill="#000" animate={{ scaleY: [1,0.2,1] }} transition={{ repeat: Infinity, duration: 4 }} />
      <motion.circle cx="-8" cy="-25" r="1.5" fill="#f00" animate={{ opacity: [0.5,1,0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} />
      <motion.circle cx="8" cy="-25" r="1.5" fill="#f00" animate={{ opacity: [0.5,1,0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} />
      <circle cx="-8" cy="-25" r="0.5" fill="#ffffff" opacity="0.6" /><circle cx="8" cy="-25" r="0.5" fill="#ffffff" opacity="0.6" />
      <ellipse cx="0" cy="-15" rx="6" ry="8" fill="#000" /><ellipse cx="0" cy="-15" rx="3" ry="4" fill="#1a1a1a" />
      {isBoss && <motion.path d="M-15 -35 L0 -50 L15 -35" fill="none" stroke="#f00" strokeWidth="2" animate={{ opacity: [0.5,1,0.5] }} transition={{ repeat: Infinity, duration: 1 }} />}
    </g>
  );
};

const AlienSVG = ({ isHit, isBoss, walkFrame, isDying, deathFrame, hitTime, woundCount }: { isHit: boolean; isBoss: boolean; walkFrame: number; isDying: boolean; deathFrame: number; hitTime: number; woundCount: number }) => {
  const scale = isBoss ? 2.0 : 1.3;
  const legSwing = Math.sin(walkFrame * 8) * 15;
  const breathe = Math.sin(walkFrame * 4) * 1;
  const hitFlash = isHit ? Math.min(1, (Date.now() - hitTime) / 100) : 0;
  const deathRotation = isDying ? Math.min(90, deathFrame * 5) : 0;
  const deathScale = isDying ? Math.max(0.5, 1 - deathFrame * 0.02) : 1;
  
  return (
    <g transform={`scale(${scale * deathScale}) rotate(${deathRotation}, 0, 30)`} style={{ filter: isHit ? `brightness(${3 - hitFlash * 2}) saturate(${3 - hitFlash * 2}) hue-rotate(${hitFlash * 60}deg)` : 'none', transition: 'filter 0.08s', opacity: isDying ? Math.max(0, 1 - deathFrame * 0.03) : 1 }}>
      <ellipse cx="0" cy="45" rx="20" ry="5" fill="rgba(0,0,0,0.5)" />
      <g transform={`rotate(${legSwing})`} style={{ transformOrigin: '16px 20px' }}>
        <rect x="-8" y={20+breathe} width="8" height="12" rx="2" fill="#4a6b5e" /><circle cx="-4" cy="32" r="3" fill="#3a5b4e" /><rect x="-8" y="32" width="8" height="13" rx="2" fill="#4a6b5e" /><rect x="-10" y="43" width="12" height="4" rx="1" fill="#3a5b4e" />
      </g>
      <g transform={`rotate(${-legSwing})`} style={{ transformOrigin: '-16px 20px' }}>
        <rect x="0" y={20+breathe} width="8" height="12" rx="2" fill="#4a6b5e" /><circle cx="4" cy="32" r="3" fill="#3a5b4e" /><rect x="0" y="32" width="8" height="13" rx="2" fill="#4a6b5e" /><rect x="-2" y="43" width="12" height="4" rx="1" fill="#3a5b4e" />
      </g>
      <ellipse cx="0" cy={5+breathe} rx="18" ry="22" fill="#8b5cf6" /><ellipse cx="0" cy={5+breathe} rx="15" ry="18" fill="#7c4ce6" />
      {woundCount > 0 && <circle cx="-5" cy="0" r="4" fill="#00ff00" opacity="0.5" />}
      <circle cx="0" cy={-20+breathe} r="16" fill="#a78bfa" /><circle cx="0" cy={-20+breathe} r="14" fill="#977bea" />
      <motion.ellipse cx="-6" cy="-22" rx="5" ry="7" fill="#000" animate={{ scaleY: [1,0.3,1] }} transition={{ repeat: Infinity, duration: 3 }} />
      <motion.ellipse cx="6" cy="-22" rx="5" ry="7" fill="#000" animate={{ scaleY: [1,0.3,1] }} transition={{ repeat: Infinity, duration: 3 }} />
      <motion.circle cx="-6" cy="-22" r="2" fill="#0f0" animate={{ opacity: [0.5,1,0.5] }} transition={{ repeat: Infinity, duration: 2 }} />
      <motion.circle cx="6" cy="-22" r="2" fill="#0f0" animate={{ opacity: [0.5,1,0.5] }} transition={{ repeat: Infinity, duration: 2 }} />
      <circle cx="-6" cy="-22" r="0.8" fill="#ffffff" opacity="0.6" /><circle cx="6" cy="-22" r="0.8" fill="#ffffff" opacity="0.6" />
      <path d="M-10 -30 Q0 -35 10 -30" stroke="#8b5cf6" strokeWidth="4" fill="none" />
      <motion.circle cx="0" cy="-32" r="3" fill="#0f0" animate={{ opacity: [0.5,1,0.5] }} transition={{ repeat: Infinity, duration: 1 }} />
      <circle cx="0" cy="-32" r="1" fill="#ffffff" opacity="0.6" />
      {isBoss && (<g><path d="M-8 -35 L-6 -40 L-3 -37 L0 -41 L3 -37 L6 -40 L8 -35 Z" fill="#ffd700" /><circle cx="-6" cy="-38" r="1" fill="#ff0000" /><circle cx="0" cy="-39" r="1" fill="#00ff00" /><circle cx="6" cy="-38" r="1" fill="#0000ff" /></g>)}
    </g>
  );
};

const SnakeSVG = ({ isHit, isBoss, walkFrame, isDying, deathFrame, hitTime, woundCount }: { isHit: boolean; isBoss: boolean; walkFrame: number; isDying: boolean; deathFrame: number; hitTime: number; woundCount: number }) => {
  const scale = isBoss ? 2.5 : 1.5;
  const wave1 = Math.sin(walkFrame * 6) * 8;
  const wave2 = Math.sin(walkFrame * 6 + 1) * 8;
  const wave3 = Math.sin(walkFrame * 6 + 2) * 8;
  const hitFlash = isHit ? Math.min(1, (Date.now() - hitTime) / 100) : 0;
  const deathScale = isDying ? Math.max(0.3, 1 - deathFrame * 0.03) : 1;
  
  return (
    <g transform={`scale(${scale * deathScale})`} style={{ filter: isHit ? `brightness(${3 - hitFlash * 2}) saturate(${3 - hitFlash * 2})` : 'none', transition: 'filter 0.08s', opacity: isDying ? Math.max(0, 1 - deathFrame * 0.03) : 1 }}>
      <path d={`M-30 0 Q-20 ${wave1} -10 0 Q0 ${wave2} 10 0 Q20 ${wave3} 30 0`} stroke="#2d5016" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d={`M-30 0 Q-20 ${wave1} -10 0 Q0 ${wave2} 10 0 Q20 ${wave3} 30 0`} stroke="#4a7c2c" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d={`M-25 ${wave1/2} L-20 ${wave1} M-15 ${wave2/2} L-10 0 M-5 ${wave2/2} L0 ${wave2} M5 ${wave3/2} L10 0 M15 ${wave3/2} L20 ${wave3}`} stroke="#1a3008" strokeWidth="1" fill="none" />
      <ellipse cx="30" cy="0" rx="8" ry="6" fill="#2d5016" /><ellipse cx="30" cy="0" rx="6" ry="4" fill="#3d6026" />
      <ellipse cx="32" cy="-2" rx="3" ry="2" fill="#ff0" /><ellipse cx="32" cy="-2" rx="1" ry="2" fill="#000" />
      <circle cx="33" cy="-2" r="0.5" fill="#ffffff" opacity="0.6" />
      <motion.path d="M38 0 L42 -1 M38 0 L42 1" stroke="#f00" strokeWidth="1" fill="none" animate={{ d: ["M38 0 L42 -1 M38 0 L42 1","M38 0 L44 0","M38 0 L42 -1 M38 0 L42 1"] }} transition={{ repeat: Infinity, duration: 0.5 }} />
      <circle cx="-20" cy={wave1/2} r="2" fill="#1a3008" /><circle cx="-5" cy={wave2/2} r="2" fill="#1a3008" /><circle cx="15" cy={wave3/2} r="2" fill="#1a3008" />
      {isBoss && <><circle cx="30" cy="-8" r="2" fill="#ffd700" /><circle cx="25" cy="-8" r="2" fill="#ffd700" /></>}
    </g>
  );
};

const BirdSVG = ({ wingPhase, size }: { wingPhase: number; size: number }) => {
  const wingY = Math.sin(wingPhase) * 4;
  return (
    <g transform={`scale(${size})`}>
      <path d={`M0 0 Q-6 ${wingY} -12 0`} stroke="#222" strokeWidth="1.5" fill="none" />
      <path d={`M0 0 Q6 ${wingY} 12 0`} stroke="#222" strokeWidth="1.5" fill="none" />
      <circle cx="0" cy="0" r="1.5" fill="#222" />
    </g>
  );
};

const ENVIRONMENTS: Record<EnvironmentType, { name: string; hindiName: string; icon: any; overlay: string; enemyTypes: EnemyType[] }> = {
  gali: { name: "Gali Muhalla", hindiName: "गली मुहल्ला", icon: MapPin, overlay: "bg-slate-950/40", enemyTypes: ['thug', 'zombie'] },
  jungle: { name: "Jadui Jungle", hindiName: "जादुई जंगल", icon: Trees, overlay: "bg-emerald-950/40", enemyTypes: ['tiger', 'ghost', 'zombie', 'snake'] },
  city: { name: "City Center", hindiName: "शहर का केंद्र", icon: Building2, overlay: "bg-slate-950/40", enemyTypes: ['alien', 'zombie'] }
};

export default function AlamnagarStrike() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const [gameState, setGameState] = useState<'auth' | 'menu' | 'select_env' | 'playing' | 'paused' | 'gameover'>('auth');
  const [selectedEnvironment, setSelectedEnvironment] = useState<EnvironmentType>('gali');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [wave, setWave] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ambientEnabled, setAmbientEnabled] = useState(true);
  const [bgMusicEnabled, setBgMusicEnabled] = useState(true);
  const [screenShake, setScreenShake] = useState(0);
  const [warningText, setWarningText] = useState<string | null>(null);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('rifle');
  const [isMicOn, setIsMicOn] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [gunRecoil, setGunRecoil] = useState(0);
  const [ammo, setAmmo] = useState(WEAPONS.rifle.magazineSize);
  const [isReloading, setIsReloading] = useState(false);
  const [isDashing, setIsDashing] = useState(false);
  const [dashCooldown, setDashCooldown] = useState(0);
  const [combo, setCombo] = useState(0);
  const [muzzleFlash, setMuzzleFlash] = useState(0);
  const [birds, setBirds] = useState<BirdObject[]>([]);
  const [bulletImpacts, setBulletImpacts] = useState<ImpactEffect[]>([]);
  
  // 🎛️ COLLAPSIBLE TOP-LEFT UI STATE
  const [isUIExpanded, setIsUIExpanded] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [navAutoHideTimer, setNavAutoHideTimer] = useState<NodeJS.Timeout | null>(null);

  const gunPositionRef = useRef({ x: 50, y: 80 });
  const gunAngleRef = useRef(0);
  const mousePositionRef = useRef({ x: 50, y: 50 });
  const bulletsRef = useRef<BulletObject[]>([]);
  const enemiesRef = useRef<EnemyObject[]>([]);
  const particlesRef = useRef<ParticleObject[]>([]);
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
  const birdSpawnRef = useRef<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem("alamnagarStrikeHighScore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && bgMusicEnabled) {
      startBgAmbient(selectedEnvironment, 0.12);
    } else {
      stopBgAmbient();
    }
    return () => { stopBgAmbient(); };
  }, [gameState, bgMusicEnabled, selectedEnvironment]);

  useEffect(() => {
    if (gameState === 'playing' && ambientEnabled && soundEnabled) {
      getAudioContext();
      playSound('ambient_night', 0.03);
      ambientIntervalRef.current = window.setInterval(() => {
        if (ambientEnabled && soundEnabled) {
          playSound('ambient_night', 0.03);
          if (Math.random() > 0.6) playSound('ambient_wind', 0.3);
          if (Math.random() > 0.85) playSound('ghost_wail', 0.15);
          if (Math.random() > 0.7) playSound('bird_tweet', 0.1);
          if (Math.random() > 0.8) playSound('ambient_crickets', 0.08);
        }
      }, 6000);
    }
    return () => {
      if (ambientIntervalRef.current) {
        clearInterval(ambientIntervalRef.current);
        ambientIntervalRef.current = null;
      }
    };
  }, [gameState, ambientEnabled, soundEnabled]);

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    try {
      if (authPassword.length < 6) { setAuthError('पासवर्ड कम से कम 6 अक्षर'); return; }
      const credential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      await updateProfile(credential.user, { displayName: authName || authEmail.split('@')[0] });
      await setDoc(doc(db, 'users', credential.user.uid), {
        uid: credential.user.uid,
        displayName: authName || authEmail.split('@')[0],
        email: authEmail,
        createdAt: serverTimestamp(),
        highScore: 0,
        gamesPlayed: 0
      });
      setAuthSuccess('✅ अकाउंट बन गया!');
      setTimeout(() => { setAuthEmail(''); setAuthPassword(''); setAuthName(''); }, 1500);
    } catch (error: any) {
      setAuthError(error.code === 'auth/email-already-in-use' ? 'ईमेल पहले से रजिस्टर्ड' : 'साइनअप विफल');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    try {
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
      setAuthSuccess('✅ लॉगिन सफल!');
      setTimeout(() => { setAuthEmail(''); setAuthPassword(''); }, 1500);
    } catch {
      setAuthError('ईमेल या पासवर्ड गलत');
    }
  };

  const handleLogout = async () => {
    if (playerPresenceRef.current) {
      try { await deleteDoc(doc(db, 'gamePresence', playerPresenceRef.current)); } catch {}
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
    } catch {
      alert('Mic access denied');
    }
  };

  const startGame = (environment?: EnvironmentType) => {
    if (environment) setSelectedEnvironment(environment);
    setGameState('playing');
    setScore(0);
    setHealth(100);
    setWave(1);
    setWarningText(null);
    setCurrentWeapon('rifle');
    setGunRecoil(0);
    setAmmo(WEAPONS.rifle.magazineSize);
    setIsReloading(false);
    setIsDashing(false);
    setDashCooldown(0);
    setCombo(0);
    setBirds([]);
    setBulletImpacts([]);
    setIsNavExpanded(true);
    setIsUIExpanded(false);
    scoreRef.current = 0;
    healthRef.current = 100;
    gunPositionRef.current = { x: 50, y: 80 };
    gunAngleRef.current = 0;
    mousePositionRef.current = { x: 50, y: 50 };
    bulletsRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    lastShotRef.current = 0;
    lastKillTimeRef.current = 0;
    birdSpawnRef.current = 0;
    
    getAudioContext();
    if (soundEnabled) playSound('combo');
    
    const timer = setTimeout(() => { setIsNavExpanded(false); }, 3000);
    setNavAutoHideTimer(timer);
  };

  const spawnParticles = useCallback((x: number, y: number, color: string, count: number, type: ParticleType = 'spark', options: { speed?: number; size?: number; gravity?: number } = {}) => {
    const speed = options.speed ?? (type === 'blood' ? 6 : 3);
    const size = options.size ?? (type === 'blood' ? 8 : 4);
    const gravity = options.gravity ?? (type === 'blood' ? 0.15 : 0.05);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const velocity = (Math.random() * 0.5 + 0.5) * speed;
      particlesRef.current.push({
        id: Date.now() + Math.random() + i, x, y,
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity - (type === 'blood' ? 2 : 1),
        life: 1, maxLife: 1, color, size: Math.random() * size + 2, type,
        rotation: Math.random() * 360, rotationSpeed: (Math.random() - 0.5) * 10, gravity,
      });
    }
  }, []);

  // 💥 ENEMY FRAGMENTATION BLAST - Real Body Parts
  const spawnFragmentationBlast = useCallback((x: number, y: number, weaponType: WeaponType, enemyType: EnemyType) => {
    const blastPower = WEAPONS[weaponType].blastPower;
    const fragmentCounts = { small: 6, medium: 10, large: 16, massive: 24 };
    const blastRadius = { small: 3, medium: 5, large: 8, massive: 12 };
    const count = fragmentCounts[blastPower];
    const radius = blastRadius[blastPower];

    const bodyColors: Record<EnemyType, string[]> = {
      zombie: ['#3d5a4e', '#4a6b5e', '#2d4a3e', '#5a3d3d'],
      thug: ['#333', '#d4a373', '#1a1a1a', '#222'],
      tiger: ['#f97316', '#e96306', '#000', '#fff'],
      ghost: ['rgba(255,255,255,0.8)', 'rgba(200,200,255,0.6)', '#000', '#f00'],
      alien: ['#8b5cf6', '#7c4ce6', '#a78bfa', '#0f0'],
      snake: ['#2d5016', '#4a7c2c', '#1a3008', '#ff0'],
    };

    const fragmentTypes = ['head', 'torso', 'arm_l', 'arm_r', 'leg_l', 'leg_r'];
    const colors = bodyColors[enemyType];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const velocity = (Math.random() * 0.6 + 0.4) * radius;
      const fragType = fragmentTypes[i % fragmentTypes.length];
      
      particlesRef.current.push({
        id: Date.now() + Math.random() + i * 100,
        x, y,
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity - 3,
        life: 1, maxLife: 1,
        color: colors[i % colors.length],
        size: fragType === 'head' ? 10 : fragType === 'torso' ? 12 : 6,
        type: 'fragment',
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 30,
        gravity: 0.2,
        fragmentType: fragType,
      });
    }

    setBulletImpacts(prev => [...prev, {
      id: Date.now() + Math.random(),
      x, y, life: 1,
      size: radius * 15,
      type: 'death',
      color: enemyType === 'alien' ? '#00ff00' : enemyType === 'ghost' ? '#ffffff' : '#ff6600',
    }]);
  }, []);

  const spawnExplosion = useCallback((x: number, y: number, size: 'small' | 'medium' | 'large' = 'medium', color: string = '#ff6600') => {
    const counts = { small: 8, medium: 15, large: 25 };
    const sizes = { small: 20, medium: 35, large: 50 };
    spawnParticles(x, y, color, counts[size], 'fire', { speed: 5, size: sizes[size] / 3, gravity: -0.1 });
    spawnParticles(x, y, '#333', Math.floor(counts[size] / 2), 'smoke', { speed: 2, size: sizes[size] / 2, gravity: -0.05 });
    spawnParticles(x, y, '#666', Math.floor(counts[size] / 3), 'debris', { speed: 8, size: 6, gravity: 0.2 });
    spawnParticles(x, y, '#8b0000', counts[size], 'blood', { speed: 7, size: 10, gravity: 0.15 });
    spawnParticles(x, y, '#ff0000', Math.floor(counts[size] / 2), 'blood', { speed: 5, size: 8, gravity: 0.12 });
    setBulletImpacts(prev => [...prev, { id: Date.now() + Math.random(), x, y, life: 1, size: sizes[size] * 2, type: size === 'large' ? 'death' : 'explosion', color }]);
  }, [spawnParticles]);

  const spawnEnemy = useCallback(() => {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const x = side === 'left' ? -10 : 110;
    const y = 60 + Math.random() * 20;
    const isBoss = wave >= 3 && Math.random() > 0.8;
    const enemyTypes = ENVIRONMENTS[selectedEnvironment].enemyTypes;
    const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    let warningName = "दुश्मन";
    if (enemyType === 'tiger') warningName = "खूंखार शेर";
    else if (enemyType === 'ghost') warningName = "डरावना भूत";
    else if (enemyType === 'thug') warningName = "खतरनाक गुंडा";
    else if (enemyType === 'alien') warningName = "एलियन";
    else if (enemyType === 'snake') warningName = "खतरनाक अजगर";
    else if (enemyType === 'zombie') warningName = "ज़ोंबी";
    if (isBoss) warningName = "बॉस " + warningName;
    
    setWarningText(`⚠️ ${side === 'left' ? "बाएं" : "दाएं"} से ${warningName}!`);
    if (isBoss && soundEnabled) {
      playSound('boss_spawn');
      if (enemyType === 'tiger') playSound('roar');
      else if (enemyType === 'ghost') playSound('ghost_wail');
      else if (enemyType === 'snake') playSound('snake_hiss');
    }
    setTimeout(() => setWarningText(null), 2500);
    
    enemiesRef.current.push({
      id: Date.now() + Math.random(), x, y, velocityX: 0, velocityY: 0,
      size: isBoss ? 90 : 60, health: isBoss ? 5 + wave : 1 + Math.floor(wave / 2),
      maxHealth: isBoss ? 5 + wave : 1 + Math.floor(wave / 2), type: enemyType, isBoss,
      isHit: false, hitTime: 0, walkFrame: Math.random() * 10, isAttacking: false,
      spawnTime: Date.now(), isDying: false, deathFrame: 0, stumbleX: 0, stumbleY: 0,
      woundCount: 0,
    });
  }, [wave, selectedEnvironment, soundEnabled]);

  const handleReload = useCallback(() => {
    if (isReloading || ammo === WEAPONS[currentWeapon].magazineSize) return;
    setIsReloading(true);
    if (soundEnabled) playSound('reload');
    setTimeout(() => { setAmmo(WEAPONS[currentWeapon].magazineSize); setIsReloading(false); }, WEAPONS[currentWeapon].reloadTime);
  }, [isReloading, ammo, currentWeapon, soundEnabled]);

  const handleDash = useCallback(() => {
    if (isDashing || dashCooldown > 0 || gameState !== 'playing') return;
    setIsDashing(true);
    setDashCooldown(2000);
    if (soundEnabled) playSound('dash');
    setTimeout(() => setIsDashing(false), 300);
  }, [isDashing, dashCooldown, gameState, soundEnabled]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    let enemySpawnTimer = 0;
    let dashCooldownTimer = 0;
    let comboTimerInterval = 0;
    
    const gameLoop = () => {
      const gunPosition = gunPositionRef.current;
      const mousePosition = mousePositionRef.current;
      const bullets = bulletsRef.current;
      const enemies = enemiesRef.current;
      const particles = particlesRef.current;

      if (dashCooldown > 0) {
        dashCooldownTimer += 16;
        if (dashCooldownTimer >= dashCooldown) { setDashCooldown(0); dashCooldownTimer = 0; }
      }
      if (combo > 0) {
        comboTimerInterval += 16;
        if (comboTimerInterval > 3000) { setCombo(0); comboTimerInterval = 0; }
      }

      const lerpFactor = isDashing ? 0.05 : 0.15;
      gunPosition.x += (mousePosition.x - gunPosition.x) * lerpFactor;
      gunPosition.y += (mousePosition.y - gunPosition.y) * lerpFactor;

      const dx = mousePosition.x - gunPosition.x;
      const dy = mousePosition.y - gunPosition.y;
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        let angleDiff = targetAngle - gunAngleRef.current;
        while (angleDiff < -180) angleDiff += 360;
        while (angleDiff > 180) angleDiff -= 360;
        gunAngleRef.current += angleDiff * 0.2;
      }

      if (gunRecoil > 0) setGunRecoil(r => Math.max(0, r - 0.4));
      if (muzzleFlash > 0) setMuzzleFlash(m => Math.max(0, m - 0.15));

      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;
        bullet.trail.push({ x: bullet.x, y: bullet.y });
        if (bullet.trail.length > 20) bullet.trail.shift();
        if (bullet.x < -10 || bullet.x > 110 || bullet.y < -10 || bullet.y > 110) {
          setBulletImpacts(prev => [...prev, { id: Date.now() + Math.random(), x: Math.max(0, Math.min(100, bullet.x)), y: Math.max(0, Math.min(100, bullet.y)), life: 1, size: 15 + Math.random() * 10, type: 'bullet' }]);
          if (soundEnabled) playSound('bullet_impact', 0.3);
          spawnParticles(bullet.x, bullet.y, '#888', 6, 'dust', { speed: 2, size: 4 });
          bullets.splice(i, 1);
        }
      }

      setBulletImpacts(prev => prev.map(impact => ({ ...impact, life: impact.life - 0.04 })).filter(impact => impact.life > 0));

      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        particle.velocityX *= 0.94;
        particle.velocityY *= 0.94;
        particle.velocityY += particle.gravity;
        particle.rotation += particle.rotationSpeed;
        const decayRate = particle.type === 'blood' ? 0.015 : particle.type === 'smoke' ? 0.01 : particle.type === 'fire' ? 0.025 : particle.type === 'debris' ? 0.02 : particle.type === 'fragment' ? 0.012 : 0.025;
        particle.life -= decayRate;
        if (particle.life <= 0 || particle.y > 120) particles.splice(i, 1);
      }

      birdSpawnRef.current++;
      if (birdSpawnRef.current > 250 && birds.length < 6) {
        birdSpawnRef.current = 0;
        const fromLeft = Math.random() > 0.5;
        setBirds(prev => [...prev, { id: Date.now() + Math.random(), x: fromLeft ? -5 : 105, y: 8 + Math.random() * 25, velocityX: fromLeft ? 0.3 : -0.3, velocityY: (Math.random() - 0.5) * 0.1, wingPhase: Math.random() * Math.PI * 2, size: 0.8 + Math.random() * 0.5 }]);
      }

      setBirds(prev => prev.map(bird => ({ ...bird, x: bird.x + bird.velocityX, y: bird.y + bird.velocityY + Math.sin(bird.wingPhase) * 0.05, wingPhase: bird.wingPhase + 0.3 })).filter(bird => bird.x > -10 && bird.x < 110));

      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy.isDying) {
          enemy.deathFrame += 1;
          if (enemy.deathFrame > 30) { enemies.splice(i, 1); }
          continue;
        }
        const edx = gunPosition.x - enemy.x;
        const edy = gunPosition.y - enemy.y;
        const distance = Math.sqrt(edx * edx + edy * edy);
        const baseSpeed = 0.08 + (wave * 0.01);
        const speedMultiplier = enemy.type === 'ghost' ? 1.3 : enemy.type === 'snake' ? 0.9 : 1;
        const speed = baseSpeed * speedMultiplier;
        
        enemy.stumbleX *= 0.9;
        enemy.stumbleY *= 0.9;
        
        if (distance < 25) {
          enemy.velocityX = (edx / distance) * speed * 2.5 + enemy.stumbleX;
          enemy.velocityY = (edy / distance) * speed * 2.5 + enemy.stumbleY;
          enemy.isAttacking = true;
        } else {
          enemy.velocityX = (edx / distance) * speed + enemy.stumbleX;
          enemy.velocityY = (edy / distance) * speed + enemy.stumbleY;
          enemy.isAttacking = false;
        }
        enemy.x += enemy.velocityX;
        enemy.y += enemy.velocityY;
        enemy.walkFrame += 0.04;
        if (enemy.isHit && Date.now() - enemy.hitTime > 150) { enemy.isHit = false; }

        if (distance < (15 + enemy.size / 2) && !isDashing) {
          healthRef.current -= (enemy.isBoss ? 20 : 10);
          setHealth(Math.max(0, healthRef.current));
          enemy.isDying = true;
          enemy.deathFrame = 0;
          setScreenShake(15);
          if (soundEnabled) playSound('hit');
          spawnParticles(gunPosition.x, gunPosition.y, '#ef4444', 10, 'blood');
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

      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        let hit = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
          const enemy = enemies[j];
          if (enemy.isDying) continue;
          const distance = Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2);
          if (distance < (bullet.size + enemy.size / 2)) {
            enemy.health -= bullet.damage;
            enemy.isHit = true;
            enemy.hitTime = Date.now();
            enemy.woundCount += 1;
            hit = true;
            const pushAngle = Math.atan2(bullet.velocityY, bullet.velocityX);
            enemy.stumbleX = Math.cos(pushAngle) * 0.5;
            enemy.stumbleY = Math.sin(pushAngle) * 0.3;
            if (soundEnabled) playSound('hit');
            spawnParticles(bullet.x, bullet.y, '#8b0000', 5, 'blood', { speed: 4, size: 6 });
            spawnParticles(bullet.x, bullet.y, '#ff0000', 3, 'blood', { speed: 3, size: 4 });

            if (enemy.health <= 0) {
              enemy.isDying = true;
              enemy.deathFrame = 0;
              if (soundEnabled) {
                playSound('explode');
                if (enemy.type === 'zombie') playSound('zombie_die');
                else if (enemy.type === 'thug') playSound('thug_die');
                else if (enemy.type === 'tiger') playSound('tiger_die');
                else if (enemy.type === 'ghost') playSound('ghost_die');
                else if (enemy.type === 'alien') playSound('alien_die');
                else if (enemy.type === 'snake') playSound('snake_die');
              }
              const now = Date.now();
              if (now - lastKillTimeRef.current < 3000) {
                setCombo(c => c + 1);
                if (combo + 1 >= 3 && soundEnabled) playSound('combo');
              } else { setCombo(1); }
              lastKillTimeRef.current = now;
              comboTimerInterval = 0;

              const multiplier = combo >= 3 ? 2 : 1;
              scoreRef.current += (enemy.isBoss ? 100 : 20) * multiplier;
              setScore(scoreRef.current);
              setScreenShake(enemy.isBoss ? 20 : 10);
              
              spawnFragmentationBlast(enemy.x, enemy.y, bullet.weaponType, enemy.type);
              spawnExplosion(enemy.x, enemy.y, enemy.isBoss ? 'large' : 'medium', enemy.type === 'alien' ? '#00ff00' : enemy.type === 'ghost' ? '#ffffff' : enemy.type === 'snake' ? '#4ade80' : '#ff6600');
            }
            break;
          }
        }
        if (hit) bullets.splice(i, 1);
      }

      enemySpawnTimer++;
      if (enemySpawnTimer > Math.max(30, 80 - wave * 5)) { spawnEnemy(); enemySpawnTimer = 0; }
      if (scoreRef.current > wave * 150) setWave(w => w + 1);
      if (screenShake > 0) setScreenShake(s => Math.max(0, s - 0.5));

      setTick(t => t + 1);
      frameRef.current = requestAnimationFrame(gameLoop);
    };

    frameRef.current = requestAnimationFrame(gameLoop);
    return () => { cancelAnimationFrame(frameRef.current); setCombo(0); };
  }, [gameState, wave, highScore, soundEnabled, spawnEnemy, screenShake, spawnParticles, spawnExplosion, spawnFragmentationBlast, isDashing, dashCooldown, combo, muzzleFlash, birds.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gameState === 'playing') setGameState('paused');
        else if (gameState === 'paused') setGameState('playing');
      }
      if ((e.key === 'r' || e.key === 'R') && gameState === 'playing') handleReload();
      if (e.key === 'Shift' && gameState === 'playing') handleDash();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleReload, handleDash]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (gameState !== 'playing' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mousePositionRef.current = { x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 };
  }, [gameState]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (gameState !== 'playing' || isReloading) return;
    e.preventDefault();
    const weapon = WEAPONS[currentWeapon];
    if (ammo <= 0) { handleReload(); if (soundEnabled) playSound('empty_click'); return; }

    const now = Date.now();
    if (now - lastShotRef.current < weapon.fireRate) return;
    lastShotRef.current = now;
    setAmmo(a => a - 1);

    const gunPosition = gunPositionRef.current;
    const angleRad = gunAngleRef.current * (Math.PI / 180);
    const muzzleX = gunPosition.x + Math.cos(angleRad) * weapon.muzzleOffset;
    const muzzleY = gunPosition.y + Math.sin(angleRad) * weapon.muzzleOffset;
    
    setMuzzleFlash(1);
    setGunRecoil(weapon.recoil);
    
    const shoot = (spreadOffset: number) => {
      const finalAngle = angleRad + spreadOffset;
      bulletsRef.current.push({ id: Date.now() + Math.random(), x: muzzleX, y: muzzleY, velocityX: Math.cos(finalAngle) * weapon.speed, velocityY: Math.sin(finalAngle) * weapon.speed, size: weapon.size, color: weapon.color, damage: weapon.damage, trail: [], weaponType: currentWeapon });
    };

    if (currentWeapon === 'shotgun') { shoot(-0.2); shoot(-0.1); shoot(0); shoot(0.1); shoot(0.2); if (soundEnabled) playSound('shotgun'); }
    else if (currentWeapon === 'sniper') { shoot(0); if (soundEnabled) playSound('sniper'); }
    else if (currentWeapon === 'pistol') { shoot((Math.random() - 0.5) * weapon.spread); if (soundEnabled) playSound('pistol'); }
    else { shoot((Math.random() - 0.5) * weapon.spread); if (soundEnabled) playSound('rifle'); }
    
    const shellAngle = angleRad + Math.PI / 2 + (Math.random() - 0.5) * 0.3;
    particlesRef.current.push({ id: Date.now(), x: gunPosition.x, y: gunPosition.y, velocityX: Math.cos(shellAngle) * 0.6, velocityY: Math.sin(shellAngle) * 0.6 - 0.4, life: 1, maxLife: 1, color: '#d4af37', size: 3, type: 'shell', rotation: 0, rotationSpeed: 10, gravity: 0.1 });
    spawnParticles(muzzleX, muzzleY, '#ffaa00', 2, 'fire', { speed: 1, size: 3, gravity: -0.05 });
    setScreenShake(currentWeapon === 'sniper' ? 10 : currentWeapon === 'shotgun' ? 5 : 2);
  }, [gameState, isReloading, ammo, currentWeapon, soundEnabled, handleReload, spawnParticles]);

  const switchWeapon = (weapon: WeaponType) => {
    if (currentWeapon === weapon || isReloading) return;
    setCurrentWeapon(weapon);
    setAmmo(WEAPONS[weapon].magazineSize);
    if (soundEnabled) playSound('reload');
    if (navAutoHideTimer) clearTimeout(navAutoHideTimer);
    const timer = setTimeout(() => { setIsNavExpanded(false); }, 2000);
    setNavAutoHideTimer(timer);
  };

  const currentEnvironment = ENVIRONMENTS[selectedEnvironment];

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
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 bg-stone-900/90 backdrop-blur-xl border border-yellow-500/30 rounded-3xl p-8 md:p-10 max-w-md w-full shadow-[0_0_60px_rgba(234,179,8,0.2)]">
          <div className="text-center mb-6">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-3">🎯</motion.div>
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">आलमनगर स्ट्राइक</h1>
            <p className="text-stone-400 text-sm mt-2">अपना अकाउंट बनाएं या लॉगिन करें</p>
          </div>
          <div className="flex gap-2 mb-6 bg-stone-800 p-1 rounded-xl">
            <button onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${authMode === 'login' ? 'bg-yellow-500 text-black' : 'text-stone-400'}`}>🔑 लॉगिन</button>
            <button onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthSuccess(''); }} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${authMode === 'signup' ? 'bg-yellow-500 text-black' : 'text-stone-400'}`}>📝 साइनअप</button>
          </div>
          <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {authMode === 'signup' && <input type="text" value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="पूरा नाम" className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-yellow-500 transition" required />}
            <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="ईमेल" className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-yellow-500 transition" required />
            <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="पासवर्ड (6+ अक्षर)" className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-yellow-500 transition" required />
            {authError && <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg text-sm">{authError}</div>}
            {authSuccess && <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-2 rounded-lg text-sm">{authSuccess}</div>}
            <button type="submit" className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-black text-lg py-3 rounded-xl hover:scale-105 transition-transform">{authMode === 'login' ? '🔑 लॉगिन करें' : '📝 अकाउंट बनाएं'}</button>
          </form>
          <Link href="/" className="block mt-4 text-center text-stone-500 hover:text-yellow-400 text-sm font-bold transition-colors">← मुख्य पृष्ठ</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden select-none touch-none font-sans text-white">
      <AnimatedBackground environment={selectedEnvironment} />
      <div className={`absolute inset-0 ${currentEnvironment.overlay} pointer-events-none`} />

      <div className="absolute inset-0 pointer-events-none z-[5]">
        {birds.map(bird => (
          <div key={bird.id} className="absolute" style={{ left: `${bird.x}%`, top: `${bird.y}%`, transform: `scaleX(${bird.velocityX > 0 ? 1 : -1})` }}>
            <svg width="30" height="20" viewBox="-15 -10 30 20"><BirdSVG wingPhase={bird.wingPhase} size={bird.size} /></svg>
          </div>
        ))}
      </div>

      {/* 🎛️ COLLAPSIBLE TOP-LEFT UI */}
      <div className="absolute top-0 left-0 z-30 p-4 pointer-events-none">
        {/* Toggle Button */}
        <motion.button
          onClick={() => setIsUIExpanded(!isUIExpanded)}
          className="pointer-events-auto mb-2 bg-black/70 backdrop-blur-md p-2 rounded-lg border border-white/20 hover:bg-black/90 transition-colors shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isUIExpanded ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
        </motion.button>

        {/* Collapsible Panel */}
        <AnimatePresence>
          {isUIExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-2 pointer-events-auto"
            >
              <Link href="/" className="flex items-center gap-2 text-white bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 hover:bg-black/90 transition shadow-lg">
                <ArrowLeft className="w-4 h-4" /> Home
              </Link>
              
              <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-2 rounded-lg border border-white/20">
                {currentUser.photoURL ? <img src={currentUser.photoURL} alt="" className="w-8 h-8 rounded-full border-2 border-yellow-500" /> : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-xs font-black text-black">{(currentUser.displayName || currentUser.email || 'P')[0].toUpperCase()}</div>}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{currentUser.displayName || 'Player'}</div>
                  <div className="text-[10px] text-stone-400 truncate">{currentUser.email}</div>
                </div>
                <button onClick={handleLogout} className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors">🚪</button>
              </div>

              <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-2 rounded-lg border border-white/20">
                {soundEnabled ? <Volume2 className="w-5 h-5 text-green-400" /> : <VolumeX className="w-5 h-5 text-red-400" />}
                <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-xs text-white font-bold">SFX</button>
              </div>

              <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-2 rounded-lg border border-white/20">
                {bgMusicEnabled ? <Music className="w-5 h-5 text-cyan-400" /> : <Music2 className="w-5 h-5 text-stone-600" />}
                <button onClick={() => setBgMusicEnabled(!bgMusicEnabled)} className="text-xs text-white font-bold">BGM</button>
              </div>

              <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-2 rounded-lg border border-white/20">
                {ambientEnabled ? <Wind className="w-5 h-5 text-purple-400" /> : <Wind className="w-5 h-5 text-stone-600" />}
                <button onClick={() => setAmbientEnabled(!ambientEnabled)} className="text-xs text-white font-bold">Amb</button>
              </div>

              <button onClick={toggleMic} className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${isMicOn ? 'bg-green-600/60 border-green-400/50' : 'bg-black/70 border-white/20'}`}>
                {isMicOn ? <Mic className="w-5 h-5 text-green-400" /> : <MicOff className="w-5 h-5 text-red-400" />}
                <span className="text-xs text-white font-bold">{isMicOn ? 'MIC' : 'OFF'}</span>
                {isSpeaking && <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top-Right Stats */}
      {gameState === 'playing' && (
        <div className="absolute top-0 right-0 z-30 p-4 flex flex-col items-end gap-3 pointer-events-none">
          <div className="bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 flex items-center gap-3 shadow-lg pointer-events-auto">
            <Target className="w-5 h-5 text-yellow-400" />
            <span className="text-2xl font-black text-white">{score}</span>
            {combo >= 3 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-sm font-black text-red-500 animate-pulse">x{combo}!</motion.span>}
          </div>
          <div className="w-48 h-6 bg-black/70 rounded-full border border-white/20 overflow-hidden relative shadow-lg pointer-events-auto">
            <motion.div className="h-full bg-gradient-to-r from-red-600 to-red-400" animate={{ width: `${health}%` }} transition={{ type: 'spring', bounce: 0 }} />
            <div className="absolute inset-0 flex items-center justify-center"><span className="text-xs font-black text-white drop-shadow-md">HP {health}%</span></div>
          </div>
          <div className="text-sm font-bold text-stone-300 bg-black/50 px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 pointer-events-auto">
            <currentEnvironment.icon className="w-4 h-4" />
            {currentEnvironment.hindiName} • WAVE {wave}
          </div>
        </div>
      )}

      <div ref={canvasRef} className="absolute inset-0 z-10 cursor-crosshair" onPointerMove={handlePointerMove} onPointerDown={handlePointerDown} style={{ transform: screenShake > 0 ? `translate(${(Math.random() - 0.5) * screenShake}px, ${(Math.random() - 0.5) * screenShake}px)` : 'none' }}>
        {gameState === 'playing' && (
          <>
            {particlesRef.current.map(particle => (
              <div key={particle.id} className="absolute pointer-events-none" style={{
                left: `${particle.x}%`, top: `${particle.y}%`,
                width: `${particle.size * 2}px`, height: `${particle.type === 'fragment' ? particle.size * 3 : particle.size * 2}px`,
                marginLeft: `-${particle.size}px`, marginTop: `-${particle.size}px`,
                backgroundColor: particle.color, opacity: particle.life,
                transform: `rotate(${particle.rotation}deg)`,
                boxShadow: particle.type === 'blood' ? 'none' : particle.type === 'fire' ? `0 0 ${particle.size * 2}px ${particle.color}` : particle.type === 'fragment' ? `0 0 4px ${particle.color}` : `0 0 8px ${particle.color}`,
                borderRadius: particle.type === 'debris' || particle.type === 'fragment' ? '2px' : '50%',
              }}>
                {particle.type === 'fragment' && particle.fragmentType === 'head' && <HeadFragment color={particle.color} size={particle.size * 2} />}
                {particle.type === 'fragment' && particle.fragmentType === 'torso' && <TorsoFragment color={particle.color} size={particle.size * 2} />}
                {particle.type === 'fragment' && (particle.fragmentType === 'arm_l' || particle.fragmentType === 'arm_r') && <ArmFragment color={particle.color} size={particle.size * 2} />}
                {particle.type === 'fragment' && (particle.fragmentType === 'leg_l' || particle.fragmentType === 'leg_r') && <LegFragment color={particle.color} size={particle.size * 2} />}
              </div>
            ))}
            {bulletImpacts.map(impact => (
              <motion.div key={impact.id} initial={{ scale: 0, opacity: 1 }} animate={{ scale: impact.type === 'death' ? 5 : impact.type === 'explosion' ? 4 : 2.5, opacity: 0 }} transition={{ duration: impact.type === 'death' ? 0.6 : 0.4 }} className="absolute pointer-events-none" style={{ left: `${impact.x}%`, top: `${impact.y}%`, width: `${impact.size}px`, height: `${impact.size}px`, marginLeft: `-${impact.size / 2}px`, marginTop: `-${impact.size / 2}px`, background: impact.type === 'death' ? 'radial-gradient(circle, rgba(255,255,200,1) 0%, rgba(255,150,0,0.9) 20%, rgba(255,50,0,0.7) 40%, rgba(100,0,0,0.4) 60%, transparent 100%)' : impact.type === 'explosion' ? `radial-gradient(circle, rgba(255,200,100,0.9) 0%, ${impact.color || 'rgba(255,100,0,0.7)'} 30%, rgba(100,50,0,0.4) 60%, transparent 100%)` : 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,200,100,0.4) 40%, transparent 70%)', borderRadius: '50%' }} />
            ))}
            {bulletsRef.current.map(bullet => (
              <div key={bullet.id} className="absolute pointer-events-none">
                {bullet.trail.map((trailPoint, index) => (
                  <div key={index} className="absolute rounded-full" style={{ left: `${trailPoint.x}%`, top: `${trailPoint.y}%`, width: `${bullet.size * 0.6}px`, height: `${bullet.size * 0.6}px`, marginLeft: `-${bullet.size * 0.3}px`, marginTop: `-${bullet.size * 0.3}px`, backgroundColor: bullet.color, opacity: (index / bullet.trail.length) * 0.9, boxShadow: `0 0 6px ${bullet.color}` }} />
                ))}
                <div className="absolute rounded-full" style={{ left: `${bullet.x}%`, top: `${bullet.y}%`, width: `${bullet.size * 2}px`, height: `${bullet.size * 2}px`, marginLeft: `-${bullet.size}px`, marginTop: `-${bullet.size}px`, backgroundColor: '#fff', boxShadow: `0 0 12px ${bullet.color}, 0 0 24px ${bullet.color}` }} />
              </div>
            ))}
            {enemiesRef.current.map(enemy => (
              <div key={enemy.id} className="absolute z-20 pointer-events-none" style={{ left: `${enemy.x}%`, top: `${enemy.y}%`, width: `${enemy.size}px`, height: `${enemy.size * 1.5}px`, marginLeft: `-${enemy.size / 2}px`, marginTop: `-${enemy.size * 0.75}px`, transform: enemy.x < 50 ? 'scaleX(1)' : 'scaleX(-1)' }}>
                {enemy.maxHealth > 1 && !enemy.isDying && (
                  <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/20 absolute -top-3" style={{ transform: enemy.x < 50 ? 'scaleX(1)' : 'scaleX(-1)' }}>
                    <div className="h-full bg-gradient-to-r from-red-500 to-green-500 transition-all duration-100" style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }} />
                  </div>
                )}
                <svg viewBox="-40 -50 80 100" className="w-full h-full overflow-visible">
                  {enemy.type === 'zombie' && <ZombieSVG isHit={enemy.isHit} isBoss={enemy.isBoss} walkFrame={enemy.walkFrame} isDying={enemy.isDying} deathFrame={enemy.deathFrame} hitTime={enemy.hitTime} woundCount={enemy.woundCount} />}
                  {enemy.type === 'thug' && <ThugSVG isHit={enemy.isHit} isBoss={enemy.isBoss} walkFrame={enemy.walkFrame} isDying={enemy.isDying} deathFrame={enemy.deathFrame} hitTime={enemy.hitTime} woundCount={enemy.woundCount} />}
                  {enemy.type === 'tiger' && <TigerSVG isHit={enemy.isHit} isBoss={enemy.isBoss} walkFrame={enemy.walkFrame} isDying={enemy.isDying} deathFrame={enemy.deathFrame} hitTime={enemy.hitTime} woundCount={enemy.woundCount} />}
                  {enemy.type === 'ghost' && <GhostSVG isHit={enemy.isHit} isBoss={enemy.isBoss} walkFrame={enemy.walkFrame} isDying={enemy.isDying} deathFrame={enemy.deathFrame} hitTime={enemy.hitTime} woundCount={enemy.woundCount} />}
                  {enemy.type === 'alien' && <AlienSVG isHit={enemy.isHit} isBoss={enemy.isBoss} walkFrame={enemy.walkFrame} isDying={enemy.isDying} deathFrame={enemy.deathFrame} hitTime={enemy.hitTime} woundCount={enemy.woundCount} />}
                  {enemy.type === 'snake' && <SnakeSVG isHit={enemy.isHit} isBoss={enemy.isBoss} walkFrame={enemy.walkFrame} isDying={enemy.isDying} deathFrame={enemy.deathFrame} hitTime={enemy.hitTime} woundCount={enemy.woundCount} />}
                </svg>
              </div>
            ))}
            <div className="absolute z-30 pointer-events-none" style={{ left: `${gunPositionRef.current.x}%`, top: `${gunPositionRef.current.y}%`, transform: 'translate(-50%, -50%)' }}>
              <svg className="overflow-visible w-[150px] h-[150px] md:w-[220px] md:h-[220px] lg:w-[260px] lg:h-[260px]" viewBox="-100 -100 200 200">
                <GunSVG weapon={currentWeapon} angle={gunAngleRef.current} recoil={gunRecoil} />
                {muzzleFlash > 0 && (<circle cx={Math.cos(gunAngleRef.current * Math.PI / 180) * WEAPONS[currentWeapon].muzzleOffset} cy={Math.sin(gunAngleRef.current * Math.PI / 180) * WEAPONS[currentWeapon].muzzleOffset} r={15 * muzzleFlash} fill="rgba(255, 200, 50, 0.8)" style={{ filter: 'blur(3px)' }} />)}
                {isReloading && (<text x="-30" y="5" fill="white" fontSize="14" fontWeight="bold">RELOAD</text>)}
              </svg>
            </div>
            {isMicOn && isSpeaking && (<div className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-green-500 rounded-full animate-pulse border-2 border-white" />)}
          </>
        )}
      </div>

      {gameState === 'playing' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
          <motion.button onClick={() => setIsNavExpanded(!isNavExpanded)} className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-black/80 backdrop-blur-md px-4 py-2 rounded-t-lg border border-white/20 pointer-events-auto hover:bg-black/90 transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {isNavExpanded ? <ChevronDown className="w-5 h-5 text-white" /> : <ChevronUp className="w-5 h-5 text-white" />}
          </motion.button>
          <motion.div initial={{ y: '100%' }} animate={{ y: isNavExpanded ? '0%' : '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="bg-black/90 backdrop-blur-md border-t border-white/20 p-4 pointer-events-auto">
            <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
              {(Object.keys(WEAPONS) as WeaponType[]).map(weapon => (
                <motion.button key={weapon} onClick={() => switchWeapon(weapon)} disabled={isReloading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`px-4 py-2 rounded-lg font-bold text-sm border transition-all ${currentWeapon === weapon ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'bg-black/60 text-white border-white/20 hover:bg-black/80'}`}>{WEAPONS[weapon].name}</motion.button>
              ))}
              <div className="w-px h-8 bg-white/20 mx-2" />
              <motion.button onClick={handleReload} disabled={isReloading || ammo === WEAPONS[currentWeapon].magazineSize} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 rounded-lg font-bold text-sm border border-white/20 bg-black/60 text-white hover:bg-black/80 transition-all disabled:opacity-50 flex items-center gap-2"><RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} /> Reload</motion.button>
              <motion.button onClick={handleDash} disabled={dashCooldown > 0} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`px-4 py-2 rounded-lg font-bold text-sm border transition-all flex items-center gap-2 ${dashCooldown > 0 ? 'bg-black/40 text-stone-500 border-stone-700' : 'bg-blue-600/80 text-white border-blue-400'}`}><Zap className="w-4 h-4" /> {dashCooldown > 0 ? `${(dashCooldown / 1000).toFixed(1)}s` : 'Dash'}</motion.button>
              <div className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm flex items-center gap-2"><span className="text-white/60">Ammo:</span><span className="font-bold">{ammo}/{WEAPONS[currentWeapon].magazineSize}</span></div>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {warningText && (
          <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }} className="absolute top-0 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
            <div className="bg-red-900/90 backdrop-blur-md border-2 border-red-500 text-red-100 px-6 py-3 rounded-b-xl text-lg font-black shadow-[0_0_30px_rgba(239,68,68,0.6)] flex items-center gap-3 animate-pulse">
              <AlertTriangle className="w-6 h-6 text-yellow-400" /> {warningText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(gameState === 'menu' || gameState === 'select_env') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-stone-900/90 border border-yellow-500/30 p-8 md:p-12 rounded-3xl text-center max-w-3xl w-full shadow-[0_0_50px_rgba(234,179,8,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
              {gameState === 'menu' ? (
                <>
                  <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-7xl mb-4">🎯</motion.div>
                  <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-2">आलमनगर स्ट्राइक</h1>
                  <p className="text-stone-400 mb-2 font-medium">स्वागत है, <span className="text-yellow-400 font-bold">{currentUser.displayName || 'Player'}</span>!</p>
                  <p className="text-stone-500 mb-8 text-sm">अंधेरी रातों में दुश्मनों का सफाया करें</p>
                  <button onClick={() => setGameState('select_env')} className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-black text-xl py-4 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-lg group"><Play className="w-6 h-6 fill-black group-hover:scale-110 transition-transform" /> खेल शुरू करें</button>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-2"><MapPin className="text-yellow-400" /> युद्धक्षेत्र चुनें</h2>
                  <p className="text-stone-400 mb-6 text-sm">3 locations • Night Atmosphere</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {(['gali', 'jungle', 'city'] as EnvironmentType[]).map(environmentKey => {
                      const environment = ENVIRONMENTS[environmentKey];
                      return (
                        <button key={environmentKey} onClick={() => startGame(environmentKey)} className="relative p-4 rounded-xl border border-white/10 bg-black/40 hover:bg-black/60 hover:border-yellow-500/50 transition-all group flex flex-col items-center gap-3">
                          <div className="relative z-10 w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/50"><environment.icon className="w-8 h-8 text-yellow-400" /></div>
                          <div className="relative z-10 text-center">
                            <div className="font-black text-lg text-white">{environment.hindiName}</div>
                            <div className="text-xs text-stone-400">{environment.name}</div>
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

      <AnimatePresence>
        {gameState === 'gameover' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 bg-red-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-stone-900/90 border border-red-500/30 p-8 md:p-12 rounded-3xl text-center max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.2)]">
              <h1 className="text-5xl font-black text-red-500 mb-2">समाप्त</h1>
              <p className="text-stone-400 mb-2">अंधेरे ने आपको निगल लिया।</p>
              <p className="text-stone-500 mb-8 text-sm">दुश्मनों ने घेर लिया।</p>
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
              <button onClick={() => setGameState('menu')} className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-xl py-4 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-3"><RotateCcw className="w-6 h-6" /> पुन प्रयास</button>
              <Link href="/" className="block mt-6 text-stone-400 hover:text-white font-bold text-sm">← मुख्य पृष्ठ</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}