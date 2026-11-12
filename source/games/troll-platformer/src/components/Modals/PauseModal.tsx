import React from 'react';
import { Play, RotateCcw, Grid, ShoppingBag, Volume2, VolumeX, Download, Settings, Heart } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface PauseModalProps {
  currentLevel: number;
  attemptsLeft: number;
  soundEnabled: boolean;
  volume: number;
  onToggleSound: () => void;
  onChangeVolume: (vol: number) => void;
  onResume: () => void;
  onRestart: () => void;
  onOpenLevelSelect: () => void;
  onOpenShop: () => void;
  onOpenExport: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  currentLevel,
  attemptsLeft,
  soundEnabled,
  volume,
  onToggleSound,
  onChangeVolume,
  onResume,
  onRestart,
  onOpenLevelSelect,
  onOpenShop,
  onOpenExport
}) => {
  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-40 animate-pop-in">
      <div className="w-full max-w-xs bg-stone-900 border-2 border-stone-700 rounded-3xl p-5 text-center shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-yellow-400" />
          <h3 className="text-white font-pixel text-sm tracking-wider">GAME PAUSED</h3>
        </div>

        <div className="flex items-center justify-center gap-3 text-xs text-stone-400 mb-5">
          <span className="font-pixel text-[11px] text-yellow-400">LEVEL {currentLevel}</span>
          <span>•</span>
          <span className="flex items-center gap-1 font-pixel text-[11px] text-red-400">
            <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" /> {attemptsLeft} LIVES
          </span>
        </div>

        {/* Audio Volume Controls */}
        <div className="bg-stone-950 border border-stone-800 rounded-2xl p-3 mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-300">
            <span className="font-pixel text-[10px]">SOUND EFFECTS</span>
            <button
              onClick={() => {
                soundManager.playButton();
                onToggleSound();
              }}
              className="p-1 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] font-mono text-stone-400 w-8 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-2">
          {/* Resume */}
          <button
            onClick={() => {
              soundManager.playButton();
              onResume();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-stone-950 font-pixel text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform"
          >
            <Play className="w-4 h-4 fill-stone-950" />
            <span>RESUME</span>
          </button>

          {/* Restart Level */}
          <button
            onClick={() => {
              soundManager.playButton();
              onRestart();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-pixel text-[11px] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-yellow-400" />
            <span>RESTART LEVEL</span>
          </button>

          {/* Level Selection */}
          <button
            onClick={() => {
              soundManager.playButton();
              onOpenLevelSelect();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-pixel text-[11px] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Grid className="w-4 h-4 text-amber-400" />
            <span>SELECT LEVEL (200)</span>
          </button>

          {/* Shop */}
          <button
            onClick={() => {
              soundManager.playButton();
              onOpenShop();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-pixel text-[11px] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-purple-400" />
            <span>STIPHAN SKINS</span>
          </button>

          {/* Export Standalone ZIP package */}
          <button
            onClick={() => {
              soundManager.playButton();
              onOpenExport();
            }}
            className="w-full py-2 px-3 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/50 text-stone-400 hover:text-amber-300 font-sans text-xs active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Game ZIP / APK Guide</span>
          </button>
        </div>
      </div>
    </div>
  );
};
