import React from 'react';
import { Volume2, VolumeX, Settings, BarChart2, Edit3, DollarSign, Home, Award } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface HeaderProps {
  playerName: string;
  currencySymbol: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onOpenBuilder: () => void;
  onBankMoney?: () => void;
  currentPrize?: number;
  isInGame?: boolean;
  onHomeClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  playerName,
  currencySymbol,
  isMuted,
  onToggleMute,
  onOpenSettings,
  onOpenStats,
  onOpenBuilder,
  onBankMoney,
  currentPrize = 0,
  isInGame = false,
  onHomeClick
}) => {
  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-amber-500/30 sticky top-0 z-40 px-4 py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo / Title */}
        <button
          onClick={onHomeClick}
          className="flex items-center gap-3 group text-right focus:outline-none"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-black text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] group-hover:scale-105 transition-transform">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent tracking-wide">
              من سيربح المليون
            </h1>
            <p className="text-[10px] text-slate-400">
              {playerName ? `المتسابق: ${playerName}` : 'مسابقة الثقافة العامة الذهبية'}
            </p>
          </div>
        </button>

        {/* Center: In-Game Money Counter & Bank Out */}
        {isInGame && (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col text-left bg-slate-900/90 border border-amber-500/40 rounded-xl px-3 py-1.5 shadow-inner">
              <span className="text-[10px] text-slate-400">الرصيد المكتسب:</span>
              <span className="text-sm font-black text-amber-400">
                {currentPrize.toLocaleString()} {currencySymbol}
              </span>
            </div>

            {onBankMoney && currentPrize > 0 && (
              <button
                onClick={onBankMoney}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all animate-pulse"
                title="الانسحاب وتأمين الرصيد الحالي"
              >
                <DollarSign className="w-4 h-4" />
                <span>انسحاب</span>
              </button>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          
          {/* Mute Toggle */}
          <button
            onClick={() => {
              soundFx.playClick();
              onToggleMute();
            }}
            className="p-2 bg-slate-900 border border-slate-700 hover:border-amber-400 rounded-xl text-slate-300 hover:text-amber-300 transition-colors"
            title={isMuted ? 'تفعيل الأصوات' : 'كتم الأصوات'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
          </button>

          {/* Leaderboard / Stats */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenStats();
            }}
            className="p-2 bg-slate-900 border border-slate-700 hover:border-amber-400 rounded-xl text-slate-300 hover:text-amber-300 transition-colors hidden sm:flex"
            title="سجل الأرباح والإحصائيات"
          >
            <BarChart2 className="w-5 h-5" />
          </button>

          {/* Question Builder */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenBuilder();
            }}
            className="p-2 bg-slate-900 border border-slate-700 hover:border-amber-400 rounded-xl text-slate-300 hover:text-amber-300 transition-colors hidden sm:flex"
            title="صانع الأسئلة والمسابقات"
          >
            <Edit3 className="w-5 h-5" />
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenSettings();
            }}
            className="p-2 bg-slate-900 border border-slate-700 hover:border-amber-400 rounded-xl text-slate-300 hover:text-amber-300 transition-colors"
            title="إعدادات اللعبة"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Home Button */}
          {isInGame && (
            <button
              onClick={onHomeClick}
              className="p-2 bg-slate-900 border border-slate-700 hover:border-amber-400 rounded-xl text-slate-300 hover:text-amber-300 transition-colors"
              title="العودة للقائمة الرئيسية"
            >
              <Home className="w-5 h-5" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
