import React from 'react';
import { Volume2, VolumeX, RotateCcw, Pause, Heart, Coins, Lightbulb, AlertTriangle } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface HeaderHUDProps {
  currentLevel: number;
  attemptsLeft: number;
  coins: number;
  soundEnabled: boolean;
  hintsRevealed: boolean;
  onToggleSound: () => void;
  onRestart: () => void;
  onPause: () => void;
  onOpenHints: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  attemptsLeft,
  coins,
  soundEnabled,
  hintsRevealed,
  onToggleSound,
  onRestart,
  onPause,
  onOpenHints
}) => {
  const isLowLives = attemptsLeft <= 2 && attemptsLeft > 0;

  return (
    <div className="w-full px-3 py-2 flex items-center justify-between text-stone-900 select-none z-20">
      {/* Attempts / Lives Counter */}
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-pixel text-xs border shadow-sm transition-all ${
            isLowLives
              ? 'bg-red-500 text-white border-red-300 animate-pulse'
              : 'bg-stone-900/80 text-yellow-400 border-stone-700'
          }`}
        >
          {isLowLives ? (
            <AlertTriangle className="w-4 h-4 text-yellow-300" />
          ) : (
            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
          )}
          <span className="font-bold">{attemptsLeft}</span>
          <span className="text-[9px] text-stone-300 font-sans">LIVES</span>
        </div>

        {/* Coins indicator */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-stone-900/80 text-amber-300 border border-stone-700 text-xs font-pixel shadow-sm">
          <Coins className="w-3.5 h-3.5 text-yellow-400" />
          <span>{coins}</span>
        </div>
      </div>

      {/* Action Buttons: Hint, Sound, Restart, Pause */}
      <div className="flex items-center gap-1.5">
        {/* Trap Detector / Hint */}
        <button
          onClick={() => {
            soundManager.playButton();
            onOpenHints();
          }}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            hintsRevealed
              ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-md ring-2 ring-amber-300'
              : 'bg-stone-900/80 text-stone-200 border-stone-700 hover:bg-stone-800'
          }`}
          title="Trap Radar Hint"
        >
          <Lightbulb className="w-4 h-4" />
        </button>

        {/* Sound toggle */}
        <button
          onClick={() => {
            soundManager.playButton();
            onToggleSound();
          }}
          className="p-1.5 rounded-lg bg-stone-900/80 text-stone-200 border border-stone-700 hover:bg-stone-800 transition-colors cursor-pointer"
          title={soundEnabled ? 'Mute' : 'Unmute'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-green-400" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
        </button>

        {/* Quick Restart */}
        <button
          onClick={() => {
            soundManager.playButton();
            onRestart();
          }}
          className="p-1.5 rounded-lg bg-stone-900/80 text-stone-200 border border-stone-700 hover:bg-stone-800 transition-colors cursor-pointer"
          title="Restart Level"
        >
          <RotateCcw className="w-4 h-4 text-yellow-400" />
        </button>

        {/* Pause */}
        <button
          onClick={() => {
            soundManager.playButton();
            onPause();
          }}
          className="p-1.5 rounded-lg bg-stone-900/80 text-stone-200 border border-stone-700 hover:bg-stone-800 transition-colors cursor-pointer"
          title="Pause Game"
        >
          <Pause className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
