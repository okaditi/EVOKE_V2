export interface WaitlistFormData {
  name: string;
  email: string;
  primaryGame: string;
}

export type DisciplineOption = {
  value: string;
  label: string;
  genre: string;
};

export const DISCIPLINES: DisciplineOption[] = [
  { value: 'valorant', label: 'VALORANT', genre: 'Tactical FPS' },
  { value: 'cs2', label: 'COUNTER-STRIKE 2', genre: 'Tactical FPS' },
  { value: 'bgmi', label: 'BATTLEGROUNDS / MOBILE', genre: 'Battle Royale' },
  { value: 'dota', label: 'DOTA 2 / MOBA', genre: 'Competitive MOBA' },
  { value: 'fighting', label: 'FIGHTING GAMES (FGC)', genre: 'Direct 1v1' },
  { value: 'other', label: 'OTHER ARENA', genre: 'Multi-Discipline' },
];

export type EsportsGameId = 'valorant' | 'bgmi' | 'cod' | 'fifa';

export interface PlayerProfile {
  id: string;
  gamerTag: string;
  email: string;
  primaryGame: EsportsGameId;
  level: number;
  rank: string;
  avatar: string;
  role: string;
  joinedAt: string;
  stats: {
    kdOrRating: string;
    matches: number;
    winRate: string;
  };
  isGuest?: boolean;
}

export type InteractiveObjectId =
  | 'monitor'
  | 'monitor_power'
  | 'controller'
  | 'chair'
  | 'headset'
  | 'pc'
  | 'keyboard'
  | 'mouse'
  | 'character_hero';

export interface DiscoveryItem {
  id: InteractiveObjectId;
  label: string;
  discoveryText: string;
  subtext: string;
  iconName: string;
}

export const DISCOVERY_ITEMS: Record<InteractiveObjectId, DiscoveryItem> = {
  character_hero: {
    id: 'character_hero',
    label: 'ESPORTS OPERATOR',
    discoveryText: 'DOMINATE.',
    subtext: 'Pro athlete ready for battle. Switch between BGMI, COD, and FIFA icons.',
    iconName: 'Shield',
  },
  controller: {
    id: 'controller',
    label: 'PRO CONTROLLER',
    discoveryText: 'PLAY.',
    subtext: 'Forged for instinct and milliseconds.',
    iconName: 'Gamepad2',
  },
  chair: {
    id: 'chair',
    label: 'RACING BUCKET SEAT',
    discoveryText: 'PROVE.',
    subtext: 'Pro racing gaming chair with dual harness cutouts, memory foam neck pillow, and 360° dynamic swivel.',
    iconName: 'Armchair',
  },
  pc: {
    id: 'pc',
    label: 'PLAYSTATION 5 CONSOLE',
    discoveryText: 'PLAY.',
    subtext: 'Next-gen PS5 console with aerodynamic white wing plates and dual LED lightbar. Click to power ON/OFF.',
    iconName: 'Gamepad2',
  },
  headset: {
    id: 'headset',
    label: 'ACOUSTIC CANOPY',
    discoveryText: 'COMPETE.',
    subtext: 'Pinpoint spatial telemetry. Click to put on headphones and play soundtrack.',
    iconName: 'Headphones',
  },
  mouse: {
    id: 'mouse',
    label: 'ESPORTS GAMING MOUSE',
    discoveryText: 'TRACK.',
    subtext: 'Lightweight ergonomic gaming mouse with PTFE glides and thumb rest. Drag on desk to move monitor cursor.',
    iconName: 'Mouse',
  },
  monitor: {
    id: 'monitor',
    label: 'CURVED DISPLAY',
    discoveryText: 'MORE THAN A GAME.',
    subtext: 'The definitive competitive ecosystem taking shape.',
    iconName: 'Monitor',
  },
  monitor_power: {
    id: 'monitor_power',
    label: 'MONITOR POWER',
    discoveryText: 'MORE THAN A GAME.',
    subtext: 'Toggle 240Hz spatial display illumination.',
    iconName: 'Power',
  },
  keyboard: {
    id: 'keyboard',
    label: 'MECHANICAL DECK',
    discoveryText: "WHAT'S NEXT?",
    subtext: 'Tactile precision crafted for master champions.',
    iconName: 'Keyboard',
  },
};

