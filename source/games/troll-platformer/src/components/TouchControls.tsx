import React, { useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import { InputState } from '../game/GameEngine';

interface TouchControlsProps {
  onInputChange: (key: keyof InputState, value: boolean) => void;
  hapticsEnabled?: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onInputChange,
  hapticsEnabled = true
}) => {
  const leftRef = useRef<HTMLButtonElement>(null);
  const rightRef = useRef<HTMLButtonElement>(null);
  const jumpRef = useRef<HTMLButtonElement>(null);

  const triggerHaptic = () => {
    if (hapticsEnabled && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // Ignore if restricted
      }
    }
  };

  const handleTouchStart = (key: keyof InputState, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    triggerHaptic();
    onInputChange(key, true);
  };

  const handleTouchEnd = (key: keyof InputState, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onInputChange(key, false);
  };

  return (
    <div className="w-full px-4 py-2 flex items-center justify-between select-none pointer-events-auto z-20">
      {/* Directional Pad: Left & Right */}
      <div className="flex items-center gap-3">
        <button
          ref={leftRef}
          aria-label="Move Left"
          onTouchStart={(e) => handleTouchStart('left', e)}
          onTouchEnd={(e) => handleTouchEnd('left', e)}
          onMouseDown={(e) => handleTouchStart('left', e)}
          onMouseUp={(e) => handleTouchEnd('left', e)}
          onMouseLeave={(e) => handleTouchEnd('left', e)}
          className="w-18 h-18 rounded-2xl bg-gradient-to-b from-stone-800 to-stone-900 border-2 border-stone-600 text-yellow-400 active:bg-stone-700 active:scale-95 shadow-lg flex items-center justify-center transition-transform touch-btn cursor-pointer"
        >
          <ArrowLeft className="w-8 h-8 stroke-[3]" />
        </button>

        <button
          ref={rightRef}
          aria-label="Move Right"
          onTouchStart={(e) => handleTouchStart('right', e)}
          onTouchEnd={(e) => handleTouchEnd('right', e)}
          onMouseDown={(e) => handleTouchStart('right', e)}
          onMouseUp={(e) => handleTouchEnd('right', e)}
          onMouseLeave={(e) => handleTouchEnd('right', e)}
          className="w-18 h-18 rounded-2xl bg-gradient-to-b from-stone-800 to-stone-900 border-2 border-stone-600 text-yellow-400 active:bg-stone-700 active:scale-95 shadow-lg flex items-center justify-center transition-transform touch-btn cursor-pointer"
        >
          <ArrowRight className="w-8 h-8 stroke-[3]" />
        </button>
      </div>

      {/* Action Pad: Jump */}
      <div className="flex items-center">
        <button
          ref={jumpRef}
          aria-label="Jump"
          onTouchStart={(e) => handleTouchStart('jump', e)}
          onTouchEnd={(e) => handleTouchEnd('jump', e)}
          onMouseDown={(e) => handleTouchStart('jump', e)}
          onMouseUp={(e) => handleTouchEnd('jump', e)}
          onMouseLeave={(e) => handleTouchEnd('jump', e)}
          className="w-20 h-20 rounded-2xl bg-gradient-to-b from-amber-500 to-amber-600 border-2 border-yellow-300 text-stone-950 active:bg-amber-700 active:scale-95 shadow-xl flex flex-col items-center justify-center transition-transform touch-btn cursor-pointer"
        >
          <ArrowUp className="w-9 h-9 stroke-[3.5]" />
          <span className="text-[10px] font-black tracking-widest mt--1 font-pixel">JUMP</span>
        </button>
      </div>
    </div>
  );
};
