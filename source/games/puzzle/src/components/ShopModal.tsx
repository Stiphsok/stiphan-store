import React, { useState } from 'react';
import { X, Check, Lock, Sparkles, Wand2, Zap } from 'lucide-react';
import { BOARD_THEMES } from '../data/presets';
import { BoardTheme } from '../types/game';
import { sound } from '../utils/sound';

interface ShopModalProps {
  isOpen: boolean;
  coins: number;
  unlockedThemeIds: string[];
  activeThemeId: string;
  hasDoubleReward: boolean;
  onBuyTheme: (theme: BoardTheme) => void;
  onSelectTheme: (theme: BoardTheme) => void;
  onBuySolveOneTile: () => void;
  onBuyDoubleReward: () => void;
  onOpenAd: () => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  coins,
  unlockedThemeIds,
  activeThemeId,
  hasDoubleReward,
  onBuyTheme,
  onSelectTheme,
  onBuySolveOneTile,
  onBuyDoubleReward,
  onOpenAd,
  onClose,
}) => {
  const [tab, setTab] = useState<'themes' | 'boosts'>('themes');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#1b263b] border-2 border-[#fca311] rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/80 bg-[#121c2d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-black font-black flex items-center justify-center text-base">
              🛍️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>متجر سطيفان</span>
                <span className="text-xs bg-[#fca311] text-black font-extrabold px-2 py-0.5 rounded-full">
                  🪙 {coins} عملة
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                خصص البورد واشترِ مساعدات ذكية
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700/60 bg-[#172235]">
          <button
            onClick={() => {
              sound.playClick();
              setTab('themes');
            }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              tab === 'themes'
                ? 'border-[#fca311] text-[#fca311] bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>ثيمات وإطارات البورد</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setTab('boosts');
            }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              tab === 'boosts'
                ? 'border-emerald-400 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>المساعدات والتعزيزات</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tab === 'themes' ? (
            BOARD_THEMES.map((theme) => {
              const isUnlocked = unlockedThemeIds.includes(theme.id);
              const isEquipped = activeThemeId === theme.id;
              const canAfford = coins >= theme.price;

              return (
                <div
                  key={theme.id}
                  style={{ borderColor: isEquipped ? theme.borderColor : '#334155' }}
                  className="bg-[#0d1b2a] border-2 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-md"
                >
                  {/* Theme Preview Dot & Info */}
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        backgroundColor: theme.boardBg,
                        borderColor: theme.borderColor,
                        boxShadow: `0 0 10px ${theme.shadowColor}`,
                      }}
                      className="w-12 h-12 rounded-xl border-2 flex items-center justify-center text-lg shrink-0"
                    >
                      🧩
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{theme.name}</span>
                        {isEquipped && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full">
                            مُفعّل
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{theme.description}</p>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="shrink-0">
                    {isEquipped ? (
                      <button
                        disabled
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>مختارة</span>
                      </button>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onSelectTheme(theme);
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#415a77] hover:bg-[#415a77]/80 text-white transition-all shadow-sm"
                      >
                        تفعيل
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (canAfford) {
                            sound.playCoin();
                            onBuyTheme(theme);
                          } else {
                            sound.playError();
                          }
                        }}
                        disabled={!canAfford}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                          canAfford
                            ? 'bg-[#fca311] hover:bg-[#e0910f] text-black shadow-md active:scale-95'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{theme.price} عملة</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            /* Boosts / Power-ups tab */
            <div className="space-y-3">
              {/* Power-up 1: Solve One Tile */}
              <div className="bg-[#0d1b2a] border border-slate-700 p-4 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-500/40 flex items-center justify-center text-purple-300 text-2xl shrink-0">
                    <Wand2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      عصا سحرية: حل قطعة واحدة
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      تنقل قطعة عشوائية غير صحيحة إلى مكانها الأصلي فوراً!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (coins >= 25) {
                      sound.playPowerup();
                      onBuySolveOneTile();
                    } else {
                      sound.playError();
                    }
                  }}
                  disabled={coins < 25}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1 shrink-0 ${
                    coins >= 25
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>25 عملة</span>
                </button>
              </div>

              {/* Power-up 2: 2x Coin Multiplier */}
              <div className="bg-[#0d1b2a] border border-slate-700 p-4 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-900/40 border border-amber-500/40 flex items-center justify-center text-amber-300 text-2xl shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <span>مضاعف المكافأة 2X</span>
                      {hasDoubleReward && (
                        <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.2 rounded-full font-black">
                          نشط الآن!
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ضاعف العملات التي ستربحها عند الفوز بالماتش القادم!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (coins >= 20 && !hasDoubleReward) {
                      sound.playPowerup();
                      onBuyDoubleReward();
                    } else {
                      sound.playError();
                    }
                  }}
                  disabled={coins < 20 || hasDoubleReward}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1 shrink-0 ${
                    coins >= 20 && !hasDoubleReward
                      ? 'bg-[#fca311] hover:bg-[#e0910f] text-black shadow-md active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {hasDoubleReward ? <span>مفعّل</span> : <span>20 عملة</span>}
                </button>
              </div>

              {/* Need coins banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/60 to-[#1b263b] border border-red-500/30 flex items-center justify-between gap-3">
                <div className="text-right">
                  <h5 className="text-xs font-bold text-red-200">خاصينك عملات؟</h5>
                  <p className="text-[10px] text-slate-300">
                    تفرج فإعلان قصير وربح 20 عملة فالبلاصة!
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAd();
                  }}
                  className="px-3 py-1.5 bg-[#e63946] hover:bg-red-600 text-white text-xs font-bold rounded-xl shrink-0 shadow-md"
                >
                  شاهد إعلان (+20)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
