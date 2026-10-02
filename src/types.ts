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
  | 'character_hero'
  | 'puppy'
  | 'bed'
  | 'door'
  | 'crafting_table'
  | 'chest'
  | 'poster'
  | 'lights';

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
  puppy: {
    id: 'puppy',
    label: 'MINECRAFT TAMED PUPPY',
    discoveryText: 'FREE ROAMING COMPANION',
    subtext: 'Your loyal voxel puppy exploring the room. Click to make him happy-bark & sit!',
    iconName: 'Heart',
  },
  bed: {
    id: 'bed',
    label: 'MINECRAFT RESPAWN BED',
    discoveryText: 'REST & RECOVERY',
    subtext: 'Voxel red wool mattress with dark oak wood frame. Sets respawn anchor.',
    iconName: 'Bed',
  },
  door: {
    id: 'door',
    label: 'MINECRAFT OAK DOOR',
    discoveryText: 'ENCLOSED GAMING ROOM ENTRY',
    subtext: 'Classic Minecraft spruce/oak door with glass panel and iron handle.',
    iconName: 'DoorClosed',
  },
  crafting_table: {
    id: 'crafting_table',
    label: 'MINECRAFT CRAFTING TABLE',
    discoveryText: 'CREATIVE WORK BENCH',
    subtext: '3x3 Voxel crafting grid block for building gear and tools.',
    iconName: 'Box',
  },
  chest: {
    id: 'chest',
    label: 'MINECRAFT STORAGE CHEST',
    discoveryText: 'LOOT & REWARDS',
    subtext: 'Voxel wooden chest with iron lock clasp.',
    iconName: 'Package',
  },
  poster: {
    id: 'poster',
    label: 'EVOKE ESPORTS CHAMPIONS POSTER',
    discoveryText: 'DOMINATE THE ARENA',
    subtext: 'Official Evoke Esports Valorant Radiant Champions wall poster.',
    iconName: 'Trophy',
  },
  lights: {
    id: 'lights',
    label: 'ROOM LIGHTS',
    discoveryText: 'AMBIENCE',
    subtext: 'Click to toggle room lighting.',
    iconName: 'Lightbulb',
  },
};

