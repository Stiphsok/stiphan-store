import React from 'react';
import { Timer, Footprints, RotateCcw } from 'lucide-react';
import { formatTime } from '../utils/puzzle';
import { sound } from '../utils/sound';

interface InfoPanelProps {
  imageName: string;
  timer: number;
  moves: number;
  onReset: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  imageName,
  timer,
  moves,
  onReset,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="flex items-center justify-between bg-[#1b263b] px-3.5 py-2.5 rounded-xl border border-slate-700/60 shadow-md text-xs sm:text-sm text-[#e0e1dd]">
        {/* Title of current picture */}
        <div className="flex items-center gap-1.5 truncate max-w-[45%]">
          <span className="text-[#fca311] font-bold shrink-0">الصورة:</span>
          <span className="truncate font-semibold text-white/90" title={imageName}>
            {imageName}
          </span>
        </div>

        {/* Moves & Timer & Quick Restart */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 text-slate-300 font-mono">
            <Footprints className="w-3.5 h-3.5 text-amber-400" />
            <span>{moves}</span>
            <span className="text-[11px] text-slate-400 hidden min-[480px]:inline">حركة</span>
          </div>

          <div className="flex items-center gap-1 text-slate-200 font-mono bg-[#0d1b2a] px-2 py-0.5 rounded-md border border-slate-800">
            <Timer className="w-3.5 h-3.5 text-[#fca311]" />
            <span className="font-bold tracking-wider">{formatTime(timer)}</span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onReset();
            }}
            title="إعادة خلط اللغز"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors active:rotate-180"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
