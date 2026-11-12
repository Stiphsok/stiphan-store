import React, { useEffect } from 'react';
import { ArrowRight, Trophy, Coins, Clapperboard, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../audio/soundManager';

interface LevelWinModalProps {
  levelNumber: number;
  coinsEarned: number;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onWatchAdBonusCoins: () => void;
  bonusClaimed: boolean;
}

export const LevelWinModal: React.FC<LevelWinModalProps> = ({
  levelNumber,
  coinsEarned,
  onNextLevel,
  onReplayLevel,
  onWatchAdBonusCoins,
  bonusClaimed
}) => {
  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore if unavailable
    }
  }, []);

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-40 animate-pop-in">
      <div className="w-full max-w-xs bg-stone-900 border-2 border-yellow-500 rounded-3xl p-5 text-center shadow-2xl relative overflow-hidden">
        {/* Victory Trophy */}
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-yellow-950/80 border-2 border-yellow-400 flex items-center justify-center glow-pulse">
          <Trophy className="w-8 h-8 text-yellow-400 stroke-[2.5]" />
        </div>

        <h3 className="text-yellow-400 font-pixel text-sm tracking-wide mb-1">
          LEVEL {levelNumber} CLEAR!
        </h3>

        {/* Moroccan congratulatory chant */}
        <p className="font-arabic font-bold text-emerald-400 text-lg mb-1" dir="rtl">
          مبروك آ البطل! ناضي 👏🎉
        </p>
        <p className="text-stone-400 text-xs mb-4">
          You survived the troll traps!
        </p>

        {/* Coins Earned */}
        <div className="bg-stone-950 border border-stone-800 rounded-2xl p-3 flex items-center justify-around mb-4">
          <div className="flex items-center gap-1.5 text-yellow-400 font-pixel text-xs">
            <Coins className="w-4 h-4" />
            <span>+{coinsEarned} COINS</span>
          </div>
        </div>

        {/* Watch Ad for 2X Coins */}
        {!bonusClaimed && (
          <button
            onClick={() => {
              soundManager.playButton();
              onWatchAdBonusCoins();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500 text-amber-200 font-sans text-xs font-bold active:scale-95 flex items-center justify-center gap-2 cursor-pointer transition-all mb-3"
          >
            <Clapperboard className="w-4 h-4 text-yellow-400" />
            <span>Watch Ad for +50 Bonus Coins!</span>
          </button>
        )}

        {/* Next Level & Replay Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              soundManager.playButton();
              onNextLevel();
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 active:scale-95 text-stone-950 font-pixel text-xs font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform"
          >
            <span>NEXT LEVEL</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          <button
            onClick={() => {
              soundManager.playButton();
              onReplayLevel();
            }}
            className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-sans text-xs active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Level</span>
          </button>
        </div>
      </div>
    </div>
  );
};
