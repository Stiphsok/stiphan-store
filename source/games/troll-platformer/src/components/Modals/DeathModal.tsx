import React from 'react';
import { RotateCcw, Clapperboard, Heart, AlertCircle } from 'lucide-react';
import { DarijaQuote } from '../../data/darijaQuotes';
import { soundManager } from '../../audio/soundManager';

interface DeathModalProps {
  quote: DarijaQuote;
  attemptsLeft: number;
  onRetry: () => void;
  onWatchAdRevive: () => void;
}

export const DeathModal: React.FC<DeathModalProps> = ({
  quote,
  attemptsLeft,
  onRetry,
  onWatchAdRevive
}) => {
  const isLastLife = attemptsLeft === 1;

  return (
    <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-40 animate-pop-in">
      <div className="w-full max-w-xs bg-stone-900 border-2 border-stone-700 rounded-3xl p-5 text-center shadow-2xl relative overflow-hidden">
        {/* Top Troll Header */}
        <div className="text-4xl mb-2 animate-bounce">{quote.emoji}</div>

        <h3 className="text-red-500 font-pixel text-sm tracking-wider mb-3">
          YOU DIED!
        </h3>

        {/* Moroccan Darija Troll Quote */}
        <div className="bg-stone-950 border border-stone-800 rounded-2xl p-3.5 mb-4">
          <p className="font-arabic font-black text-xl text-yellow-400 mb-1 leading-relaxed dir-rtl" dir="rtl">
            {quote.arabic}
          </p>
          <p className="text-stone-400 text-[11px] italic mb-0.5">
            "{quote.phonetic}"
          </p>
          <p className="text-stone-300 text-xs font-semibold">
            {quote.translation}
          </p>
        </div>

        {/* Attempts Status */}
        <div className="flex items-center justify-center gap-1.5 mb-5">
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          <span className="text-xs font-pixel text-stone-200">
            {attemptsLeft} {attemptsLeft === 1 ? 'ATTEMPT' : 'ATTEMPTS'} LEFT
          </span>
          {isLastLife && (
            <span className="flex items-center text-[10px] text-amber-400 font-bold ml-1">
              <AlertCircle className="w-3 h-3 mr-0.5 text-amber-400" /> CRITICAL!
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {/* Quick Retry Button */}
          <button
            onClick={() => {
              soundManager.playButton();
              onRetry();
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-stone-950 font-pixel text-xs font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>TRY AGAIN</span>
          </button>

          {/* Watch Rewarded Ad for Instant Revive */}
          <button
            onClick={() => {
              soundManager.playButton();
              onWatchAdRevive();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-200 font-sans text-xs font-bold active:scale-95 flex items-center justify-center gap-2 cursor-pointer transition-transform"
          >
            <Clapperboard className="w-4 h-4 text-yellow-400" />
            <span>Second Chance (Revive Here)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
