import React, { useEffect, useState } from 'react';
import { Sparkles, X, HelpCircle, Lightbulb } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface AskHostModalProps {
  isOpen: boolean;
  onClose: () => void;
  hint: string;
  question: string;
}

export const AskHostModal: React.FC<AskHostModalProps> = ({
  isOpen,
  onClose,
  hint,
  question
}) => {
  const [isThinking, setIsThinking] = useState(true);

  useEffect(() => {
    if (isOpen) {
      soundFx.playLifeline();
      setIsThinking(true);
      const timer = setTimeout(() => {
        setIsThinking(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 border-2 border-purple-500/50 rounded-2xl shadow-2xl p-6 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-500/30 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 border border-purple-400/50 rounded-xl text-purple-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-purple-300">رأي ورؤية المذيع</h3>
              <p className="text-xs text-slate-400">توجيهات وتلميحات مقدم البرنامج</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {isThinking ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
            <HelpCircle className="w-12 h-12 text-purple-400 animate-bounce" />
            <p className="text-purple-200 text-sm font-medium animate-pulse">
              المذيع يتأمل السؤال بعناية لتحليل الخيارات...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-slate-950/70 border border-purple-500/30 rounded-xl space-y-3">
              <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                السؤال المطروح:
              </div>
              <p className="text-slate-200 font-medium text-sm">{question}</p>
            </div>

            <div className="p-5 bg-gradient-to-br from-purple-900/40 to-indigo-900/30 border border-purple-400/40 rounded-xl space-y-3 shadow-inner">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                تلميح المذيع لك:
              </div>
              <p className="text-slate-100 text-base leading-relaxed font-semibold italic bg-slate-950/60 p-4 rounded-lg border border-purple-500/20">
                "{hint}"
              </p>
            </div>

            <p className="text-xs text-center text-slate-400">
              "خذ وقتك في التفكير، فالمبلغ المعروض كبير والقرار لك وحدك!"
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg active:scale-98 transition-all"
            >
              شكراً للمذيع، سأحدد إجابتي الآن
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
