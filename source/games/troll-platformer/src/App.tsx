import { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine, InputState } from './game/GameEngine';
import { getLevel, TOTAL_LEVELS } from './game/levels';
import { getSkin } from './data/skins';
import { getRandomDarijaQuote, DarijaQuote } from './data/darijaQuotes';
import { soundManager } from './audio/soundManager';
import { adManager } from './ads/AdManager';
import { GameScreen, AdRewardType, Skin } from './types/game';

// Components
import { MainMenu } from './components/MainMenu';
import { HeaderHUD } from './components/HeaderHUD';
import { TouchControls } from './components/TouchControls';
import { DeathModal } from './components/Modals/DeathModal';
import { OutOfLivesModal } from './components/Modals/OutOfLivesModal';
import { LevelWinModal } from './components/Modals/LevelWinModal';
import { PauseModal } from './components/Modals/PauseModal';
import { LevelSelectModal } from './components/Modals/LevelSelectModal';
import { ShopModal } from './components/Modals/ShopModal';
import { AdRewardedModal } from './components/Modals/AdRewardedModal';
import { ExportZipModal } from './components/Modals/ExportZipModal';
import { CampaignCompleteModal } from './components/Modals/CampaignCompleteModal';

const STORAGE_KEY = 'stiphan_game_save_v1';

export function App() {
  // Game Screen State
  const [screen, setScreen] = useState<GameScreen>('menu');

  // Progression & Save State
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(6); // 6 Free attempts
  const [totalDeaths, setTotalDeaths] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [selectedSkinId, setSelectedSkinId] = useState<string>('classic');
  const [unlockedSkinIds, setUnlockedSkinIds] = useState<string[]>(['classic']);

  // Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.7);
  const [hintsRevealed, setHintsRevealed] = useState<boolean>(false);

  // Transient Modal States
  const [currentQuote, setCurrentQuote] = useState<DarijaQuote>(getRandomDarijaQuote());
  const [activeAdReward, setActiveAdReward] = useState<AdRewardType | null>(null);
  const [winCoinsBonusClaimed, setWinCoinsBonusClaimed] = useState<boolean>(false);
  const [lowLivesWarningShown, setLowLivesWarningShown] = useState<boolean>(false);

  // Canvas & Engine Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Input states
  const inputRef = useRef<InputState>({ left: false, right: false, jump: false });

  // 1. Load Saved Progress from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.currentLevel) setCurrentLevel(data.currentLevel);
        if (data.unlockedLevel) setUnlockedLevel(data.unlockedLevel);
        if (data.completedLevels) setCompletedLevels(data.completedLevels);
        if (data.attemptsLeft !== undefined) setAttemptsLeft(Math.max(1, data.attemptsLeft));
        if (data.totalDeaths) setTotalDeaths(data.totalDeaths);
        if (data.coins) setCoins(data.coins);
        if (data.selectedSkinId) setSelectedSkinId(data.selectedSkinId);
        if (data.unlockedSkinIds) setUnlockedSkinIds(data.unlockedSkinIds);
        if (data.soundEnabled !== undefined) {
          setSoundEnabled(data.soundEnabled);
          soundManager.setEnabled(data.soundEnabled);
        }
        if (data.volume !== undefined) {
          setVolume(data.volume);
          soundManager.setVolume(data.volume);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // 2. Save Progress to LocalStorage
  const saveProgress = useCallback(() => {
    try {
      const data = {
        currentLevel,
        unlockedLevel,
        completedLevels,
        attemptsLeft,
        totalDeaths,
        coins,
        selectedSkinId,
        unlockedSkinIds,
        soundEnabled,
        volume
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore
    }
  }, [
    currentLevel,
    unlockedLevel,
    completedLevels,
    attemptsLeft,
    totalDeaths,
    coins,
    selectedSkinId,
    unlockedSkinIds,
    soundEnabled,
    volume
  ]);

  useEffect(() => {
    saveProgress();
  }, [saveProgress]);

  // Handle Player Death
  const handlePlayerDeath = useCallback(() => {
    setTotalDeaths((d) => d + 1);
    setCurrentQuote(getRandomDarijaQuote());

    setAttemptsLeft((prev) => {
      const nextLives = Math.max(0, prev - 1);

      // Warning when only 2 lives remain (Requirement 7)
      if (nextLives === 2) {
        setLowLivesWarningShown(true);
        soundManager.playWarning();
        setTimeout(() => setLowLivesWarningShown(false), 3000);
      }

      // Check if out of lives
      if (nextLives <= 0) {
        setTimeout(() => {
          setScreen('out_of_lives');
        }, 600);
      } else {
        setTimeout(() => {
          setScreen('game_over');
        }, 500);
      }

      return nextLives;
    });
  }, []);

  // Handle Level Complete
  const handleLevelComplete = useCallback(() => {
    // Add base 10 coins
    setCoins((c) => c + 10);
    setWinCoinsBonusClaimed(false);

    // Record completion
    setCompletedLevels((prev) => {
      if (!prev.includes(currentLevel)) {
        return [...prev, currentLevel];
      }
      return prev;
    });

    // Unlock next level
    if (currentLevel >= unlockedLevel && unlockedLevel < TOTAL_LEVELS) {
      setUnlockedLevel(currentLevel + 1);
    }

    // Check for Final Campaign Win (Level 200!)
    if (currentLevel >= TOTAL_LEVELS) {
      setScreen('campaign_complete');
      return;
    }

    // Interstitial check: Frequency capped between levels (Requirement 8)
    if (adManager.shouldShowInterstitial()) {
      adManager.recordInterstitialShown();
      // Show occasional non-intrusive ad
    }

    setScreen('level_win');
  }, [currentLevel, unlockedLevel]);

  // Handle Coin Collected in level
  const handleCoinCollected = useCallback((amount: number) => {
    setCoins((c) => c + amount);
  }, []);

  // Initialize or Update Game Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const levelData = getLevel(currentLevel);
    const skinData = getSkin(selectedSkinId);

    if (!engineRef.current) {
      const engine = new GameEngine(canvasRef.current, levelData, skinData);
      engine.onDeath = handlePlayerDeath;
      engine.onLevelComplete = handleLevelComplete;
      engine.onCoinCollected = handleCoinCollected;
      engine.setHintsRevealed(hintsRevealed);
      engineRef.current = engine;
    } else {
      engineRef.current.setLevel(levelData);
      engineRef.current.setSkin(skinData);
      engineRef.current.setHintsRevealed(hintsRevealed);
      engineRef.current.onDeath = handlePlayerDeath;
      engineRef.current.onLevelComplete = handleLevelComplete;
      engineRef.current.onCoinCollected = handleCoinCollected;
    }

    if (screen === 'playing') {
      engineRef.current.start();
    } else {
      engineRef.current.stop();
    }
  }, [currentLevel, selectedSkinId, screen, hintsRevealed, handlePlayerDeath, handleLevelComplete, handleCoinCollected]);

  // Keyboard controls listener (Arrow keys, WASD, Space, R, P/Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'playing') {
        if (e.code === 'KeyP' || e.code === 'Escape') {
          if (screen === 'paused') setScreen('playing');
        }
        return;
      }

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        inputRef.current.left = true;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        inputRef.current.right = true;
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        inputRef.current.jump = true;
      } else if (e.code === 'KeyR') {
        // Quick restart
        handleRestartLevel();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        handlePause();
      }

      if (engineRef.current) {
        engineRef.current.input = { ...inputRef.current };
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        inputRef.current.left = false;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        inputRef.current.right = false;
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        inputRef.current.jump = false;
      }

      if (engineRef.current) {
        engineRef.current.input = { ...inputRef.current };
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [screen]);

  // Touch control input handler
  const handleTouchInput = (key: keyof InputState, value: boolean) => {
    inputRef.current[key] = value;
    if (engineRef.current) {
      engineRef.current.input = { ...inputRef.current };
    }
  };

  // Restart level
  const handleRestartLevel = () => {
    if (engineRef.current) {
      engineRef.current.restartLevel();
    }
    setScreen('playing');
  };

  // Pause
  const handlePause = () => {
    setScreen('paused');
  };

  // Sound toggle
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setEnabled(next);
  };

  // Sound volume change
  const handleChangeVolume = (vol: number) => {
    setVolume(vol);
    soundManager.setVolume(vol);
  };

  // Level Selection
  const handleSelectLevel = (lvl: number) => {
    setCurrentLevel(lvl);
    setHintsRevealed(false);
    if (engineRef.current) {
      engineRef.current.setLevel(getLevel(lvl));
      engineRef.current.restartLevel();
    }
    setScreen('playing');
  };

  // Next level
  const handleNextLevel = () => {
    const nextLvl = Math.min(TOTAL_LEVELS, currentLevel + 1);
    setCurrentLevel(nextLvl);
    setHintsRevealed(false);
    if (engineRef.current) {
      engineRef.current.setLevel(getLevel(nextLvl));
      engineRef.current.restartLevel();
    }
    setScreen('playing');
  };

  // Shop skin purchase
  const handleBuySkin = (skin: Skin) => {
    if (coins >= skin.price) {
      setCoins((c) => c - skin.price);
      setUnlockedSkinIds((prev) => [...prev, skin.id]);
      setSelectedSkinId(skin.id);
      soundManager.playCoin();
    }
  };

  // Rewarded Ad triggers
  const handleWatchRewardedAd = (type: AdRewardType) => {
    setActiveAdReward(type);
    adManager.requestRewardedAd(type, (completedType) => {
      handleRewardGranted(completedType);
    });
  };

  // Grant benefits from Rewarded Ad completion
  const handleRewardGranted = (type: AdRewardType) => {
    switch (type) {
      case 'extra_lives':
        setAttemptsLeft((prev) => prev + 3);
        setScreen('playing');
        if (engineRef.current) engineRef.current.restartLevel();
        break;
      case 'second_chance':
        setAttemptsLeft((prev) => Math.max(1, prev));
        if (engineRef.current) {
          engineRef.current.revivePlayer();
        }
        setScreen('playing');
        break;
      case 'level_bonus_coins':
        setCoins((c) => c + 50);
        setWinCoinsBonusClaimed(true);
        break;
      case 'reveal_hints':
        setHintsRevealed(true);
        if (engineRef.current) engineRef.current.setHintsRevealed(true);
        setScreen('playing');
        break;
      case 'daily_bonus':
        setAttemptsLeft((prev) => prev + 3);
        setCoins((c) => c + 100);
        break;
    }
    setActiveAdReward(null);
  };

  // Buy 3 lives with coins
  const handleBuyLivesWithCoins = () => {
    if (coins >= 50) {
      setCoins((c) => c - 50);
      setAttemptsLeft((prev) => prev + 3);
      setScreen('playing');
      if (engineRef.current) engineRef.current.restartLevel();
      soundManager.playCoin();
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#14100c] flex items-center justify-center p-0 md:p-3 overflow-hidden select-none">
      {/* Mobile Portrait Viewport Container (9:16 aspect ratio) */}
      <div className="relative w-full max-w-[420px] h-full max-h-[820px] aspect-[9/16] bg-[#ff7a00] md:rounded-[36px] md:border-4 md:border-stone-800 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Subtle Scanlines overlay for retro CRT flair */}
        <div className="absolute inset-0 scanlines pointer-events-none z-30" />

        {/* 1. Main Menu Screen */}
        {screen === 'menu' && (
          <MainMenu
            currentLevel={currentLevel}
            unlockedLevel={unlockedLevel}
            attemptsLeft={attemptsLeft}
            coins={coins}
            soundEnabled={soundEnabled}
            onPlay={() => {
              setScreen('playing');
              if (engineRef.current) engineRef.current.restartLevel();
            }}
            onOpenLevelSelect={() => setScreen('level_select')}
            onOpenShop={() => setScreen('shop')}
            onOpenExport={() => setScreen('export_zip')}
            onToggleSound={handleToggleSound}
          />
        )}

        {/* 2. Active Game Screen */}
        {screen !== 'menu' && (
          <>
            {/* Header HUD */}
            <HeaderHUD
              currentLevel={currentLevel}
              attemptsLeft={attemptsLeft}
              coins={coins}
              soundEnabled={soundEnabled}
              hintsRevealed={hintsRevealed}
              onToggleSound={handleToggleSound}
              onRestart={handleRestartLevel}
              onPause={handlePause}
              onOpenHints={() => handleWatchRewardedAd('reveal_hints')}
            />

            {/* Low Lives Urgent Warning Banner */}
            {lowLivesWarningShown && (
              <div className="absolute top-14 left-4 right-4 bg-red-600 text-white font-pixel text-[11px] p-2 rounded-xl text-center shadow-lg border-2 border-yellow-300 z-30 animate-bounce">
                ⚠️ WARNING: ONLY 2 LIVES LEFT! ⚠️
              </div>
            )}

            {/* Game Canvas Container */}
            <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
              <canvas
                ref={canvasRef}
                width={360}
                height={640}
                className="w-full h-full object-contain pixelated"
              />
            </div>

            {/* Mobile Touch Controls at Bottom */}
            <TouchControls onInputChange={handleTouchInput} />
          </>
        )}

        {/* === MODALS & OVERLAYS === */}

        {/* Out of Lives Modal (Requirement 7) */}
        {screen === 'out_of_lives' && (
          <OutOfLivesModal
            onWatchAdForLives={() => handleWatchRewardedAd('extra_lives')}
            coins={coins}
            onBuyLivesWithCoins={handleBuyLivesWithCoins}
          />
        )}

        {/* Player Death Modal with Darija Messages (Requirement 6) */}
        {screen === 'game_over' && (
          <DeathModal
            quote={currentQuote}
            attemptsLeft={attemptsLeft}
            onRetry={handleRestartLevel}
            onWatchAdRevive={() => handleWatchRewardedAd('second_chance')}
          />
        )}

        {/* Level Victory Modal */}
        {screen === 'level_win' && (
          <LevelWinModal
            levelNumber={currentLevel}
            coinsEarned={10}
            onNextLevel={handleNextLevel}
            onReplayLevel={handleRestartLevel}
            onWatchAdBonusCoins={() => handleWatchRewardedAd('level_bonus_coins')}
            bonusClaimed={winCoinsBonusClaimed}
          />
        )}

        {/* Pause Modal */}
        {screen === 'paused' && (
          <PauseModal
            currentLevel={currentLevel}
            attemptsLeft={attemptsLeft}
            soundEnabled={soundEnabled}
            volume={volume}
            onToggleSound={handleToggleSound}
            onChangeVolume={handleChangeVolume}
            onResume={() => setScreen('playing')}
            onRestart={handleRestartLevel}
            onOpenLevelSelect={() => setScreen('level_select')}
            onOpenShop={() => setScreen('shop')}
            onOpenExport={() => setScreen('export_zip')}
          />
        )}

        {/* Level Select Modal (200 Levels) */}
        {screen === 'level_select' && (
          <LevelSelectModal
            currentLevel={currentLevel}
            unlockedLevel={unlockedLevel}
            completedLevels={completedLevels}
            onSelectLevel={handleSelectLevel}
            onClose={() => setScreen(currentLevel > 0 ? 'playing' : 'menu')}
          />
        )}

        {/* Wardrobe / Shop Modal */}
        {screen === 'shop' && (
          <ShopModal
            coins={coins}
            unlockedSkinIds={unlockedSkinIds}
            selectedSkinId={selectedSkinId}
            onSelectSkin={(id) => setSelectedSkinId(id)}
            onBuySkin={handleBuySkin}
            onClose={() => setScreen('menu')}
          />
        )}

        {/* Rewarded Video Ad Modal */}
        {activeAdReward && (
          <AdRewardedModal
            rewardType={activeAdReward}
            onRewardComplete={() => handleRewardGranted(activeAdReward)}
            onClose={() => setActiveAdReward(null)}
          />
        )}

        {/* Standalone ZIP Exporter & APK Guide Modal */}
        {screen === 'export_zip' && (
          <ExportZipModal onClose={() => setScreen('menu')} />
        )}

        {/* Final Campaign Complete Modal (Conquered all 200 levels!) */}
        {screen === 'campaign_complete' && (
          <CampaignCompleteModal
            totalDeaths={totalDeaths}
            totalCoins={coins}
            onRestartGame={() => {
              setCurrentLevel(1);
              setAttemptsLeft(6);
              setScreen('playing');
              if (engineRef.current) engineRef.current.restartLevel();
            }}
            onOpenExport={() => setScreen('export_zip')}
          />
        )}
      </div>
    </div>
  );
}

export default App;
