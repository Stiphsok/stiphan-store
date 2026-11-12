import { GameStats } from '../types/game';

const STATS_STORAGE_KEY = 'stiphan_puzzle_stats_v1';
const SOUND_STORAGE_KEY = 'stiphan_puzzle_sound_v1';
const THEME_STORAGE_KEY = 'stiphan_puzzle_theme_v1';

export const DEFAULT_STATS: GameStats = {
  coins: 50,
  gamesWon: 0,
  totalMoves: 0,
  bestTimes: {
    3: null,
    4: null,
    5: null,
  },
  bestMoves: {
    3: null,
    4: null,
    5: null,
  },
  unlockedThemeIds: ['gold-atlas'],
  lastDailySpinDate: null,
};

export function loadGameStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      bestTimes: { ...DEFAULT_STATS.bestTimes, ...(parsed.bestTimes || {}) },
      bestMoves: { ...DEFAULT_STATS.bestMoves, ...(parsed.bestMoves || {}) },
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveGameStats(stats: GameStats): void {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save stats to localStorage', err);
  }
}

export function loadSoundPreference(): boolean {
  try {
    const val = localStorage.getItem(SOUND_STORAGE_KEY);
    return val !== 'false';
  } catch {
    return true;
  }
}

export function saveSoundPreference(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {
    // ignore
  }
}

export function loadSelectedThemeId(): string {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'gold-atlas';
  } catch {
    return 'gold-atlas';
  }
}

export function saveSelectedThemeId(id: string): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    // ignore
  }
}
