import React from 'react';
import { Clapperboard, Heart, Sparkles, Clock } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface OutOfLivesModalProps {
  onWatchAdForLives: () => void;
  onFreeRefillTimer?: () => void;
  coins: number;
  onBuyLivesWithCoins: () => void;
}

export const OutOfLivesModal: React.FC<OutOfLivesModalProps> = ({
  onWatchAdForLives,
  coins,
  onBuyLivesWithCoins
}) => {
  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-50 animate-pop-in">
      <div className="w-full max-w-xs bg-stone-900 border-2 border-red-500/60 rounded-3xl p-5 text-center shadow-2xl relative overflow-hidden">
        {/* Pulsing Skull/Heart */}
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-red-950/80 border-2 border-red-500/80 flex items-center justify-center animate-pulse">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
        </div>

        <h3 className="text-white font-pixel text-sm tracking-wide mb-1">
          OUT OF LIVES!
        </h3>

        {/* Funny Darija punchline */}
        <p className="font-arabic font-bold text-yellow-400 text-base mb-1" dir="rtl">
          صافي تقاضاو ليك المحاولات! 😂
        </p>
        <p className="text-stone-400 text-[11px] mb-4">
          All 6 free attempts have been used. Watch an ad to get 3 more attempts and keep your level progress!
        </p>

        {/* Primary Action: Watch Rewarded Ad for +3 Lives */}
        <button
          onClick={() => {
            soundManager.playButton();
            onWatchAdForLives();
          }}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 hover:brightness-110 active:scale-95 text-stone-950 font-pixel text-xs font-black shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all mb-2.5"
        >
          <Clapperboard className="w-5 h-5 text-stone-950 stroke-[2.5]" />
          <span>WATCH AD (+3 LIVES)</span>
        </button>

        {/* Secondary Option: Buy 3 Lives with 50 Coins */}
        {coins >= 50 && (
          <button
            onClick={() => {
              soundManager.playButton();
              onBuyLivesWithCoins();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 border border-amber-500/40 text-amber-300 font-pixel text-[10px] active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer transition-all mb-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>BUY 3 LIVES (50 COINS)</span>
          </button>
        )}

        {/* Free timer / preservation reminder */}
        <div className="flex items-center justify-center gap-1.5 text-stone-400 text-[10px] pt-2 border-t border-stone-800">
          <Clock className="w-3 h-3 text-stone-400" />
          <span>Your unlocked levels are safely preserved!</span>
        </div>
      </div>
    </div>
  );
};
