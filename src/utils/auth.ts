import { PlayerProfile, EsportsGameId } from '../types';

const SESSION_KEY = 'evoke_player_session';
const REGISTERED_USERS_KEY = 'evoke_registered_users';

export const DEMO_PROFILES: Record<EsportsGameId, PlayerProfile> = {
  valorant: {
    id: 'demo-val-00',
    gamerTag: 'JETT_RADIANT',
    email: 'jett.val@evoke.gg',
    primaryGame: 'valorant',
    level: 99,
    rank: 'RADIANT #1 • VCT CHAMPION',
    avatar: 'jett',
    role: 'Duelist / Entry',
    joinedAt: '2026-01-10',
    stats: {
      kdOrRating: '1.82 KD / 324 ACS',
      matches: 2450,
      winRate: '72.8%',
    },
  },
  bgmi: {
    id: 'demo-bgmi-01',
    gamerTag: 'VIPER_SOUL',
    email: 'viper.bgmi@evoke.gg',
    primaryGame: 'bgmi',
    level: 72,
    rank: 'CONQUEROR',
    avatar: 'spetsnaz',
    role: 'Sniper / Scout',
    joinedAt: '2026-03-12',
    stats: {
      kdOrRating: '7.85 K/D',
      matches: 1420,
      winRate: '34.2%',
    },
  },
  cod: {
    id: 'demo-cod-02',
    gamerTag: 'GHOST_ACTUAL',
    email: 'ghost.cod@evoke.gg',
    primaryGame: 'cod',
    level: 95,
    rank: 'WARZONE ELITE',
    avatar: 'skull',
    role: 'Assault Lead',
    joinedAt: '2026-01-20',
    stats: {
      kdOrRating: '4.62 K/D',
      matches: 2890,
      winRate: '28.6%',
    },
  },
  fifa: {
    id: 'demo-fifa-03',
    gamerTag: 'KAI_STRIKER',
    email: 'kai.fc@evoke.gg',
    primaryGame: 'fifa',
    level: 68,
    rank: 'DIVISION 1 • TOP 100',
    avatar: 'striker',
    role: 'Apex Striker',
    joinedAt: '2026-02-15',
    stats: {
      kdOrRating: '3.88 Goals/M',
      matches: 980,
      winRate: '78.4%',
    },
  },
};

export const getStoredSession = (): PlayerProfile | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveSession = (profile: PlayerProfile): void => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('evoke_auth_change', { detail: profile }));
  } catch (err) {
    console.error('Failed to save session:', err);
  }
};

export const clearSession = (): void => {
  try {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new CustomEvent('evoke_auth_change', { detail: null }));
  } catch (err) {
    console.error('Failed to clear session:', err);
  }
};

export const getRegisteredUsers = (): PlayerProfile[] => {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) return Object.values(DEMO_PROFILES);
    const custom: PlayerProfile[] = JSON.parse(raw);
    return [...custom, ...Object.values(DEMO_PROFILES)];
  } catch {
    return Object.values(DEMO_PROFILES);
  }
};

export const loginWithEmail = async (
  email: string,
  _password?: string
): Promise<PlayerProfile> => {
  const users = getRegisteredUsers();
  const existing = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (existing) {
    saveSession(existing);
    return existing;
  }

  // Auto-provision standard profile if new
  const cleanTag = email.split('@')[0].toUpperCase();
  const newProfile: PlayerProfile = {
    id: `usr-${Date.now()}`,
    gamerTag: cleanTag || 'OPERATOR_EVK',
    email: email.trim().toLowerCase(),
    primaryGame: 'bgmi',
    level: 1,
    rank: 'ROOKIE PRO',
    avatar: 'spetsnaz',
    role: 'All-Rounder',
    joinedAt: new Date().toISOString().split('T')[0],
    stats: {
      kdOrRating: '1.80 K/D',
      matches: 12,
      winRate: '15.0%',
    },
  };

  saveSession(newProfile);
  return newProfile;
};

export const registerUser = async (
  gamerTag: string,
  email: string,
  _password: string,
  primaryGame: EsportsGameId = 'bgmi',
  avatar: string = 'spetsnaz'
): Promise<PlayerProfile> => {
  const cleanTag = gamerTag.trim().toUpperCase() || 'CHAMPION';
  const roleByGame: Record<EsportsGameId, string> = {
    valorant: 'Radiant Duelist',
    bgmi: 'Tactical Marksman',
    cod: 'Special Forces Operator',
    fifa: 'Apex Playmaker',
  };

  const newProfile: PlayerProfile = {
    id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    gamerTag: cleanTag,
    email: email.trim().toLowerCase(),
    primaryGame,
    level: 15,
    rank: 'GENESIS VANGUARD',
    avatar,
    role: roleByGame[primaryGame] || 'Competitor',
    joinedAt: new Date().toISOString().split('T')[0],
    stats: {
      kdOrRating: primaryGame === 'fifa' ? '2.40 Goals/M' : '3.10 K/D',
      matches: 48,
      winRate: '42.5%',
    },
  };

  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    const list: PlayerProfile[] = raw ? JSON.parse(raw) : [];
    list.unshift(newProfile);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage issues
  }

  saveSession(newProfile);
  return newProfile;
};

export const loginAsGuest = (primaryGame: EsportsGameId = 'bgmi'): PlayerProfile => {
  const rand = Math.floor(100 + Math.random() * 900);
  const guestProfile: PlayerProfile = {
    id: `guest-${Date.now()}`,
    gamerTag: `GUEST_${rand}`,
    email: `guest${rand}@evoke.local`,
    primaryGame,
    level: 5,
    rank: 'TRIAL RUNNER',
    avatar: primaryGame === 'bgmi' ? 'spetsnaz' : primaryGame === 'cod' ? 'skull' : 'striker',
    role: 'Recruit',
    joinedAt: new Date().toISOString().split('T')[0],
    stats: {
      kdOrRating: '2.10 K/D',
      matches: 8,
      winRate: '25.0%',
    },
    isGuest: true,
  };

  saveSession(guestProfile);
  return guestProfile;
};

export const loginWithSocial = async (
  provider: 'steam' | 'discord' | 'google',
  primaryGame: EsportsGameId = 'bgmi'
): Promise<PlayerProfile> => {
  const providerTags: Record<string, string> = {
    steam: 'STEAM_PRO',
    discord: 'DISCORD_CHAMP',
    google: 'G_GAMER',
  };
  const rand = Math.floor(100 + Math.random() * 900);

  const profile: PlayerProfile = {
    id: `soc-${provider}-${Date.now()}`,
    gamerTag: `${providerTags[provider]}_${rand}`,
    email: `player.${provider}@evoke.gg`,
    primaryGame,
    level: 30,
    rank: 'VERIFIED PRO',
    avatar: primaryGame === 'bgmi' ? 'spetsnaz' : primaryGame === 'cod' ? 'skull' : 'striker',
    role: 'Verified Athlete',
    joinedAt: new Date().toISOString().split('T')[0],
    stats: {
      kdOrRating: primaryGame === 'fifa' ? '3.10 Goals/M' : '4.25 K/D',
      matches: 210,
      winRate: '38.5%',
    },
  };

  saveSession(profile);
  return profile;
};
