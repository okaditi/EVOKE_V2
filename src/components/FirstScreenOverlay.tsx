import React from 'react';
import { ArrowLeft, ArrowDown } from 'lucide-react';
import { EsportsGameId, PlayerProfile } from '../types';

interface FirstScreenOverlayProps {
  progress: number;
  sceneMode: 'orbit' | 'monitor' | 'reveal';
  isPCPowered?: boolean;
  isMonitorPowered?: boolean;
  isHeadphonePlaying?: boolean;
  activeCharacter?: EsportsGameId;
  onSelectCharacter?: (game: EsportsGameId) => void;
  onInspectCharacter?: () => void;
  onResetView: () => void;
  onTogglePCPower?: () => void;
  onSpinChair?: () => void;
  onToggleHeadphoneMusic?: () => void;
  playerProfile?: PlayerProfile | null;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

export const FirstScreenOverlay: React.FC<FirstScreenOverlayProps> = ({
  progress,
  sceneMode,
  onResetView,
}) => {
  // Fade out cleanly as user scrolls into Part 2
  const opacity = Math.max(0, 1.0 - progress * 10);
  if (opacity <= 0.01) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none z-20 transition-opacity duration-200"
      style={{ opacity }}
    >
      {/* ========================================================= */}
      {/* 1. ATMOSPHERIC BURGUNDY & MAUVE BACKDROP GLOW             */}
      {/* ========================================================= */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Left Side: Burgundy / Deep Mauve Aura for Valorant Agent */}
        <div className="theme-scene-aura-left absolute top-[45%] left-[22%] -translate-x-1/2 -translate-y-1/2 w-[45vw] h-[65vh] max-w-[650px] max-h-[650px] rounded-full blur-[110px]" />

        {/* Right Side: Burgundy / Burnt Orange Glow for Battlestation Setup */}
        <div className="theme-scene-aura-right absolute top-[48%] right-[18%] translate-x-1/2 -translate-y-1/2 w-[50vw] h-[65vh] max-w-[750px] max-h-[700px] rounded-full blur-[120px]" />
      </div>

      {/* Top Center: If inside Monitor zoom mode, show Return pill */}
      {sceneMode === 'monitor' && (
        <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-in fade-in duration-300">
          <button
            onClick={onResetView}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#17141C]/90 border-2 border-[#A62B5F] text-[#F4F0EA] font-display text-xs tracking-[0.2em] uppercase hover:bg-[#A62B5F]/25 transition-all shadow-[0_0_20px_rgba(166,43,95,0.4)] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#E66A3A]" />
            <span>RETURN TO ROOM PERSPECTIVE</span>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* BOLD THEMED SCROLL CUE  */}
      {/* ========================================================= */}
      <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-50">
        <div className="flex flex-col items-center gap-3">
          <span className="theme-accent-text theme-accent-glow-text font-display font-black text-xs sm:text-sm tracking-[0.4em] uppercase drop-shadow-md">
            SCROLL TO EXPLORE
          </span>
          <div className="theme-accent-border theme-accent-glow flex h-10 w-6 items-center justify-center rounded-full border-2 bg-[#17141C]/80 backdrop-blur-sm">
            <ArrowDown className="theme-highlight-text h-4 w-4 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
};
