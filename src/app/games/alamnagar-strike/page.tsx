"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Trophy, Play, RotateCcw, Volume2, VolumeX, Target, 
  MapPin, Trees, Building2, AlertTriangle, Crosshair
} from "lucide-react";
import Link from "next/link";

// ✅ Audio Engine
const playSound = (type: 'shoot' | 'shotgun' | 'sniper' | 'hit' | 'kill' | 'explode' | 'gameover' | 'booyah' | 'switch') => {
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
    } else if (type === 'switch') {
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

// ✅ Realistic Weapons Data
const WEAPONS: Record<WeaponType, { name: string; fireRate: number; damage: number; spread: number; speed: number; color: string; ammo: string }> = {
  pistol: { name: "Pistol", fireRate: 250, damage: 1, spread: 0, speed: 2.5, color: "#fbbf24", ammo: "" },
  rifle: { name: "Assault Rifle", fireRate: 100, damage: 1, spread: 0.05, speed: 3.0, color: "#3b82f6", ammo: "∞" },
  shotgun: { name: "Shotgun", fireRate: 800, damage: 1, spread: 0.3, speed: 2.0, color: "#ef4444", ammo: "∞" },
  sniper: { name: "Sniper", fireRate: 1200, damage: 5, spread: 0, speed: 5.0, color: "#a855f7", ammo: "∞" },
};

// ✅ Enhanced SVG Enemies (Less sticker-like, more character-like)
const DakuEnemy = ({ walkFrame, isHit }: { walkFrame: number; isHit: boolean }) => {
  const legSwing = Math.sin(walkFrame * 10) * 20;
  const armSwing = Math.sin(walkFrame * 10) * 15;
  const bob = Math.abs(Math.sin(walkFrame * 10)) * 3;
  
  return (
    <g transform={`translate(0, ${-bob})`} style={{ filter: isHit ? 'brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)' : 'none', transition: 'filter 0.1s' }}>
      {/* Shadow */}
      <ellipse cx="30" cy="95" rx="15" ry="4" fill="rgba(0,0,0,0.5)" />
      {/* Back Leg */}
      <rect x="26" y="60" width="8" height="30" rx="4" fill="#111" transform={`rotate(${legSwing} 30 60)`} />
      {/* Back Arm */}
      <rect x="12" y="30" width="8" height="25" rx="4" fill="#8B4513" transform={`rotate(${-armSwing} 16 30)`} />
      {/* Body */}
      <rect x="20" y="25" width="20" height="35" rx="4" fill="#2F4F4F" />
      {/* Head */}
      <circle cx="30" cy="15" r="12" fill="#8B4513" />
      {/* Bandana */}
      <path d="M 18 12 Q 30 8 42 12 L 42 18 Q 30 14 18 18 Z" fill="#DC143C" />
      {/* Eyes */}
      <circle cx="26" cy="14" r="2" fill="white" /><circle cx="34" cy="14" r="2" fill="white" />
      <circle cx="26" cy="14" r="1" fill="black" /><circle cx="34" cy="14" r="1" fill="black" />
      {/* Front Leg */}
      <rect x="26" y="60" width="8" height="30" rx="4" fill="#222" transform={`rotate(${-legSwing} 30 60)`} />
      {/* Front Arm */}
      <rect x="40" y="30" width="8" height="25" rx="4" fill="#8B4513" transform={`rotate(${armSwing} 44 30)`} />
      {/* Gun in hand */}
      <rect x="42" y="40" width="18" height="6" rx="2" fill="#333" transform={`rotate(${armSwing} 44 30)`} />
    </g>
  );
};

const TigerEnemy = ({ walkFrame, isHit }: { walkFrame: number; isHit: boolean }) => {
  const legSwing = Math.sin(walkFrame * 12) * 25;
  const bob = Math.abs(Math.sin(walkFrame * 12)) * 2;
  
  return (
    <g transform={`translate(0, ${-bob})`} style={{ filter: isHit ? 'brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)' : 'none', transition: 'filter 0.1s' }}>
      <ellipse cx="40" cy="55" rx="20" ry="5" fill="rgba(0,0,0,0.5)" />
      {/* Back Legs */}
      <rect x="25" y="40" width="6" height="15" rx="3" fill="#CC7000" transform={`rotate(${legSwing} 28 40)`} />
      <rect x="45" y="40" width="6" height="15" rx="3" fill="#CC7000" transform={`rotate(${-legSwing} 48 40)`} />
      {/* Body */}
      <ellipse cx="40" cy="35" rx="22" ry="15" fill="#FF8C00" />
      {/* Stripes */}
      <path d="M 30 25 L 32 35 M 40 23 L 40 35 M 50 25 L 48 35" stroke="black" strokeWidth="2" />
      {/* Head */}
      <circle cx="18" cy="25" r="12" fill="#FF8C00" />
      <circle cx="10" cy="18" r="4" fill="#FF8C00" /><circle cx="26" cy="18" r="4" fill="#FF8C00" />
      <circle cx="14" cy="23" r="2" fill="yellow" /><circle cx="22" cy="23" r="2" fill="yellow" />
      <circle cx="14" cy="23" r="1" fill="black" /><circle cx="22" cy="23" r="1" fill="black" />
      {/* Front Legs */}
      <rect x="30" y="40" width="6" height="15" rx="3" fill="#FF8C00" transform={`rotate(${-legSwing} 33 40)`} />
      <rect x="50" y="40" width="6" height="15" rx="3" fill="#FF8C00" transform={`rotate(${legSwing} 53 40)`} />
      {/* Tail */}
      <path d={`M 62 35 Q ${70 + Math.sin(walkFrame*10)*5} 30 75 25`} stroke="#FF8C00" strokeWidth="4" fill="none" />
    </g>
  );
};

const AlienEnemy = ({ walkFrame, isHit }: { walkFrame: number; isHit: boolean }) => {
  const legSwing = Math.sin(walkFrame * 8) * 30;
  const armSwing = Math.sin(walkFrame * 8) * 20;
  const bob = Math.abs(Math.sin(walkFrame * 8)) * 4;

  return (
    <g transform={`translate(0, ${-bob})`} style={{ filter: isHit ? 'brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)' : 'none', transition: 'filter 0.1s' }}>
      <ellipse cx="30" cy="95" rx="15" ry="4" fill="rgba(0,0,0,0.5)" />
      {/* Back Legs */}
      <rect x="22" y="75" width="8" height="20" rx="4" fill="#556B2F" transform={`rotate(${legSwing} 26 75)`} />
      <rect x="30" y="75" width="8" height="20" rx="4" fill="#556B2F" transform={`rotate(${-legSwing} 34 75)`} />
      {/* Body */}
      <rect x="20" y="40" width="20" height="35" rx="5" fill="#708090" />
      {/* Head */}
      <ellipse cx="30" cy="20" rx="18" ry="22" fill="#90EE90" />
      {/* Eyes */}
      <ellipse cx="22" cy="18" rx="6" ry="8" fill="black" /><ellipse cx="38" cy="18" rx="6" ry="8" fill="black" />
      <circle cx="22" cy="18" r="2" fill="white" /><circle cx="38" cy="18" r="2" fill="white" />
      {/* Antenna */}
      <line x1="30" y1="0" x2="30" y2="-10" stroke="#90EE90" strokeWidth="2" />
      <circle cx="30" cy="-10" r="3" fill="yellow" />
      {/* Arms */}
      <rect x="5" y="45" width="15" height="8" rx="4" fill="#90EE90" transform={`rotate(${-armSwing} 12 45)`} />
      <rect x="40" y="45" width="15" height="8" rx="4" fill="#90EE90" transform={`rotate(${armSwing} 48 45)`} />
      {/* Front Legs */}
      <rect x="22" y="75" width="8" height="20" rx="4" fill="#708090" transform={`rotate(${-legSwing} 26 75)`} />
      <rect x="30" y="75" width="8" height="20" rx="4" fill="#708090" transform={`rotate(${legSwing} 34 75)`} />
    </g>
  );
};

// ✅ Realistic Movable Rifle SVG
const RifleSVG = ({ weapon, angle }: { weapon: WeaponType; angle: number }) => {
  const color = WEAPONS[weapon].color;
  return (
    <g transform={`rotate(${angle})`} style={{ filter: `drop-shadow(0 0 8px ${color})` }}>
      {/* Stock */}
      <rect x="-30" y="-4" width="20" height="8" rx="2" fill="#4a3b2a" />
      {/* Handle */}
      <rect x="-15" y="4" width="8" height="12" rx="2" fill="#222" />
      {/* Body */}
      <rect x="-10" y="-5" width="30" height="10" rx="2" fill="#333" />
      {/* Magazine */}
      <rect x="-5" y="5" width="10" height="15" rx="1" fill="#111" />
      {/* Barrel */}
      <rect x="20" y="-3" width="25" height="6" rx="1" fill="#555" />
      {/* Scope/Detail */}
      <rect x="-5" y="-8" width="15" height="3" rx="1" fill={color} />
      {/* Muzzle Flash (Animated via CSS if needed, static here for simplicity) */}
    </g>
  );
};

interface Enemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  hp: number;
  maxHp: number;
  type: 'daku' | 'tiger' | 'alien';
  side: 'left' | 'right';
  walkFrame: number;
  isHit: boolean;
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

const ENVIRONMENTS: Record<Environment, { 
  name: string; hindiName: string; icon: any; bg: string; overlay: string;
  enemyType: 'daku' | 'tiger' | 'alien'; enemyColor: string;
}> = {
  gali: { 
    name: "Gali Muhalla", hindiName: "गली मुहल्ला", icon: MapPin, 
    bg: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1920&auto=format&fit=crop",
    overlay: "bg-amber-950/60", enemyType: 'daku', enemyColor: "#DC143C"
  },
  jungle: { 
    name: "Jadui Jungle", hindiName: "जादुई जंगल", icon: Trees, 
    bg: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1920&auto=format&fit=crop",
    overlay: "bg-emerald-950/70", enemyType: 'tiger', enemyColor: "#FF8C00"
  },
  city: { 
    name: "City Center", hindiName: "शहर का केंद्र", icon: Building2, 
    bg: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1920&auto=format&fit=crop",
    overlay: "bg-slate-900/70", enemyType: 'alien', enemyColor: "#90EE90"
  }
};

export default function AlamnagarStrike() {
  const [gameState, setGameState] = useState<'menu' | 'select_env' | 'playing' | 'gameover'>('menu');
  const [selectedEnv, setSelectedEnv] = useState<Environment>('gali');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [wave, setWave] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [screenShake, setScreenShake] = useState(0);
  const [warningText, setWarningText] = useState<string | null>(null);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('rifle');

  // Refs for 60FPS loop
  const gunPosRef = useRef({ x: 50, y: 80 });
  const gunAngleRef = useRef(0);
  const mousePosRef = useRef({ x: 50, y: 50 });
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);
  const lastShotRef = useRef(0);
  const scoreRef = useRef(0);
  const healthRef = useRef(100);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // For rendering
  const [, setTick] = useState(0);

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
    gunPosRef.current = { x: 50, y: 80 };
    gunAngleRef.current = -90;
    mousePosRef.current = { x: 50, y: 50 };
    bulletsRef.current = []; enemiesRef.current = []; particlesRef.current = [];
    if (soundEnabled) playSound('booyah');
  };

  const spawnEnemy = useCallback(() => {
    const env = ENVIRONMENTS[selectedEnv];
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const x = side === 'left' ? -10 : 110;
    const y = 60 + Math.random() * 20; // Ground level area

    const isBoss = wave >= 3 && Math.random() > 0.8;
    const size = isBoss ? 80 : 60;
    const hp = isBoss ? 5 + wave : 1 + Math.floor(wave / 2);

    const directionText = side === 'left' ? "बाएं (Left)" : "दाएं (Right)";
    setWarningText(`⚠️ चेतावनी: ${directionText} से ${isBoss ? 'बॉस ' : ''}दुश्मन आ रहा है!`);
    setTimeout(() => setWarningText(null), 2500);

    enemiesRef.current.push({
      id: Date.now() + Math.random(), x, y, vx: 0, vy: 0,
      size, color: env.enemyColor, hp, maxHp: hp, type: env.enemyType, side,
      walkFrame: Math.random() * 10, isHit: false
    });
  }, [wave, selectedEnv]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    let enemySpawnTimer = 0;
    
    const loop = () => {
      const gunPos = gunPosRef.current;
      const mousePos = mousePosRef.current;
      const bullets = bulletsRef.current;
      const enemies = enemiesRef.current;
      const particles = particlesRef.current;

      // 1. Smooth Gun Movement (Lerp)
      gunPos.x += (mousePos.x - gunPos.x) * 0.15;
      gunPos.y += (mousePos.y - gunPos.y) * 0.15;

      // 2. Calculate Gun Angle (Point towards mouse movement or just up if stationary)
      const dx = mousePos.x - gunPos.x;
      const dy = mousePos.y - gunPos.y;
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        // Smooth rotation
        let diff = targetAngle - gunAngleRef.current;
        while (diff < -180) diff += 360;
        while (diff > 180) diff -= 360;
        gunAngleRef.current += diff * 0.2;
      }

      // 3. Move Bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx; b.y += b.vy;
        if (b.x < -10 || b.x > 110 || b.y < -10 || b.y > 110) bullets.splice(i, 1);
      }

      // 4. Move Enemies towards Gun
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const edx = gunPos.x - e.x;
        const edy = gunPos.y - e.y;
        const dist = Math.sqrt(edx * edx + edy * edy);
        const speed = 0.1 + (wave * 0.015);
        
        e.vx = (edx / dist) * speed;
        e.vy = (edy / dist) * speed;
        e.x += e.vx;
        e.y += e.vy;
        e.walkFrame += 0.05;
        if (e.isHit) e.isHit = false; // Reset hit flash

        // Collision with Gun
        if (dist < (15 + e.size/2)) {
          healthRef.current -= (e.size > 70 ? 20 : 10);
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
            if (scoreRef.current > highScore) {
              setHighScore(scoreRef.current);
              localStorage.setItem("alamnagarStrikeHighScore", scoreRef.current.toString());
            }
            return;
          }
        }
      }

      // 5. Bullet vs Enemy Collision
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

      // 6. Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.03;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // 7. Spawn Enemies
      enemySpawnTimer++;
      if (enemySpawnTimer > Math.max(30, 80 - wave * 5)) {
        spawnEnemy();
        enemySpawnTimer = 0;
      }

      // 8. Wave Progression & Shake decay
      if (scoreRef.current > wave * 150) setWave(w => w + 1);
      if (screenShake > 0) setScreenShake(s => Math.max(0, s - 1));

      setTick(t => t + 1); // Force render
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameState, wave, highScore, soundEnabled, spawnEnemy, screenShake]);

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
    
    const shoot = (spreadOffset: number) => {
      const finalAngle = angleRad + spreadOffset;
      bulletsRef.current.push({
        id: Date.now() + Math.random(), 
        x: gunPos.x + Math.cos(finalAngle) * 5, 
        y: gunPos.y + Math.sin(finalAngle) * 5,
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

  const env = ENVIRONMENTS[selectedEnv];
  const EnvIcon = env.icon;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden select-none touch-none font-sans text-white">
      {/* Dynamic Background */}
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
            {soundEnabled ? <Volume2 className="w-5 h-5 text-green-400" /> : <VolumeX className="w-5 h-5 text-red-400" />}
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-xs text-white font-bold">SOUND</button>
          </div>
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

      {/* Weapon Selector UI (Bottom) */}
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
              style={{ borderColor: currentWeapon === w ? '#fff' : WEAPONS[w].color }}
            >
              <span style={{ color: currentWeapon === w ? 'black' : WEAPONS[w].color }}>{WEAPONS[w].name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Cinematic Warning Banner */}
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

      {/* Game Canvas Area */}
      <div 
        ref={canvasRef}
        className="absolute inset-0 z-10 cursor-crosshair"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        style={{ transform: screenShake > 0 ? `translate(${(Math.random()-0.5)*screenShake}px, ${(Math.random()-0.5)*screenShake}px)` : 'none' }}
      >
        {gameState === 'playing' && (
          <>
            {/* Particles (Blood/Explosions) */}
            {particlesRef.current.map(p => (
              <div key={p.id} className="absolute rounded-full pointer-events-none"
                style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.size * 2}px`, height: `${p.size * 2}px`, marginLeft: `-${p.size}px`, marginTop: `-${p.size}px`, backgroundColor: p.color, opacity: p.life, boxShadow: `0 0 10px ${p.color}` }} />
            ))}

            {/* Bullets */}
            {bulletsRef.current.map(b => (
              <div key={b.id} className="absolute rounded-full z-10 pointer-events-none"
                style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.size}px`, height: `${b.size * 2}px`, marginLeft: `-${b.size/2}px`, marginTop: `-${b.size}px`, backgroundColor: b.color, boxShadow: `0 0 10px ${b.color}, 0 0 20px ${b.color}`, transform: `rotate(${Math.atan2(b.vy, b.vx) * 180 / Math.PI + 90}deg)` }} />
            ))}

            {/* Enemies (Realistic SVG Characters) */}
            {enemiesRef.current.map(e => (
              <div key={e.id} className="absolute z-20 pointer-events-none"
                style={{ left: `${e.x}%`, top: `${e.y}%`, width: `${e.size}px`, height: `${e.size * 1.5}px`, marginLeft: `-${e.size/2}px`, marginTop: `-${e.size * 0.75}px`, transform: e.side === 'left' ? 'scaleX(1)' : 'scaleX(-1)' }}>
                {e.maxHp > 1 && (
                  <div className="w-full h-1.5 bg-black/50 rounded-full mb-1 overflow-hidden border border-white/20 absolute -top-3" style={{ transform: e.side === 'left' ? 'scaleX(1)' : 'scaleX(-1)' }}>
                    <div className="h-full bg-green-500 transition-all duration-100" style={{ width: `${(e.hp / e.maxHp) * 100}%` }} />
                  </div>
                )}
                <svg viewBox="0 0 60 100" className="w-full h-full overflow-visible">
                  {e.type === 'daku' && <DakuEnemy walkFrame={e.walkFrame} isHit={e.isHit} />}
                  {e.type === 'tiger' && <TigerEnemy walkFrame={e.walkFrame} isHit={e.isHit} />}
                  {e.type === 'alien' && <AlienEnemy walkFrame={e.walkFrame} isHit={e.isHit} />}
                </svg>
              </div>
            ))}

            {/* Movable Realistic Gun */}
            <div className="absolute z-30 pointer-events-none" style={{ left: `${gunPosRef.current.x}%`, top: `${gunPosRef.current.y}%`, transform: 'translate(-50%, -50%)' }}>
              <svg width="80" height="80" viewBox="-40 -40 80 80" className="overflow-visible">
                <RifleSVG weapon={currentWeapon} angle={gunAngleRef.current} />
              </svg>
            </div>
          </>
        )}
      </div>

      {/* Menu / Environment Selection */}
      <AnimatePresence>
        {(gameState === 'menu' || gameState === 'select_env') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-stone-900/90 border border-yellow-500/30 p-8 md:p-12 rounded-3xl text-center max-w-2xl w-full shadow-[0_0_50px_rgba(234,179,8,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
              
              {gameState === 'menu' ? (
                <>
                  <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-7xl mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">🎯</motion.div>
                  <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-2">आलमनगर स्ट्राइक</h1>
                  <p className="text-stone-400 mb-8 font-medium">अपना युद्धक्षेत्र चुनें और गाँव की रक्षा करें!</p>
                  <button onClick={() => setGameState('select_env')}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-black text-xl py-4 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-lg shadow-orange-500/30 group">
                    <Play className="w-6 h-6 fill-black group-hover:scale-110 transition-transform" /> स्थान चुनें
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-2"><MapPin className="text-yellow-400" /> युद्धक्षेत्र का चयन करें</h2>
                  <p className="text-stone-400 mb-6 text-sm">आलमनगर के सेटेलाइट मानचित्र पर आधारित</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {(['gali', 'jungle', 'city'] as Environment[]).map((envKey) => {
                      const e = ENVIRONMENTS[envKey];
                      const Icon = e.icon;
                      return (
                        <button key={envKey} onClick={() => startGame(envKey)}
                          className="relative w-full p-4 rounded-xl border border-white/10 bg-black/40 hover:bg-black/60 hover:border-yellow-500/50 transition-all group text-left flex flex-col items-center gap-3 overflow-hidden">
                          <div className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity" style={{ backgroundImage: `url(${e.bg})` }} />
                          <div className="relative z-10 w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/50">
                            <Icon className="w-8 h-8 text-yellow-400" />
                          </div>
                          <div className="relative z-10 text-center">
                            <div className="font-black text-lg text-white">{e.hindiName}</div>
                            <div className="text-xs text-stone-400 mt-1">{e.name}</div>
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

      {/* Game Over Screen */}
      <AnimatePresence>
        {gameState === 'gameover' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-red-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-stone-900/90 border border-red-500/30 p-8 md:p-12 rounded-3xl text-center max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.2)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
              <h1 className="text-5xl font-black text-red-500 mb-2 tracking-tighter drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">समाप्त</h1>
              <p className="text-stone-400 mb-8">युद्धक्षेत्र गिर गया।</p>
              
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
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-xl py-4 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-lg shadow-red-500/30 group">
                <RotateCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" /> पुन प्रयास
              </button>
              <Link href="/" className="block mt-6 text-stone-400 hover:text-white font-bold text-sm transition-colors">← मुख्य पृष्ठ</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}