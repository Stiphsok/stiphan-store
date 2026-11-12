import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Tv, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { MOCK_ADS } from '../data/presets';
import { sound } from '../utils/sound';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardCoins: (amount: number) => void;
}

export const AdModal: React.FC<AdModalProps> = ({
  isOpen,
  onClose,
  onRewardCoins,
}) => {
  const [isWatching, setIsWatching] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isFinished, setIsFinished] = useState(false);
  const [adIndex, setAdIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setIsWatching(false);
      setCountdown(5);
      setIsFinished(false);
      // Pick random ad
      setAdIndex(Math.floor(Math.random() * MOCK_ADS.length));
    }
  }, [isOpen]);

  const currentAd = MOCK_ADS[adIndex] || MOCK_ADS[0];

  const handleStartAd = () => {
    sound.playClick();
    setIsWatching(true);
    setCountdown(5);

    let current = 5;
    const interval = window.setInterval(() => {
      current -= 1;
      setCountdown(current);

      if (current <= 0) {
        window.clearInterval(interval);
        setIsFinished(true);
        sound.playCoin();
        onRewardCoins(20);

        // Small confetti pop
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });

        // Auto close after brief celebration
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1b263b] border-2 border-[#fca311] rounded-3xl p-6 text-center w-full max-w-sm shadow-2xl relative overflow-hidden animate-scaleUp">
        {/* Close Button (disabled while watching) */}
        {!isWatching && (
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="absolute top-4 left-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-2xl shadow-lg border-2 border-red-400/40 mb-3">
          <Tv className="w-7 h-7 text-white" />
        </div>

        <h2 className="text-xl font-black text-[#fca311] mb-1">
          📺 إعلان مكافأة
        </h2>

        {!isWatching && !isFinished ? (
          <>
            <p className="text-slate-300 text-xs sm:text-sm mb-4 leading-relaxed">
              تفرج في الإعلان القصير باش تاخد{' '}
              <span className="text-[#fca311] font-black underline decoration-amber-400">
                20 عملة مجانية
              </span>
              !
            </p>

            {/* Preview of Sponsor Brand */}
            <div className="bg-[#0d1b2a] border border-slate-700/80 p-3.5 rounded-2xl mb-5 text-right flex items-center gap-3">
              <div
                style={{ backgroundColor: `${currentAd.accent}20` }}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border border-slate-700"
              >
                {currentAd.icon}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-amber-400 font-bold tracking-wider">
                  راعي اللعبة الرسمي
                </span>
                <h4 className="text-xs font-bold text-white truncate">{currentAd.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-1">{currentAd.tagline}</p>
              </div>
            </div>

            <button
              onClick={handleStartAd}
              className="w-full py-3.5 px-4 rounded-xl bg-[#fca311] hover:bg-[#e0910f] active:scale-98 text-black font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>مشاهدة الإعلان (5 ثواني)</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="mt-3 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              إلغاء والعودة للعبة
            </button>
          </>
        ) : isWatching && !isFinished ? (
          <div className="py-2">
            {/* Countdown Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/30 border border-red-500/50 text-red-200 text-xs font-bold mb-4 animate-pulse">
              <span>⏳ جاري عرض الإعلان...</span>
              <span className="font-mono text-base font-black text-amber-300">{countdown}</span>
              <span>ثواني</span>
            </div>

            {/* Sponsor Commercial Box */}
            <div
              style={{ borderColor: currentAd.accent }}
              className="bg-[#0d1b2a] border-2 p-4 rounded-2xl mb-4 text-center relative overflow-hidden"
            >
              <div className="text-4xl mb-2 animate-bounce">{currentAd.icon}</div>
              <h3 className="text-base font-black text-white mb-1">{currentAd.title}</h3>
              <p
                style={{ color: currentAd.accent }}
                className="text-xs font-bold mb-2 tracking-wide"
              >
                {currentAd.tagline}
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                {currentAd.description}
              </p>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  style={{
                    width: `${((5 - countdown) / 5) * 100}%`,
                    backgroundColor: currentAd.accent,
                  }}
                  className="h-full transition-all duration-1000 ease-linear rounded-full"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              يرجى الانتظار للحصول على عملاتك المجانية...
            </p>
          </div>
        ) : (
          /* Finished State */
          <div className="py-4 space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-xl font-black text-emerald-400">
              🎉 مبروك! ربحتي 20 عملة!
            </h3>
            <p className="text-xs text-slate-300">
              تمت إضافة 20 عملة إلى رصيدك بنجاح.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
