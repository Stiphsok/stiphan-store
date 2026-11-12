import React from 'react';
import { X, Trophy, Award, TrendingUp, RotateCcw } from 'lucide-react';

export interface GameRecord {
  id: string;
  date: string;
  playerName: string;
  prize: number;
  questionsAnswered: number;
  isWin: boolean;
  isBanked: boolean;
}

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameHistory: GameRecord[];
  onClearHistory: () => void;
  currencySymbol: string;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  gameHistory,
  onClearHistory,
  currencySymbol
}) => {
  if (!isOpen) return null;

  const totalGames = gameHistory.length;
  const millionairesCount = gameHistory.filter(g => g.isWin).length;
  const totalEarnings = gameHistory.reduce((acc, curr) => acc + curr.prize, 0);
  const avgQuestions = totalGames > 0
    ? (gameHistory.reduce((acc, curr) => acc + curr.questionsAnswered, 0) / totalGames).toFixed(1)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-400/50 rounded-xl text-amber-400">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-300">سجل الأرباح والإحصائيات</h3>
              <p className="text-xs text-slate-400">ملخص الإنجازات والجولات السابقة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block mb-1">الجولات الملعوبة</span>
            <span className="text-2xl font-black text-amber-300">{totalGames}</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block mb-1">أبطال المليون</span>
            <span className="text-2xl font-black text-emerald-400 flex items-center justify-center gap-1">
              <Award className="w-5 h-5 text-amber-400" /> {millionairesCount}
            </span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block mb-1">معدل الأسئلة</span>
            <span className="text-2xl font-black text-blue-400">{avgQuestions}</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block mb-1">إجمالي الأرباح</span>
            <span className="text-lg font-black text-amber-400 truncate block">
              {totalEarnings.toLocaleString()} {currencySymbol}
            </span>
          </div>
        </div>

        {/* History Table */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-6">
          <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            سجل الجولات الأخيرة:
          </h4>

          {gameHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm bg-slate-950/60 rounded-xl border border-slate-850">
              لم تتم أي جولة حتى الآن. ابدأ المسابقة وسجل اسمك في قائمة الأبطال!
            </div>
          ) : (
            gameHistory.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${
                    rec.isWin
                      ? 'bg-amber-500/20 border border-amber-400 text-amber-300'
                      : rec.isBanked
                      ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {rec.isWin ? '🏆' : rec.isBanked ? '💰' : '🎮'}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-200">{rec.playerName || 'متسابق'}</div>
                    <div className="text-[10px] text-slate-400">{rec.date} • مجاب: {rec.questionsAnswered}/15</div>
                  </div>
                </div>

                <div className="text-left font-mono font-bold text-amber-400 text-sm">
                  {rec.prize.toLocaleString()} {currencySymbol}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClearHistory}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            مسح السجل
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-500 text-slate-950 font-bold text-sm rounded-xl hover:bg-amber-400 transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
