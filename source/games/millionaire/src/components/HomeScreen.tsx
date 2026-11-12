import React from 'react';
import { Play, Trophy, Zap, Edit3, Settings, ShieldCheck, User } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface HomeScreenProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  onStartClassic: () => void;
  onStartSpeed: () => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onOpenBuilder: () => void;
  currencySymbol: string;
  highScore: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  playerName,
  setPlayerName,
  onStartClassic,
  onStartSpeed,
  onOpenSettings,
  onOpenStats,
  onOpenBuilder,
  currencySymbol,
  highScore
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center space-y-8 py-6 px-4">
      
      {/* Golden Studio Spotlight Logo */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-4 border-amber-400/80 shadow-[0_0_50px_rgba(245,158,11,0.4)] flex items-center justify-center mx-auto group-hover:scale-105 transition-transform duration-500">
          <div className="absolute inset-2 rounded-full border-2 border-dashed border-amber-500/40 animate-spin-slow"></div>
          <div className="flex flex-col items-center">
            <Trophy className="w-16 h-16 md:w-20 md:h-20 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
            <span className="text-[11px] font-black text-amber-300 tracking-widest uppercase mt-1">
              النسخة الذهبية
            </span>
          </div>
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div className="space-y-3">
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent drop-shadow-lg tracking-tight">
          من سيربح المليون؟
        </h1>
        <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          اختبر معرفتك وثقافتك العامة في أضخم مسابقة تفاعلية عربية! 15 سؤالاً تفصلك عن حصد جائزة المليون الكبرى!
        </p>
      </div>

      {/* Player Input & High score Banner */}
      <div className="w-full max-w-md bg-slate-900/90 border-2 border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="space-y-2 text-right">
          <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <User className="w-4 h-4" /> اسم المتسابق:
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="أدخل اسمك الكريم..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-bold text-center focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
          />
        </div>

        {highScore > 0 && (
          <div className="flex items-center justify-between bg-slate-950/80 px-4 py-2.5 rounded-xl border border-amber-500/30 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> أعلى رصيد محقق:
            </span>
            <span className="font-extrabold text-amber-400 font-mono text-sm">
              {highScore.toLocaleString()} {currencySymbol}
            </span>
          </div>
        )}
      </div>

      {/* Primary Action Buttons */}
      <div className="w-full max-w-md space-y-4">
        
        {/* Start Classic Game */}
        <button
          onClick={() => {
            soundFx.playWin();
            onStartClassic();
          }}
          className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 text-xl font-black rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.5)] active:scale-98 transition-all flex items-center justify-center gap-3 border-2 border-amber-300"
        >
          <Play className="w-7 h-7 fill-slate-950" />
          ابدأ مسابقة المليون الكلاسيكية
        </button>

        {/* Start Speed Attack */}
        <button
          onClick={() => {
            soundFx.playWin();
            onStartSpeed();
          }}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold rounded-2xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 border border-purple-400/40 text-base"
        >
          <Zap className="w-5 h-5 text-amber-400 animate-bounce" />
          تحدي السرعة والخاطف (60 ثانية)
        </button>

      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-md pt-2">
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenStats();
          }}
          className="p-3 bg-slate-900/90 border border-slate-800 hover:border-amber-400 rounded-xl flex flex-col items-center justify-center text-xs font-bold text-slate-300 hover:text-amber-300 transition-all group"
        >
          <Trophy className="w-5 h-5 mb-1 text-amber-400 group-hover:scale-110 transition-transform" />
          <span>سجل الأرباح</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onOpenBuilder();
          }}
          className="p-3 bg-slate-900/90 border border-slate-800 hover:border-amber-400 rounded-xl flex flex-col items-center justify-center text-xs font-bold text-slate-300 hover:text-amber-300 transition-all group"
        >
          <Edit3 className="w-5 h-5 mb-1 text-amber-400 group-hover:scale-110 transition-transform" />
          <span>صانع الأسئلة</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onOpenSettings();
          }}
          className="p-3 bg-slate-900/90 border border-slate-800 hover:border-amber-400 rounded-xl flex flex-col items-center justify-center text-xs font-bold text-slate-300 hover:text-amber-300 transition-all group"
        >
          <Settings className="w-5 h-5 mb-1 text-amber-400 group-hover:scale-110 transition-transform" />
          <span>الإعدادات</span>
        </button>
      </div>

    </div>
  );
};
