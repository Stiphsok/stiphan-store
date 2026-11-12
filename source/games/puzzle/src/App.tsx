import { useState, useEffect, useRef, useCallback } from 'react';
import { GridSize, PresetImage, BoardTheme, GameStats } from './types/game';
import { PRESET_IMAGES, BOARD_THEMES } from './data/presets';
import {
  shuffleBoard,
  isBoardSolved,
  findBestHintTile,
} from './utils/puzzle';
import { cropImageToSquare } from './utils/imageCropper';
import { sound } from './utils/sound';
import {
  loadGameStats,
  saveGameStats,
  loadSoundPreference,
  saveSoundPreference,
  loadSelectedThemeId,
  saveSelectedThemeId,
} from './utils/storage';

import { Header } from './components/Header';
import { ControlBar } from './components/ControlBar';
import { InfoPanel } from './components/InfoPanel';
import { GameBoard } from './components/GameBoard';
import { FooterPanel } from './components/FooterPanel';

import { WinModal } from './components/WinModal';
import { AdModal } from './components/AdModal';
import { GalleryModal } from './components/GalleryModal';
import { ShopModal } from './components/ShopModal';
import { SpinWheelModal } from './components/SpinWheelModal';
import { StatsModal } from './components/StatsModal';
import { HelpModal } from './components/HelpModal';

export default function App() {
  // Game Configuration State
  const [gridSize, setGridSize] = useState<GridSize>(3);
  const [tiles, setTiles] = useState<number[]>([]);
  const [emptyIndex, setEmptyIndex] = useState<number>(8);
  const [currentImgUrl, setCurrentImgUrl] = useState<string>(PRESET_IMAGES[0].url);
  const [currentTitle, setCurrentTitle] = useState<string>(PRESET_IMAGES[0].name);
  const [hasCustomUpload, setHasCustomUpload] = useState<boolean>(false);

  // Playback & Score State
  const [timer, setTimer] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [coinsEarnedThisWin, setCoinsEarnedThisWin] = useState<number>(15);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // Boosters & Helpers
  const [showNumbers, setShowNumbers] = useState<boolean>(false);
  const [isPeeking, setIsPeeking] = useState<boolean>(false);
  const [hintIndex, setHintIndex] = useState<number | null>(null);
  const [hasDoubleReward, setHasDoubleReward] = useState<boolean>(false);

  // Persistence & Audio
  const [stats, setStats] = useState<GameStats>(loadGameStats);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(loadSoundPreference);
  const [activeThemeId, setActiveThemeId] = useState<string>(loadSelectedThemeId);

  // Modals State
  const [isWinModalOpen, setIsWinModalOpen] = useState(false);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isWheelModalOpen, setIsWheelModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const timerIntervalRef = useRef<number | null>(null);

  // Sync sound preference
  useEffect(() => {
    sound.enabled = soundEnabled;
    saveSoundPreference(soundEnabled);
  }, [soundEnabled]);

  // Sync stats to localStorage
  useEffect(() => {
    saveGameStats(stats);
  }, [stats]);

  // Active theme calculation
  const activeTheme: BoardTheme =
    BOARD_THEMES.find((t) => t.id === activeThemeId) || BOARD_THEMES[0];

  // Stop Timer
  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Start Timer
  const startTimer = useCallback(() => {
    stopTimer();
    setTimer(0);
    setIsPlaying(true);
    timerIntervalRef.current = window.setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  }, [stopTimer]);

  // Initialize and shuffle board
  const initializeBoard = useCallback(
    (size: GridSize) => {
      stopTimer();
      setIsWon(false);
      setIsWinModalOpen(false);
      setMoves(0);
      setHintIndex(null);

      const { tiles: shuffled, emptyIndex: empty } = shuffleBoard(size);
      setTiles(shuffled);
      setEmptyIndex(empty);
      startTimer();
    },
    [startTimer, stopTimer]
  );

  // Initialize on first mount
  useEffect(() => {
    initializeBoard(3);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [initializeBoard]);

  // Change Grid Size
  const handleChangeGridSize = (size: GridSize) => {
    setGridSize(size);
    initializeBoard(size);
  };

  // Load Random Preset Image
  const handleRandomPreset = () => {
    const available = PRESET_IMAGES.filter((img) => img.url !== currentImgUrl);
    const chosen = available[Math.floor(Math.random() * available.length)] || PRESET_IMAGES[0];
    setCurrentImgUrl(chosen.url);
    setCurrentTitle(chosen.name);
    initializeBoard(gridSize);
  };

  // Select preset from gallery
  const handleSelectPreset = (preset: PresetImage) => {
    setCurrentImgUrl(preset.url);
    setCurrentTitle(preset.name);
    initializeBoard(gridSize);
  };

  // Custom Image Upload (Phone / Computer)
  const handleUploadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (result) {
        const squared = await cropImageToSquare(result);
        setCurrentImgUrl(squared);
        setCurrentTitle(`الصورة: ${file.name}`);
        setHasCustomUpload(true);
        initializeBoard(gridSize);
      }
    };
    reader.readAsDataURL(file);
  };

  // Custom Image URL
  const handleCustomUrl = (url: string, name: string) => {
    setCurrentImgUrl(url);
    setCurrentTitle(name);
    initializeBoard(gridSize);
  };

  // Handle Tile Move
  const handleMoveTile = (index: number) => {
    if (isWon || index === emptyIndex) return;

    // Check if game was paused or timer stopped
    if (!isPlaying) {
      setIsPlaying(true);
      timerIntervalRef.current = window.setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }

    const newTiles = [...tiles];
    newTiles[emptyIndex] = newTiles[index];
    newTiles[index] = gridSize * gridSize - 1;

    setTiles(newTiles);
    setEmptyIndex(index);
    setMoves((prev) => prev + 1);
    setHintIndex(null);

    // Check Win
    if (isBoardSolved(newTiles)) {
      stopTimer();
      setIsWon(true);

      // Award coins: Base 3x3 = 15 coins, 4x4 = 25 coins, 5x5 = 40 coins
      const baseReward = gridSize === 3 ? 15 : gridSize === 4 ? 25 : 40;
      const finalReward = hasDoubleReward ? baseReward * 2 : baseReward;
      setCoinsEarnedThisWin(finalReward);
      if (hasDoubleReward) setHasDoubleReward(false);

      // Check record
      const prevBestTime = stats.bestTimes[gridSize];
      const prevBestMoves = stats.bestMoves[gridSize];
      const newIsRecord =
        prevBestTime === null || timer < prevBestTime || moves + 1 < (prevBestMoves || Infinity);
      setIsNewRecord(newIsRecord);

      // Update user stats
      setStats((prev) => {
        const updatedBestTimes = { ...prev.bestTimes };
        if (updatedBestTimes[gridSize] === null || timer < (updatedBestTimes[gridSize] as number)) {
          updatedBestTimes[gridSize] = timer;
        }

        const updatedBestMoves = { ...prev.bestMoves };
        if (
          updatedBestMoves[gridSize] === null ||
          moves + 1 < (updatedBestMoves[gridSize] as number)
        ) {
          updatedBestMoves[gridSize] = moves + 1;
        }

        return {
          ...prev,
          coins: prev.coins + finalReward,
          gamesWon: prev.gamesWon + 1,
          totalMoves: prev.totalMoves + moves + 1,
          bestTimes: updatedBestTimes,
          bestMoves: updatedBestMoves,
        };
      });

      // Show win modal after subtle delay
      setTimeout(() => {
        setIsWinModalOpen(true);
      }, 400);
    }
  };

  // Smart Hint
  const handleUseHint = () => {
    if (hintIndex !== null) return;
    const bestMove = findBestHintTile(tiles, emptyIndex, gridSize);
    if (bestMove !== null) {
      sound.playPowerup();
      setHintIndex(bestMove);
      // Cost 5 coins if user has enough, else free helper
      if (stats.coins >= 5) {
        setStats((prev) => ({ ...prev, coins: prev.coins - 5 }));
      }
    }
  };

  // Boost: Auto Solve 1 Tile
  const handleBuySolveOneTile = () => {
    if (stats.coins < 25) return;
    // Deduct coins
    setStats((prev) => ({ ...prev, coins: prev.coins - 25 }));

    // Find first tile that is misplaced
    const misplacedIndex = tiles.findIndex((val, idx) => val !== idx && val !== gridSize * gridSize - 1);
    if (misplacedIndex !== -1) {
      // Find where tile `misplacedIndex` actually is
      const targetVal = misplacedIndex;
      const currentPosOfTarget = tiles.indexOf(targetVal);

      if (currentPosOfTarget !== -1) {
        const updated = [...tiles];
        // Swap them directly as a magical power-up
        const temp = updated[misplacedIndex];
        updated[misplacedIndex] = updated[currentPosOfTarget];
        updated[currentPosOfTarget] = temp;

        // If one of them was the empty slot, update emptyIndex
        const newEmpty = updated.indexOf(gridSize * gridSize - 1);
        setTiles(updated);
        setEmptyIndex(newEmpty);
        setIsShopModalOpen(false);

        // Check if solved
        if (isBoardSolved(updated)) {
          stopTimer();
          setIsWon(true);
          setIsWinModalOpen(true);
        }
      }
    }
  };

  // Boost: Double Reward
  const handleBuyDoubleReward = () => {
    if (stats.coins < 20 || hasDoubleReward) return;
    setStats((prev) => ({ ...prev, coins: prev.coins - 20 }));
    setHasDoubleReward(true);
    setIsShopModalOpen(false);
  };

  // Buy & Equip Themes
  const handleBuyTheme = (theme: BoardTheme) => {
    if (stats.coins < theme.price) return;
    setStats((prev) => ({
      ...prev,
      coins: prev.coins - theme.price,
      unlockedThemeIds: [...prev.unlockedThemeIds, theme.id],
    }));
    setActiveThemeId(theme.id);
    saveSelectedThemeId(theme.id);
  };

  const handleSelectTheme = (theme: BoardTheme) => {
    setActiveThemeId(theme.id);
    saveSelectedThemeId(theme.id);
  };

  // Rewarded Ad completion
  const handleRewardCoins = (amount: number) => {
    setStats((prev) => ({
      ...prev,
      coins: prev.coins + amount,
    }));
  };

  // Daily Spin Wheel reward
  const handleSpinReward = (amount: number, dateStr: string) => {
    setStats((prev) => ({
      ...prev,
      coins: prev.coins + amount,
      lastDailySpinDate: dateStr,
    }));
  };

  const handleDeductCoins = (amount: number) => {
    setStats((prev) => ({
      ...prev,
      coins: Math.max(0, prev.coins - amount),
    }));
  };

  return (
    <div className="min-h-screen bg-[#0d1b2a] text-white flex flex-col items-center justify-between bg-moroccan-pattern selection:bg-[#fca311] selection:text-black">
      {/* Top Header */}
      <Header
        coins={stats.coins}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onOpenShop={() => setIsShopModalOpen(true)}
        onOpenWheel={() => setIsWheelModalOpen(true)}
        onOpenStats={() => setIsStatsModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenAd={() => setIsAdModalOpen(true)}
      />

      {/* Main Game Container */}
      <main className="w-full flex-1 flex flex-col items-center justify-center py-2 sm:py-4 gap-2.5 sm:gap-3">
        {/* Controls: Upload, Random, Gallery, Grid Size, Helpers */}
        <ControlBar
          gridSize={gridSize}
          onChangeGridSize={handleChangeGridSize}
          onUploadImage={handleUploadImage}
          onRandomPreset={handleRandomPreset}
          onOpenGallery={() => setIsGalleryModalOpen(true)}
          showNumbers={showNumbers}
          onToggleNumbers={() => setShowNumbers((prev) => !prev)}
          isPeeking={isPeeking}
          onTogglePeek={setIsPeeking}
          onUseHint={handleUseHint}
          canHint={hintIndex === null}
        />

        {/* Info Panel: Current Title, Timer, Moves */}
        <InfoPanel
          imageName={currentTitle}
          timer={timer}
          moves={moves}
          onReset={() => initializeBoard(gridSize)}
        />

        {/* Puzzle Board */}
        <GameBoard
          gridSize={gridSize}
          tiles={tiles}
          emptyIndex={emptyIndex}
          currentImgUrl={currentImgUrl}
          theme={activeTheme}
          showNumbers={showNumbers}
          hintIndex={hintIndex}
          isPeeking={isPeeking}
          isWon={isWon}
          onMoveTile={handleMoveTile}
        />

        {/* Footer Panel: Target Reference & Watch Ad */}
        <FooterPanel
          currentImgUrl={currentImgUrl}
          imageTitle={currentTitle}
          onOpenAdModal={() => setIsAdModalOpen(true)}
          onOpenWheel={() => setIsWheelModalOpen(true)}
        />
      </main>

      {/* Subtle Moroccan Footer Brand Note */}
      <footer className="w-full py-2 text-center text-[11px] text-slate-300 border-t border-slate-800/80 bg-[#0d1b2a]/90">
        سطيفان بوزل 🇲🇦 Stiphan Puzzle • العب بالماوس، الكيبورد أو اللمس
      </footer>

      {/* All Dialogs & Modals */}
      <WinModal
        isOpen={isWinModalOpen}
        time={timer}
        moves={moves}
        gridSize={gridSize}
        coinsEarned={coinsEarnedThisWin}
        isNewRecord={isNewRecord}
        onNextPuzzle={handleRandomPreset}
        onReplay={() => initializeBoard(gridSize)}
        onClose={() => setIsWinModalOpen(false)}
      />

      <AdModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onRewardCoins={handleRewardCoins}
      />

      <GalleryModal
        isOpen={isGalleryModalOpen}
        currentUrl={currentImgUrl}
        onSelectImage={handleSelectPreset}
        onCustomUrl={handleCustomUrl}
        onUploadFile={handleUploadImage}
        onClose={() => setIsGalleryModalOpen(false)}
      />

      <ShopModal
        isOpen={isShopModalOpen}
        coins={stats.coins}
        unlockedThemeIds={stats.unlockedThemeIds}
        activeThemeId={activeThemeId}
        hasDoubleReward={hasDoubleReward}
        onBuyTheme={handleBuyTheme}
        onSelectTheme={handleSelectTheme}
        onBuySolveOneTile={handleBuySolveOneTile}
        onBuyDoubleReward={handleBuyDoubleReward}
        onOpenAd={() => setIsAdModalOpen(true)}
        onClose={() => setIsShopModalOpen(false)}
      />

      <SpinWheelModal
        isOpen={isWheelModalOpen}
        coins={stats.coins}
        lastDailySpinDate={stats.lastDailySpinDate}
        onReward={handleSpinReward}
        onDeductCoins={handleDeductCoins}
        onClose={() => setIsWheelModalOpen(false)}
      />

      <StatsModal
        isOpen={isStatsModalOpen}
        stats={stats}
        hasCustomUpload={hasCustomUpload}
        onClose={() => setIsStatsModalOpen(false)}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}
