import React, { useState, useEffect, useRef } from 'react';
import { X, Check, ArrowRight, ShieldCheck, Copy } from 'lucide-react';
import { DISCIPLINES } from '../types';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [primaryGame, setPrimaryGame] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [rosterId, setRosterId] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => {
        setIsSubmitted(false);
        setCopied(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !primaryGame) return;

    // Generate random Genesis roster identifier
    const randNum = Math.floor(1000 + Math.random() * 9000);
    setRosterId(`EVK-${randNum}-ALPHA`);
    setIsSubmitted(true);
  };

  const handleCopy = () => {
    if (!rosterId) return;
    navigator.clipboard.writeText(rosterId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#171519]/90 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg bg-[#14121a] border-4 border-[#A62B5F] p-7 sm:p-10 md:p-12 shadow-[0_0_50px_rgba(166,43,95,0.4)] transform transition-all duration-300"
      >
        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 sm:top-6 sm:right-6 text-[#F4F0EA]/70 hover:text-[#E66A3A] transition-colors w-8 h-8 bg-[#1f1b29] border border-[#A62B5F]/40 flex items-center justify-center cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Minimal Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 bg-[#E66A3A] animate-pulse" />
              <span className="font-display font-bold text-[11px] tracking-[0.25em] uppercase text-[#A62B5F]">
                ✦ VALORANT PRIORITY ROSTER ✦
              </span>
            </div>

            <h2
              id="waitlist-title"
              className="font-display font-black text-2xl sm:text-3xl tracking-[0.05em] text-[#F4F0EA] uppercase"
            >
              JOIN THE WAITLIST
            </h2>

            <p className="mt-2 font-display text-xs tracking-wider text-[#F4F0EA]/70 uppercase leading-relaxed">
              Something new is taking shape in the competitive arena.
            </p>

            {/* Waitlist Form with exact requested fields */}
            <form onSubmit={handleSubmit} className="mt-7 sm:mt-8 space-y-5">
              <div>
                <label className="block font-display text-[11px] font-bold tracking-[0.2em] uppercase text-[#A62B5F] mb-2">
                  NAME / GAMER TAG
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="PLAYER HANDLE OR GAMER TAG"
                  className="w-full bg-[#0d0b12] border-2 border-[#3c3550] focus:border-[#A62B5F] text-[#F4F0EA] placeholder-[#F4F0EA]/30 px-4 py-3 font-mono text-xs tracking-wider uppercase outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-display text-[11px] font-bold tracking-[0.2em] uppercase text-[#A62B5F] mb-2">
                  EMAIL
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="NAME@DOMAIN.COM"
                  className="w-full bg-[#0d0b12] border-2 border-[#3c3550] focus:border-[#A62B5F] text-[#F4F0EA] placeholder-[#F4F0EA]/30 px-4 py-3 font-mono text-xs tracking-wider uppercase outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-display text-[11px] font-bold tracking-[0.2em] uppercase text-[#A62B5F] mb-2">
                  PRIMARY DISCIPLINE
                </label>
                <div className="relative">
                  <select
                    required
                    value={primaryGame}
                    onChange={(e) => setPrimaryGame(e.target.value)}
                    className="w-full bg-[#0d0b12] border-2 border-[#3c3550] focus:border-[#A62B5F] text-[#F4F0EA] px-4 py-3 font-mono text-xs tracking-wider uppercase outline-none appearance-none transition-all cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#171519] text-[#F4F0EA]/40">
                      SELECT YOUR PRIMARY DISCIPLINE
                    </option>
                    {DISCIPLINES.map((d) => (
                      <option key={d.value} value={d.value} className="bg-[#171519] text-[#F4F0EA]">
                        {d.label} — {d.genre}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#A62B5F]">
                    <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                  </div>
                </div>
              </div>

              {/* Exact button requested: JOIN EVOKE */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full group bg-gradient-to-r from-[#A62B5F] to-[#E66A3A] hover:brightness-110 active:scale-[0.99] text-[#F4F0EA] py-3.5 sm:py-4 border-2 border-[#A62B5F] font-display font-black text-xs tracking-[0.25em] uppercase transition-all duration-200 shadow-[0_0_25px_rgba(166,43,95,0.4)] cursor-pointer"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>JOIN EVOKE</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1 font-mono text-[10px] tracking-[0.2em] uppercase text-[#A62B5F]/70">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E66A3A]" />
                <span>CHRONOLOGICAL ALPHA ACCESS PROTOCOL</span>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 border-2 border-[#A62B5F] flex items-center justify-center bg-[#A62B5F]/20 shadow-[0_0_25px_rgba(166,43,95,0.4)]">
              <Check className="w-8 h-8 sm:w-10 sm:h-10 text-[#E66A3A]" />
            </div>

            {/* Exact text requested: YOU'RE IN. "Welcome to the beginning." */}
            <h3 className="font-display font-black text-3xl sm:text-4xl tracking-[0.1em] text-[#F4F0EA] uppercase">
              YOU'RE IN.
            </h3>

            <p className="mt-4 font-display text-xs sm:text-sm tracking-[0.2em] uppercase text-[#E66A3A] max-w-sm mx-auto leading-relaxed">
              Welcome to the beginning.
            </p>

            {/* Assigned Member Protocol Key */}
            <div className="mt-6 p-4 bg-[#0d0b12] border-2 border-[#A62B5F]/50 flex items-center justify-between max-w-xs mx-auto">
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#A62B5F]">
                  Roster Node
                </span>
                <span className="font-mono font-bold text-xs tracking-wider text-[#E66A3A] tabular-nums">
                  {rosterId}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="p-2 text-[#F4F0EA]/70 hover:text-[#A62B5F] transition-colors cursor-pointer"
                title="Copy Roster Token"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-[#3c3550]">
              <button
                onClick={onClose}
                className="text-[11px] font-display font-bold tracking-[0.25em] text-[#A62B5F] hover:text-[#E66A3A] uppercase transition-colors cursor-pointer"
              >
                RETURN TO EXPERIENCE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
