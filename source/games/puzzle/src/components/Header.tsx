import React from 'react';
import { Volume2, VolumeX, ShoppingBag, Trophy, Sparkles, HelpCircle } from 'lucide-react';
import { sound } from '../utils/sound';

interface HeaderProps {
  coins: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenShop: () => void;
  onOpenWheel: () => void;
  onOpenStats: () => void;
  onOpenHelp: () => void;
  onOpenAd: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  coins,
  soundEnabled,
  onToggleSound,
  onOpenShop,
  onOpenWheel,
  onOpenStats,
  onOpenHelp,
  onOpenAd,
}) => {
  return (
    <header className="w-full bg-[#1b263b] border-b-2 border-[#fca311] px-4 py-3 shadow-lg z-30 sticky top-0">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
        {/* Logo and Moroccan Tagline */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fca311] to-[#e63946] flex items-center justify-center text-xl shadow-md border border-amber-300/30 select-none">
            🧩
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black text-[#fca311] tracking-wide leading-tight flex items-center gap-1.5">
              <span>سطيفان بوزل</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#fca311]/20 text-[#fca311] border border-[#fca311]/40 hidden sm:inline-block">
                Stiphan
              </span>
            </h1>
            <p className="text-[11px] text-slate-300/90 font-medium leading-none">
              رتب الصورة واربح العملات 🇲🇦
            </p>
          </div>
        </div>

        {/* Action badges: Coins, Shop, Wheel, Sound */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Coins Badge (Clickable to get more coins) */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAd();
            }}
            title="انقر لربح عملات مجانية"
            className="flex items-center gap-1.5 bg-[#121212] hover:bg-[#121212]/90 active:scale-95 transition-all border border-[#fca311] px-2.5 py-1.5 rounded-full text-xs font-bold text-[#fca311] shadow-inner group"
          >
            <span className="text-sm group-hover:rotate-12 transition-transform">🪙</span>
            <span className="font-mono text-sm tracking-tight">{coins}</span>
            <span className="text-[11px] text-slate-300 hidden min-[400px]:inline">عملة</span>
            <span className="bg-[#fca311] text-black rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform">
              +
            </span>
          </button>

          {/* Lucky Wheel */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenWheel();
            }}
            title="عجلة الحظ اليومية"
            className="p-2 rounded-lg bg-[#415a77]/50 hover:bg-[#415a77] text-amber-300 hover:text-amber-200 transition-colors border border-amber-500/20 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
          </button>

          {/* Shop */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenShop();
            }}
            title="متجر الثيمات والمساعدات"
            className="p-2 rounded-lg bg-[#415a77]/50 hover:bg-[#415a77] text-emerald-400 hover:text-emerald-300 transition-colors border border-emerald-500/20 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>

          {/* Stats / Trophies */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenStats();
            }}
            title="الأرقام القياسية والإنجازات"
            className="p-2 rounded-lg bg-[#415a77]/50 hover:bg-[#415a77] text-cyan-400 hover:text-cyan-300 transition-colors border border-cyan-500/20 active:scale-95"
          >
            <Trophy className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
            className={`p-2 rounded-lg transition-colors border active:scale-95 ${
              soundEnabled
                ? 'bg-[#415a77]/50 hover:bg-[#415a77] text-white border-white/10'
                : 'bg-red-900/40 hover:bg-red-900/60 text-red-300 border-red-500/30'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Instructions */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenHelp();
            }}
            title="طريقة اللعب"
            className="p-2 rounded-lg bg-[#415a77]/50 hover:bg-[#415a77] text-slate-300 hover:text-white transition-colors border border-white/10 active:scale-95"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
