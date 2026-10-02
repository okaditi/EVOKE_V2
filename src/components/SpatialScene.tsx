import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Evoke3DExperience } from '../scene/setupScene';
import { InteractiveObjectId, EsportsGameId, PlayerProfile } from '../types';
import { soundscape } from '../utils/audio';
import { getStoredSession, clearSession } from '../utils/auth';
import { FixedBackgroundVideo } from './FixedBackgroundVideo';
import { FirstScreenOverlay } from './FirstScreenOverlay';
import { CinematicScrollStory } from './CinematicScrollStory';
import { InteractiveTooltip } from './InteractiveTooltip';
import { Navigation } from './Navigation';
import { WaitlistModal } from './WaitlistModal';
import { AuthModal } from './AuthModal';
import { PlayerProfileModal } from './PlayerProfileModal';
import { ThemeSwitcher, colorThemes, ColorThemeId } from './ThemeSwitcher';

export const SpatialScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<Evoke3DExperience | null>(null);
  const [colorTheme, setColorTheme] = useState<ColorThemeId>(() => {
    const savedTheme = window.localStorage.getItem('evoke-color-theme');
    return colorThemes.find((theme) => theme.id === savedTheme)?.id ?? 'valorant';
  });

  useEffect(() => {
    window.localStorage.setItem('evoke-color-theme', colorTheme);
    const theme = colorThemes.find((option) => option.id === colorTheme) ?? colorThemes[0];
    experienceRef.current?.setEnvironmentPalette(
      theme.accent,
      theme.highlight,
      theme.secondary,
      theme.surface
    );
  }, [colorTheme]);

  // Authentication & Esports Player Profile
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(() => getStoredSession());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // 3D Minecrafty Valorant Player Character on Left
  const [activeCharacter, setActiveCharacter] = useState<EsportsGameId>(() => {
    const session = getStoredSession();
    return session?.primaryGame || 'valorant';
  });

  // Interaction State for First Screen
  const [hoveredId, setHoveredId] = useState<InteractiveObjectId | null>(null);
  const [isDraggingController, setIsDraggingController] = useState(false);
  const [isDraggingChair, setIsDraggingChair] = useState(false);
  const [isDraggingMouse, setIsDraggingMouse] = useState(false);
  const [isMonitorPowered, setIsMonitorPowered] = useState(true);
  const [isPCPowered, setIsPCPowered] = useState(true);
  const [isHeadphonePlaying, setIsHeadphonePlaying] = useState(false);
  const [sceneMode, setSceneMode] = useState<'orbit' | 'monitor' | 'reveal'>('orbit');
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  // Sequential Scroll Story State (0 to 1)
  const [scrollProgress, setScrollProgress] = useState(0);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Sync session changes from custom events
  useEffect(() => {
    const handleAuthChange = (e: Event) => {
      const detail = (e as CustomEvent<PlayerProfile | null>).detail;
      setPlayerProfile(detail);
      if (detail && experienceRef.current) {
        experienceRef.current.setPlayerGamerTag(detail.gamerTag);
        if (detail.primaryGame) {
          setActiveCharacter(detail.primaryGame);
          experienceRef.current.setCharacter(detail.primaryGame);
        }
      }
    };
    window.addEventListener('evoke_auth_change', handleAuthChange);
    return () => window.removeEventListener('evoke_auth_change', handleAuthChange);
  }, []);

  // Smooth scroll progression interpolation
  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        targetProgressRef.current = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const tick = () => {
      const target = targetProgressRef.current;
      const diff = target - currentProgressRef.current;
      if (Math.abs(diff) > 0.0002) {
        currentProgressRef.current += diff * 0.14;
        const current = currentProgressRef.current;
        setScrollProgress(current);
        if (experienceRef.current) {
          if (current > 0.05 && experienceRef.current.mode === 'monitor') {
            experienceRef.current.setMode('orbit');
            setSceneMode('orbit');
          }
          experienceRef.current.setScrollProgress(current);
        }
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Headphone Music Toggle
  const handleToggleHeadphones = useCallback(() => {
    const isPlaying = soundscape.toggleHeadphoneMusic(() => {
      if (experienceRef.current) {
        experienceRef.current.triggerSonicPulse();
      }
    });
    setIsHeadphonePlaying(isPlaying);
    if (experienceRef.current) {
      experienceRef.current.triggerSonicPulse();
    }
  }, []);

  // Spin Chair 360 Handler
  const handleSpinChair = useCallback(() => {
    if (experienceRef.current) {
      experienceRef.current.spinChair360();
    }
  }, []);

  // Toggle CPU Power Handler
  const handleTogglePCPower = useCallback(() => {
    if (experienceRef.current) {
      experienceRef.current.togglePCPower();
    }
  }, []);

  // Switch Character on Left Side
  const handleSelectCharacter = useCallback((game: EsportsGameId) => {
    setActiveCharacter(game);
    if (experienceRef.current) {
      experienceRef.current.setCharacter(game);
    }
    soundscape.playClick(1280);
  }, []);

  // Inspect Character
  const handleInspectCharacter = useCallback(() => {
    if (experienceRef.current) {
      experienceRef.current.triggerObjectInteraction('character_hero');
    }
  }, []);

  // User Auth Handlers
  const handleOpenAuth = useCallback((mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  }, []);

  const handleAuthSuccess = useCallback((profile: PlayerProfile) => {
    setPlayerProfile(profile);
    if (profile.primaryGame) {
      setActiveCharacter(profile.primaryGame);
    }
    if (experienceRef.current) {
      experienceRef.current.setPlayerGamerTag(profile.gamerTag);
      if (profile.primaryGame) {
        experienceRef.current.setCharacter(profile.primaryGame);
      }
    }
  }, []);

  const handleLogout = useCallback(() => {
    clearSession();
    setPlayerProfile(null);
    if (experienceRef.current) {
      experienceRef.current.setPlayerGamerTag('EVOKE // APEX');
    }
  }, []);

  // Initialize Three.js Experience
  useEffect(() => {
    if (!containerRef.current) return;

    const exp = new Evoke3DExperience(containerRef.current, {
      onHoverObject: (id) => {
        setHoveredId(id);
      },
      onSelectObject: (id) => {
        if (id === 'monitor') {
          setSceneMode(exp.mode);
        } else if (id === 'headset') {
          handleToggleHeadphones();
        } else if (id === 'character_hero') {
          handleInspectCharacter();
        } else if (id === 'lights') {
          exp.toggleRoomLights();
        }
      },
      onControllerDragStart: () => {
        setIsDraggingController(true);
      },
      onControllerDragEnd: () => {
        setIsDraggingController(false);
      },
      onChairDragStart: () => {
        setIsDraggingChair(true);
      },
      onChairDragEnd: () => {
        setIsDraggingChair(false);
      },
      onMouseDragStart: () => {
        setIsDraggingMouse(true);
      },
      onMouseDragEnd: () => {
        setIsDraggingMouse(false);
      },
      onMonitorPowerToggle: (isPowered) => {
        setIsMonitorPowered(isPowered);
      },
      onPCPowerToggle: (isPowered) => {
        setIsPCPowered(isPowered);
      },
    });

    // Sync initial character and player gamer tag
    if (playerProfile) {
      exp.setPlayerGamerTag(playerProfile.gamerTag);
      if (playerProfile.primaryGame) {
        exp.setCharacter(playerProfile.primaryGame);
      }
    } else {
      exp.setCharacter(activeCharacter);
    }

    const theme = colorThemes.find((option) => option.id === colorTheme) ?? colorThemes[0];
    exp.setEnvironmentPalette(theme.accent, theme.highlight, theme.secondary, theme.surface);
    experienceRef.current = exp;

    return () => {
      exp.destroy();
      experienceRef.current = null;
    };
  }, [handleToggleHeadphones, handleInspectCharacter]);

  // Handle resetting back to standard orbit view & smooth scroll to top
  const handleResetView = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!experienceRef.current) return;
    experienceRef.current.setMode('orbit');
    setSceneMode('orbit');
  }, []);

  // Compute cursor style based on physical interaction states on screen 1
  const getCursorClass = () => {
    if (scrollProgress > 0.08) return 'cursor-default';
    if (isDraggingChair || isDraggingController || isDraggingMouse) return 'cursor-grabbing';
    if (
      hoveredId === 'chair' ||
      hoveredId === 'controller' ||
      hoveredId === 'mouse' ||
      hoveredId === 'character_hero'
    ) {
      return 'cursor-grab';
    }
    if (
      hoveredId === 'monitor' ||
      hoveredId === 'monitor_power' ||
      hoveredId === 'pc' ||
      hoveredId === 'headset'
    ) {
      return 'cursor-pointer';
    }
    return 'cursor-default';
  };

  // -------------------------------------------------------------
  // DISSOLVE / TRANSITION DYNAMICS FOR 3D GAMING SETUP
  // As user scrolls past the first screen, the setup gently fades
  // into darkness, blurs, and leaves the interactive mode.
  // -------------------------------------------------------------
  const setupOpacity = Math.max(0, 1.0 - Math.max(0, scrollProgress - 0.06) * 7.5);
  const setupBlur = Math.min(22, Math.max(0, scrollProgress - 0.06) * 120);
  const setupScale = 1.0 - Math.min(0.06, Math.max(0, scrollProgress - 0.06) * 0.4);
  const isSetupInteractive = scrollProgress < 0.08;

  return (
    <div data-theme={colorTheme} className="relative w-full min-h-[550vh] bg-transparent text-ivory">
      {/* ========================================================= */}
      {/* FIXED ESPORTS BACKGROUND VIDEO                            */}
      {/* Does NOT move on scroll, occupies 100% background across  */}
      {/* subsequent screens (Story stages 1-5, and Waitlist)       */}
      {/* Fades out on Screen 1 so the character & setup are focus  */}
      {/* ========================================================= */}
      <FixedBackgroundVideo scrollProgress={scrollProgress} />

      {/* Top Floating Minimal Sticky Navigation with Auth state */}
      <Navigation
        onOpenWaitlist={() => setIsWaitlistOpen(true)}
        onResetView={handleResetView}
        playerProfile={playerProfile}
        onOpenAuth={handleOpenAuth}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <ThemeSwitcher selectedTheme={colorTheme} onSelectTheme={setColorTheme} />

      {/* ========================================================= */}
      {/* PART 1: THE INTERACTIVE 3D ENVIRONMENT                     */}
      {/* 3D Realistic Character on Left & Battlestation on Right   */}
      {/* ========================================================= */}
      <div
        className={`fixed inset-0 z-10 will-change-transform ${
          isSetupInteractive ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{
          opacity: setupOpacity,
          filter: `blur(${setupBlur}px)`,
          transform: `scale(${setupScale})`,
          visibility: setupOpacity <= 0.005 ? 'hidden' : 'visible',
        }}
      >
        <div
          ref={containerRef}
          className={`w-full h-full ${
            isDraggingChair || isDraggingController || isDraggingMouse ? 'touch-none' : 'touch-pan-y'
          } ${getCursorClass()}`}
        />
      </div>

      {/* First Screen Overlay: Character Switcher, Rig Telemetry, & Controls */}
      <FirstScreenOverlay
        progress={scrollProgress}
        sceneMode={sceneMode}
        isPCPowered={isPCPowered}
        isMonitorPowered={isMonitorPowered}
        isHeadphonePlaying={isHeadphonePlaying}
        activeCharacter={activeCharacter}
        onSelectCharacter={handleSelectCharacter}
        onInspectCharacter={handleInspectCharacter}
        onResetView={handleResetView}
        onTogglePCPower={handleTogglePCPower}
        onSpinChair={handleSpinChair}
        onToggleHeadphoneMusic={handleToggleHeadphones}
        playerProfile={playerProfile}
        onOpenAuth={handleOpenAuth}
      />

      {/* Minimal Context Indicator for Active Physical Interaction (First Screen only) */}
      {isSetupInteractive && (
        <InteractiveTooltip
          activeId={
            isDraggingMouse
              ? 'mouse'
              : isDraggingChair
              ? 'chair'
              : isDraggingController
              ? 'controller'
              : hoveredId
          }
          isDraggingController={isDraggingController}
          isDraggingChair={isDraggingChair}
          isDraggingMouse={isDraggingMouse}
          isMonitorPowered={isMonitorPowered}
          isPCPowered={isPCPowered}
        />
      )}

      {/* ========================================================= */}
      {/* PART 2: CINEMATIC SCROLL-DRIVEN BRAND STORY               */}
      {/* Activates sequentially after scrolling past first screen  */}
      {/* ========================================================= */}
      <CinematicScrollStory
        progress={scrollProgress}
        onOpenWaitlist={() => setIsWaitlistOpen(true)}
      />

      {/* Authentication Modal (Sign In / Create Account / Guest / Quick Social) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
        preferredGame={activeCharacter}
      />

      {/* Player Profile Dossier Modal */}
      <PlayerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={playerProfile}
        onLogout={handleLogout}
        onSwitchCharacter={handleSelectCharacter}
        activeCharacter={activeCharacter}
      />

      {/* Minimal Waitlist Modal Overlay */}
      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
      />
    </div>
  );
};
