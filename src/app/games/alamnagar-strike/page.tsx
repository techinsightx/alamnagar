"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Crosshair, Heart, Skull, Trophy, Play, RotateCcw, 
  Volume2, VolumeX, Target, Shield, Zap, MapPin, Trees, Wand2, Bomb, Building2
} from "lucide-react";
import Link from "next/link";

// ✅ Audio Engine
const playSound = (type: 'shoot' | 'shoot_magic' | 'hit' | 'kill' | 'explode' | 'gameover' | 'booyah') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'shoot') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square'; osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'shoot_magic') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'explode') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.5, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'kill') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'triangle'; osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'gameover') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination); osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime); osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 1);
      gain.gain.setValueAtTime(0.4, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 1);
    } else if (type === 'booyah') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination); osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime); osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.6);
    }
  } catch (e) {}
};

type Environment = 'gali' | 'jungle' | 'city';
type WeaponType = 'pistol' | 'rifle' | 'shotgun' | 'magic';

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
  emoji: string;
  entryPoint: string;
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
  isMagic: boolean;
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

interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: 'health' | 'rifle' | 'shotgun' | 'magic';
  size: number;
  emoji: string;
}

// ✅ Alamnagar ke teeno ilake - Satellite map based
const ENVIRONMENTS: Record<Environment, { 
  name: string; 
  hindiName: string;
  icon: any; 
  bg: string; 
  overlay: string;
  landmarks: string[];
}> = {
  gali: { 
    name: "Gali Muhalla", 
    hindiName: "गली मुहल्ला",
    icon: MapPin, 
    bg: "https://images.unsplash.com/photo-1596522354195-e8448ea1642c?q=80&w=1920&auto=format&fit=crop",
    overlay: "bg-stone-900/70",
    landmarks: ["मुखिया चौक", "मंदिर गली", "स्कूल रोड", "हाट बाजार"]
  },
  jungle: { 
    name: "Jadui Jungle", 
    hindiName: "जादुई जंगल",
    icon: Trees, 
    bg: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1920&auto=format&fit=crop",
    overlay: "bg-emerald-950/80",
    landmarks: ["घना जंगल", "नदी किनारे", "पहाड़ी रास्ता", "गुफा क्षेत्र"]
  },
  city: { 
    name: "City Center", 
    hindiName: "शहर का केंद्र",
    icon: Building2, 
    bg: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1920&auto=format&fit=crop",
    overlay: "bg-slate-900/70",
    landmarks: ["मेन रोड", "बस स्टैंड", "मॉल एरिया", "रेलवे स्टेशन"]
  }
};

// ✅ Entry points ke Hindi descriptions
const ENTRY_POINTS: Record<string, string> = {
  'north': "उत्तर दिशा से",
  'south': "दक्षिण दिशा से", 
  'east': "पूर्व दिशा से",
  'west': "पश्चिम दिशा से",
  'northeast': "उत्तर-पूर्व से",
  'northwest': "उत्तर-पश्चिम से",
  'southeast': "दक्षिण-पूर्व से",
  'southwest': "दक्षिण-पश्चिम से"
};

const WEAPONS: Record<WeaponType, { fireRate: number; speed: number; damage: number; spread: number; color: string; name: string; isMagic: boolean }> = {
  pistol: { fireRate: 300, speed: 1.5, damage: 1, spread: 1, color: '#fbbf24', name: 'PISTOL', isMagic: false },
  rifle: { fireRate: 100, speed: 2.5, damage: 1, spread: 1, color: '#3b82f6', name: 'RIFLE', isMagic: false },
  shotgun: { fireRate: 600, speed: 1.2, damage: 1, spread: 5, color: '#ef4444', name: 'SHOTGUN', isMagic: false },
  magic: { fireRate: 800, speed: 1.0, damage: 5, spread: 1, color: '#a855f7', name: 'JADUI WAND', isMagic: true },
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
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('pistol');
  const [weaponTimer, setWeaponTimer] = useState(0);
  const [enemyRoutes, setEnemyRoutes] = useState<string[]>([]);

  const playerRef = useRef({ x: 50, y: 80, size: 24 });
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const mouseRef = useRef({ x: 50, y: 50 });
  const frameRef = useRef<number>(0);
  const lastShotRef = useRef(0);
  const scoreRef = useRef(0);
  const healthRef = useRef(100);
  const canvasRef = useRef<HTMLDivElement>(null);
  const currentWeaponRef = useRef<WeaponType>('pistol');
  const weaponTimerRef = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem("alamnagarStrikeHighScore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => { currentWeaponRef.current = currentWeapon; }, [currentWeapon]);

  const startGame = (env?: Environment) => {
    if (env) setSelectedEnv(env);
    setGameState('playing');
    setScore(0); setHealth(100); setWave(1);
    setCurrentWeapon('pistol'); setWeaponTimer(0);
    setEnemyRoutes([]);
    scoreRef.current = 0; healthRef.current = 100;
    playerRef.current = { x: 50, y: 80, size: 24 };
    bulletsRef.current = []; enemiesRef.current = [];
    particlesRef.current = []; powerUpsRef.current = [];
    if (soundEnabled) playSound('booyah');
  };

  const getEntryPoint = (x: number, y: number): string => {
    if (y < 20) {
      if (x < 30) return 'northwest';
      if (x > 70) return 'northeast';
      return 'north';
    }
    if (y > 80) {
      if (x < 30) return 'southwest';
      if (x > 70) return 'southeast';
      return 'south';
    }
    if (x < 10) return 'west';
    if (x > 90) return 'east';
    return 'center';
  };

  const spawnEnemy = useCallback(() => {
    const side = Math.floor(Math.random() * 4);
    let x = 50, y = 10;
    
    // Different entry points based on environment
    if (side === 0) { x = Math.random() * 100; y = -5; } // Top
    else if (side === 1) { x = 105; y = Math.random() * 50; } // Right
    else if (side === 2) { x = Math.random() * 100; y = 105; } // Bottom
    else { x = -5; y = Math.random() * 50; } // Left

    let size = 20, hp = 1 + Math.floor(wave / 3), color = '#ef4444', emoji = '🧟';
    const rand = Math.random();
    
    if (wave >= 3 && rand > 0.85) {
      size = 40; hp = 5 + wave; color = '#a855f7'; emoji = '👹';
    } else if (wave >= 2 && rand > 0.6) {
      size = 30; hp = 3 + Math.floor(wave / 2); color = '#22c55e'; emoji = '🐺';
    }

    const entryPoint = getEntryPoint(x, y);
    const hindiDirection = ENTRY_POINTS[entryPoint] || "अज्ञात दिशा से";
    
    // Add route description
    const routeText = `${hindiDirection} दुश्मन आ रहा है!`;
    setEnemyRoutes(prev => [...prev.slice(-4), routeText]);

    enemiesRef.current.push({
      id: Date.now() + Math.random(), x, y,
      vx: (side === 1 ? -1 : side === 3 ? 1 : 0) * (0.2 + Math.random() * 0.2),
      vy: (side === 0 || side === 2 ? (side === 0 ? 1 : -1) : 0) * (0.05 + Math.random() * 0.05),
      size, color, hp, maxHp: hp, emoji, entryPoint
    });
  }, [wave]);

  // ✅ Main 60FPS Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    let enemySpawnTimer = 0;
    
    const loop = () => {
      const player = playerRef.current;
      const bullets = bulletsRef.current;
      const enemies = enemiesRef.current;
      const particles = particlesRef.current;
      const powerUps = powerUpsRef.current;

      // 1. Move Bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx; b.y += b.vy;
        if (b.x < -10 || b.x > 110 || b.y < -10 || b.y > 110) bullets.splice(i, 1);
      }

      // 2. Move Enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.x += e.vx; e.y += e.vy;
        
        if (e.x <= 5 || e.x >= 95) e.vx *= -1;

        const dx = player.x - e.x;
        const dy = player.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < (player.size + e.size) / 2) {
          healthRef.current -= (e.size > 30 ? 20 : 10);
          setHealth(Math.max(0, healthRef.current));
          enemies.splice(i, 1);
          setScreenShake(10);
          if (soundEnabled) playSound('hit');
          
          for (let p = 0; p < 8; p++) {
            particles.push({ id: Math.random(), x: player.x, y: player.y, vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5, life: 1, color: '#ef4444', size: 4 });
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

      // 3. Bullet vs Enemy Collision
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        let hit = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          const dx = b.x - e.x; const dy = b.y - e.y;
          if (Math.sqrt(dx * dx + dy * dy) < (b.size + e.size) / 2) {
            e.hp -= b.damage;
            hit = true;
            
            for (let p = 0; p < 3; p++) {
              particles.push({ id: Math.random(), x: e.x, y: e.y, vx: (Math.random() - 0.5), vy: (Math.random() - 0.5), life: 0.5, color: '#ffffff', size: 2 });
            }

            if (e.hp <= 0) {
              enemies.splice(j, 1);
              const points = e.size > 30 ? 50 : e.size > 25 ? 20 : 10;
              scoreRef.current += points;
              setScore(scoreRef.current);
              if (soundEnabled) playSound(b.isMagic ? 'explode' : 'kill');
              setScreenShake(b.isMagic ? 15 : 5);
              
              const pCount = b.isMagic ? 30 : 12;
              const pColor = b.isMagic ? '#a855f7' : e.color;
              for (let p = 0; p < pCount; p++) {
                particles.push({
                  id: Math.random(), x: e.x, y: e.y,
                  vx: (Math.random() - 0.5) * (b.isMagic ? 3 : 2), 
                  vy: (Math.random() - 0.5) * (b.isMagic ? 3 : 2),
                  life: 1.5, color: pColor, size: b.isMagic ? 6 : 4
                });
              }

              if (Math.random() < 0.2) {
                const types: PowerUp['type'][] = ['health', 'rifle', 'shotgun', 'magic'];
                const pType = types[Math.floor(Math.random() * types.length)];
                const emojis = { health: '❤️', rifle: '🏹', shotgun: '💥', magic: '' };
                powerUpsRef.current.push({ id: Date.now() + Math.random(), x: e.x, y: e.y, type: pType, size: 20, emoji: emojis[pType] });
              }
            }
            break;
          }
        }
        if (hit) bullets.splice(i, 1);
      }

      // 4. PowerUp Collection
      for (let i = powerUps.length - 1; i >= 0; i--) {
        const p = powerUps[i];
        const dx = player.x - p.x; const dy = player.y - p.y;
        if (Math.sqrt(dx * dx + dy * dy) < (player.size + p.size) / 2) {
          if (p.type === 'health') {
            healthRef.current = Math.min(100, healthRef.current + 30);
            setHealth(healthRef.current);
          } else {
            currentWeaponRef.current = p.type;
            setCurrentWeapon(p.type);
            weaponTimerRef.current = 600;
            setWeaponTimer(600);
          }
          powerUps.splice(i, 1);
          if (soundEnabled) playSound('booyah');
        }
      }

      // 5. Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.03;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // 6. Weapon Timer
      if (weaponTimerRef.current > 0) {
        weaponTimerRef.current -= 1;
        setWeaponTimer(weaponTimerRef.current);
        if (weaponTimerRef.current <= 0) {
          currentWeaponRef.current = 'pistol';
          setCurrentWeapon('pistol');
        }
      }

      // 7. Spawn Enemies
      enemySpawnTimer++;
      if (enemySpawnTimer > Math.max(20, 60 - wave * 3)) {
        spawnEnemy();
        if (wave > 3 && Math.random() > 0.7) spawnEnemy();
        enemySpawnTimer = 0;
      }

      // 8. Wave Progression
      if (scoreRef.current > wave * 150) setWave(w => w + 1);
      if (screenShake > 0) setScreenShake(s => Math.max(0, s - 1));

      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameState, wave, highScore, soundEnabled, spawnEnemy, screenShake]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (gameState !== 'playing' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current = { 
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100 
    };
  }, [gameState]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (gameState !== 'playing') return;
    e.preventDefault();
    const now = Date.now();
    const weapon = WEAPONS[currentWeaponRef.current];
    if (now - lastShotRef.current < weapon.fireRate) return;
    lastShotRef.current = now;

    const player = playerRef.current;
    const mouse = mouseRef.current;
    const dx = mouse.x - player.x;
    const dy = mouse.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    
    if (weapon.spread === 1) {
      bulletsRef.current.push({ id: Date.now(), x: player.x, y: player.y, vx: (dx / dist) * weapon.speed, vy: (dy / dist) * weapon.speed, size: weapon.isMagic ? 8 : 5, color: weapon.color, damage: weapon.damage, isMagic: weapon.isMagic });
    } else {
      for (let i = 0; i < weapon.spread; i++) {
        const angleOffset = (i - (weapon.spread - 1) / 2) * 0.15;
        const cos = Math.cos(angleOffset); const sin = Math.sin(angleOffset);
        bulletsRef.current.push({
          id: Date.now() + i, x: player.x, y: player.y,
          vx: ((dx / dist) * cos - (dy / dist) * sin) * weapon.speed,
          vy: ((dx / dist) * sin + (dy / dist) * cos) * weapon.speed,
          size: 4, color: weapon.color, damage: weapon.damage, isMagic: false
        });
      }
    }
    if (soundEnabled) playSound(weapon.isMagic ? 'shoot_magic' : 'shoot');
    setScreenShake(weapon.isMagic ? 8 : 2);
  }, [gameState, soundEnabled]);

  const env = ENVIRONMENTS[selectedEnv];
  const EnvIcon = env.icon;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden select-none touch-none font-sans text-white">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000" style={{ backgroundImage: `url(${env.bg})` }} />
        <div className={`absolute inset-0 ${env.overlay} transition-all duration-1000`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)]" />
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
            <div className="flex items-center gap-3">
              <div className="w-48 h-6 bg-black/60 rounded-full border border-white/10 overflow-hidden relative shadow-lg">
                <motion.div className="h-full bg-gradient-to-r from-red-600 to-red-400" initial={{ width: '100%' }} animate={{ width: `${health}%` }} transition={{ type: 'spring', bounce: 0 }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black text-white drop-shadow-md">HP {health}%</span>
                </div>
              </div>
              {currentWeapon !== 'pistol' && (
                <div className="bg-purple-500/20 border border-purple-400/50 px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-purple-300">{Math.ceil(weaponTimer / 60)}s</span>
                </div>
              )}
            </div>
            <div className="text-sm font-bold text-stone-300 bg-black/40 px-3 py-1 rounded-full border border-white/5 flex items-center gap-2">
              <EnvIcon className="w-4 h-4" /> {env.hindiName} • WAVE {wave}
            </div>
          </div>
        )}
      </div>

      {/* Enemy Route Descriptions - Hindi Text (Left Side) */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none space-y-2">
        <AnimatePresence>
          {enemyRoutes.map((route, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-black/70 backdrop-blur-md border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)] whitespace-nowrap"
            >
              ⚠️ {route}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

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
            {/* PowerUps */}
            {powerUpsRef.current.map(p => (
              <motion.div key={p.id} initial={{ scale: 0 }} animate={{ scale: 1, y: [0, -8, 0] }} transition={{ y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } }}
                className="absolute flex items-center justify-center z-10"
                style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.size * 1.5}px`, height: `${p.size * 1.5}px`, marginLeft: `-${p.size * 0.75}px`, marginTop: `-${p.size * 0.75}px` }}>
                <div className={`w-full h-full rounded-full flex items-center justify-center text-2xl shadow-[0_0_25px_currentColor] ${p.type === 'health' ? 'bg-red-500/30 text-red-400' : p.type === 'magic' ? 'bg-purple-500/30 text-purple-400' : 'bg-orange-500/30 text-orange-400'}`}>
                  {p.emoji}
                </div>
              </motion.div>
            ))}

            {/* Player */}
            <div className="absolute flex flex-col items-center justify-center z-20" style={{ left: `${playerRef.current.x}%`, top: `${playerRef.current.y}%` }}>
              <div className="relative">
                <div className={`w-12 h-12 rounded-full bg-black/80 border-2 ${currentWeapon === 'magic' ? 'border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.8)]' : currentWeapon === 'shotgun' ? 'border-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.8)]' : currentWeapon === 'rifle' ? 'border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.8)]' : 'border-yellow-500 shadow-[0_0_25px_rgba(234,179,8,0.8)]'} flex items-center justify-center`}>
                  {currentWeapon === 'magic' ? <Wand2 className="w-6 h-6 text-purple-400" /> : <Crosshair className={`w-6 h-6 ${currentWeapon === 'shotgun' ? 'text-orange-400' : currentWeapon === 'rifle' ? 'text-blue-400' : 'text-yellow-400'}`} />}
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-[10px] font-black bg-black/70 px-2 py-0.5 rounded text-white border border-white/20">{WEAPONS[currentWeapon].name}</span>
                </div>
              </div>
            </div>

            {/* Bullets */}
            {bulletsRef.current.map(b => (
              <div key={b.id} className="absolute rounded-full z-10"
                style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.size * 2}px`, height: `${b.size * 2}px`, marginLeft: `-${b.size}px`, marginTop: `-${b.size}px`, backgroundColor: b.color, boxShadow: `0 0 10px ${b.color}, 0 0 20px ${b.color}` }} />
            ))}

            {/* Enemies */}
            {enemiesRef.current.map(e => (
              <div key={e.id} className="absolute flex flex-col items-center justify-center z-10"
                style={{ left: `${e.x}%`, top: `${e.y}%`, width: `${e.size * 1.5}px`, height: `${e.size * 1.5}px`, marginLeft: `-${e.size * 0.75}px`, marginTop: `-${e.size * 0.75}px` }}>
                {e.maxHp > 1 && (
                  <div className="w-full h-1.5 bg-black/50 rounded-full mb-1 overflow-hidden border border-white/20">
                    <div className="h-full bg-green-500 transition-all duration-100" style={{ width: `${(e.hp / e.maxHp) * 100}%` }} />
                  </div>
                )}
                <div className="w-full h-full rounded-full flex items-center justify-center text-3xl md:text-4xl border-2 border-black/30 animate-bounce"
                  style={{ backgroundColor: `${e.color}30`, boxShadow: `0 0 25px ${e.color}`, borderColor: e.color }}>
                  {e.emoji}
                </div>
              </div>
            ))}

            {/* Particles */}
            {particlesRef.current.map(p => (
              <div key={p.id} className="absolute rounded-full pointer-events-none"
                style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.size * 2}px`, height: `${p.size * 2}px`, marginLeft: `-${p.size}px`, marginTop: `-${p.size}px`, backgroundColor: p.color, opacity: p.life, boxShadow: `0 0 10px ${p.color}` }} />
            ))}
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