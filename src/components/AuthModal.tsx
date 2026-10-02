import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Shield,
  Gamepad2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Flame,
  Zap,
} from 'lucide-react';
import { EsportsGameId, PlayerProfile } from '../types';
import {
  loginWithEmail,
  registerUser,
  loginAsGuest,
  loginWithSocial,
  DEMO_PROFILES,
} from '../utils/auth';
import { soundscape } from '../utils/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: PlayerProfile) => void;
  initialMode?: 'login' | 'signup';
  preferredGame?: EsportsGameId;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  preferredGame = 'bgmi',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gamerTag, setGamerTag] = useState('');
  const [selectedGame, setSelectedGame] = useState<EsportsGameId>(preferredGame);
  const [selectedAvatar, setSelectedAvatar] = useState('spetsnaz');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMode(initialMode);
    setSelectedGame(preferredGame);
    setError('');
  }, [initialMode, preferredGame, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 120);
    } else {
      document.body.style.overflow = '';
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim()) {
          setError('Please provide your player email or gamer tag.');
          setIsLoading(false);
          return;
        }
        const profile = await loginWithEmail(email, password);
        soundscape.playClick(1200);
        onSuccess(profile);
        onClose();
      } else {
        if (!gamerTag.trim() || !email.trim()) {
          setError('Please provide a gamer tag and email address.');
          setIsLoading(false);
          return;
        }
        const profile = await registerUser(
          gamerTag,
          email,
          password || 'demopass',
          selectedGame,
          selectedAvatar
        );
        soundscape.playClick(1400);
        onSuccess(profile);
        onClose();
      }
    } catch {
      setError('Authentication encountered a barrier. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (game: EsportsGameId) => {
    const profile = DEMO_PROFILES[game];
    soundscape.playClick(1100);
    onSuccess(profile);
    onClose();
  };

  const handleSocialLogin = async (provider: 'steam' | 'discord' | 'google') => {
    setIsLoading(true);
    try {
      const profile = await loginWithSocial(provider, selectedGame);
      soundscape.playClick(1250);
      onSuccess(profile);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const profile = loginAsGuest(selectedGame);
    soundscape.playClick(1000);
    onSuccess(profile);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0c0a0e]/90 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-[#120f1a] border-4 border-[#A62B5F] p-6 sm:p-8 shadow-[0_0_50px_rgba(166,43,95,0.4)] text-[#F4F0EA]">
        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#F4F0EA]/70 hover:text-[#E66A3A] w-8 h-8 bg-[#1f1b29] border border-[#A62B5F]/40 flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Monogram */}
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 bg-[#E66A3A] animate-ping" />
          <span className="font-display text-[10px] tracking-[0.25em] uppercase text-[#A62B5F] font-bold">
            ✦ EVOKE COMPETITIVE NETWORK ✦
          </span>
        </div>

        {/* Dialog Title */}
        <h2 className="font-display font-black text-2xl sm:text-3xl tracking-[0.05em] text-[#F4F0EA] uppercase">
          {mode === 'login' ? 'SIGN IN TO EVOKE' : 'FORGE YOUR ROSTER'}
        </h2>
        <p className="text-xs text-[#F4F0EA]/70 font-display mt-1 mb-5">
          {mode === 'login'
            ? 'Connect your player credentials to sync battlestation telemetry & rank.'
            : 'Register your gamer tag to claim priority scrims and 3D operator badges.'}
        </p>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-[#0d0b12] border-2 border-[#3c3550] mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-display font-bold tracking-[0.15em] uppercase transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[#A62B5F] text-[#F4F0EA] shadow-md'
                : 'text-[#F4F0EA]/50 hover:text-[#A62B5F]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>SIGN IN</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-display font-bold tracking-[0.15em] uppercase transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#A62B5F] text-[#F4F0EA] shadow-md'
                : 'text-[#F4F0EA]/50 hover:text-[#A62B5F]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>CREATE ACCOUNT</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              {/* Gamer Tag */}
              <div>
                <label className="block text-[11px] font-display uppercase tracking-[0.2em] text-[#F4F0EA]/70 mb-1">
                  GAMER TAG / BATTLETAG *
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  required
                  placeholder="e.g. VIPER_99 or GHOST_COD"
                  value={gamerTag}
                  onChange={(e) => setGamerTag(e.target.value.toUpperCase())}
                  className="w-full bg-[#1A1520] border border-[#F4F0EA]/15 rounded-lg px-3.5 py-2.5 text-sm font-mono text-[#F4F0EA] placeholder:text-[#F4F0EA]/30 focus:border-[#E66A3A] focus:outline-none transition-colors"
                />
              </div>

              {/* Primary Discipline / Title Selector */}
              <div>
                <label className="block text-[11px] font-display uppercase tracking-[0.2em] text-[#F4F0EA]/70 mb-1">
                  PRIMARY ESPORTS TITLE *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGame('bgmi');
                      setSelectedAvatar('spetsnaz');
                    }}
                    className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      selectedGame === 'bgmi'
                        ? 'border-[#E66A3A] bg-[#E66A3A]/15 text-[#F4F0EA]'
                        : 'border-[#F4F0EA]/10 bg-[#120F16] text-[#F4F0EA]/60 hover:border-[#F4F0EA]/30'
                    }`}
                  >
                    <span className="font-display font-black text-xs">BGMI</span>
                    <span className="text-[10px] text-[#E66A3A] font-mono">BATTLE ROYALE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGame('cod');
                      setSelectedAvatar('skull');
                    }}
                    className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      selectedGame === 'cod'
                        ? 'border-[#00e5ff] bg-[#00e5ff]/15 text-[#F4F0EA]'
                        : 'border-[#F4F0EA]/10 bg-[#120F16] text-[#F4F0EA]/60 hover:border-[#F4F0EA]/30'
                    }`}
                  >
                    <span className="font-display font-black text-xs">COD</span>
                    <span className="text-[10px] text-[#00e5ff] font-mono">WARZONE / MW</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGame('fifa');
                      setSelectedAvatar('striker');
                    }}
                    className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      selectedGame === 'fifa'
                        ? 'border-[#A62B5F] bg-[#A62B5F]/15 text-[#F4F0EA]'
                        : 'border-[#F4F0EA]/10 bg-[#120F16] text-[#F4F0EA]/60 hover:border-[#F4F0EA]/30'
                    }`}
                  >
                    <span className="font-display font-black text-xs">FIFA</span>
                    <span className="text-[10px] text-[#A62B5F] font-mono">EA SPORTS FC</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-[11px] font-display uppercase tracking-[0.2em] text-[#F4F0EA]/70 mb-1">
              EMAIL ADDRESS *
            </label>
            <input
              ref={mode === 'login' ? inputRef : undefined}
              type="email"
              required
              placeholder="player@evoke.gg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1A1520] border border-[#F4F0EA]/15 rounded-lg px-3.5 py-2.5 text-sm font-mono text-[#F4F0EA] placeholder:text-[#F4F0EA]/30 focus:border-[#A62B5F] focus:outline-none transition-colors"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-[11px] font-display uppercase tracking-[0.2em] text-[#F4F0EA]/70 mb-1">
              PASSWORD {mode === 'login' ? '' : '(OPTIONAL FOR BETA)'}
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1A1520] border border-[#F4F0EA]/15 rounded-lg px-3.5 py-2.5 text-sm font-mono text-[#F4F0EA] placeholder:text-[#F4F0EA]/30 focus:border-[#A62B5F] focus:outline-none transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-[#A62B5F] to-[#E66A3A] text-[#F4F0EA] font-display font-bold text-xs tracking-[0.2em] uppercase hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>SYNCHRONIZING...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>SIGN IN & ACTIVATE BATTLESTATION</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>REGISTER OPERATOR PROFILE</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Social & Guest Shortcuts */}
        <div className="mt-5 pt-4 border-t border-[#F4F0EA]/10 space-y-3">
          <div className="text-[10px] font-display uppercase tracking-[0.25em] text-[#F4F0EA]/40 text-center">
            OR INSTANT ONE-CLICK AUTH
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSocialLogin('steam')}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#110E15] border border-[#F4F0EA]/10 hover:border-[#F4F0EA]/30 text-xs font-mono text-[#F4F0EA]/80 transition-colors cursor-pointer"
              title="Continue with Steam"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-[#E66A3A]" />
              <span>STEAM</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('discord')}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#110E15] border border-[#F4F0EA]/10 hover:border-[#5865F2] text-xs font-mono text-[#F4F0EA]/80 transition-colors cursor-pointer"
              title="Continue with Discord"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#5865F2]" />
              <span>DISCORD</span>
            </button>

            <button
              type="button"
              onClick={handleGuestLogin}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#110E15] border border-[#F4F0EA]/10 hover:border-[#A62B5F] text-xs font-mono text-[#F4F0EA]/80 transition-colors cursor-pointer"
              title="Instant Guest Mode"
            >
              <Shield className="w-3.5 h-3.5 text-[#A62B5F]" />
              <span>GUEST</span>
            </button>
          </div>

          {/* Quick Demo Pre-configured Roster */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#F4F0EA]/50 mb-2">
              <span>ONE-CLICK VERIFIED ATHLETES:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('bgmi')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#18151D] border border-[#E66A3A]/40 hover:bg-[#E66A3A]/20 text-[11px] font-mono text-[#F4F0EA] transition-all cursor-pointer"
              >
                <Flame className="w-3 h-3 text-[#E66A3A]" />
                <span>VIPER_SOUL [BGMI]</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('cod')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#18151D] border border-[#00e5ff]/40 hover:bg-[#00e5ff]/20 text-[11px] font-mono text-[#F4F0EA] transition-all cursor-pointer"
              >
                <Shield className="w-3 h-3 text-[#00e5ff]" />
                <span>GHOST_ACTUAL [COD]</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('fifa')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#18151D] border border-[#A62B5F]/40 hover:bg-[#A62B5F]/20 text-[11px] font-mono text-[#F4F0EA] transition-all cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-[#A62B5F]" />
                <span>KAI_STRIKER [FIFA]</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
