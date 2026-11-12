import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Timer, Footprints, Coins, Share2, ArrowRight, RotateCcw, Check } from 'lucide-react';
import { formatTime } from '../utils/puzzle';
import { sound } from '../utils/sound';
import { GridSize } from '../types/game';

interface WinModalProps {
  isOpen: boolean;
  time: number;
  moves: number;
  gridSize: GridSize;
  coinsEarned: number;
  isNewRecord: boolean;
  onNextPuzzle: () => void;
  onReplay: () => void;
  onClose: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  time,
  moves,
  gridSize,
  coinsEarned,
  isNewRecord,
  onNextPuzzle,
  onReplay,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      sound.playWin();
      // Burst celebratory confetti
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 1000,
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShare = async () => {
    sound.playClick();
    const shareText = `🧩 سطيفان بوزل: قاديت اللغز بحجم ${gridSize}×${gridSize} فوقت ${formatTime(
      time
    )} وبـ ${moves} حركة فقط! تيران ناضي 🔥 واش تقدر تفوتني؟`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'سطيفان بوزل - Stiphan Puzzle',
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1b263b] border-2 border-[#fca311] rounded-3xl p-6 text-center w-full max-w-sm shadow-2xl relative overflow-hidden animate-scaleUp">
        {/* Glow ambient circle */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#fca311]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Victory Trophy Badge */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#fca311] to-amber-300 flex items-center justify-center text-3xl shadow-lg border-2 border-amber-200 mb-3 animate-bounce">
          🏆
        </div>

        <h2 className="text-2xl font-black text-[#fca311] mb-1 tracking-wide">
          🎉 تيران ناضي!
        </h2>
        <p className="text-slate-200 text-sm mb-4 leading-relaxed font-medium">
          قاديتي الصورة في وقت قياسي وربحتي{' '}
          <span className="text-[#fca311] font-black underline decoration-amber-400">
            {coinsEarned} عملة إضافية
          </span>
          !
        </p>

        {isNewRecord && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-bold mb-4 animate-pulse">
            <Trophy className="w-3.5 h-3.5" />
            <span>رقم قياسي جديد! تبارك الله عليك 🔥</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 bg-[#0d1b2a] p-3 rounded-2xl border border-slate-700/80 mb-5">
          <div className="flex flex-col items-center p-2 rounded-xl bg-slate-800/40">
            <Timer className="w-4 h-4 text-[#fca311] mb-1" />
            <span className="text-[10px] text-slate-400">الوقت</span>
            <span className="font-mono text-sm font-black text-white">{formatTime(time)}</span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-xl bg-slate-800/40">
            <Footprints className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-[10px] text-slate-400">الحركات</span>
            <span className="font-mono text-sm font-black text-white">{moves}</span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-xl bg-slate-800/40">
            <Coins className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[10px] text-slate-400">المكافأة</span>
            <span className="font-mono text-sm font-black text-[#fca311]">+{coinsEarned}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* New Random Preset */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
              onNextPuzzle();
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-[#fca311] hover:bg-[#e0910f] active:scale-98 text-black font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>صورة جديدة</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>

          {/* Replay Same Image */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
                onReplay();
              }}
              className="py-2.5 px-3 rounded-xl bg-[#415a77] hover:bg-[#415a77]/80 active:scale-98 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-600"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة المحاولة</span>
            </button>

            {/* Share Result */}
            <button
              onClick={handleShare}
              className="py-2.5 px-3 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-emerald-500/40"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ!' : 'بارطاجي الفوز'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
