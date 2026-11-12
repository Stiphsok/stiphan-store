export type GridSize = 3 | 4 | 5;

export interface PresetImage {
  id: string;
  name: string;
  category: 'morocco' | 'sports' | 'food' | 'anime' | 'nature' | 'custom';
  categoryLabel: string;
  url: string;
  author?: string;
}

export interface BoardTheme {
  id: string;
  name: string;
  borderColor: string;
  tileBg: string;
  boardBg: string;
  accentColor: string;
  shadowColor: string;
  price: number;
  unlocked: boolean;
  description: string;
}

export interface GameStats {
  coins: number;
  gamesWon: number;
  totalMoves: number;
  bestTimes: {
    3: number | null;
    4: number | null;
    5: number | null;
  };
  bestMoves: {
    3: number | null;
    4: number | null;
    5: number | null;
  };
  unlockedThemeIds: string[];
  lastDailySpinDate: string | null;
}

export interface AdData {
  title: string;
  tagline: string;
  description: string;
  brand: string;
  rewardCoins: number;
  icon: string;
  accent: string;
}
