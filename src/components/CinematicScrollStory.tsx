import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Shield,
  Activity,
  Users,
  Award,
  Flame,
  Sword,
  Crosshair,
  Swords,
  Target,
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
      className={`evoke-story-shell fixed inset-0 pointer-events-none select-none z-30 flex items-center justify-center px-4 pt-20 pb-8 ${p >= 0.84 ? 'evoke-final-shell' : ''}`}
      style={{
        backgroundColor: `rgba(12, 10, 16, ${bgOpacity})`,
      }}
    >
      <div className="evoke-story-grid absolute inset-0 pointer-events-none" />
      <div className="evoke-story-frame absolute inset-3 sm:inset-[18px] pointer-events-none" />
      {/* Background Ambient Glow */}
      <div
        className="theme-story-aura absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full blur-[140px] pointer-events-none transition-opacity duration-500"
        style={{ opacity: clampMap(p, 0.12, 0.9, 0.3, 0.85) }}
      />



      {/* Main Container - Ensures centered view without blocking touch scroll */}
      <div className={`relative w-full ${s5Opacity > 0.01 ? 'max-w-[1740px]' : s1Opacity > 0.01 ? 'max-w-[1740px]' : 'max-w-5xl'} flex items-center justify-center py-2 pointer-events-none`}>
        {/* ========================================================= */}
        {/* STAGE 1: EXPLORE THE GAMES.                               */}
        {/* ========================================================= */}
        {s1Opacity > 0.01 && (
          <div
            className="evoke-games-section w-full flex flex-col items-center text-center px-2 sm:px-6 pointer-events-auto transition-all duration-300 ease-out"
            style={{
              opacity: s1Opacity,
              transform: `translate3d(0, ${s1Y}px, 0) scale(${s1Scale})`,
            }}
          >
            <h2 className="evoke-games-title">
              EXPLORE THE GAMES WHERE<br className="hidden md:block" /> SKILL, <em>STRATEGY</em>, AND TEAMWORK<br className="hidden md:block" /> COLLIDE<span className="theme-highlight-text">.</span>
            </h2>

            <p className="evoke-games-description">
              From tactical shooters to battle royale, football simulation, and fighting games,<br className="hidden lg:block" /> every title here represents a different kind of esports mastery. Choose your<br className="hidden lg:block" /> battlefield and study the skills that win rounds, matches, and championships.
            </p>

            <div className="evoke-game-grid">
              {[
                { name: 'VALORANT', image: '/assets/Neon Valorant Voxel Agent Banner.png' },
                { name: 'CS2', image: '/assets/Voxel CS2 Tactical Assault.png' },
                { name: 'BGMI', image: '/assets/BGMI Voxel Battle Banner.png' },
                { name: 'FORTNITE', image: '/assets/Neon Voxel Fortnite Battle Scene.png' },
                { name: 'MORTAL KOMBAT', image: '/assets/Scorpion’s Flaming MK11 Assault.png' },
                { name: 'EA FC', image: '/assets/Neon EA FC Voxel Esports Banner.png' },
              ].map((game, index) => (
                <div className={`evoke-game-card evoke-game-card-${index + 1}`} key={game.name}>
                  <div className="evoke-game-image">
                    <img src={game.image} alt={`${game.name} game artwork`} />
                  </div>
                  <span>{game.name}</span><i />
                </div>
              ))}
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
        {s5Opacity > 0.01 && (
          <section className="evoke-final w-full pointer-events-auto" style={{ opacity: s5Opacity, transform: `translate3d(0, ${s5Y}px, 0) scale(${s5Scale})` }}>
            <div className="evoke-final-hero">
              <div className="evoke-final-copy">
                <div className="evoke-final-kicker"><span>01&nbsp; 01</span><i /> A HIGHER TOMORROW</div>
                <h1>PLAY<span>.</span><br />PROVE<span>.</span><br />PROGRESS<span>.</span></h1>
                <div className="evoke-final-rule" />
              </div>
              <div className="evoke-final-art-space" aria-label="Background artwork area" />
            </div>
            <div className="evoke-final-cards">
              {[
                { title: 'COMPETE', desc: 'Tournaments, ranked play and real opportunities.', icon: Swords, n: '01' },
                { title: 'PRACTICE', desc: 'Sharpen your skills with tools, scrims and training.', icon: Target, n: '02' },
                { title: 'COMMUNITY', desc: 'Players, creators and teams growing together.', icon: Users, n: '03' },
              ].map(({ title, desc, icon: Icon, n }) => <button className="evoke-final-card" key={title} onClick={onOpenWaitlist}>
                <span className="evoke-final-card-icon"><Icon /></span><span className="evoke-final-card-copy"><b>{title}</b><small>{desc}</small></span>
                <span className="evoke-final-card-number">{n}</span><ArrowRight className="evoke-final-card-arrow" />
              </button>)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
