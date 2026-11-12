import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

interface BannerAdProps {
  placement?: 'menu' | 'level_select' | 'shop';
}

export const BannerAd: React.FC<BannerAdProps> = ({ placement = 'menu' }) => {
  return (
    <div className="w-full py-1.5 px-3 flex items-center justify-center z-10 select-none">
      <div className="w-full max-w-xs h-12 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between px-3 shadow-md relative overflow-hidden">
        {/* Ad Tag */}
        <div className="absolute top-0.5 right-1.5 flex items-center gap-0.5 text-[8px] text-stone-500 font-pixel">
          <ShieldCheck className="w-2.5 h-2.5 text-stone-500" />
          <span>AD</span>
        </div>

        {/* Content */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-xs font-pixel text-white shadow-xs">
            {placement === 'menu' ? '🎮' : placement === 'shop' ? '💎' : '⭐'}
          </div>
          <div className="text-left">
            <p className="text-[11px] font-bold text-stone-200 leading-tight">
              {placement === 'menu' ? 'Troll Games Pro' : placement === 'shop' ? 'Unlock Special Coins' : 'More Mobile Puzzles'}
            </p>
            <p className="text-[9px] text-stone-400">Google AdMob Placement</p>
          </div>
        </div>

        {/* Install / Check out button */}
        <div className="px-2 py-1 rounded-md bg-stone-800 text-amber-400 font-pixel text-[9px] flex items-center gap-1">
          <span>INSTALL</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </div>
      </div>
    </div>
  );
};
