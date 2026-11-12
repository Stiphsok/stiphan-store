import React from 'react';
import { Play, Grid, ShoppingBag, Volume2, VolumeX, Download, Heart } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { BannerAd } from './BannerAd';

interface MainMenuProps {
  currentLevel: number;
  unlockedLevel: number;
  attemptsLeft: number;
  coins: number;
  soundEnabled: boolean;
  onPlay: () => void;
  onOpenLevelSelect: () => void;
  onOpenShop: () => void;
  onOpenExport: () => void;
  onToggleSound: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  currentLevel,
  unlockedLevel,
  attemptsLeft,
  coins,
  soundEnabled,
  onPlay,
  onOpenLevelSelect,
  onOpenShop,
  onOpenExport,
  onToggleSound
}) => {
  return (
    <div className="w-full h-full flex flex-col justify-between items-center p-4 bg-[#ff7a00] text-stone-900 select-none relative overflow-hidden">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-full bg-stone-900 text-yellow-400 font-pixel text-xs border border-stone-800 flex items-center gap-1.5 shadow-sm">
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>{attemptsLeft}/6 LIVES</span>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-stone-900 text-amber-300 font-pixel text-xs border border-stone-800 flex items-center gap-1 shadow-sm">
            <span>🪙 {coins}</span>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playButton();
            onToggleSound();
          }}
          className="p-2 rounded-xl bg-stone-900/80 text-stone-200 border border-stone-800 hover:bg-stone-800 transition-colors cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
        </button>
      </div>

      {/* Hero Title & Mascot Branding */}
      <div className="flex flex-col items-center text-center my-auto z-10">
        <div className="relative mb-3 animate-bounce">
          {/* Stiphan Pixel Mascot */}
          <div className="w-16 h-20 bg-yellow-300 border-3 border-stone-900 rounded-sm relative shadow-2xl flex flex-col items-center">
            {/* Fez Hat */}
            <div className="absolute -top-4 w-8 h-4 bg-red-700 rounded-t-sm border border-stone-900">
              <div className="w-1 h-3 bg-black absolute right-0 top-1" />
            </div>
            {/* Eyes */}
            <div className="w-full flex justify-end pr-2 pt-3">
              <div className="w-3 h-3 bg-white border border-stone-900 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-stone-950" />
              </div>
            </div>
            {/* Goofy Troll Mouth */}
            <div className="w-5 h-2 bg-stone-950 mt-4 rounded-xs" />
          </div>
          <span className="absolute -bottom-2 -right-3 text-lg">😈</span>
        </div>

        {/* Brand Name */}
        <h1 className="font-pixel text-3xl font-black text-stone-950 tracking-wider drop-shadow-sm mb-0.5">
          STIPHAN
        </h1>
        <div className="bg-stone-950 text-yellow-400 px-3 py-0.5 rounded-md font-pixel text-[11px] tracking-widest uppercase mb-1 shadow-md">
          DIE AGAIN: TROLL EDITION
        </div>

        <p className="font-arabic font-bold text-stone-900 text-sm dir-rtl mt-0.5" dir="rtl">
          لعبة الفخاخ المغربية المضحكة 🇲🇦
        </p>

        <p className="text-[11px] text-stone-800 font-bold max-w-xs mt-1">
          200 Unfair & Funny Levels • Mischievous Darija Laughs
        </p>
      </div>

      {/* Menu Navigation Buttons */}
      <div className="w-full max-w-xs flex flex-col gap-2.5 z-10 mb-2">
        {/* Play / Continue */}
        <button
          onClick={() => {
            soundManager.playButton();
            onPlay();
          }}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 text-yellow-400 border-2 border-stone-800 hover:brightness-110 active:scale-95 font-pixel text-sm font-black shadow-xl flex items-center justify-center gap-3 cursor-pointer transition-all"
        >
          <Play className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          <span>{currentLevel > 1 ? `CONTINUE (LVL ${currentLevel})` : 'PLAY GAME'}</span>
        </button>

        {/* Level Select & Shop */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              soundManager.playButton();
              onOpenLevelSelect();
            }}
            className="py-3 px-3 rounded-xl bg-stone-900/90 text-stone-200 border border-stone-800 hover:bg-stone-800 active:scale-95 font-pixel text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <Grid className="w-4 h-4 text-amber-400" />
            <span>LEVELS ({unlockedLevel}/200)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButton();
              onOpenShop();
            }}
            className="py-3 px-3 rounded-xl bg-stone-900/90 text-stone-200 border border-stone-800 hover:bg-stone-800 active:scale-95 font-pixel text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-purple-400" />
            <span>WARDROBE</span>
          </button>
        </div>

        {/* Download Standalone ZIP / APK Guide */}
        <button
          onClick={() => {
            soundManager.playButton();
            onOpenExport();
          }}
          className="py-2.5 px-3 rounded-xl bg-stone-900/60 hover:bg-stone-900/80 text-stone-950 border border-stone-800/40 active:scale-95 font-sans font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Game (.ZIP) & Android APK Guide</span>
        </button>
      </div>

      {/* Banner Ad Placement at Menu Footer (Requirement 8) */}
      <BannerAd placement="menu" />
    </div>
  );
};
