import React from 'react';
import {
  X,
  LogOut,
  Shield,
  Trophy,
  Award,
  Zap,
  RefreshCw,
  Sparkles,
  Flame,
} from 'lucide-react';
import { PlayerProfile, EsportsGameId } from '../types';

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile | null;
  onLogout: () => void;
  onSwitchCharacter: (game: EsportsGameId) => void;
  activeCharacter: EsportsGameId;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onLogout,
  onSwitchCharacter,
  activeCharacter,
}) => {
  if (!isOpen || !profile) return null;

  const gameNames: Record<EsportsGameId, string> = {
    valorant: 'VALORANT // RADIANT',
    bgmi: 'BATTLEGROUNDS MOBILE INDIA',
    cod: 'CALL OF DUTY: WARZONE',
    fifa: 'EA SPORTS FC / FIFA',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0a080d]/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-[#120f1a] border-4 border-[#A62B5F] p-6 sm:p-8 shadow-[0_0_50px_rgba(166,43,95,0.4)] text-[#F4F0EA]">
        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#F4F0EA]/70 hover:text-[#E66A3A] w-8 h-8 bg-[#1f1b29] border border-[#A62B5F]/40 flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Profile Identity */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-14 h-14 bg-[#100c19] border-2 border-[#A62B5F] p-0.5 shadow-[0_0_15px_rgba(166,43,95,0.4)]">
            <div className="w-full h-full bg-[#1b1726] flex items-center justify-center font-display font-black text-xl text-[#F4F0EA]">
              {profile.gamerTag.substring(0, 2).toUpperCase()}
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#E66A3A] border-2 border-[#120f1a]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-lg tracking-[0.05em] text-[#F4F0EA]">
                {profile.gamerTag}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-[#A62B5F]/20 border border-[#A62B5F]/60 text-[#F4F0EA]">
                LVL {profile.level}
              </span>
            </div>
            <div className="text-xs text-[#E66A3A] font-mono mt-0.5">
              ✦ {profile.rank}
            </div>
            <div className="text-[11px] text-[#F4F0EA]/60 font-mono">
              {profile.email}
            </div>
          </div>
        </div>

        {/* Combat Stats Overview */}
        <div className="grid grid-cols-3 gap-2.5 p-3 bg-[#0d0b12] border-2 border-[#3c3550] mb-5">
          <div className="text-center">
            <div className="text-[10px] font-mono text-[#A62B5F]">K/D RATIO</div>
            <div className="font-mono font-black text-sm text-[#F4F0EA] mt-0.5">
              {profile.stats.kdOrRating}
            </div>
          </div>
          <div className="text-center border-x-2 border-[#3c3550]">
            <div className="text-[10px] font-mono text-[#A62B5F]">WIN RATE</div>
            <div className="font-mono font-black text-sm text-[#E66A3A] mt-0.5">
              {profile.stats.winRate}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-mono text-[#F4F0EA]/40">MATCHES</div>
            <div className="font-display font-black text-sm text-[#A62B5F] mt-0.5">
              {profile.stats.matches}
            </div>
          </div>
        </div>

        {/* 3D Character Synchronizer */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-display uppercase tracking-[0.2em] text-[#F4F0EA]/70">
            <span>ACTIVE 3D OPERATOR</span>
            <span className="text-[#E66A3A] font-mono text-[10px]">LEFT SIDE 3D HERO</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['bgmi', 'cod', 'fifa'] as EsportsGameId[]).map((game) => (
              <button
                key={game}
                onClick={() => onSwitchCharacter(game)}
                className={`py-2 px-2.5 rounded-lg border text-xs font-display font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeCharacter === game
                    ? 'border-[#E66A3A] bg-[#E66A3A]/20 text-[#F4F0EA] shadow-md'
                    : 'border-[#F4F0EA]/10 bg-[#100d14] text-[#F4F0EA]/60 hover:border-[#F4F0EA]/30'
                }`}
              >
                {game === 'bgmi' && <Flame className="w-3 h-3 text-[#E66A3A]" />}
                {game === 'cod' && <Shield className="w-3 h-3 text-[#00e5ff]" />}
                {game === 'fifa' && <Sparkles className="w-3 h-3 text-[#A62B5F]" />}
                <span>{game.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-3 border-t border-[#F4F0EA]/10">
          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl border border-red-500/30 hover:border-red-500/60 bg-red-950/20 hover:bg-red-950/40 text-red-200 text-xs font-display font-bold tracking-[0.15em] uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>SIGN OUT</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#1A1622] hover:bg-[#251F30] border border-[#F4F0EA]/15 text-[#F4F0EA] text-xs font-display font-bold tracking-[0.15em] uppercase transition-colors flex items-center justify-center cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
