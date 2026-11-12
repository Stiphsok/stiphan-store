import React, { useState } from 'react';
import { Tv, ZoomIn, X, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

interface FooterPanelProps {
  currentImgUrl: string;
  imageTitle: string;
  onOpenAdModal: () => void;
  onOpenWheel: () => void;
}

export const FooterPanel: React.FC<FooterPanelProps> = ({
  currentImgUrl,
  imageTitle,
  onOpenAdModal,
  onOpenWheel,
}) => {
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  return (
    <>
      <div className="w-full max-w-xl mx-auto px-4 mt-2">
        <div className="flex items-center justify-between gap-3 bg-[#1b263b] p-2.5 sm:p-3 rounded-2xl border border-slate-700/80 shadow-md">
          {/* Reference Image Container (Target: "الهدف: قاد بحال هذي") */}
          <div
            onClick={() => {
              sound.playClick();
              setIsZoomOpen(true);
            }}
            title="انقر لتكبير صورة الهدف"
            className="flex items-center gap-2.5 bg-[#0d1b2a] hover:bg-[#0d1b2a]/80 p-1.5 sm:p-2 rounded-xl border border-slate-700/60 cursor-pointer transition-all group"
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 border-[#fca311] shadow-sm shrink-0">
              <img
                src={currentImgUrl}
                alt="الهدف المطلوب"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                <ZoomIn className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="text-right leading-tight">
              <div className="text-[11px] font-black text-[#fca311] tracking-wide flex items-center gap-1">
                <span>الهدف المطلوب</span>
                <span className="text-[9px] bg-[#fca311]/20 text-[#fca311] px-1 py-0.2 rounded border border-[#fca311]/40">
                  كَبّر 🔍
                </span>
              </div>
              <p className="text-xs text-[#e0e1dd] font-semibold mt-0.5">قاد بحال هذي 🎯</p>
            </div>
          </div>

          {/* Quick Actions: Watch Ad & Spin Wheel */}
          <div className="flex items-center gap-2">
            {/* Watch Ad Button (+20 coins) */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenAdModal();
              }}
              className="relative flex items-center gap-1.5 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-gradient-to-r from-[#e63946] to-[#d62828] hover:from-[#d62828] hover:to-[#ba181b] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-900/30 border border-red-400/30 transition-all group"
            >
              <Tv className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col text-right leading-none">
                <span className="font-bold text-xs sm:text-sm">تفرج فإعلان</span>
                <span className="text-[10px] text-amber-200 font-extrabold mt-0.5">
                  (+20 عملة 🪙)
                </span>
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
            </button>

            {/* Lucky Spin shortcut */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenWheel();
              }}
              title="عجلة الحظ"
              className="p-2.5 sm:p-3 rounded-xl bg-[#415a77] hover:bg-[#415a77]/80 text-amber-300 border border-amber-400/20 active:scale-95 transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Enlarged Zoom Modal for Reference Image */}
      {isZoomOpen && (
        <div
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#1b263b] border-2 border-[#fca311] rounded-2xl p-4 max-w-md w-full shadow-2xl flex flex-col items-center"
          >
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-3 left-3 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#fca311] mb-2">{imageTitle}</h3>
            <p className="text-xs text-slate-300 mb-3 text-center">
              هذه هي الصورة الكاملة التي تحاول ترتيبها
            </p>

            <img
              src={currentImgUrl}
              alt="صورة مكبرة"
              className="w-full max-h-[60vh] object-contain rounded-xl border border-slate-700 shadow-md"
            />

            <button
              onClick={() => setIsZoomOpen(false)}
              className="mt-4 px-6 py-2 bg-[#fca311] text-black font-bold text-sm rounded-xl hover:bg-[#fca311]/90 shadow-md transition-all"
            >
              فهمت، نرجع للعب 🧩
            </button>
          </div>
        </div>
      )}
    </>
  );
};
