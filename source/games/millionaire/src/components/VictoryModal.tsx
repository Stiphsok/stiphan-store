import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, RefreshCw, Home, Share2, Printer, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface VictoryModalProps {
  isOpen: boolean;
  isWin: boolean; // True if reached 1,000,000
  isBanked: boolean; // True if player walked away
  prize: number;
  currencySymbol: string;
  playerName: string;
  questionsAnswered: number;
  onRestart: () => void;
  onHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  isWin,
  isBanked,
  prize,
  currencySymbol,
  playerName,
  questionsAnswered,
  onRestart,
  onHome
}) => {
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (isWin) {
        soundFx.playWin();
        // Confetti burst
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        const interval = setInterval(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 1500);
        return () => clearInterval(interval);
      } else {
        soundFx.playCorrect();
      }
    }
  }, [isOpen, isWin]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `🎉 حققتُ رصيد قدره ${prize.toLocaleString()} ${currencySymbol} في لعبة من سيربح المليون! هل تستطيع التغلب على مجموعي؟ 🏆`;
    if (navigator.share) {
      navigator.share({
        title: 'من سيربح المليون',
        text: text,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('تم نسخ النتيجة إلى الحافظة بنجاح!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/60 rounded-3xl shadow-2xl p-6 md:p-8 text-slate-100 my-8">
        
        {/* Top Glow Decor */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-sm"></div>

        {/* Certificate Card Container */}
        <div 
          ref={certRef}
          className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-4 border-amber-500/40 rounded-2xl p-6 text-center shadow-2xl overflow-hidden mb-6"
        >
          {/* Subtle Watermark BG */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Trophy className="w-96 h-96 text-amber-400" />
          </div>

          {/* Banner Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-bold text-xs mb-4 shadow">
            <Sparkles className="w-4 h-4 text-amber-400" />
            {isWin ? '🏆 بطل المليون التكريمي 🏆' : isBanked ? '💰 انسحاب تكتيكي ناجح' : '🎮 نهاية الجولة'}
          </div>

          <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent mb-2">
            {isWin ? 'تهانينا الحارة! لقد أصبحت المليونير!' : isBanked ? 'إنجاز رائع ورصيد محترم!' : 'محاولة ممتازة!'}
          </h2>

          <p className="text-slate-300 text-sm max-w-lg mx-auto mb-6">
            تشهد إدارة مسابقة <span className="text-amber-400 font-bold">من سيربح المليون</span> بأن البطل:
          </p>

          <div className="text-2xl md:text-3xl font-extrabold text-amber-300 py-2 border-y-2 border-dashed border-amber-500/40 max-w-md mx-auto mb-6 tracking-wide">
            {playerName || 'متسابق المليون'}
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-amber-500/30">
              <span className="text-xs text-slate-400 block mb-1">المبلغ المحقق</span>
              <span className="text-2xl font-black text-amber-400">
                {prize.toLocaleString()} {currencySymbol}
              </span>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-amber-500/30">
              <span className="text-xs text-slate-400 block mb-1">الأسئلة المجابة</span>
              <span className="text-2xl font-black text-emerald-400">
                {questionsAnswered} / 15
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-800">
            <span>التاريخ: {new Date().toLocaleDateString('ar-MA')}</span>
            <span className="flex items-center gap-1 font-semibold text-amber-400/80">
              <Award className="w-4 h-4" /> توقيع المذيع الرسمي
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={onRestart}
            className="py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            جولة جديدة
          </button>

          <button
            onClick={handleShare}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl border border-amber-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            مشاركة
          </button>

          <button
            onClick={handlePrint}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            طباعة الشهادة
          </button>

          <button
            onClick={onHome}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            الرئيسية
          </button>
        </div>

      </div>
    </div>
  );
};
