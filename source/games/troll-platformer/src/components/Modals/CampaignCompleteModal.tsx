import React, { useEffect } from 'react';
import { Trophy, Crown, RotateCcw, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../audio/soundManager';

interface CampaignCompleteModalProps {
  totalDeaths: number;
  totalCoins: number;
  onRestartGame: () => void;
  onOpenExport: () => void;
}

export const CampaignCompleteModal: React.FC<CampaignCompleteModalProps> = ({
  totalDeaths,
  totalCoins,
  onRestartGame,
  onOpenExport
}) => {
  useEffect(() => {
    try {
      const end = Date.now() + 3000;
      const interval: NodeJS.Timeout = setInterval(() => {
        if (Date.now() > end) {
          return clearInterval(interval);
        }
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() - 0.2 }
        });
      }, 250);
    } catch {
      // Ignore
    }
  }, []);

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 z-50 animate-pop-in">
      <div className="w-full max-w-xs bg-stone-900 border-2 border-yellow-400 rounded-3xl p-5 text-center shadow-2xl relative overflow-hidden">
        {/* Crown & Trophy */}
        <div className="relative w-20 h-20 mx-auto mb-3 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg">
            <Trophy className="w-9 h-9 text-stone-950 stroke-[2.5]" />
          </div>
          <Crown className="w-8 h-8 text-yellow-300 absolute -top-2 right-2 animate-bounce" />
        </div>

        <h2 className="font-pixel text-sm text-yellow-400 mb-1">
          ALL 200 LEVELS BEATEN!
        </h2>
        <p className="font-arabic font-black text-emerald-400 text-lg mb-1 leading-tight" dir="rtl">
          نتا هو أسطورة الستيفان الحقيقية! 🇲🇦👑
        </p>
        <p className="text-stone-300 text-xs mb-4">
          You conquered every single unfair troll trap and made it to the ultimate finale!
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 bg-stone-950 p-3 rounded-2xl border border-stone-800 mb-4">
          <div>
            <p className="text-[10px] text-stone-400 font-pixel">TOTAL DEATHS</p>
            <p className="text-sm font-bold text-red-400 font-mono">{totalDeaths}</p>
          </div>
          <div>
            <p className="text-[10px] text-stone-400 font-pixel">TOTAL COINS</p>
            <p className="text-sm font-bold text-yellow-400 font-mono">{totalCoins}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              soundManager.playButton();
              onOpenExport();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 active:scale-95 text-stone-950 font-pixel text-xs font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>DOWNLOAD STANDALONE APK / ZIP</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButton();
              onRestartGame();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-sans text-xs active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay from Level 1</span>
          </button>
        </div>
      </div>
    </div>
  );
};
