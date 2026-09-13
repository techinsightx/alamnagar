"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
// ✅ FIX: Added ArrowLeft to the imports
import { ArrowLeft, Crosshair, Heart, Skull, Trophy, Play, RotateCcw, Volume2, VolumeX, Target } from "lucide-react";
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

interface Entity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  hp: number;
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

export default function AlamnagarStrike() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [wave, setWave] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [screenShake, setScreenShake] = useState(0);

  // Game refs for 60FPS performance without React re-renders
  const playerRef = useRef({ x: 50, y: 50, size: 20 });
  const bulletsRef = useRef<Entity[]>([]);
  const enemiesRef = useRef<Entity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 50, y: 50 });
  const frameRef = useRef<number>(0);
  const lastShotRef = useRef(0);
  const scoreRef = useRef(0);
  const healthRef = useRef(100);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("alamnagarStrikeHighScore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setHealth(100);
    setWave(1);
    scoreRef.current = 0;
    healthRef.current = 100;
    playerRef.current = { x: 50, y: 50, size: 20 };
    bulletsRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    if (soundEnabled) playSound('booyah');
  };

  const spawnEnemy = useCallback(() => {
    const side = Math.floor(Math.random() * 4);
    let x = 50, y = 50;
    if (side === 0) { x = Math.random() * 100; y = -5; } // Top
    if (side === 1) { x = 105; y = Math.random() * 100; } // Right
    if (side === 2) { x = Math.random() * 100; y = 105; } // Bottom
    if (side === 3) { x = -5; y = Math.random() * 100; } // Left

    const speed = 0.15 + (wave * 0.02);
    enemiesRef.current.push({
      id: Date.now() + Math.random(),
      x, y,
      vx: 0, vy: 0, // Calculated in loop
      size: 15 + Math.random() * 10,
      color: Math.random() > 0.8 ? '#ef4444' : '#f97316', // Red or Orange
      hp: 1 + Math.floor(wave / 3)
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
        const speed = 0.15 + (wave * 0.015);
        
        e.vx = (dx / dist) * speed;
        e.vy = (dy / dist) * speed;
        e.x += e.vx;
        e.y += e.vy;

        // Hit Player
        if (dist < (player.size + e.size) / 2) {
          healthRef.current -= 10;
          setHealth(healthRef.current);
          enemies.splice(i, 1);
          setScreenShake(10);
          if (soundEnabled) playSound('hit');
          
          // Blood particles
          for (let p = 0; p < 5; p++) {
            particles.push({
              id: Math.random(), x: player.x, y: player.y,
              vx: (Math.random() - 0.5) * 1, vy: (Math.random() - 0.5) * 1,
              life: 1, color: '#ef4444', size: 3
            });
          }

          if (healthRef.current <= 0) {
            setGameState('gameover');
            if (soundEnabled) playSound('gameover');
            if (scoreRef.current > highScore) {
              setHighScore(scoreRef.current);
              localStorage.setItem("alamnagarStrikeHighScore", scoreRef.current.toString());
            }
            return; // Stop loop
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
            e.hp -= 1;
            hit = true;
            if (e.hp <= 0) {
              enemies.splice(j, 1);
              scoreRef.current += 10;
              setScore(scoreRef.current);
              if (soundEnabled) playSound('kill');
              setScreenShake(3);
              
              // Explosion particles
              for (let p = 0; p < 8; p++) {
                particles.push({
                  id: Math.random(), x: e.x, y: e.y,
                  vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5,
                  life: 1, color: e.color, size: 4
                });
              }
            }
            break;
          }
        }
        if (hit) bullets.splice(i, 1);
      }

      // 4. Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // 5. Spawn Enemies
      enemySpawnTimer++;
      if (enemySpawnTimer > Math.max(20, 60 - wave * 2)) {
        spawnEnemy();
        enemySpawnTimer = 0;
      }

      // 6. Wave Progression
      if (scoreRef.current > wave * 100) {
        setWave(w => w + 1);
      }

      // Decrease screen shake
      if (screenShake > 0) setScreenShake(s => Math.max(0, s - 1));

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameState, wave, highScore, soundEnabled, spawnEnemy, screenShake]);

  // ✅ Mouse/Touch Tracking
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (gameState !== 'playing' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    mouseRef.current = { x, y };
  }, [gameState]);

  // ✅ Shooting Mechanic
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (gameState !== 'playing') return;
    e.preventDefault(); // Prevent zoom/scroll
    
    const now = Date.now();
    if (now - lastShotRef.current < 150) return; // Fire rate limit
    lastShotRef.current = now;

    const player = playerRef.current;
    const mouse = mouseRef.current;
    const dx = mouse.x - player.x;
    const dy = mouse.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    const speed = 1.5;
    bulletsRef.current.push({
      id: Date.now(),
      x: player.x, y: player.y,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      size: 4,
      color: '#fbbf24',
      hp: 1
    });

    if (soundEnabled) playSound('shoot');
    setScreenShake(2);
  }, [gameState, soundEnabled]);

  return (
    <div className="min-h-screen bg-stone-950 relative overflow-hidden select-none touch-none font-sans">
      <style>{`
        @keyframes gridMove { 0% { background-position: 0 0; } 100% { background-position: 40px 40px; } }
      `}</style>

      {/* Tactical Grid Background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ 
          backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          animation: 'gridMove 2s linear infinite'
        }} 
      />

      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <Link href="/" className="flex items-center gap-2 text-white bg-black/50 backdrop-blur px-3 py-2 rounded-lg border border-white/20 hover:bg-black/70 transition">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-2 rounded-lg border border-white/20">
            {soundEnabled ? <Volume2 className="w-5 h-5 text-green-400" /> : <VolumeX className="w-5 h-5 text-red-400" />}
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-xs text-white font-bold">SOUND</button>
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="flex flex-col items-end gap-2">
            <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-lg border border-white/20 flex items-center gap-3">
              <Target className="w-5 h-5 text-yellow-400" />
              <span className="text-2xl font-black text-white">{score}</span>
            </div>
            <div className="w-48 h-6 bg-black/60 rounded-full border border-white/20 overflow-hidden relative">
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
            <div className="text-xs font-bold text-stone-400">WAVE {wave}</div>
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
            {/* Player */}
            <div 
              className="absolute w-10 h-10 -ml-5 -mt-5 rounded-full bg-blue-500 border-4 border-white shadow-[0_0_20px_rgba(59,130,246,0.8)] flex items-center justify-center z-20"
              style={{ left: `${playerRef.current.x}%`, top: `${playerRef.current.y}%` }}
            >
              <Crosshair className="w-6 h-6 text-white" />
            </div>

            {/* Bullets */}
            {bulletsRef.current.map(b => (
              <div
                key={b.id}
                className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-yellow-400 shadow-[0_0_10px_#fbbf24] z-10"
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
              />
            ))}

            {/* Enemies */}
            {enemiesRef.current.map(e => (
              <div
                key={e.id}
                className="absolute rounded-lg border-2 border-black flex items-center justify-center z-10"
                style={{ 
                  left: `${e.x}%`, top: `${e.y}%`, 
                  width: `${e.size}px`, height: `${e.size}px`, 
                  marginLeft: `-${e.size/2}px`, marginTop: `-${e.size/2}px`,
                  backgroundColor: e.color,
                  boxShadow: `0 0 15px ${e.color}`
                }}
              >
                <Skull className="w-1/2 h-1/2 text-black/50" />
              </div>
            ))}

            {/* Particles */}
            {particlesRef.current.map(p => (
              <div
                key={p.id}
                className="absolute rounded-full pointer-events-none"
                style={{ 
                  left: `${p.x}%`, top: `${p.y}%`, 
                  width: `${p.size}px`, height: `${p.size}px`,
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
            <div className="bg-stone-900 border-2 border-yellow-500/50 p-8 md:p-12 rounded-3xl text-center max-w-md w-full shadow-[0_0_50px_rgba(234,179,8,0.3)]">
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">🔫</motion.div>
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-2">
                ALAMNAGAR STRIKE
              </h1>
              <p className="text-stone-400 mb-8 font-medium">Survive the waves. Protect the village.</p>
              
              <div className="bg-stone-800 rounded-xl p-4 mb-8 flex items-center justify-between border border-stone-700">
                <span className="text-stone-400 font-bold flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Best Score</span>
                <span className="text-2xl font-black text-white">{highScore}</span>
              </div>

              <button 
                onClick={startGame}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-black text-xl py-4 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-lg shadow-orange-500/30"
              >
                <Play className="w-6 h-6 fill-black" /> DEPLOY NOW
              </button>
              <p className="text-xs text-stone-500 mt-4">Mouse/Touch to Aim & Shoot • Don't let them touch you!</p>
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
            <div className="bg-stone-900 border-2 border-red-500/50 p-8 md:p-12 rounded-3xl text-center max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.4)]">
              <h1 className="text-5xl font-black text-red-500 mb-2 tracking-tighter">ELIMINATED</h1>
              <p className="text-stone-400 mb-6">The village has fallen.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-stone-800 rounded-xl p-4 border border-stone-700">
                  <div className="text-xs text-stone-400 font-bold uppercase">Score</div>
                  <div className="text-3xl font-black text-white">{score}</div>
                </div>
                <div className="bg-stone-800 rounded-xl p-4 border border-stone-700">
                  <div className="text-xs text-stone-400 font-bold uppercase">Wave</div>
                  <div className="text-3xl font-black text-yellow-400">{wave}</div>
                </div>
              </div>

              <button 
                onClick={startGame}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-xl py-4 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-lg shadow-red-500/30"
              >
                <RotateCcw className="w-6 h-6" /> RETRY MISSION
              </button>
              <Link href="/" className="block mt-4 text-stone-400 hover:text-white font-bold text-sm transition-colors">
                ← Return to Base
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}