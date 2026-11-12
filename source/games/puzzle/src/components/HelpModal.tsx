import React from 'react';
import { X, Lightbulb, MousePointer, Smartphone, Keyboard, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#1b263b] border-2 border-[#fca311] rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/80 bg-[#121c2d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#fca311] text-black font-black flex items-center justify-center text-base">
              ℹ️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                كيفاش تلعب سطيفان بوزل؟
              </h2>
              <p className="text-[11px] text-slate-300">
                قواعد اللعبة وأسرار الفوز السريع
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-200 leading-relaxed">
          {/* Objective */}
          <div className="bg-[#0d1b2a] border border-slate-700/80 p-3.5 rounded-2xl">
            <h4 className="text-sm font-bold text-[#fca311] mb-1 flex items-center gap-1.5">
              <span>🎯 الهدف من اللعبة</span>
            </h4>
            <p>
              حرك قطع الصورة واحدة تلو الأخرى إلى المكان الفارغ حتى تعيد ترتيب الصورة الأصلية كاملة في أقل وقت وبأقل عدد حركات ممكن!
            </p>
          </div>

          {/* Controls */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>طرق التحكم المدعومة</span>
            </h4>

            <div className="grid grid-cols-1 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-2.5">
                <MousePointer className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <b className="text-white">النقر المباشر:</b> انقر على أي قطعة مجاورة للمربع الفارغ لتتحرك، أو انقر على قطعة في نفس السطر لتحريك السطر كاملاً!
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-2.5">
                <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <b className="text-white">السحب باللمس (Swipe):</b> على الهاتف، اسحب بإصبعك في اتجاه المربع الفارغ لتنزلق القطعة بنعومة وسرعة فائقة.
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-2.5">
                <Keyboard className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <b className="text-white">لوحة المفاتيح:</b> استخدم أسهم الكيبورد (↑ ↓ ← →) أو أزرار W, A, S, D للتحكم السريع بدون ماوس!
                </div>
              </div>
            </div>
          </div>

          {/* Helpers */}
          <div className="bg-[#0d1b2a] border border-slate-700/80 p-3.5 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-[#fca311] flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span>أدوات مساعدة ذكية</span>
            </h4>
            <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-300">
              <li>
                <b className="text-white">🔢 زر الأرقام:</b> يظهر أرقام الترتيب (1, 2, 3...) على كل قطعة لتسهيل الحل للمبتدئين.
              </li>
              <li>
                <b className="text-white">👁️ زر كشف الصورة:</b> اضغط واستمر لإظهار الصورة الأصلية كاملة بشفافية فوق اللوح.
              </li>
              <li>
                <b className="text-white">💡 زر التلميح:</b> يضيء لك القطعة المناسبة التي يجب تحريكها تالياً.
              </li>
              <li>
                <b className="text-white">🪙 كسب العملات:</b> تفوز بعملات عند إكمال كل لغز، أو عبر مشاهدة إعلان قصير، أو من عجلة الحظ اليومية!
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700 bg-[#121c2d] flex justify-center">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-2.5 bg-[#fca311] text-black font-bold text-xs rounded-xl hover:bg-[#e0910f] transition-all shadow-md"
          >
            صافي فهمت، نبدا نلعب! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};
