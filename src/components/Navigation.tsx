import React, { useState } from 'react';
import { Volume2, VolumeX, LogIn, User, Sparkles } from 'lucide-react';
import { soundscape } from '../utils/audio';
import { PlayerProfile } from '../types';

interface NavigationProps {
  onOpenWaitlist: () => void;
  onResetView: () => void;
  playerProfile: PlayerProfile | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenProfile: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  onOpenWaitlist,
  onResetView,
  playerProfile,
  onOpenAuth,
  onOpenProfile,
}) => {
  const [audioActive, setAudioActive] = useState(false);

  const handleAudioToggle = () => {
    const active = soundscape.toggle();
    setAudioActive(active);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between gap-2 px-3 sm:px-10 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:py-6 sm:pt-[calc(1.5rem+env(safe-area-inset-top))] pointer-events-auto transition-all select-none">
      {/* Top Left: EVOKE Monogram & Brandmark */}
      <button
        onClick={() => {
          soundscape.playClick(1200);
          onResetView();
        }}
        className="flex min-w-0 items-center gap-2 sm:gap-3 group cursor-pointer focus:outline-none"
        aria-label="Reset Evoke 3D perspective"
        title="Reset 3D Perspective"
      >
        {/* LOGO.png Website Logo */}
        <div className="relative flex items-center justify-center transition-transform group-hover:scale-105">
          <img
            src="/assets/LOGO.png"
            alt="EVOKE Logo"
            className="h-8 w-8 sm:h-10 sm:w-10 object-contain filter drop-shadow-[0_0_10px_rgba(166,43,95,0.6)]"
          />
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap font-display font-extrabold text-xs sm:text-base tracking-[0.08em] sm:tracking-[0.2em] text-ivory uppercase transition-colors group-hover:theme-accent-text">
              EVOKE ESPORTS
            </span>
            <span className="hidden sm:inline theme-accent-border-soft theme-accent-bg-soft theme-accent-text border px-1.5 py-0.5 text-[9px] font-mono font-bold">
              RADIANT
            </span>
          </div>
          <span className="hidden sm:block theme-highlight-text text-[9px] font-display font-bold tracking-[0.2em]">
            PLAY • PROVE • PROGRESS
          </span>
        </div>
      </button>

      {/* Top Right: Soundscape Toggle + Auth Button + Primary Action */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">


        {/* LOGIN / SIGN UP OR ACTIVE PLAYER BADGE */}
        {playerProfile ? (
          <button
            onClick={() => {
              soundscape.playClick(1300);
              onOpenProfile();
            }}
            className="theme-accent-border theme-highlight-border-hover theme-accent-glow flex cursor-pointer items-center gap-2 border-2 bg-[#17141C]/90 px-3 py-1.5 transition-all group sm:px-4 sm:py-2"
            title="Click to view Player Dossier & Stats"
          >
            <div className="theme-accent-gradient flex h-5 w-5 items-center justify-center text-[10px] font-display font-black text-ivory">
              {playerProfile.gamerTag.substring(0, 1)}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-bold text-[11px] sm:text-xs tracking-widest text-ivory transition-colors group-hover:theme-highlight-text">
                {playerProfile.gamerTag}
              </span>
            </div>
            <span className="theme-accent-bg ml-0.5 h-1.5 w-1.5 animate-ping" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundscape.playClick(1200);
                onOpenAuth('login');
              }}
              className="theme-accent-border-soft theme-accent-border flex cursor-pointer items-center gap-1 border bg-[#17141C] px-2 py-1.5 text-[10px] font-display font-bold tracking-[0.08em] text-ivory uppercase shadow-md transition-all hover:bg-[#2c202d] sm:gap-1.5 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.15em]"
            >
              <LogIn className="theme-highlight-text h-3.5 w-3.5" />
              <span>LOG IN</span>
            </button>
            <button
              onClick={() => {
                soundscape.playClick(1400);
                onOpenAuth('signup');
              }}
              className="theme-accent-gradient theme-accent-glow hidden cursor-pointer items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-display font-bold tracking-[0.15em] text-ivory uppercase transition-all hover:brightness-110 sm:flex sm:py-2 sm:text-xs"
            >
              <User className="w-3.5 h-3.5" />
              <span>SIGN UP</span>
            </button>
          </div>
        )}

        {/* Top-Right: JOIN THE WAITLIST */}
        <button
          onClick={() => {
            soundscape.playClick(1500);
            onOpenWaitlist();
          }}
          className="theme-accent-border theme-highlight-border-hover theme-accent-bg-soft theme-accent-glow relative group cursor-pointer border-2 px-2.5 py-1.5 transition-all duration-200 hover:brightness-125 active:scale-95 sm:px-5 sm:py-2"
        >
          <span className="relative z-10 font-display font-bold text-[9px] sm:text-xs tracking-[0.1em] sm:tracking-[0.2em] text-ivory transition-colors group-hover:theme-highlight-text uppercase">
            WAITLIST
          </span>
        </button>
      </div>
    </header>
  );
};
