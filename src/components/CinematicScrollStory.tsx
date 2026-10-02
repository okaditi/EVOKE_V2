import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Trophy,
  Activity,
  Users,
  Award,
  Flame,
  Sword,
  RefreshCw,
  Crosshair,
  Layers,
  Radio,
} from 'lucide-react';
import { soundscape } from '../utils/audio';

interface CinematicScrollStoryProps {
  progress: number;
  onOpenWaitlist: () => void;
}

// Linear range clamp & map helper
function clampMap(
  val: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  if (val <= inMin) return outMin;
  if (val >= inMax) return outMax;
  const ratio = (val - inMin) / (inMax - inMin);
  return outMin + ratio * (outMax - outMin);
}

export const CinematicScrollStory: React.FC<CinematicScrollStoryProps> = ({
  progress,
  onOpenWaitlist,
}) => {
  const p = Math.min(Math.max(progress, 0), 1);
  const [activeGameMode, setActiveGameMode] = useState<number>(0);
  const [selectedWeapon, setSelectedWeapon] = useState<number>(0);

  // Hide completely on screen 1
  if (p < 0.07) return null;

  // -------------------------------------------------------------
  // NON-OVERLAPPING DISCRETE STAGE CALCULATION (CRISP & SMOOTH)
  // -------------------------------------------------------------

  // STAGE 1: GENESIS (0.08 -> 0.25)
  let s1Opacity = 0;
  let s1Y = 30;
  let s1Scale = 0.95;
  if (p >= 0.08 && p <= 0.26) {
    if (p < 0.14) {
      s1Opacity = clampMap(p, 0.08, 0.14, 0, 1);
      s1Y = clampMap(p, 0.08, 0.14, 30, 0);
      s1Scale = clampMap(p, 0.08, 0.14, 0.95, 1);
    } else if (p > 0.20) {
      s1Opacity = clampMap(p, 0.20, 0.26, 1, 0);
      s1Y = clampMap(p, 0.20, 0.26, 0, -30);
      s1Scale = clampMap(p, 0.20, 0.26, 1, 1.04);
    } else {
      s1Opacity = 1;
      s1Y = 0;
      s1Scale = 1;
    }
  }

  // STAGE 2: PLAY (0.27 -> 0.45)
  let s2Opacity = 0;
  let s2Y = 30;
  let s2Scale = 0.95;
  if (p >= 0.27 && p <= 0.46) {
    if (p < 0.33) {
      s2Opacity = clampMap(p, 0.27, 0.33, 0, 1);
      s2Y = clampMap(p, 0.27, 0.33, 30, 0);
      s2Scale = clampMap(p, 0.27, 0.33, 0.95, 1);
    } else if (p > 0.40) {
      s2Opacity = clampMap(p, 0.40, 0.46, 1, 0);
      s2Y = clampMap(p, 0.40, 0.46, 0, -30);
      s2Scale = clampMap(p, 0.40, 0.46, 1, 1.04);
    } else {
      s2Opacity = 1;
      s2Y = 0;
      s2Scale = 1;
    }
  }

  // STAGE 3: PROVE (0.47 -> 0.65)
  let s3Opacity = 0;
  let s3Y = 30;
  let s3Scale = 0.95;
  if (p >= 0.47 && p <= 0.66) {
    if (p < 0.53) {
      s3Opacity = clampMap(p, 0.47, 0.53, 0, 1);
      s3Y = clampMap(p, 0.47, 0.53, 30, 0);
      s3Scale = clampMap(p, 0.47, 0.53, 0.95, 1);
    } else if (p > 0.60) {
      s3Opacity = clampMap(p, 0.60, 0.66, 1, 0);
      s3Y = clampMap(p, 0.60, 0.66, 0, -30);
      s3Scale = clampMap(p, 0.60, 0.66, 1, 1.04);
    } else {
      s3Opacity = 1;
      s3Y = 0;
      s3Scale = 1;
    }
  }

  // STAGE 4: PROGRESS (0.67 -> 0.84)
  let s4Opacity = 0;
  let s4Y = 30;
  let s4Scale = 0.95;
  if (p >= 0.67 && p <= 0.85) {
    if (p < 0.73) {
      s4Opacity = clampMap(p, 0.67, 0.73, 0, 1);
      s4Y = clampMap(p, 0.67, 0.73, 30, 0);
      s4Scale = clampMap(p, 0.67, 0.73, 0.95, 1);
    } else if (p > 0.79) {
      s4Opacity = clampMap(p, 0.79, 0.85, 1, 0);
      s4Y = clampMap(p, 0.79, 0.85, 0, -30);
      s4Scale = clampMap(p, 0.79, 0.85, 1, 1.04);
    } else {
      s4Opacity = 1;
      s4Y = 0;
      s4Scale = 1;
    }
  }

  // STAGE 5: ARRIVAL & CTA (0.85 -> 1.0)
  let s5Opacity = 0;
  let s5Y = 30;
  let s5Scale = 0.95;
  if (p >= 0.84) {
    s5Opacity = clampMap(p, 0.84, 0.92, 0, 1);
    s5Y = clampMap(p, 0.84, 0.92, 30, 0);
    s5Scale = clampMap(p, 0.84, 0.92, 0.95, 1);
  }

  const bgOpacity = clampMap(p, 0.08, 0.22, 0.2, 0.55);

  const gameModes = [
    {
      id: '5v5',
      title: 'RADIANT 5V5 // TACTICAL',
      tagline: 'High-Stakes Search & Defuse',
      desc: 'Surgical voxel site destruction, abilities & 128 sub-tick gunplay.',
      players: '5v5 Ranked',
      tick: '128 Sub-Tick',
      icon: Crosshair,
      badge: 'RANKED'
    },
    {
      id: 'deathmatch',
      title: 'ARENA DEATHMATCH',
      tagline: 'Instant Respawn Aim Trainer',
      desc: 'Free-for-all warmups with unrestricted loadouts & recoil physics.',
      players: '12-Player FFA',
      tick: 'Instant Respawn',
      icon: Flame,
      badge: 'WARMUP'
    },
    {
      id: 'guild',
      title: 'GUILD SIEGE & WARFARE',
      tagline: '64-Player Voxel Conquest',
      desc: 'Massive destructible battlefields with siege engines & territory nodes.',
      players: '32v32 Large Scale',
      tick: 'Dynamic Terrain',
      icon: Shield,
      badge: 'GUILD WAR'
    }
  ];

  const weapons = [
    {
      name: 'VANDAL // CRIMSON VOXEL',
      type: 'Tactical Assault Rifle',
      damage: '160 Head / 40 Body',
      fireRate: '9.75 rds/sec',
      skin: 'Radiant Voxel Edition',
    },
    {
      name: 'OPERATOR // RADIANT APEX',
      type: 'Sub-Pixel Sniper Rifle',
      damage: '255 Head / 150 Body',
      fireRate: '0.75 rds/sec',
      skin: 'Mythic Gold Foil',
    },
    {
      name: 'KARAMBIT // VOXEL AURA',
      type: 'Tactical Melee Blade',
      damage: '150 Backstab',
      fireRate: 'Instant Spin',
      skin: 'Animated Chroma RGB',
    }
  ];

  const topPlayers = [
    { rank: '#1', tag: 'TENZ_VOXEL', rating: '3,420 RR', kd: '3.42', winRate: '84.2%', main: 'Jett Voxel' },
    { rank: '#2', tag: 'SHROUD_PIXEL', rating: '3,290 RR', kd: '3.18', winRate: '81.5%', main: 'Reyna Tactical' },
    { rank: '#3', tag: 'EVOKE_RADIANT', rating: '3,150 RR', kd: '2.95', winRate: '78.9%', main: 'Chamber Block' },
  ];

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none z-30 flex items-center justify-center px-4 pt-20 pb-8"
      style={{
        backgroundColor: `rgba(12, 10, 16, ${bgOpacity})`,
      }}
    >
      {/* Background Ambient Glow */}
      <div
        className="theme-story-aura absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full blur-[140px] pointer-events-none transition-opacity duration-500"
        style={{ opacity: clampMap(p, 0.12, 0.9, 0.3, 0.85) }}
      />



      {/* Main Container - Ensures centered view without blocking touch scroll */}
      <div className="relative w-full max-w-5xl flex items-center justify-center py-2 pointer-events-none">
        {/* ========================================================= */}
        {/* STAGE 1: MORE THAN A GAME.                                */}
        {/* ========================================================= */}
        {s1Opacity > 0.01 && (
          <div
            className="w-full flex flex-col items-center text-center px-2 sm:px-6 pointer-events-auto transition-all duration-300 ease-out"
            style={{
              opacity: s1Opacity,
              transform: `translate3d(0, ${s1Y}px, 0) scale(${s1Scale})`,
            }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 border border-[#A62B5F]/40 bg-[#A62B5F]/15 backdrop-blur-md rounded-full">
              <Radio className="w-3.5 h-3.5 theme-accent-text animate-pulse" />
              <span className="theme-accent-text font-mono font-bold text-[10px] sm:text-xs tracking-[0.3em] uppercase">
                GENESIS VOXEL INFRASTRUCTURE
              </span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-[#F4F0EA] uppercase leading-tight text-glow">
              MORE THAN <span className="theme-accent-text">A GAME.</span>
            </h2>

            <p className="mt-2 sm:mt-3 max-w-xl text-xs sm:text-sm text-[#F4F0EA]/80 font-sans leading-relaxed">
              EVOKE merges high-precision tactical esports mechanics with fully destructible voxel environments and kernel-validated competitive anti-cheat.
            </p>

            {/* 4 Telemetry Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 w-full max-w-4xl">
              <div className="p-3.5 sm:p-4 border border-white/15 bg-[#17141C]/85 backdrop-blur-md hover:border-[#A62B5F]/60 transition-all text-left">
                <div className="flex items-center justify-between mb-1.5">
                  <Zap className="w-4 h-4 theme-accent-text" />
                  <span className="font-mono text-[9px] text-[#F4F0EA]/50">NET-TICK</span>
                </div>
                <div className="font-display font-black text-lg sm:text-xl text-[#F4F0EA]">128 TICK</div>
                <div className="font-mono text-[10px] theme-highlight-text mt-0.5">14ms Global Sub-Tick</div>
              </div>

              <div className="p-3.5 sm:p-4 border border-white/15 bg-[#17141C]/85 backdrop-blur-md hover:border-[#A62B5F]/60 transition-all text-left">
                <div className="flex items-center justify-between mb-1.5">
                  <Layers className="w-4 h-4 theme-highlight-text" />
                  <span className="font-mono text-[9px] text-[#F4F0EA]/50">PHYSICS</span>
                </div>
                <div className="font-display font-black text-lg sm:text-xl text-[#F4F0EA]">VOXEL 4.0</div>
                <div className="font-mono text-[10px] theme-accent-text mt-0.5">Ray-Traced Destruction</div>
              </div>

              <div className="p-3.5 sm:p-4 border border-white/15 bg-[#17141C]/85 backdrop-blur-md hover:border-[#A62B5F]/60 transition-all text-left">
                <div className="flex items-center justify-between mb-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-[9px] text-[#F4F0EA]/50">SECURITY</span>
                </div>
                <div className="font-display font-black text-lg sm:text-xl text-[#F4F0EA]">KERNEL AI</div>
                <div className="font-mono text-[10px] text-emerald-400 mt-0.5">Active Behavioral Anticheat</div>
              </div>

              <div className="p-3.5 sm:p-4 border border-white/15 bg-[#17141C]/85 backdrop-blur-md hover:border-[#A62B5F]/60 transition-all text-left">
                <div className="flex items-center justify-between mb-1.5">
                  <Trophy className="w-4 h-4 theme-highlight-text" />
                  <span className="font-mono text-[9px] text-[#F4F0EA]/50">PRIZE POOL</span>
                </div>
                <div className="font-display font-black text-lg sm:text-xl text-[#F4F0EA]">$2.5M USD</div>
                <div className="font-mono text-[10px] theme-highlight-text mt-0.5">Genesis Circuit Launch</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 2: PLAY.                                            */}
        {/* ========================================================= */}
        {s2Opacity > 0.01 && (
          <div
            className="w-full flex flex-col items-center text-center px-2 sm:px-6 pointer-events-auto transition-all duration-300 ease-out"
            style={{
              opacity: s2Opacity,
              transform: `translate3d(0, ${s2Y}px, 0) scale(${s2Scale})`,
            }}
          >
            <h2 className="font-display font-black text-4xl sm:text-6xl md:text-7xl tracking-tight text-[#F4F0EA] uppercase leading-none mb-1 text-glow">
              PLAY<span className="theme-accent-text">.</span>
            </h2>
            <p className="font-mono text-xs theme-highlight-text uppercase tracking-[0.25em] mb-5 sm:mb-6">
              SELECT YOUR TACTICAL COMBAT PROTOCOL
            </p>

            {/* Game Modes Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full">
              {gameModes.map((mode, idx) => {
                const IconComp = mode.icon;
                const isSelected = activeGameMode === idx;
                return (
                  <div
                    key={mode.id}
                    onClick={() => {
                      soundscape.playClick(1100 + idx * 200);
                      setActiveGameMode(idx);
                    }}
                    className={`relative p-4 sm:p-5 text-left cursor-pointer transition-all duration-200 border ${
                      isSelected
                        ? 'theme-accent-border bg-[#17141C]/95 theme-accent-glow transform -translate-y-1'
                        : 'border-white/15 bg-[#17141C]/75 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[9px] font-bold px-2 py-0.5 border border-white/20 text-[#F4F0EA]/80 uppercase">
                        {mode.badge}
                      </span>
                      <IconComp className={`w-4 h-4 ${isSelected ? 'theme-accent-text' : 'text-[#F4F0EA]/50'}`} />
                    </div>

                    <h3 className="font-display font-bold text-sm sm:text-base text-[#F4F0EA] mb-0.5">
                      {mode.title}
                    </h3>
                    <div className="font-mono text-xs theme-highlight-text mb-2">
                      {mode.tagline}
                    </div>
                    <p className="text-xs text-[#F4F0EA]/75 leading-relaxed mb-3">
                      {mode.desc}
                    </p>

                    <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] sm:text-[11px] font-mono">
                      <span className="text-[#F4F0EA]/60">{mode.players}</span>
                      <span className="theme-accent-text font-bold">{mode.tick}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 inline-flex items-center gap-2.5 px-4 py-1.5 border border-white/15 bg-[#17141C]/85 backdrop-blur-md rounded-full">
              <Users className="w-3.5 h-3.5 theme-accent-text animate-pulse" />
              <span className="font-mono text-[11px] font-bold text-[#F4F0EA] tracking-widest">
                184,920 PLAYERS IN MATCHMAKING
              </span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 3: PROVE.                                           */}
        {/* ========================================================= */}
        {s3Opacity > 0.01 && (
          <div
            className="w-full flex flex-col items-center text-center px-2 sm:px-6 pointer-events-auto transition-all duration-300 ease-out"
            style={{
              opacity: s3Opacity,
              transform: `translate3d(0, ${s3Y}px, 0) scale(${s3Scale})`,
            }}
          >
            <h2 className="theme-accent-text theme-accent-glow-text font-display font-black text-4xl sm:text-6xl md:text-7xl tracking-tight uppercase leading-none mb-1">
              PROVE<span className="theme-highlight-text">.</span>
            </h2>
            <p className="font-mono text-xs text-[#F4F0EA]/80 uppercase tracking-[0.25em] mb-5 sm:mb-6">
              GLOBAL RADIANT LEADERBOARDS & METRICS
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left">
              {/* Leaderboards */}
              <div className="md:col-span-2 p-4 sm:p-5 border border-white/15 bg-[#17141C]/90 backdrop-blur-md">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 theme-accent-text" />
                    <span className="font-display font-bold text-xs sm:text-sm text-[#F4F0EA] tracking-wider uppercase">
                      RADIANT APEX STANDINGS
                    </span>
                  </div>
                  <span className="font-mono text-[10px] theme-highlight-text">SEASON 01 LIVE</span>
                </div>

                <div className="space-y-2.5">
                  {topPlayers.map((player) => (
                    <div
                      key={player.tag}
                      className="flex items-center justify-between p-2.5 sm:p-3 border border-white/10 bg-white/5 hover:border-[#A62B5F]/50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-display font-black text-base theme-accent-text w-5">
                          {player.rank}
                        </span>
                        <div>
                          <div className="font-display font-bold text-xs sm:text-sm text-[#F4F0EA]">
                            {player.tag}
                          </div>
                          <div className="font-mono text-[10px] text-[#F4F0EA]/60">
                            Main: {player.main} • Win%: {player.winRate}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-xs theme-highlight-text">
                          {player.rating}
                        </div>
                        <div className="font-mono text-[10px] text-emerald-400">
                          {player.kd} K/D
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Combat Accuracy Ratings */}
              <div className="p-4 sm:p-5 border border-white/15 bg-[#17141C]/90 backdrop-blur-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-2.5 border-b border-white/10 mb-3">
                    <Activity className="w-4 h-4 theme-highlight-text" />
                    <span className="font-display font-bold text-xs text-[#F4F0EA] tracking-wider uppercase">
                      COMBAT TELEMETRY
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-[11px] mb-1">
                        <span className="text-[#F4F0EA]/70">Headshot Accuracy</span>
                        <span className="theme-accent-text font-bold">68.4%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full theme-accent-bg w-[68%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-[11px] mb-1">
                        <span className="text-[#F4F0EA]/70">Clutch Win Rate</span>
                        <span className="theme-highlight-text font-bold">92.1%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full theme-accent-gradient w-[92%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-[11px] mb-1">
                        <span className="text-[#F4F0EA]/70">Avg Damage / Rd</span>
                        <span className="text-emerald-400 font-bold">184.2</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 w-[84%]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 text-center">
                  <span className="font-mono text-[9px] text-[#F4F0EA]/50 uppercase tracking-widest">
                    VERIFIED BY GENESIS KERNEL
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 4: PROGRESS.                                        */}
        {/* ========================================================= */}
        {s4Opacity > 0.01 && (
          <div
            className="w-full flex flex-col items-center text-center px-2 sm:px-6 pointer-events-auto transition-all duration-300 ease-out"
            style={{
              opacity: s4Opacity,
              transform: `translate3d(0, ${s4Y}px, 0) scale(${s4Scale})`,
            }}
          >
            <h2 className="font-display font-black text-4xl sm:text-6xl md:text-7xl tracking-tight text-[#F4F0EA] uppercase leading-none mb-1 text-glow">
              PROGRESS<span className="theme-accent-text">.</span>
            </h2>
            <p className="font-mono text-xs theme-highlight-text uppercase tracking-[0.25em] mb-5">
              ARMORY VAULT & BATTLE PASS REWARDS
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full text-left mb-4">
              {weapons.map((w, idx) => (
                <div
                  key={w.name}
                  onClick={() => {
                    soundscape.playClick(1300 + idx * 150);
                    setSelectedWeapon(idx);
                  }}
                  className={`p-4 border cursor-pointer transition-all ${
                    selectedWeapon === idx
                      ? 'theme-accent-border bg-[#17141C]/95 theme-accent-glow'
                      : 'border-white/15 bg-[#17141C]/75 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[9px] text-[#F4F0EA]/60 uppercase">{w.type}</span>
                    <Sword className="w-3.5 h-3.5 theme-accent-text" />
                  </div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-[#F4F0EA] mb-0.5">
                    {w.name}
                  </h4>
                  <div className="font-mono text-[11px] theme-highlight-text mb-2.5">
                    {w.skin}
                  </div>
                  <div className="pt-2 border-t border-white/10 font-mono text-[10px] space-y-1">
                    <div className="flex justify-between text-[#F4F0EA]/70">
                      <span>Damage:</span>
                      <span className="text-[#F4F0EA] font-bold">{w.damage}</span>
                    </div>
                    <div className="flex justify-between text-[#F4F0EA]/70">
                      <span>Fire Rate:</span>
                      <span className="theme-accent-text font-bold">{w.fireRate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full p-3.5 border border-white/15 bg-[#17141C]/85 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 theme-accent-text animate-spin" />
                <div className="text-left">
                  <div className="font-display font-bold text-xs text-[#F4F0EA] uppercase">
                    SEASON 01 BATTLE PASS // LEVEL 50 MAX
                  </div>
                  <div className="font-mono text-[11px] text-[#F4F0EA]/60">
                    Unlock Founders Title, Mythic Voxel Skins & Radiant Aura
                  </div>
                </div>
              </div>
              <div className="font-mono text-[11px] font-bold theme-highlight-text border border-white/20 px-3.5 py-1.5 bg-white/5">
                PROGRESS: 84% UNLOCKED
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 5: FINAL ARRIVAL & JOIN THE WAITLIST                 */}
        {/* ========================================================= */}
        {s5Opacity > 0.01 && (
          <div
            className="w-full flex flex-col items-center text-center px-2 sm:px-6 pointer-events-auto transition-all duration-300 ease-out"
            style={{
              opacity: s5Opacity,
              transform: `translate3d(0, ${s5Y}px, 0) scale(${s5Scale})`,
            }}
          >
            {/* Minimal Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="h-[1px] w-8 sm:w-12 theme-accent-bg" />
              <span className="font-mono font-bold text-[10px] sm:text-xs tracking-[0.35em] uppercase theme-accent-text">
                GENESIS ALPHA DISCOVERY
              </span>
              <div className="h-[1px] w-8 sm:w-12 theme-accent-bg" />
            </div>

            {/* Seamless Merging LOGO.png Image & Title Header */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mb-2">
              <img
                src="/assets/LOGO.png"
                alt="EVOKE ESPORTS Logo"
                className="h-16 sm:h-20 md:h-24 w-auto object-contain filter drop-shadow-[0_0_35px_rgba(166,43,95,0.75)]"
              />
              <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl tracking-[0.12em] text-[#F4F0EA] uppercase leading-none text-glow">
                EVOKE ESPORTS
              </h1>
            </div>

            {/* Creed Triad */}
            <div className="mt-1 font-display font-extrabold text-sm sm:text-lg tracking-[0.3em] theme-accent-text uppercase">
              PLAY. <span className="text-[#F4F0EA]">PROVE.</span> PROGRESS.
            </div>

            <p className="mt-2 max-w-md text-xs sm:text-sm text-[#F4F0EA]/80 font-sans leading-relaxed">
              The next evolution in tactical voxel esports. Claim your Genesis Founder Pass today to secure instant closed alpha access and exclusive weapon skins.
            </p>

            {/* CTA Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => {
                  soundscape.playClick(1500);
                  onOpenWaitlist();
                }}
                className="group relative inline-flex items-center gap-2.5 theme-accent-gradient hover:brightness-110 text-[#F4F0EA] px-7 sm:px-9 py-3.5 border-2 theme-accent-border font-mono font-extrabold text-xs tracking-[0.2em] uppercase transition-all duration-200 transform hover:scale-105 active:scale-95 theme-accent-glow cursor-pointer shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-[#F4F0EA]" />
                <span>CLAIM ALPHA ACCESS PASS</span>
                <ArrowRight className="w-4 h-4 text-[#F4F0EA] transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => {
                  soundscape.playClick(900);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-5 py-3.5 border border-white/20 bg-[#17141C]/80 hover:bg-white/10 text-[#F4F0EA] font-mono text-xs font-bold tracking-widest uppercase transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 theme-highlight-text" />
                <span>REVISIT 3D BATTLESTATION</span>
              </button>
            </div>

            {/* Roster claim count subtext */}
            <div className="mt-6 flex items-center gap-3 font-mono text-[10px] tracking-[0.2em] text-[#F4F0EA]/60 uppercase">
              <span>GENESIS ALPHA PROTOCOL</span>
              <span className="theme-accent-text">•</span>
              <span className="text-emerald-400 font-bold">18,492 / 20,000 PASSES CLAIMED</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
