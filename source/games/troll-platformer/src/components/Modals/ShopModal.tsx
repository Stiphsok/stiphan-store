import React from 'react';
import { X, Coins, Check, Sparkles } from 'lucide-react';
import { SKINS } from '../../data/skins';
import { Skin } from '../../types/game';
import { soundManager } from '../../audio/soundManager';

interface ShopModalProps {
  coins: number;
  unlockedSkinIds: string[];
  selectedSkinId: string;
  onSelectSkin: (skinId: string) => void;
  onBuySkin: (skin: Skin) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  coins,
  unlockedSkinIds,
  selectedSkinId,
  onSelectSkin,
  onBuySkin,
  onClose
}) => {
  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col p-4 z-40 animate-pop-in">
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col bg-stone-900 border-2 border-amber-500/60 rounded-3xl p-4 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="font-pixel text-xs text-white">STIPHAN'S WARDROBE</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-950 border border-amber-500/50 text-amber-300 font-pixel text-xs">
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
              <span>{coins}</span>
            </div>
            <button
              onClick={() => {
                soundManager.playButton();
                onClose();
              }}
              className="p-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Skins List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
          {SKINS.map((skin) => {
            const isUnlocked = unlockedSkinIds.includes(skin.id);
            const isSelected = selectedSkinId === skin.id;
            const canAfford = coins >= skin.price;

            return (
              <div
                key={skin.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-400 shadow-md'
                    : 'bg-stone-950 border-stone-800'
                }`}
              >
                {/* Visual Avatar Preview */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-14 rounded-xl border-2 border-stone-700 flex flex-col items-center justify-center relative shadow-inner"
                    style={{ backgroundColor: skin.bodyColor }}
                  >
                    {/* Moroccan Tarboosh Hat Preview */}
                    {skin.accessory === 'tarboosh' && (
                      <div className="absolute -top-2.5 w-6 h-3 bg-red-700 rounded-t-sm flex items-center justify-center">
                        <div className="w-1 h-2 bg-black absolute right-0 top-0.5" />
                      </div>
                    )}
                    {/* Crown Preview */}
                    {skin.accessory === 'crown' && (
                      <div className="absolute -top-2.5 text-xs text-yellow-300">👑</div>
                    )}
                    {/* Ninja Preview */}
                    {skin.accessory === 'ninja' && (
                      <div className="w-full h-1.5 bg-red-600 absolute top-2" />
                    )}
                    {/* Devil Horns */}
                    {skin.accessory === 'devil_horns' && (
                      <div className="absolute -top-2 text-xs">😈</div>
                    )}

                    {/* Eye */}
                    <div className="w-2 h-2 rounded-xs bg-white flex items-center justify-center ml-2">
                      <div
                        className="w-1 h-1 rounded-xs"
                        style={{ backgroundColor: skin.eyeColor }}
                      />
                    </div>
                  </div>

                  {/* Skin Info */}
                  <div>
                    <h4 className="font-pixel text-xs text-stone-200">{skin.name}</h4>
                    <p className="font-arabic text-amber-400 text-xs font-bold leading-tight" dir="rtl">
                      {skin.arabicName}
                    </p>
                    <p className="text-stone-400 text-[10px] mt-0.5">{skin.description}</p>
                  </div>
                </div>

                {/* Action: Equip or Buy */}
                <div>
                  {isSelected ? (
                    <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-pixel text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> EQUIPPED
                    </span>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => {
                        soundManager.playButton();
                        onSelectSkin(skin.id);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-pixel text-[10px] cursor-pointer active:scale-95 transition-all"
                    >
                      EQUIP
                    </button>
                  ) : (
                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        soundManager.playButton();
                        onBuySkin(skin);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] flex items-center gap-1 cursor-pointer transition-all ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold active:scale-95 shadow-md'
                          : 'bg-stone-800 text-stone-500 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <Coins className="w-3 h-3 text-yellow-900" />
                      <span>{skin.price}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
