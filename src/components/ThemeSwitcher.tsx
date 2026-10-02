import React, { useEffect, useRef, useState } from 'react';
import { Check, Crosshair } from 'lucide-react';

export const colorThemes = [
  { id: 'valorant', name: 'Crimson Tactical', mode: 'TACTICAL FPS', accent: '#FF4655', highlight: '#00F4B8', secondary: '#111417', surface: '#1C2226' },
  { id: 'cod', name: 'Covert Ops', mode: 'COMBAT ZONE', accent: '#FF5E00', highlight: '#C5A880', secondary: '#3B4436', surface: '#20251F' },
  { id: 'counter-strike', name: 'Desert Strike', mode: 'COMPETITIVE FPS', accent: '#DE9B35', highlight: '#E1E2E2', secondary: '#1B2228', surface: '#1B2228' },
  { id: 'fortnite', name: 'Neon Rush', mode: 'BUILD / ARENA', accent: '#8C2AE3', highlight: '#00F0FF', secondary: '#FF007F', surface: '#171126' },
  { id: 'apex', name: 'Apex Protocol', mode: 'SQUAD COMBAT', accent: '#DA292A', highlight: '#FFB800', secondary: '#1F2226', surface: '#1F2226' },
  { id: 'clash-royale', name: 'Royal Guard', mode: 'MOBILE STRATEGY', accent: '#0066FF', highlight: '#C800FF', secondary: '#FFD700', surface: '#12203B' },
] as const;

export type ColorThemeId = (typeof colorThemes)[number]['id'];

interface ThemeSwitcherProps {
  selectedTheme: ColorThemeId;
  onSelectTheme: (theme: ColorThemeId) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  selectedTheme,
  onSelectTheme,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOnOutsideClick);
    };
  }, [isOpen]);

  const selected = colorThemes.find((theme) => theme.id === selectedTheme) ?? colorThemes[0];
  const selectedIndex = colorThemes.findIndex((theme) => theme.id === selectedTheme) + 1;

  return (
    <div ref={switcherRef} className="fixed right-3 top-1/2 z-60 -translate-y-1/2 sm:right-5">
      {isOpen && (
        <div
          id="color-theme-options"
          role="radiogroup"
          aria-label="Game colorway loadout"
          className="theme-armory-panel absolute right-full top-1/2 mr-3 w-[238px] -translate-y-1/2"
        >
          <div className="theme-armory-kicker">
            <Crosshair aria-hidden="true" className="h-3.5 w-3.5" />
            <span>EVOKE // LOADOUT CONTROL</span>
          </div>
          <div className="theme-armory-heading">
            <span>GAME COLORWAYS</span>
            <span className="theme-armory-count">
              {String(selectedIndex).padStart(2, '0')} / {String(colorThemes.length).padStart(2, '0')}
            </span>
          </div>
          <div className="theme-armory-active">
            <span className="theme-armory-active-label">ACTIVE PROFILE</span>
            <span className="theme-armory-active-name" style={{ color: selected.accent }}>
              {selected.name.toUpperCase()}
            </span>
          </div>
          <div className="theme-armory-options">
            {colorThemes.map((theme, index) => {
              const isSelected = selectedTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onSelectTheme(theme.id)}
                  className={`theme-armory-option ${isSelected ? 'theme-armory-option-active' : ''}`}
                >
                  <span className="theme-armory-index">{String(index + 1).padStart(2, '0')}</span>
                  <span
                    aria-hidden="true"
                    className="theme-armory-swatch"
                    style={{
                      backgroundImage: `linear-gradient(120deg, ${theme.accent} 0 34%, ${theme.highlight} 34% 67%, ${theme.secondary} 67% 100%)`,
                    }}
                  />
                  <span className="theme-armory-option-copy">
                    <span className="theme-armory-option-name">{theme.name}</span>
                    <span className="theme-armory-option-mode">{theme.mode}</span>
                  </span>
                  {isSelected && <Check aria-hidden="true" className="theme-accent-text h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
          <div className="theme-armory-footer">
            <span>PRESET SIGNAL</span>
            <span style={{ color: selected.accent }}>● ONLINE</span>
          </div>
        </div>
      )}

      <button
        type="button"
        aria-label={`Color theme: ${selected.name}`}
        aria-controls="color-theme-options"
        aria-expanded={isOpen}
        title="Open game colorway loadout"
        onClick={() => setIsOpen((open) => !open)}
        className="theme-armory-trigger"
      >
        <Crosshair aria-hidden="true" className="h-[17px] w-[17px]" />
        <span className="theme-armory-trigger-label">ARMORY</span>
        <span
          aria-hidden="true"
          className="theme-armory-trigger-signal"
          style={{ backgroundColor: selected.accent }}
        />
      </button>
    </div>
  );
};