import React from 'react';
import { Trophy, Timer, Footprints, Coins, X, Award, CheckCircle } from 'lucide-react';
import { GameStats } from '../types/game';
import { formatTime } from '../utils/puzzle';
import { sound } from '../utils/sound';

interface StatsModalProps {
  isOpen: boolean;
  stats: GameStats;
  hasCustomUpload: boolean;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  stats,
  hasCustomUpload,
  onClose,
}) => {
  if (!isOpen) return null;

  const achievements = [
    {
      id: 'first-win',
      title: 'أول فوز 🥇',
      desc: 'قاد أول صورة بنجاح في اللعبة',
      completed: stats.gamesWon >= 1,
    },
    {
      id: 'speed-demon',
      title: 'سريع البرق ⚡',
      desc: 'فز في لغز 3×3 في أقل من دقيقة واحدة',
      completed: stats.bestTimes[3] !== null && stats.bestTimes[3] <= 60,
    },
    {
      id: 'big-brain',
      title: 'مخ أينشتاين 🧠',
      desc: 'حل لغز بحجم 4×4 أو 5×5 للمحترفين',
      completed: stats.bestTimes[4] !== null || stats.bestTimes[5] !== null,
    },
    {
      id: 'coin-collector',
      title: 'مول الشكارة 💰',
      desc: 'اجمع أكثر من 100 عملة ذهبية',
      completed: stats.coins >= 100,
    },
    {
      id: 'custom-art',
      title: 'فنان شخصي 🎨',
      desc: 'ارفع صورة من هاتفك أو كاميرتك وحلها',
      completed: hasCustomUpload,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#1b263b] border-2 border-[#fca311] rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/80 bg-[#121c2d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#fca311] text-black font-black flex items-center justify-center text-base">
              🏆
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                الأرقام القياسية والإنجازات
              </h2>
              <p className="text-[11px] text-slate-300">
                إحصائياتك ومستواك في سطيفان بوزل
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Summary Badges */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#0d1b2a] border border-slate-700/80 p-3 rounded-2xl">
              <Trophy className="w-5 h-5 text-[#fca311] mx-auto mb-1" />
              <div className="text-lg font-black text-white">{stats.gamesWon}</div>
              <div className="text-[10px] text-slate-400">مرات الفوز</div>
            </div>

            <div className="bg-[#0d1b2a] border border-slate-700/80 p-3 rounded-2xl">
              <Footprints className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-lg font-black text-white">{stats.totalMoves}</div>
              <div className="text-[10px] text-slate-400">إجمالي الحركات</div>
            </div>

            <div className="bg-[#0d1b2a] border border-slate-700/80 p-3 rounded-2xl">
              <Coins className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-lg font-black text-[#fca311]">{stats.coins}</div>
              <div className="text-[10px] text-slate-400">العملات الحالية</div>
            </div>
          </div>

          {/* Best Records by Size */}
          <div className="bg-[#0d1b2a] border border-slate-700 p-3.5 rounded-2xl">
            <h3 className="text-xs font-bold text-[#fca311] mb-2 flex items-center gap-1.5">
              <Timer className="w-4 h-4" />
              <span>أفضل توقيت وأقل حركات حسب الحجم</span>
            </h3>

            <div className="space-y-2 text-xs">
              {[3, 4, 5].map((sz) => {
                const s = sz as 3 | 4 | 5;
                const time = stats.bestTimes[s];
                const moves = stats.bestMoves[s];
                return (
                  <div
                    key={sz}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-700/50"
                  >
                    <span className="font-bold text-slate-200">
                      {sz}×{sz}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({sz === 3 ? 'سهل' : sz === 4 ? 'متوسط' : 'صعيب'})
                      </span>
                    </span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-amber-300">
                        ⏱️ {time !== null ? formatTime(time) : '--:--'}
                      </span>
                      <span className="text-emerald-300">
                        👣 {moves !== null ? `${moves} ح` : '--'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>الإنجازات المفتوحة</span>
            </h3>

            <div className="space-y-2">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                    ach.completed
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : 'bg-[#0d1b2a] border-slate-800 opacity-60'
                  }`}
                >
                  <div className="text-right">
                    <h5 className="text-xs font-bold text-white">{ach.title}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{ach.desc}</p>
                  </div>
                  <div>
                    {ach.completed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
