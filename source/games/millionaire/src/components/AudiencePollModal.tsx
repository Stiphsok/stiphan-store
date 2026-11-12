import React, { useEffect, useState } from 'react';
import { Users, X, BarChart3 } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface AudiencePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  correctIndex: number;
  eliminatedIndices: number[];
  level: number;
  options: string[];
}

export const AudiencePollModal: React.FC<AudiencePollModalProps> = ({
  isOpen,
  onClose,
  correctIndex,
  eliminatedIndices,
  level,
  options
}) => {
  const [percentages, setPercentages] = useState<number[]>([0, 0, 0, 0]);
  const [isCalculating, setIsCalculating] = useState(true);

  useEffect(() => {
    if (isOpen) {
      soundFx.playLifeline();
      setIsCalculating(true);

      const timer = setTimeout(() => {
        // Calculate percentages base on level
        const results = [0, 0, 0, 0];
        const activeIndices = [0, 1, 2, 3].filter(i => !eliminatedIndices.includes(i));
        
        // Correct option probability gets slightly lower as level goes up (audience isn't infallible!)
        let correctProb = Math.max(45, 85 - (level * 2.5));
        if (!activeIndices.includes(correctIndex)) {
          correctProb = 0;
        }

        let remaining = 100 - (activeIndices.includes(correctIndex) ? correctProb : 0);
        const wrongActive = activeIndices.filter(i => i !== correctIndex);

        if (wrongActive.length > 0) {
          wrongActive.forEach((idx, i) => {
            if (i === wrongActive.length - 1) {
              results[idx] = remaining;
            } else {
              const share = Math.floor(Math.random() * (remaining / wrongActive.length + 10));
              results[idx] = share;
              remaining -= share;
            }
          });
        }

        if (activeIndices.includes(correctIndex)) {
          results[correctIndex] = correctProb + (remaining > 0 ? remaining : 0);
        }

        setPercentages(results);
        setIsCalculating(false);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [isOpen, correctIndex, eliminatedIndices, level]);

  if (!isOpen) return null;

  const labels = ['أ', 'ب', 'ج', 'د'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl p-6 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-400/50 rounded-xl text-amber-400">
              <Users className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-300">جمهور القاعة المصوت</h3>
              <p className="text-xs text-slate-400">نتيجة تصويت الاستوديو المباشر</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        {isCalculating ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-amber-400 border-t-transparent animate-spin"></div>
              <BarChart3 className="absolute inset-0 m-auto w-7 h-7 text-amber-400" />
            </div>
            <p className="text-amber-200 text-sm animate-pulse font-medium">جاري تجميع أصوات الجمهور في القاعة...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-3 items-end h-56 pt-6 px-4 bg-slate-950/60 rounded-xl border border-slate-800">
              {percentages.map((pct, idx) => {
                const isEliminated = eliminatedIndices.includes(idx);
                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    <span className="text-xs font-bold text-amber-400 mb-2">{pct}%</span>
                    <div className="w-full bg-slate-800/80 rounded-t-lg overflow-hidden h-40 flex items-end p-1">
                      <div
                        className={`w-full rounded-t transition-all duration-1000 ${
                          isEliminated
                            ? 'bg-slate-700'
                            : idx === correctIndex
                            ? 'bg-gradient-to-t from-emerald-600 via-emerald-500 to-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                            : 'bg-gradient-to-t from-blue-700 to-indigo-500'
                        }`}
                        style={{ height: `${pct}%` }}
                      ></div>
                    </div>
                    <div className="mt-3 flex flex-col items-center">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        isEliminated ? 'bg-slate-800 text-slate-500' : 'bg-amber-500 text-slate-950 shadow-md'
                      }`}>
                        {labels[idx]}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[65px] mt-1 text-center">
                        {options[idx]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-center text-slate-400 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              💡 <span className="text-amber-300 font-semibold">تنويه المذيع:</span> أغلبية أصوات الجمهور تشير إلى الخيار ({labels[percentages.indexOf(Math.max(...percentages))]}). القرار النهائي يعود لك!
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-98 transition-all"
            >
              العودة إلى السؤال
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
