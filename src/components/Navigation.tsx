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
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-10 py-5 sm:py-6 pointer-events-auto transition-all select-none">
      {/* Top Left: EVOKE Monogram & Brandmark */}
      <button
        onClick={() => {
          soundscape.playClick(1200);
          onResetView();
        }}
        className="flex items-center gap-3 group cursor-pointer focus:outline-none"
        aria-label="Reset Evoke 3D perspective"
        title="Reset 3D Perspective"
      >
        {/* Burgundy Monogram Icon */}
        <div className="relative w-8 h-8 bg-[#17141C] border-2 border-[#A62B5F] shadow-[0_0_15px_rgba(166,43,95,0.4)] flex items-center justify-center transition-transform group-hover:scale-105">
          <div className="w-3.5 h-3.5 bg-gradient-to-tr from-[#A62B5F] to-[#E66A3A]" />
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-extrabold text-sm sm:text-base tracking-[0.25em] text-[#F4F0EA] uppercase transition-colors group-hover:text-[#A62B5F]">
              EVOKE
            </span>
            <span className="text-[9px] font-mono font-bold text-[#A62B5F] bg-[#A62B5F]/15 px-1.5 py-0.5 border border-[#A62B5F]/40">
              RADIANT
            </span>
          </div>
          <span className="text-[9px] font-display font-bold tracking-[0.2em] text-[#E66A3A]">
            PLAY • PROVE • PROGRESS
          </span>
        </div>
      </button>

      {/* Top Right: Soundscape Toggle + Auth Button + Primary Action */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Subtle Ambient Drone Toggle */}
        <button
          onClick={handleAudioToggle}
          className="hidden md:flex items-center gap-2 text-[#F4F0EA]/70 hover:text-[#A62B5F] transition-colors p-2 text-xs cursor-pointer bg-[#17141C]/80 border border-[#A62B5F]/30"
          title={audioActive ? 'Mute atmospheric soundscape' : 'Enable atmospheric soundscape'}
          aria-label={audioActive ? 'Mute audio' : 'Unmute audio'}
        >
          {audioActive ? (
            <>
              <Volume2 className="w-4 h-4 text-[#A62B5F]" />
              <span className="font-display text-[10px] tracking-[0.2em] text-[#A62B5F] uppercase">
                SOUND ON
              </span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-[#F4F0EA]/40" />
              <span className="font-display text-[10px] tracking-[0.2em] text-[#F4F0EA]/50 uppercase hover:text-[#A62B5F]">
                ATMOSPHERE
              </span>
            </>
          )}
        </button>

        {/* LOGIN / SIGN UP OR ACTIVE PLAYER BADGE */}
        {playerProfile ? (
          <button
            onClick={() => {
              soundscape.playClick(1300);
              onOpenProfile();
            }}
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#17141C]/90 border-2 border-[#A62B5F] hover:border-[#E66A3A] transition-all cursor-pointer shadow-[0_0_15px_rgba(166,43,95,0.3)] group"
            title="Click to view Player Dossier & Stats"
          >
            <div className="w-5 h-5 bg-gradient-to-tr from-[#A62B5F] to-[#E66A3A] flex items-center justify-center text-[10px] font-display font-black text-[#F4F0EA]">
              {playerProfile.gamerTag.substring(0, 1)}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-bold text-[11px] sm:text-xs tracking-[0.1em] text-[#F4F0EA] group-hover:text-[#E66A3A] transition-colors">
                {playerProfile.gamerTag}
              </span>
            </div>
            <span className="w-1.5 h-1.5 bg-[#E66A3A] animate-ping ml-0.5" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundscape.playClick(1200);
                onOpenAuth('login');
              }}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#17141C] hover:bg-[#2c202d] border border-[#A62B5F]/40 hover:border-[#A62B5F] text-[#F4F0EA] text-[11px] sm:text-xs font-display font-bold tracking-[0.15em] uppercase transition-all cursor-pointer shadow-md"
            >
              <LogIn className="w-3.5 h-3.5 text-[#E66A3A]" />
              <span>LOG IN</span>
            </button>
            <button
              onClick={() => {
                soundscape.playClick(1400);
                onOpenAuth('signup');
              }}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 bg-gradient-to-r from-[#A62B5F] to-[#E66A3A] hover:brightness-110 text-[#F4F0EA] text-[11px] sm:text-xs font-display font-bold tracking-[0.15em] uppercase transition-all cursor-pointer shadow-[0_0_15px_rgba(166,43,95,0.4)]"
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
          className="relative group border-2 border-[#A62B5F] hover:border-[#E66A3A] px-4 sm:px-5 py-1.5 sm:py-2 bg-[#A62B5F]/20 hover:bg-[#A62B5F]/35 transition-all duration-200 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(166,43,95,0.3)]"
        >
          <span className="relative z-10 font-display font-bold text-[10px] sm:text-xs tracking-[0.2em] text-[#F4F0EA] group-hover:text-[#E66A3A] uppercase transition-colors">
            WAITLIST
          </span>
        </button>
      </div>
    </header>
  );
};
