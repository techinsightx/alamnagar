"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Trophy, Play, RotateCcw, Volume2, VolumeX, Target, 
  MapPin, Trees, Building2, AlertTriangle, Mic, MicOff, Users, 
  User, LogIn, UserPlus, Mail, Lock, LogOut, Gamepad2, Hand
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

// ✅ Audio Engine
const playSound = (type: 'shoot' | 'shotgun' | 'sniper' | 'hit' | 'kill' | 'explode' | 'gameover' | 'booyah' | 'switch' | 'login') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    
    if (type === 'shoot') {
      osc.type = 'square'; osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'shotgun') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.4, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'sniper') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.5, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'explode') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.5, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'kill') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'switch' || type === 'login') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'gameover') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, ctx.currentTime); osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 1);
      gain.gain.setValueAtTime(0.4, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 1);
    } else if (type === 'booyah') {
      osc.type = 'square'; osc.frequency.setValueAtTime(400, ctx.currentTime); osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'hit') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {}
};

type Environment = 'gali' | 'jungle' | 'city';
type WeaponType = 'pistol' | 'rifle' | 'shotgun' | 'sniper';
type CharacterType = 'boy' | 'girl';
type GunHand = 'left' | 'right';

const WEAPONS: Record<WeaponType, { name: string; fireRate: number; damage: number; spread: number; speed: number; color: string }> = {
  pistol: { name: "Pistol", fireRate: 250, damage: 1, spread: 0, speed: 2.5, color: "#fbbf24" },
  rifle: { name: "Rifle", fireRate: 100, damage: 1, spread: 0.05, speed: 3.0, color: "#3b82f6" },
  shotgun: { name: "Shotgun", fireRate: 800, damage: 1, spread: 0.3, speed: 2.0, color: "#ef4444" },
  sniper: { name: "Sniper", fireRate: 1200, damage: 5, spread: 0, speed: 5.0, color: "#a855f7" },
};

// ✅ Boy Character SVG (Fixed upright, no rotation)
const BoyCharacter = ({ profilePhoto, isHit }: { profilePhoto?: string; isHit: boolean }) => (
  <g style={{ filter: isHit ? 'brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)' : 'none' }}>
    {/* Shadow */}
    <ellipse cx="0" cy="45" rx="25" ry="7" fill="rgba(0,0,0,0.5)" />
    
    {/* Legs (Animated) */}
    <g className="animate-walk">
      <rect x="-12" y="20" width="10" height="25" rx="4" fill="#1e3a8a" />
      <rect x="2" y="20" width="10" height="25" rx="4" fill="#1e3a8a" />
      {/* Boots */}
      <rect x="-14" y="40" width="14" height="7" rx="3" fill="#333" />
      <rect x="0" y="40" width="14" height="7" rx="3" fill="#333" />
    </g>
    
    {/* Body (T-shirt) */}
    <rect x="-18" y="-5" width="36" height="28" rx="5" fill="#dc2626" />
    {/* Belt */}
    <rect x="-18" y="18" width="36" height="4" rx="2" fill="#1a1a1a" />
    
    {/* Arms (will be positioned based on gun hand) */}
    <rect x="-26" y="-2" width="10" height="22" rx="4" fill="#fbbf24" />
    <rect x="16" y="-2" width="10" height="22" rx="4" fill="#fbbf24" />
    
    {/* Head */}
    <circle cx="0" cy="-20" r="16" fill="#fcd34d" />
    
    {/* Profile Photo (if available) */}
    {profilePhoto && (
      <g>
        <defs>
          <clipPath id="boyHeadClip">
            <circle cx="0" cy="-20" r="15" />
          </clipPath>
        </defs>
        <image 
          href={profilePhoto} 
          x="-15" y="-35" 
          width="30" height="30" 
          clipPath="url(#boyHeadClip)"
          preserveAspectRatio="xMidYMid slice"
        />
      </g>
    )}
    
    {/* Hair (Boy - short spiky) */}
    <path d="M -16 -25 Q -12 -36 0 -34 Q 12 -36 16 -25 Q 14 -30 0 -29 Q -14 -30 -16 -25 Z" fill="#1a1a1a" />
    
    {/* Eyes */}
    <circle cx="-6" cy="-22" r="2.5" fill="white" />
    <circle cx="6" cy="-22" r="2.5" fill="white" />
    <circle cx="-6" cy="-22" r="1.2" fill="black" />
    <circle cx="6" cy="-22" r="1.2" fill="black" />
    
    {/* Mouth */}
    <path d="M -5 -14 Q 0 -12 5 -14" stroke="black" strokeWidth="1.5" fill="none" />
  </g>
);

// ✅ Girl Character SVG (Fixed upright, no rotation)
const GirlCharacter = ({ profilePhoto, isHit }: { profilePhoto?: string; isHit: boolean }) => (
  <g style={{ filter: isHit ? 'brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)' : 'none' }}>
    {/* Shadow */}
    <ellipse cx="0" cy="45" rx="25" ry="7" fill="rgba(0,0,0,0.5)" />
    
    {/* Legs (Animated) */}
    <g className="animate-walk">
      <rect x="-10" y="20" width="9" height="25" rx="4" fill="#4c1d95" />
      <rect x="1" y="20" width="9" height="25" rx="4" fill="#4c1d95" />
      {/* Boots */}
      <rect x="-12" y="40" width="13" height="7" rx="3" fill="#ec4899" />
      <rect x="-1" y="40" width="13" height="7" rx="3" fill="#ec4899" />
    </g>
    
    {/* Body (Top) */}
    <rect x="-16" y="-5" width="32" height="26" rx="5" fill="#ec4899" />
    {/* Belt */}
    <rect x="-16" y="18" width="32" height="4" rx="2" fill="#1a1a1a" />
    
    {/* Arms */}
    <rect x="-24" y="-2" width="9" height="20" rx="4" fill="#fde68a" />
    <rect x="15" y="-2" width="9" height="20" rx="4" fill="#fde68a" />
    
    {/* Head */}
    <circle cx="0" cy="-20" r="16" fill="#fde68a" />
    
    {/* Profile Photo (if available) */}
    {profilePhoto && (
      <g>
        <defs>
          <clipPath id="girlHeadClip">
            <circle cx="0" cy="-20" r="15" />
          </clipPath>
        </defs>
        <image 
          href={profilePhoto} 
          x="-15" y="-35" 
          width="30" height="30" 
          clipPath="url(#girlHeadClip)"
          preserveAspectRatio="xMidYMid slice"
        />
      </g>
    )}
    
    {/* Hair (Girl - long with pigtails) */}
    <path d="M -16 -25 Q -12 -36 0 -34 Q 12 -36 16 -25 Q 14 -30 0 -29 Q -14 -30 -16 -25 Z" fill="#7c2d12" />
    <ellipse cx="-18" cy="-17" rx="6" ry="12" fill="#7c2d12" />
    <ellipse cx="18" cy="-17" rx="6" ry="12" fill="#7c2d12" />
    
    {/* Eyes */}
    <circle cx="-6" cy="-22" r="2.8" fill="white" />
    <circle cx="6" cy="-22" r="2.8" fill="white" />
    <circle cx="-6" cy="-22" r="1.4" fill="black" />
    <circle cx="6" cy="-22" r="1.4" fill="black" />
    
    {/* Eyelashes */}
    <path d="M -8 -24 L -9 -26 M -4 -24 L -4 -26" stroke="black" strokeWidth="0.7" />
    <path d="M 4 -24 L 4 -26 M 8 -24 L 9 -26" stroke="black" strokeWidth="0.7" />
    
    {/* Mouth (smile) */}
    <path d="M -5 -14 Q 0 -11 5 -14" stroke="black" strokeWidth="1.5" fill="#ec4899" />
  </g>
);

// ✅ Realistic Gun SVG (Rotates independently)
const GunSVG = ({ weapon, angle, hand }: { weapon: WeaponType; angle: number; hand: GunHand }) => {
  const color = WEAPONS[weapon].color;
  const flipX = hand === 'left' ? -1 : 1;
  
  return (
    <g transform={`rotate(${angle}) scale(${flipX}, 1)`} style={{ filter: `drop-shadow(0 0 10px ${color})` }}>
      {/* Stock */}
      <rect x="-35" y="-5" width="22" height="10" rx="3" fill="#4a3b2a" />
      {/* Handle */}
      <rect x="-18" y="5" width="10" height="15" rx="3" fill="#222" />
      {/* Body */}
      <rect x="-12" y="-6" width="35" height="12" rx="3" fill="#333" />
      {/* Magazine */}
      <rect x="-8" y="6" width="12" height="18" rx="2" fill="#111" />
      {/* Barrel */}
      <rect x="23" y="-4" width="30" height="8" rx="2" fill="#555" />
      {/* Scope/Detail */}
      <rect x="-8" y="-10" width="18" height="4" rx="2" fill={color} />
      {/* Muzzle */}
      <circle cx="53" cy="0" r="3" fill="#222" />
    </g>
  );
};

const ENVIRONMENTS: Record<Environment, { 
  name: string; hindiName: string; icon: any; bg: string; overlay: string;
}> = {
  gali: { 
    name: "Gali Muhalla", hindiName: "गली मुहल्ला", icon: MapPin, 
    bg: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1920&auto=format&fit=crop",
    overlay: "bg-amber-950/60"
  },
  jungle: { 
    name: "Jadui Jungle", hindiName: "जादुई जंगल", icon: Trees, 
    bg: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1920&auto=format&fit=crop",
    overlay: "bg-emerald-950/70"
  },
  city: { 
    name: "City Center", hindiName: "शहर का केंद्र", icon: Building2, 
    bg: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1920&auto=format&fit=crop",
    overlay: "bg-slate-900/70"
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
  const [gameState, setGameState] = useState<'auth' | 'menu' | 'select_char' | 'select_env' | 'playing' | 'gameover'>('auth');
  const [selectedEnv, setSelectedEnv] = useState<Environment>('gali');
  const [selectedChar, setSelectedChar] = useState<CharacterType>('boy');
  const [gunHand, setGunHand] = useState<GunHand>('right');
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

  // Game refs
  const characterPosRef = useRef({ x: 50, y: 80 });
  const gunAngleRef = useRef(0);
  const mousePosRef = useRef({ x: 50, y: 50 });
  const bulletsRef = useRef<any[]>([]);
  const enemiesRef = useRef<any[]>([]);
  const particlesRef = useRef<any[]>([]);
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
          character: 'boy',
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
    scoreRef.current = 0; healthRef.current = 100;
    characterPosRef.current = { x: 50, y: 80 };
    gunAngleRef.current = 0;
    mousePosRef.current = { x: 50, y: 50 };
    bulletsRef.current = []; enemiesRef.current = []; particlesRef.current = [];
    if (soundEnabled) playSound('booyah');
  };

  const spawnEnemy = useCallback(() => {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const x = side === 'left' ? -10 : 110;
    const y = 60 + Math.random() * 20;
    const isBoss = wave >= 3 && Math.random() > 0.8;
    const size = isBoss ? 80 : 60;
    const hp = isBoss ? 5 + wave : 1 + Math.floor(wave / 2);

    const directionText = side === 'left' ? "बाएं (Left)" : "दाएं (Right)";
    setWarningText(`⚠️ चेतावनी: ${directionText} से ${isBoss ? 'बॉस ' : ''}दुश्मन आ रहा है!`);
    setTimeout(() => setWarningText(null), 2500);

    enemiesRef.current.push({
      id: Date.now() + Math.random(), x, y, vx: 0, vy: 0,
      size, color: "#DC143C", hp, maxHp: hp, side,
      walkFrame: Math.random() * 10, isHit: false,
      emoji: isBoss ? '👹' : ''
    });
  }, [wave]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    let enemySpawnTimer = 0;
    
    const loop = () => {
      const charPos = characterPosRef.current;
      const mousePos = mousePosRef.current;
      const bullets = bulletsRef.current;
      const enemies = enemiesRef.current;
      const particles = particlesRef.current;

      // Character moves smoothly
      charPos.x += (mousePos.x - charPos.x) * 0.15;
      charPos.y += (mousePos.y - charPos.y) * 0.15;

      // Gun angle calculated from character to mouse
      const dx = mousePos.x - charPos.x;
      const dy = mousePos.y - charPos.y;
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        let diff = targetAngle - gunAngleRef.current;
        while (diff < -180) diff += 360;
        while (diff > 180) diff -= 360;
        gunAngleRef.current += diff * 0.2;
      }

      // Move bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx; b.y += b.vy;
        if (b.x < -10 || b.x > 110 || b.y < -10 || b.y > 110) bullets.splice(i, 1);
      }

      // Move enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const edx = charPos.x - e.x;
        const edy = charPos.y - e.y;
        const dist = Math.sqrt(edx * edx + edy * edy);
        const speed = 0.1 + (wave * 0.015);
        
        e.vx = (edx / dist) * speed;
        e.vy = (edy / dist) * speed;
        e.x += e.vx;
        e.y += e.vy;
        e.walkFrame += 0.05;
        if (e.isHit) e.isHit = false;

        if (dist < (15 + e.size/2)) {
          healthRef.current -= (e.size > 70 ? 20 : 10);
          setHealth(Math.max(0, healthRef.current));
          enemies.splice(i, 1);
          setScreenShake(10);
          if (soundEnabled) playSound('hit');
          
          for (let p = 0; p < 8; p++) {
            particles.push({ id: Math.random(), x: charPos.x, y: charPos.y, vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5, life: 1, color: '#ef4444', size: 4 });
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

      // Bullet vs Enemy
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
            
            for (let p = 0; p < 3; p++) {
              particles.push({ id: Math.random(), x: e.x, y: e.y, vx: (Math.random() - 0.5), vy: (Math.random() - 0.5), life: 0.5, color: '#ffffff', size: 2 });
            }

            if (e.hp <= 0) {
              enemies.splice(j, 1);
              const points = e.size > 70 ? 50 : 20;
              scoreRef.current += points;
              setScore(scoreRef.current);
              if (soundEnabled) playSound('explode');
              setScreenShake(8);
              
              for (let p = 0; p < 15; p++) {
                particles.push({
                  id: Math.random(), x: e.x, y: e.y,
                  vx: (Math.random() - 0.5) * 2.5, vy: (Math.random() - 0.5) * 2.5,
                  life: 1.5, color: e.color, size: 5
                });
              }
            }
            break;
          }
        }
        if (hit) bullets.splice(i, 1);
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.03;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Spawn enemies
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
  }, [gameState, wave, highScore, soundEnabled, spawnEnemy, screenShake, currentUser]);

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

    const charPos = characterPosRef.current;
    const angleRad = gunAngleRef.current * (Math.PI / 180);
    
    const shoot = (spreadOffset: number) => {
      const finalAngle = angleRad + spreadOffset;
      bulletsRef.current.push({
        id: Date.now() + Math.random(), 
        x: charPos.x + Math.cos(finalAngle) * 8, 
        y: charPos.y + Math.sin(finalAngle) * 8,
        vx: Math.cos(finalAngle) * weapon.speed, 
        vy: Math.sin(finalAngle) * weapon.speed,
        size: currentWeapon === 'sniper' ? 8 : 5, 
        color: weapon.color, 
        damage: weapon.damage
      });
    };

    if (currentWeapon === 'shotgun') {
      shoot(-0.2); shoot(-0.1); shoot(0); shoot(0.1); shoot(0.2);
      if (soundEnabled) playSound('shotgun');
    } else if (currentWeapon === 'sniper') {
      shoot(0);
      if (soundEnabled) playSound('sniper');
    } else {
      shoot((Math.random() - 0.5) * weapon.spread);
      if (soundEnabled) playSound('shoot');
    }
    setScreenShake(currentWeapon === 'sniper' ? 10 : currentWeapon === 'shotgun' ? 5 : 2);
  }, [gameState, soundEnabled, currentWeapon]);

  const switchWeapon = (w: WeaponType) => {
    setCurrentWeapon(w);
    if (soundEnabled) playSound('switch');
  };

  const toggleGunHand = () => {
    setGunHand(gunHand === 'right' ? 'left' : 'right');
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
      <style>{`
        @keyframes walk {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-walk {
          animation: walk 0.4s ease-in-out infinite;
        }
      `}</style>

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
          
          {/* User Profile */}
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

          {/* ✅ Gun Hand Toggle */}
          <button 
            onClick={toggleGunHand}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-black/60 hover:bg-black/80 transition-all"
          >
            <Hand className="w-5 h-5 text-cyan-400" />
            <span className="text-xs text-white font-bold">{gunHand === 'right' ? 'RIGHT HAND' : 'LEFT HAND'}</span>
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

            {bulletsRef.current.map(b => (
              <div key={b.id} className="absolute rounded-full z-10 pointer-events-none"
                style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.size}px`, height: `${b.size * 2}px`, marginLeft: `-${b.size/2}px`, marginTop: `-${b.size}px`, backgroundColor: b.color, boxShadow: `0 0 10px ${b.color}, 0 0 20px ${b.color}`, transform: `rotate(${Math.atan2(b.vy, b.vx) * 180 / Math.PI + 90}deg)` }} />
            ))}

            {enemiesRef.current.map(e => (
              <div key={e.id} className="absolute z-20 pointer-events-none flex flex-col items-center"
                style={{ left: `${e.x}%`, top: `${e.y}%`, width: `${e.size}px`, height: `${e.size * 1.5}px`, marginLeft: `-${e.size/2}px`, marginTop: `-${e.size * 0.75}px` }}>
                {e.maxHp > 1 && (
                  <div className="w-full h-1.5 bg-black/50 rounded-full mb-1 overflow-hidden border border-white/20 absolute -top-3">
                    <div className="h-full bg-green-500 transition-all duration-100" style={{ width: `${(e.hp / e.maxHp) * 100}%` }} />
                  </div>
                )}
                <div className="text-5xl md:text-6xl" style={{ filter: e.isHit ? 'brightness(2)' : 'none', transform: e.side === 'left' ? 'scaleX(1)' : 'scaleX(-1)' }}>
                  {e.emoji}
                </div>
              </div>
            ))}

            {/* ✅ Character (Fixed upright) + Gun (Rotates) */}
            <div className="absolute z-30 pointer-events-none" style={{ left: `${characterPosRef.current.x}%`, top: `${characterPosRef.current.y}%`, transform: 'translate(-50%, -50%)' }}>
              {/* Character (No rotation - always upright) */}
              <svg width="100" height="120" viewBox="-50 -60 100 120" className="overflow-visible">
                {selectedChar === 'boy' ? (
                  <BoyCharacter profilePhoto={currentUser.photoURL} isHit={false} />
                ) : (
                  <GirlCharacter profilePhoto={currentUser.photoURL} isHit={false} />
                )}
              </svg>
              
              {/* Gun (Rotates independently) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transform: `translate(-50%, -50%)` }}>
                <svg width="120" height="120" viewBox="-60 -60 120 120" className="overflow-visible">
                  <GunSVG weapon={currentWeapon} angle={gunAngleRef.current} hand={gunHand} />
                </svg>
              </div>

              {isMicOn && isSpeaking && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-green-500 rounded-full animate-pulse border-2 border-white" />
              )}
            </div>
          </>
        )}
      </div>

      {/* Menu / Character Selection */}
      <AnimatePresence>
        {(gameState === 'menu' || gameState === 'select_char' || gameState === 'select_env') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-stone-900/90 border border-yellow-500/30 p-8 md:p-12 rounded-3xl text-center max-w-3xl w-full shadow-[0_0_50px_rgba(234,179,8,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
              
              {gameState === 'menu' ? (
                <>
                  <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-7xl mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">🎯</motion.div>
                  <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-2">आलमनगर स्ट्राइक</h1>
                  <p className="text-stone-400 mb-2 font-medium">स्वागत है, <span className="text-yellow-400 font-bold">{currentUser.displayName || 'Player'}</span>!</p>
                  <p className="text-stone-500 mb-8 text-sm">अपना योद्धा चुनें और युद्धक्षेत्र में उतरो</p>
                  <button onClick={() => setGameState('select_char')}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-black text-xl py-4 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-lg shadow-orange-500/30 group">
                    <Play className="w-6 h-6 fill-black group-hover:scale-110 transition-transform" /> खेल शुरू करें
                  </button>
                </>
              ) : gameState === 'select_char' ? (
                <>
                  <h2 className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-2"><User className="text-yellow-400" /> अपना योद्धा चुनें</h2>
                  <p className="text-stone-400 mb-6 text-sm">Boy या Girl - कौन लड़ेगा?</p>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <button onClick={() => { setSelectedChar('boy'); setGameState('select_env'); }}
                      className={`relative p-6 rounded-2xl border-2 bg-blue-950/40 hover:bg-blue-900/60 transition-all group ${
                        selectedChar === 'boy' ? 'border-blue-400 scale-105' : 'border-blue-500/30'
                      }`}>
                      <svg viewBox="-50 -60 100 120" className="w-32 h-40 mx-auto mb-4">
                        <BoyCharacter profilePhoto={currentUser.photoURL} isHit={false} />
                      </svg>
                      <div className="font-black text-xl text-blue-300">BOY</div>
                      <div className="text-xs text-stone-400">लड़का योद्धा</div>
                    </button>
                    
                    <button onClick={() => { setSelectedChar('girl'); setGameState('select_env'); }}
                      className={`relative p-6 rounded-2xl border-2 bg-pink-950/40 hover:bg-pink-900/60 transition-all group ${
                        selectedChar === 'girl' ? 'border-pink-400 scale-105' : 'border-pink-500/30'
                      }`}>
                      <svg viewBox="-50 -60 100 120" className="w-32 h-40 mx-auto mb-4">
                        <GirlCharacter profilePhoto={currentUser.photoURL} isHit={false} />
                      </svg>
                      <div className="font-black text-xl text-pink-300">GIRL</div>
                      <div className="text-xs text-stone-400">लड़की योद्धा</div>
                    </button>
                  </div>
                  <button onClick={() => setGameState('menu')} className="text-stone-400 hover:text-white text-sm font-bold transition-colors">← वापस</button>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-2"><MapPin className="text-yellow-400" /> युद्धक्षेत्र चुनें</h2>
                  <p className="text-stone-400 mb-6 text-sm">3 locations • Voice Chat enabled </p>
                  
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
                  <button onClick={() => setGameState('select_char')} className="text-stone-400 hover:text-white text-sm font-bold transition-colors">← वापस</button>
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
              <p className="text-stone-500 mb-8 text-sm">युद्धक्षेत्र गिर गया।</p>
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