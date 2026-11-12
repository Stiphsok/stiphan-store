import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, X } from 'lucide-react';
import { sound } from '../utils/sound';

interface SpinWheelModalProps {
  isOpen: boolean;
  coins: number;
  lastDailySpinDate: string | null;
  onReward: (amount: number, label: string) => void;
  onDeductCoins: (amount: number) => void;
  onClose: () => void;
}

interface WheelSegment {
  label: string;
  amount: number;
  color: string;
  textColor: string;
}

const SEGMENTS: WheelSegment[] = [
  { label: '10 عملات', amount: 10, color: '#1b263b', textColor: '#fca311' },
  { label: '20 عملة', amount: 20, color: '#fca311', textColor: '#000000' },
  { label: '15 عملة', amount: 15, color: '#2a9d8f', textColor: '#ffffff' },
  { label: '50 عملة 🌟', amount: 50, color: '#e63946', textColor: '#ffffff' },
  { label: '25 عملة', amount: 25, color: '#415a77', textColor: '#ffffff' },
  { label: '100 عملة 👑', amount: 100, color: '#8338ec', textColor: '#ffffff' },
  { label: '30 عملة', amount: 30, color: '#3a86ff', textColor: '#ffffff' },
  { label: '5 عملات', amount: 5, color: '#0d1b2a', textColor: '#e0e1dd' },
];

export const SpinWheelModal: React.FC<SpinWheelModalProps> = ({
  isOpen,
  coins,
  lastDailySpinDate,
  onReward,
  onDeductCoins,
  onClose,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<string | null>(null);

  if (!isOpen) return null;

  const todayStr = new Date().toDateString();
  const isFreeDailyAvailable = lastDailySpinDate !== todayStr;
  const spinCost = isFreeDailyAvailable ? 0 : 10;
  const canSpin = isFreeDailyAvailable || coins >= spinCost;

  const handleSpin = () => {
    if (isSpinning || !canSpin) return;

    sound.playClick();
    if (!isFreeDailyAvailable) {
      onDeductCoins(spinCost);
    }

    setIsSpinning(true);
    setWonPrize(null);

    // Pick a winning index
    const winningIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segmentAngle = 360 / SEGMENTS.length;
    // Calculate final angle (extra 5 to 7 full rotations)
    const extraRotations = 360 * 6;
    // Target angle points to the top indicator (270 degrees or adjusted)
    const targetAngle = extraRotations + (360 - (winningIndex * segmentAngle + segmentAngle / 2));
    const newRotation = rotation + targetAngle;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const prize = SEGMENTS[winningIndex];
      setWonPrize(prize.label);
      sound.playCoin();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      onReward(prize.amount, todayStr);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#1b263b] border-2 border-[#fca311] rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl relative overflow-hidden animate-scaleUp">
        <button
          onClick={() => {
            if (!isSpinning) {
              sound.playClick();
              onClose();
            }
          }}
          disabled={isSpinning}
          className="absolute top-4 left-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 mx-auto rounded-2xl bg-[#fca311] text-black flex items-center justify-center text-2xl shadow-lg border-2 border-amber-300 mb-2">
          🎡
        </div>

        <h2 className="text-xl font-black text-[#fca311] mb-0.5">
          عجلة الحظ سطيفان
        </h2>
        <p className="text-slate-300 text-xs mb-4">
          دور العجلة واربح عملات ذهبية فابور!
        </p>

        {/* Wheel Container */}
        <div className="relative w-64 h-64 mx-auto my-2 flex items-center justify-center">
          {/* Top Pointer Indicator */}
          <div className="absolute -top-2 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 filter drop-shadow-md" />

          {/* Wheel Graphic */}
          <div
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4.5s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none',
            }}
            className="w-full h-full rounded-full border-4 border-[#fca311] shadow-2xl overflow-hidden relative"
          >
            {SEGMENTS.map((seg, idx) => {
              const angle = (360 / SEGMENTS.length) * idx;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: seg.color,
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: '50% 100%',
                    clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
                  }}
                  className="absolute top-0 left-0 w-full h-1/2 flex items-start justify-center pt-2.5"
                >
                  <span
                    style={{ color: seg.textColor }}
                    className="text-[10px] font-black tracking-tight drop-shadow-sm select-none"
                  >
                    {seg.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Center Hub */}
          <div className="absolute z-10 w-12 h-12 rounded-full bg-[#1b263b] border-3 border-[#fca311] flex items-center justify-center text-base shadow-lg text-amber-300 font-black">
            🪙
          </div>
        </div>

        {/* Win Message */}
        {wonPrize && (
          <div className="my-2 p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs animate-bounce">
            🎉 مبروك! ربحتي {wonPrize}!
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || !canSpin}
          className={`w-full mt-3 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
            canSpin && !isSpinning
              ? 'bg-[#fca311] hover:bg-[#e0910f] text-black active:scale-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {isSpinning ? (
            <span>جاري التدوير... 🌀</span>
          ) : isFreeDailyAvailable ? (
            <span>تدويرة يومية مجانية! 🎁</span>
          ) : (
            <span>تدوير بـ {spinCost} عملات</span>
          )}
        </button>

        {!isFreeDailyAvailable && (
          <p className="text-[10px] text-slate-400 mt-2">
            تم استهلاك التدويرة المجانية لليوم. التدوير الإضافي بـ 10 عملات فقط.
          </p>
        )}
      </div>
    </div>
  );
};
