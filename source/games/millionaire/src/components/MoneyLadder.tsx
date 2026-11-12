import React from 'react';
import { MONEY_LADDER } from '../data/questions';
import { Lock, Shield, Trophy } from 'lucide-react';

interface MoneyLadderProps {
  currentLevelIndex: number; // 0 to 14
  currencySymbol: string;
}

export const MoneyLadder: React.FC<MoneyLadderProps> = ({
  currentLevelIndex,
  currencySymbol
}) => {
  return (
    <div className="w-full bg-slate-900/90 border-2 border-amber-500/40 rounded-2xl p-4 shadow-xl text-slate-100 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Trophy className="w-4 h-4 text-amber-400" />
          شجرة المبالغ والجوائز
        </div>
        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          السؤال {currentLevelIndex + 1} / 15
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-around space-y-1.5 overflow-y-auto pr-1">
        {MONEY_LADDER.slice().reverse().map((amount, idx) => {
          const levelNum = 15 - idx; // 15 down to 1
          const arrayIdx = levelNum - 1;
          const isCurrent = arrayIdx === currentLevelIndex;
          const isPassed = arrayIdx < currentLevelIndex;
          const isSafety = levelNum === 5 || levelNum === 10;
          const isMillion = levelNum === 15;

          return (
            <div
              key={levelNum}
              className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 ${
                isCurrent
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.6)] scale-[1.02] border border-amber-300 font-extrabold'
                  : isPassed
                  ? 'bg-slate-800/60 text-slate-400 border border-slate-700/50'
                  : isMillion
                  ? 'bg-gradient-to-r from-amber-900/40 via-yellow-900/30 to-amber-900/40 text-amber-300 border border-amber-500/50'
                  : isSafety
                  ? 'bg-slate-800/90 text-white border border-emerald-500/50'
                  : 'bg-slate-950/40 text-amber-500/80 border border-slate-850'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-5 text-left font-mono ${isCurrent ? 'text-slate-950 font-black' : 'text-slate-400'}`}>
                  {levelNum}
                </span>

                {isSafety && (
                  <span className="flex items-center text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    <Shield className="w-3 h-3 ml-0.5" /> أمان
                  </span>
                )}
                {isMillion && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40">
                    🏆 المليون
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 font-mono">
                <span className={isCurrent ? 'text-slate-950 text-sm font-black' : isSafety ? 'text-emerald-300 font-bold' : isMillion ? 'text-amber-300 font-extrabold' : ''}>
                  {amount.toLocaleString()}
                </span>
                <span className={`text-[10px] ${isCurrent ? 'text-slate-950 font-bold' : 'text-slate-400'}`}>
                  {currencySymbol}
                </span>
                {isPassed && <span className="text-emerald-400 font-bold mr-1">✓</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-emerald-400">
          <Lock className="w-3 h-3" /> محطتا الأمان: 1,000 و 32,000
        </span>
      </div>
    </div>
  );
};
