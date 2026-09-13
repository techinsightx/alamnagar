"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Crosshair, Heart, Skull, Trophy, Play, RotateCcw, Volume2, VolumeX, Target, Shield, Zap } from "lucide-react";
import Link from "next/link";

// ✅ Audio Engine for Punchy Shooter Sounds
const playSound = (type: 'shoot' | 'hit' | 'kill' | 'gameover' | 'booyah') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'shoot') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'hit') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'kill') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'gameover') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 1);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 1);
    } else if (type === 'booyah') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.6);
    }
  } catch (e) {}
};

type EnemyType = 'grunt' | 'tank' | 'boss';
type WeaponType = 'pistol' | 'rifle' | 'shotgun';
type PowerUpType = 'health' | 'rifle' | 'shotgun';

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
  type: EnemyType;
  emoji: string;
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

interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: PowerUpType;
  size: number;
  emoji: string;
}

const WEAPONS: Record<WeaponType, { fireRate: number; speed: number; damage: number; spread: number; color: string; name: string }> = {
  pistol: { fireRate: 300, speed: 1.5, damage: 1, spread: 1, color: '#fbbf24', name: 'PISTOL' },
  rifle: { fireRate: 100, speed: 2.0, damage: 1, spread: 1, color: '#3b82f6', name: 'RIFLE' },
  shotgun: { fireRate: 600, speed: 1.2, damage: 1, spread: 5, color: '#ef4444', name: 'SHOTGUN' },
};

export default function AlamnagarStrike() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [wave, setWave] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [screenShake, setScreenShake] = useState(0);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('pistol');
  const [weaponTimer, setWeaponTimer] = useState(0);

  const playerRef = useRef({ x: 50, y: 50, size: 24 });
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

  useEffect(() => {
    currentWeaponRef.current = currentWeapon;
  }, [currentWeapon]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setHealth(100);
    setWave(1);
    setCurrentWeapon('pistol');
    setWeaponTimer(0);
    scoreRef.current = 0;
    healthRef.current = 100;
    playerRef.current = { x: 50, y: 50, size: 24 };
    bulletsRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    powerUpsRef.current = [];
    if (soundEnabled) playSound('booyah');
  };

  const spawnEnemy = useCallback(() => {
    const side = Math.floor(Math.random() * 4);
    let x = 50, y = 50;
    if (side === 0) { x = Math.random() * 100; y = -5; }
    if (side === 1) { x = 105; y = Math.random() * 100; }
    if (side === 2) { x = Math.random() * 100; y = 105; }
    if (side === 3) { x = -5; y = Math.random() * 100; }

    let type: EnemyType = 'grunt';
    let size = 20;
    let hp = 1 + Math.floor(wave / 3);
    let color = '#ef4444';
    let emoji = '🧟';
    let speedMultiplier = 1;

    const rand = Math.random();
    if (wave >= 3 && rand > 0.85) {
      type = 'boss';
      size = 40;
      hp = 5 + wave;
      color = '#a855f7';
      emoji = '👿';
      speedMultiplier = 0.6;
    } else if (wave >= 2 && rand > 0.6) {
      type = 'tank';
      size = 30;
      hp = 3 + Math.floor(wave / 2);
      color = '#22c55e';
      emoji = '🤖';
      speedMultiplier = 0.8;
    }

    const speed = (0.15 + (wave * 0.015)) * speedMultiplier;
    
    enemiesRef.current.push({
      id: Date.now() + Math.random(),
      x, y, vx: 0, vy: 0,
      size, color, hp, maxHp: hp, type, emoji
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
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -10 || b.x > 110 || b.y < -10 || b.y > 110) {
          bullets.splice(i, 1);
        }
      }

      // 2. Move Enemies & Collision with Player
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const dx = player.x - e.x;
        const dy = player.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = (0.15 + (wave * 0.015)) * (e.type === 'boss' ? 0.6 : e.type === 'tank' ? 0.8 : 1);
        
        e.vx = (dx / dist) * speed;
        e.vy = (dy / dist) * speed;
        e.x += e.vx;
        e.y += e.vy;

        if (dist < (player.size + e.size) / 2) {
          healthRef.current -= (e.type === 'boss' ? 20 : e.type === 'tank' ? 15 : 10);
          setHealth(Math.max(0, healthRef.current));
          enemies.splice(i, 1);
          setScreenShake(10);
          if (soundEnabled) playSound('hit');
          
          for (let p = 0; p < 8; p++) {
            particles.push({
              id: Math.random(), x: player.x, y: player.y,
              vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5,
              life: 1, color: '#ef4444', size: 4
            });
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
          const dx = b.x - e.x;
          const dy = b.y - e.y;
          if (Math.sqrt(dx * dx + dy * dy) < (b.size + e.size) / 2) {
            e.hp -= b.damage;
            hit = true;
            
            for (let p = 0; p < 3; p++) {
              particles.push({
                id: Math.random(), x: e.x, y: e.y,
                vx: (Math.random() - 0.5), vy: (Math.random() - 0.5),
                life: 0.5, color: '#ffffff', size: 2
              });
            }

            if (e.hp <= 0) {
              enemies.splice(j, 1);
              const points = e.type === 'boss' ? 50 : e.type === 'tank' ? 20 : 10;
              scoreRef.current += points;
              setScore(scoreRef.current);
              if (soundEnabled) playSound('kill');
              setScreenShake(e.type === 'boss' ? 15 : 5);
              
              for (let p = 0; p < 12; p++) {
                particles.push({
                  id: Math.random(), x: e.x, y: e.y,
                  vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
                  life: 1, color: e.color, size: 5
                });
              }

              // Drop PowerUp Chance (15%)
              if (Math.random() < 0.15) {
                const pType = Math.random() > 0.5 ? 'health' : (Math.random() > 0.5 ? 'rifle' : 'shotgun');
                powerUpsRef.current.push({
                  id: Date.now() + Math.random(),
                  x: e.x, y: e.y,
                  type: pType,
                  size: 20,
                  emoji: pType === 'health' ? '❤️' : pType === 'rifle' ? '🔫' : '💥'
                });
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
        const dx = player.x - p.x;
        const dy = player.y - p.y;
        if (Math.sqrt(dx * dx + dy * dy) < (player.size + p.size) / 2) {
          if (p.type === 'health') {
            healthRef.current = Math.min(100, healthRef.current + 30);
            setHealth(healthRef.current);
          } else {
            currentWeaponRef.current = p.type as WeaponType;
            setCurrentWeapon(p.type as WeaponType);
            weaponTimerRef.current = 600; // 10 seconds at 60fps
            setWeaponTimer(600);
          }
          powerUps.splice(i, 1);
          if (soundEnabled) playSound('booyah');
        }
      }

      // 5. Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
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
      const spawnRate = Math.max(20, 60 - wave * 3);
      if (enemySpawnTimer > spawnRate) {
        spawnEnemy();
        if (wave > 3 && Math.random() > 0.7) spawnEnemy();
        enemySpawnTimer = 0;
      }

      // 8. Wave Progression
      if (scoreRef.current > wave * 150) {
        setWave(w => w + 1);
      }

      if (screenShake > 0) setScreenShake(s => Math.max(0, s - 1));

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameState, wave, highScore, soundEnabled, spawnEnemy, screenShake]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (gameState !== 'playing' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    mouseRef.current = { x, y };
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
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (weapon.spread === 1) {
      bulletsRef.current.push({
        id: Date.now(),
        x: player.x, y: player.y,
        vx: (dx / dist) * weapon.speed,
        vy: (dy / dist) * weapon.speed,
        size: 5,
        color: weapon.color,
        damage: weapon.damage
      });
    } else {
      for (let i = 0; i < weapon.spread; i++) {
        const angleOffset = (i - (weapon.spread - 1) / 2) * 0.15;
        const cos = Math.cos(angleOffset);
        const sin = Math.sin(angleOffset);
        const vx = ((dx / dist) * cos - (dy / dist) * sin) * weapon.speed;
        const vy = ((dx / dist) * sin + (dy / dist) * cos) * weapon.speed;
        
        bulletsRef.current.push({
          id: Date.now() + i,
          x: player.x, y: player.y,
          vx, vy,
          size: 4,
          color: weapon.color,
          damage: weapon.damage
        });
      }
    }

    if (soundEnabled) playSound('shoot');
    setScreenShake(2);
  }, [gameState, soundEnabled]);

  return (
    <div className="min-h-screen bg-stone-950 relative overflow-hidden select-none touch-none font-sans text-white">
      {/* Tactical Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-800 via-stone-950 to-black" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{ 
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} 
        />
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
            
            <div className="flex items-center gap-3">
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
              {currentWeapon !== 'pistol' && (
                <div className="bg-blue-500/20 border border-blue-400/50 px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-blue-300">{Math.ceil(weaponTimer / 60)}s</span>
                </div>
              )}
            </div>
            <div className="text-sm font-bold text-stone-400 bg-black/40 px-3 py-1 rounded-full border border-white/5">WAVE {wave}</div>
          </div>
        )}
      </div>

      {/* Game Canvas Area */}
      <div 
        ref={canvasRef}
        className="absolute inset-0 z-10 cursor-crosshair"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        style={{
          transform: screenShake > 0 ? `translate(${(Math.random()-0.5)*screenShake}px, ${(Math.random()-0.5)*screenShake}px)` : 'none'
        }}
      >
        {gameState === 'playing' && (
          <>
            {/* PowerUps */}
            {powerUpsRef.current.map(p => (
              <motion.div
                key={p.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1, y: [0, -5, 0] }}
                transition={{ y: { duration: 1, repeat: Infinity, ease: "easeInOut" } }}
                className="absolute flex items-center justify-center z-10"
                style={{ 
                  left: `${p.x}%`, top: `${p.y}%`, 
                  width: `${p.size * 1.5}px`, height: `${p.size * 1.5}px`,
                  marginLeft: `-${p.size * 0.75}px`, marginTop: `-${p.size * 0.75}px`,
                }}
              >
                <div className={`w-full h-full rounded-full flex items-center justify-center text-2xl shadow-[0_0_20px_currentColor] ${
                  p.type === 'health' ? 'bg-red-500/30 text-red-400' : 
                  p.type === 'rifle' ? 'bg-blue-500/30 text-blue-400' : 'bg-orange-500/30 text-orange-400'
                }`}>
                  {p.emoji}
                </div>
              </motion.div>
            ))}

            {/* Player */}
            <div 
              className="absolute flex flex-col items-center justify-center z-20"
              style={{ left: `${playerRef.current.x}%`, top: `${playerRef.current.y}%` }}
            >
              <div className="relative">
                <div className={`w-12 h-12 rounded-full bg-stone-900 border-2 ${
                  currentWeapon === 'shotgun' ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.5)]' :
                  currentWeapon === 'rifle' ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' :
                  'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.5)]'
                } flex items-center justify-center`}>
                  <Crosshair className={`w-6 h-6 ${
                    currentWeapon === 'shotgun' ? 'text-orange-400' :
                    currentWeapon === 'rifle' ? 'text-blue-400' : 'text-yellow-400'
                  }`} />
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-[10px] font-black bg-black/70 px-2 py-0.5 rounded text-white border border-white/20">
                    {WEAPONS[currentWeapon].name}
                  </span>
                </div>
              </div>
            </div>

            {/* Bullets */}
            {bulletsRef.current.map(b => (
              <div
                key={b.id}
                className="absolute rounded-full z-10"
                style={{ 
                  left: `${b.x}%`, top: `${b.y}%`, 
                  width: `${b.size * 2}px`, height: `${b.size * 2}px`,
                  marginLeft: `-${b.size}px`, marginTop: `-${b.size}px`,
                  backgroundColor: b.color,
                  boxShadow: `0 0 10px ${b.color}, 0 0 20px ${b.color}`
                }}
              />
            ))}

            {/* Enemies */}
            {enemiesRef.current.map(e => (
              <div
                key={e.id}
                className="absolute flex flex-col items-center justify-center z-10"
                style={{ 
                  left: `${e.x}%`, top: `${e.y}%`, 
                  width: `${e.size * 1.5}px`, height: `${e.size * 1.5}px`, 
                  marginLeft: `-${e.size * 0.75}px`, marginTop: `-${e.size * 0.75}px`,
                }}
              >
                {e.maxHp > 1 && (
                  <div className="w-full h-1.5 bg-black/50 rounded-full mb-1 overflow-hidden border border-white/20">
                    <div 
                      className="h-full bg-green-500 transition-all duration-100" 
                      style={{ width: `${(e.hp / e.maxHp) * 100}%` }} 
                    />
                  </div>
                )}
                <div 
                  className="w-full h-full rounded-full flex items-center justify-center text-3xl md:text-4xl border-2 border-black/30"
                  style={{ 
                    backgroundColor: `${e.color}30`,
                    boxShadow: `0 0 25px ${e.color}`,
                    borderColor: e.color
                  }}
                >
                  {e.emoji}
                </div>
              </div>
            ))}

            {/* Particles */}
            {particlesRef.current.map(p => (
              <div
                key={p.id}
                className="absolute rounded-full pointer-events-none"
                style={{ 
                  left: `${p.x}%`, top: `${p.y}%`, 
                  width: `${p.size * 2}px`, height: `${p.size * 2}px`,
                  marginLeft: `-${p.size}px`, marginTop: `-${p.size}px`,
                  backgroundColor: p.color,
                  opacity: p.life
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Menu Screen */}
      <AnimatePresence>
        {gameState === 'menu' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-stone-900/90 border border-yellow-500/30 p-8 md:p-12 rounded-3xl text-center max-w-md w-full shadow-[0_0_50px_rgba(234,179,8,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
              
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-7xl mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">🎯</motion.div>
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-2">
                ALAMNAGAR STRIKE
              </h1>
              <p className="text-stone-400 mb-8 font-medium">Survive the waves. Protect the village. Collect weapons!</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
                  <div className="flex items-center justify-center gap-2 text-stone-400 text-sm font-bold mb-1">
                    <Trophy className="w-4 h-4 text-yellow-500" /> Best Score
                  </div>
                  <div className="text-2xl font-black text-white">{highScore}</div>
                </div>
                <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
                  <div className="flex items-center justify-center gap-2 text-stone-400 text-sm font-bold mb-1">
                    <Shield className="w-4 h-4 text-blue-500" /> Weapons
                  </div>
                  <div className="text-xs text-stone-300">Pistol, Rifle, Shotgun</div>
                </div>
              </div>

              <button 
                onClick={startGame}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-black text-xl py-4 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-lg shadow-orange-500/30 group"
              >
                <Play className="w-6 h-6 fill-black group-hover:scale-110 transition-transform" /> DEPLOY NOW
              </button>
              <p className="text-xs text-stone-500 mt-4">Mouse/Touch to Aim & Shoot • Collect ❤️ 🔫 💥</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Screen */}
      <AnimatePresence>
        {gameState === 'gameover' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-red-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-stone-900/90 border border-red-500/30 p-8 md:p-12 rounded-3xl text-center max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.2)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
              
              <h1 className="text-5xl font-black text-red-500 mb-2 tracking-tighter drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">ELIMINATED</h1>
              <p className="text-stone-400 mb-8">The village has fallen.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
                  <div className="text-xs text-stone-400 font-bold uppercase mb-1">Score</div>
                  <div className="text-3xl font-black text-white">{score}</div>
                </div>
                <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
                  <div className="text-xs text-stone-400 font-bold uppercase mb-1">Wave Reached</div>
                  <div className="text-3xl font-black text-yellow-400">{wave}</div>
                </div>
              </div>

              <button 
                onClick={startGame}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-xl py-4 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-lg shadow-red-500/30 group"
              >
                <RotateCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" /> RETRY MISSION
              </button>
              <Link href="/" className="block mt-6 text-stone-400 hover:text-white font-bold text-sm transition-colors">
                ← Return to Base
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}