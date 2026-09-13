"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Trophy, Play, RotateCcw, Volume2, VolumeX, Target, Zap, MapPin, Trees, Building2, AlertTriangle
} from "lucide-react";
import Link from "next/link";

// ✅ Audio Engine
const playSound = (type: 'shoot' | 'hit' | 'kill' | 'explode' | 'gameover' | 'booyah') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    
    if (type === 'shoot') {
      osc.type = 'square'; osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
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

// ✅ Realistic SVG Enemy Components
const DakuEnemy = ({ isWalking, color }: { isWalking: boolean; color: string }) => (
  <svg viewBox="0 0 60 100" className="w-full h-full" style={{ filter: `drop-shadow(0 0 10px ${color})` }}>
    {/* Head */}
    <circle cx="30" cy="15" r="12" fill="#8B4513" />
    {/* Bandana */}
    <path d="M 18 12 Q 30 8 42 12 L 42 18 Q 30 14 18 18 Z" fill="#DC143C" />
    {/* Eyes */}
    <circle cx="26" cy="14" r="2" fill="white" />
    <circle cx="34" cy="14" r="2" fill="white" />
    <circle cx="26" cy="14" r="1" fill="black" />
    <circle cx="34" cy="14" r="1" fill="black" />
    {/* Body */}
    <rect x="20" y="27" width="20" height="30" rx="3" fill="#2F4F4F" />
    {/* Arms */}
    <rect x="10" y="30" width="10" height="25" rx="5" fill="#8B4513" className={isWalking ? "animate-swing-left" : ""} style={{ transformOrigin: '15px 30px' }} />
    <rect x="40" y="30" width="10" height="25" rx="5" fill="#8B4513" className={isWalking ? "animate-swing-right" : ""} style={{ transformOrigin: '45px 30px' }} />
    {/* Legs */}
    <rect x="22" y="57" width="8" height="30" rx="4" fill="#1a1a1a" className={isWalking ? "animate-walk-left" : ""} style={{ transformOrigin: '26px 57px' }} />
    <rect x="30" y="57" width="8" height="30" rx="4" fill="#1a1a1a" className={isWalking ? "animate-walk-right" : ""} style={{ transformOrigin: '34px 57px' }} />
    {/* Weapon (Gun) */}
    <rect x="45" y="40" width="15" height="6" rx="2" fill="#333" />
  </svg>
);

const TigerEnemy = ({ isWalking, color }: { isWalking: boolean; color: string }) => (
  <svg viewBox="0 0 80 60" className="w-full h-full" style={{ filter: `drop-shadow(0 0 10px ${color})` }}>
    {/* Body */}
    <ellipse cx="40" cy="35" rx="25" ry="18" fill="#FF8C00" />
    {/* Stripes */}
    <path d="M 25 25 L 30 35 M 35 22 L 38 35 M 45 22 L 42 35 M 55 25 L 50 35" stroke="black" strokeWidth="2" />
    {/* Head */}
    <circle cx="15" cy="25" r="12" fill="#FF8C00" />
    {/* Ears */}
    <circle cx="8" cy="18" r="4" fill="#FF8C00" />
    <circle cx="22" cy="18" r="4" fill="#FF8C00" />
    {/* Eyes */}
    <circle cx="12" cy="23" r="2" fill="yellow" />
    <circle cx="18" cy="23" r="2" fill="yellow" />
    <circle cx="12" cy="23" r="1" fill="black" />
    <circle cx="18" cy="23" r="1" fill="black" />
    {/* Legs */}
    <rect x="25" y="45" width="6" height="15" rx="3" fill="#FF8C00" className={isWalking ? "animate-walk-left" : ""} style={{ transformOrigin: '28px 45px' }} />
    <rect x="35" y="45" width="6" height="15" rx="3" fill="#FF8C00" className={isWalking ? "animate-walk-right" : ""} style={{ transformOrigin: '38px 45px' }} />
    <rect x="45" y="45" width="6" height="15" rx="3" fill="#FF8C00" className={isWalking ? "animate-walk-left" : ""} style={{ transformOrigin: '48px 45px' }} />
    <rect x="55" y="45" width="6" height="15" rx="3" fill="#FF8C00" className={isWalking ? "animate-walk-right" : ""} style={{ transformOrigin: '58px 45px' }} />
    {/* Tail */}
    <path d="M 65 35 Q 75 30 78 25" stroke="#FF8C00" strokeWidth="4" fill="none" />
  </svg>
);

const AlienEnemy = ({ isWalking, color }: { isWalking: boolean; color: string }) => (
  <svg viewBox="0 0 60 100" className="w-full h-full" style={{ filter: `drop-shadow(0 0 15px ${color})` }}>
    {/* Head (Large) */}
    <ellipse cx="30" cy="20" rx="18" ry="22" fill="#90EE90" />
    {/* Eyes (Big black) */}
    <ellipse cx="22" cy="18" rx="6" ry="8" fill="black" />
    <ellipse cx="38" cy="18" rx="6" ry="8" fill="black" />
    <circle cx="22" cy="18" r="2" fill="white" />
    <circle cx="38" cy="18" r="2" fill="white" />
    {/* Body */}
    <rect x="20" y="42" width="20" height="35" rx="5" fill="#708090" />
    {/* Arms (Long) */}
    <rect x="5" y="45" width="15" height="8" rx="4" fill="#90EE90" className={isWalking ? "animate-swing-left" : ""} style={{ transformOrigin: '12px 45px' }} />
    <rect x="40" y="45" width="15" height="8" rx="4" fill="#90EE90" className={isWalking ? "animate-swing-right" : ""} style={{ transformOrigin: '48px 45px' }} />
    {/* Legs */}
    <rect x="22" y="77" width="8" height="20" rx="4" fill="#708090" className={isWalking ? "animate-walk-left" : ""} style={{ transformOrigin: '26px 77px' }} />
    <rect x="30" y="77" width="8" height="20" rx="4" fill="#708090" className={isWalking ? "animate-walk-right" : ""} style={{ transformOrigin: '34px 77px' }} />
    {/* Antenna */}
    <line x1="30" y1="0" x2="30" y2="10" stroke="#90EE90" strokeWidth="2" />
    <circle cx="30" cy="0" r="3" fill="yellow" />
  </svg>
);

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
  type: 'health' | 'rapid' | 'spread';
  size: number;
  emoji: string;
}

const ENVIRONMENTS: Record<Environment, { 
  name: string; 
  hindiName: string;
  icon: any; 
  bg: string; 
  overlay: string;
  enemyType: 'daku' | 'tiger' | 'alien';
  enemyColor: string;
}> = {
  gali: { 
    name: "Gali Muhalla", 
    hindiName: "गली मुहल्ला",
    icon: MapPin, 
    bg: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1920&auto=format&fit=crop",
    overlay: "bg-amber-950/60",
    enemyType: 'daku',
    enemyColor: "#DC143C"
  },
  jungle: { 
    name: "Jadui Jungle", 
    hindiName: "जादुई जंगल",
    icon: Trees, 
    bg: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1920&auto=format&fit=crop",
    overlay: "bg-emerald-950/70",
    enemyType: 'tiger',
    enemyColor: "#FF8C00"
  },
  city: { 
    name: "City Center", 
    hindiName: "शहर का केंद्र",
    icon: Building2, 
    bg: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1920&auto=format&fit=crop",
    overlay: "bg-slate-900/70",
    enemyType: 'alien',
    enemyColor: "#90EE90"
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

  const playerRef = useRef({ x: 50, y: 80 });
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const mouseRef = useRef({ x: 50, y: 80 });
  const frameRef = useRef<number>(0);
  const lastShotRef = useRef(0);
  const scoreRef = useRef(0);
  const healthRef = useRef(100);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("alamnagarStrikeHighScore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = (env?: Environment) => {
    if (env) setSelectedEnv(env);
    setGameState('playing');
    setScore(0); setHealth(100); setWave(1);
    setWarningText(null);
    scoreRef.current = 0; healthRef.current = 100;
    playerRef.current = { x: 50, y: 80 };
    mouseRef.current = { x: 50, y: 80 };
    bulletsRef.current = []; enemiesRef.current = [];
    particlesRef.current = []; powerUpsRef.current = [];
    if (soundEnabled) playSound('booyah');
  };

  const spawnEnemy = useCallback(() => {
    const env = ENVIRONMENTS[selectedEnv];
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const x = side === 'left' ? -10 : 110;
    const y = 72 + Math.random() * 8;

    const isBoss = wave >= 3 && Math.random() > 0.8;
    const size = isBoss ? 80 : 60;
    const hp = isBoss ? 5 + wave : 1 + Math.floor(wave / 2);

    const directionText = side === 'left' ? "बाएं (Left)" : "दाएं (Right)";
    setWarningText(`⚠️ चेतावनी: ${directionText} से ${isBoss ? 'बॉस ' : ''}दुश्मन आ रहा है!`);
    setTimeout(() => setWarningText(null), 2500);

    enemiesRef.current.push({
      id: Date.now() + Math.random(), x, y,
      vx: 0, vy: 0,
      size, color: env.enemyColor, hp, maxHp: hp, type: env.enemyType, side,
      walkFrame: 0
    });
  }, [wave, selectedEnv]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    let enemySpawnTimer = 0;
    
    const loop = () => {
      const player = playerRef.current;
      const bullets = bulletsRef.current;
      const enemies = enemiesRef.current;
      const particles = particlesRef.current;

      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx; b.y += b.vy;
        if (b.x < -10 || b.x > 110 || b.y < -10 || b.y > 110) bullets.splice(i, 1);
      }

      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const dx = player.x - e.x;
        const dist = Math.abs(dx);
        const speed = 0.15 + (wave * 0.02);
        
        e.vx = (dx > 0 ? 1 : -1) * speed;
        e.x += e.vx;
        e.walkFrame += 0.15;

        if (dist < (20 + e.size) / 2 && Math.abs(player.y - e.y) < 20) {
          healthRef.current -= (e.size > 70 ? 20 : 10);
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

              if (Math.random() < 0.2) {
                const types: PowerUp['type'][] = ['health', 'rapid', 'spread'];
                const pType = types[Math.floor(Math.random() * types.length)];
                const emojis = { health: '❤️', rapid: '⚡', spread: '🔥' };
                powerUpsRef.current.push({ id: Date.now() + Math.random(), x: e.x, y: e.y, type: pType, size: 20, emoji: emojis[pType] });
              }
            }
            break;
          }
        }
        if (hit) bullets.splice(i, 1);
      }

      for (let i = powerUpsRef.current.length - 1; i >= 0; i--) {
        const p = powerUpsRef.current[i];
        const dx = player.x - p.x; const dy = player.y - p.y;
        if (Math.sqrt(dx * dx + dy * dy) < 30) {
          if (p.type === 'health') {
            healthRef.current = Math.min(100, healthRef.current + 30);
            setHealth(healthRef.current);
          }
          powerUpsRef.current.splice(i, 1);
          if (soundEnabled) playSound('booyah');
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
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
    playerRef.current = { x, y };
  }, [gameState]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (gameState !== 'playing') return;
    e.preventDefault();
    const now = Date.now();
    if (now - lastShotRef.current < 150) return;
    lastShotRef.current = now;

    const player = playerRef.current;
    bulletsRef.current.push({
      id: Date.now(), x: player.x, y: player.y - 5,
      vx: 0, vy: -2.5,
      size: 6, color: '#fbbf24', damage: 1
    });
    if (soundEnabled) playSound('shoot');
    setScreenShake(2);
  }, [gameState, soundEnabled]);

  const env = ENVIRONMENTS[selectedEnv];
  const EnvIcon = env.icon;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden select-none touch-none font-sans text-white">
      <style>{`
        @keyframes walk-left {
          0%, 100% { transform: rotate(-20deg); }
          50% { transform: rotate(20deg); }
        }
        @keyframes walk-right {
          0%, 100% { transform: rotate(20deg); }
          50% { transform: rotate(-20deg); }
        }
        @keyframes swing-left {
          0%, 100% { transform: rotate(-30deg); }
          50% { transform: rotate(30deg); }
        }
        @keyframes swing-right {
          0%, 100% { transform: rotate(30deg); }
          50% { transform: rotate(-30deg); }
        }
        .animate-walk-left { animation: walk-left 0.4s ease-in-out infinite; }
        .animate-walk-right { animation: walk-right 0.4s ease-in-out infinite; }
        .animate-swing-left { animation: swing-left 0.4s ease-in-out infinite; }
        .animate-swing-right { animation: swing-right 0.4s ease-in-out infinite; }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000" style={{ backgroundImage: `url(${env.bg})` }} />
        <div className={`absolute inset-0 ${env.overlay} transition-all duration-1000`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      </div>

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

      <div 
        ref={canvasRef}
        className="absolute inset-0 z-10 cursor-crosshair"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        style={{ transform: screenShake > 0 ? `translate(${(Math.random()-0.5)*screenShake}px, ${(Math.random()-0.5)*screenShake}px)` : 'none' }}
      >
        {gameState === 'playing' && (
          <>
            {powerUpsRef.current.map(p => (
              <motion.div key={p.id} initial={{ scale: 0 }} animate={{ scale: 1, y: [0, -8, 0] }} transition={{ y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } }}
                className="absolute flex items-center justify-center z-10"
                style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.size * 1.5}px`, height: `${p.size * 1.5}px`, marginLeft: `-${p.size * 0.75}px`, marginTop: `-${p.size * 0.75}px` }}>
                <div className={`w-full h-full rounded-full flex items-center justify-center text-2xl shadow-[0_0_25px_currentColor] bg-black/50 border-2 border-white/20`}>
                  {p.emoji}
                </div>
              </motion.div>
            ))}

            <div className="absolute z-30 pointer-events-none" style={{ left: `${playerRef.current.x}%`, top: `${playerRef.current.y}%`, transform: 'translate(-50%, -50%)' }}>
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-500/30 rounded-full blur-xl" />
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" fill="#333" stroke="#fbbf24" strokeWidth="1.5"/>
                  <circle cx="12" cy="13" r="3" fill="#fbbf24" />
                </svg>
              </div>
            </div>

            {bulletsRef.current.map(b => (
              <div key={b.id} className="absolute rounded-full z-10"
                style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.size}px`, height: `${b.size * 3}px`, marginLeft: `-${b.size/2}px`, marginTop: `-${b.size * 1.5}px`, backgroundColor: b.color, boxShadow: `0 0 10px ${b.color}, 0 0 20px ${b.color}` }} />
            ))}

            {enemiesRef.current.map(e => (
              <div key={e.id} className="absolute flex flex-col items-center justify-center z-20"
                style={{ left: `${e.x}%`, top: `${e.y}%`, width: `${e.size}px`, height: `${e.size * 1.5}px`, marginLeft: `-${e.size/2}px`, marginTop: `-${e.size * 0.75}px` }}>
                {e.maxHp > 1 && (
                  <div className="w-full h-1.5 bg-black/50 rounded-full mb-1 overflow-hidden border border-white/20 absolute -top-3">
                    <div className="h-full bg-green-500 transition-all duration-100" style={{ width: `${(e.hp / e.maxHp) * 100}%` }} />
                  </div>
                )}
                <div className="w-full h-full relative">
                  {e.type === 'daku' && <DakuEnemy isWalking={true} color={e.color} />}
                  {e.type === 'tiger' && <TigerEnemy isWalking={true} color={e.color} />}
                  {e.type === 'alien' && <AlienEnemy isWalking={true} color={e.color} />}
                </div>
                <div className="absolute -bottom-1 w-3/4 h-2 bg-black/50 rounded-full blur-sm" />
              </div>
            ))}

            {particlesRef.current.map(p => (
              <div key={p.id} className="absolute rounded-full pointer-events-none"
                style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.size * 2}px`, height: `${p.size * 2}px`, marginLeft: `-${p.size}px`, marginTop: `-${p.size}px`, backgroundColor: p.color, opacity: p.life, boxShadow: `0 0 10px ${p.color}` }} />
            ))}
          </>
        )}
      </div>

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