export type TrapType =
  | 'hidden_spike'       // Spikes appear when Stiphan approaches
  | 'crumbling_floor'   // Floor breaks 0.25s after being stepped on
  | 'disappearing_tile' // Floor flashes and vanishes completely
  | 'falling_ceiling'   // Ceiling spikes crash down when walked beneath
  | 'fake_exit'         // Door that moves or reveals spikes when approached
  | 'troll_sign'        // Sign with misleading troll text
  | 'moving_platform'   // Platform moving back and forth
  | 'fleeing_platform'  // Platform that moves away when player jumps toward it
  | 'spring_bounce';    // High jump bounce pad

export interface Platform {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type?: 'solid' | 'crumbling' | 'disappearing' | 'fleeing' | 'ice' | 'bouncy';
  vx?: number;
  vy?: number;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  crumbleTimer?: number;
  isCrumbling?: boolean;
  isBroken?: boolean;
  opacity?: number;
  origX?: number;
  origY?: number;
}

export interface Spike {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  dir?: 'up' | 'down' | 'left' | 'right';
  hidden?: boolean;
  triggerDistance?: number;
  revealed?: boolean;
  falling?: boolean;
  vy?: number;
  origY?: number;
}

export interface TrollTrap {
  id: string;
  triggerArea: { x: number; y: number; w: number; h: number };
  type: TrapType;
  activated: boolean;
  targetId?: string;
  message?: string;
}

export interface Coin {
  id: string;
  x: number;
  y: number;
  collected: boolean;
}

export interface TrollSign {
  id: string;
  x: number;
  y: number;
  text: string;
}

export interface LevelData {
  id: number;
  title: string;
  era: string; // e.g., "Intro", "Sneaky Spikes", "Collapsing Reality", etc.
  hint?: string;
  spawn: { x: number; y: number };
  exit: { x: number; y: number; w: number; h: number; isFake?: boolean };
  platforms: Platform[];
  spikes: Spike[];
  traps: TrollTrap[];
  coins: Coin[];
  signs?: TrollSign[];
}

export interface Skin {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  price: number;
  bodyColor: string;
  eyeColor: string;
  accessory: 'none' | 'tarboosh' | 'ninja' | 'crown' | 'sunglasses' | 'devil_horns';
  unlockedByDefault?: boolean;
}

export interface GameSettings {
  soundEnabled: boolean;
  volume: number; // 0 to 1
  darijaVoice: boolean;
  hintsRevealed: boolean;
  haptics: boolean;
}

export interface GameProgress {
  currentLevel: number;
  unlockedLevel: number;
  attemptsLeft: number; // Starts at 6 free attempts
  totalDeaths: number;
  totalCoins: number;
  selectedSkinId: string;
  unlockedSkinIds: string[];
  levelBestDeaths: Record<number, number>;
  lastFreeLivesClaim?: number;
}

export type GameScreen =
  | 'menu'
  | 'playing'
  | 'paused'
  | 'level_select'
  | 'shop'
  | 'game_over'
  | 'out_of_lives'
  | 'level_win'
  | 'campaign_complete'
  | 'ad_viewing'
  | 'export_zip';

export type AdRewardType =
  | 'extra_lives'     // +3 attempts
  | 'second_chance'   // Revive where died
  | 'level_bonus_coins' // 2x coins
  | 'reveal_hints'    // Reveal traps
  | 'daily_bonus';    // Free coins + life
