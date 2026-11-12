import React, { useRef } from 'react';
import { Upload, RefreshCw, Grid3X3, Image as ImageIcon, Eye, Hash, Lightbulb } from 'lucide-react';
import { GridSize } from '../types/game';
import { sound } from '../utils/sound';

interface ControlBarProps {
  gridSize: GridSize;
  onChangeGridSize: (size: GridSize) => void;
  onUploadImage: (file: File) => void;
  onRandomPreset: () => void;
  onOpenGallery: () => void;
  showNumbers: boolean;
  onToggleNumbers: () => void;
  isPeeking: boolean;
  onTogglePeek: (peeking: boolean) => void;
  onUseHint: () => void;
  canHint: boolean;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  gridSize,
  onChangeGridSize,
  onUploadImage,
  onRandomPreset,
  onOpenGallery,
  showNumbers,
  onToggleNumbers,
  isPeeking,
  onTogglePeek,
  onUseHint,
  canHint,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sound.playClick();
      onUploadImage(file);
    }
    // Reset file input so user can pick the same file again if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-2.5 px-4">
      {/* Primary Row: Upload, Random, Gallery */}
      <div className="grid grid-cols-3 gap-2">
        {/* Upload Custom Image Button */}
        <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-[#2a9d8f] hover:bg-[#258b80] active:scale-95 text-white shadow-md cursor-pointer transition-all border border-teal-300/30 text-center">
          <Upload className="w-4 h-4 shrink-0" />
          <span>رفع صورتك</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {/* Another Image / Random Preset */}
        <button
          onClick={() => {
            sound.playClick();
            onRandomPreset();
          }}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-[#fca311] hover:bg-[#fca311]/90 active:scale-95 text-black shadow-md transition-all border border-amber-300/40 text-center"
        >
          <RefreshCw className="w-4 h-4 shrink-0" />
          <span>صورة أخرى</span>
        </button>

        {/* Gallery / Presets Catalog */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenGallery();
          }}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-[#415a77] hover:bg-[#415a77]/80 active:scale-95 text-white shadow-md transition-all border border-slate-400/20 text-center"
        >
          <ImageIcon className="w-4 h-4 shrink-0" />
          <span>الكتالوج 🖼️</span>
        </button>
      </div>

      {/* Secondary Controls: Difficulty Tabs & Helper Toggles */}
      <div className="flex items-center justify-between gap-2 flex-wrap bg-[#1b263b]/90 p-2 rounded-xl border border-slate-700/60 shadow-sm">
        {/* Difficulty Selector */}
        <div className="flex items-center gap-1 bg-[#0d1b2a] p-1 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 px-1 font-semibold flex items-center gap-1">
            <Grid3X3 className="w-3.5 h-3.5 text-[#fca311]" />
            الحجم:
          </span>
          {([3, 4, 5] as GridSize[]).map((size) => (
            <button
              key={size}
              onClick={() => {
                sound.playClick();
                onChangeGridSize(size);
              }}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                gridSize === size
                  ? 'bg-[#fca311] text-black shadow-sm scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {size}×{size}
              <span className="text-[10px] font-normal mr-1 hidden sm:inline">
                {size === 3 ? '(سهل)' : size === 4 ? '(متوسط)' : '(صعيب)'}
              </span>
            </button>
          ))}
        </div>

        {/* Helper Action Toggles */}
        <div className="flex items-center gap-1.5">
          {/* Numbers Hint Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleNumbers();
            }}
            title={showNumbers ? 'إخفاء أرقام القطع' : 'إظهار أرقام القطع للمساعدة'}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
              showNumbers
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span className="text-[11px]">الأرقام</span>
          </button>

          {/* Peek Original Image Button */}
          <button
            onMouseDown={() => onTogglePeek(true)}
            onMouseUp={() => onTogglePeek(false)}
            onTouchStart={() => onTogglePeek(true)}
            onTouchEnd={() => onTogglePeek(false)}
            title="اضغط واستمر لرؤية الصورة الكاملة"
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all select-none ${
              isPeeking
                ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="text-[11px]">كشف</span>
          </button>

          {/* Hint Move */}
          <button
            onClick={onUseHint}
            disabled={!canHint}
            title="تلميح ذكي: يوضح لك أي قطعة تحركها (5 عملات)"
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
              canHint
                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 hover:bg-yellow-500/30 active:scale-95'
                : 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="text-[11px]">تلميح</span>
          </button>
        </div>
      </div>
    </div>
  );
};
