import React, { useState } from 'react';
import { X, Lock, CheckCircle2, Trophy } from 'lucide-react';
import { TOTAL_LEVELS } from '../../game/levels';
import { soundManager } from '../../audio/soundManager';

interface LevelSelectModalProps {
  currentLevel: number;
  unlockedLevel: number;
  completedLevels: number[];
  onSelectLevel: (level: number) => void;
  onClose: () => void;
}

const ERAS = [
  { id: 1, name: 'Intro', range: [1, 10], label: '1 - 10' },
  { id: 2, name: 'Spikes', range: [11, 30], label: '11 - 30' },
  { id: 3, name: 'Collapse', range: [31, 60], label: '31 - 60' },
  { id: 4, name: 'Symphony', range: [61, 100], label: '61 - 100' },
  { id: 5, name: 'Paranoia', range: [101, 150], label: '101 - 150' },
  { id: 6, name: 'Master', range: [151, 200], label: '151 - 200' }
];

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevel,
  unlockedLevel,
  completedLevels,
  onSelectLevel,
  onClose
}) => {
  // Find current era
  const initialEra = ERAS.find((e) => currentLevel >= e.range[0] && currentLevel <= e.range[1])?.id || 1;
  const [selectedEraId, setSelectedEraId] = useState<number>(initialEra);

  const currentEra = ERAS.find((e) => e.id === selectedEraId) || ERAS[0];
  const [startLvl, endLvl] = currentEra.range;

  const levelNumbers: number[] = [];
  for (let i = startLvl; i <= endLvl; i++) {
    levelNumbers.push(i);
  }

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col p-4 z-40 animate-pop-in">
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col bg-stone-900 border-2 border-stone-700 rounded-3xl p-4 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="font-pixel text-xs text-white">SELECT LEVEL ({TOTAL_LEVELS})</h2>
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

        {/* Era Navigation Pills */}
        <div className="flex items-center gap-1.5 py-3 overflow-x-auto no-scrollbar">
          {ERAS.map((era) => {
            const isSelected = era.id === selectedEraId;
            return (
              <button
                key={era.id}
                onClick={() => {
                  soundManager.playButton();
                  setSelectedEraId(era.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-pixel whitespace-nowrap cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {era.name} ({era.label})
              </button>
            );
          })}
        </div>

        {/* 200 Level Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-5 gap-2.5 py-2">
          {levelNumbers.map((lvl) => {
            const isUnlocked = lvl <= unlockedLevel;
            const isCurrent = lvl === currentLevel;
            const isCompleted = completedLevels.includes(lvl);

            return (
              <button
                key={lvl}
                disabled={!isUnlocked}
                onClick={() => {
                  soundManager.playButton();
                  onSelectLevel(lvl);
                }}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center font-pixel text-xs transition-transform cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-400 text-stone-950 ring-2 ring-yellow-300 shadow-lg scale-105'
                    : isCompleted
                    ? 'bg-emerald-900/60 border border-emerald-500/60 text-emerald-300'
                    : isUnlocked
                    ? 'bg-stone-800 border border-stone-600 text-stone-200 hover:bg-stone-700 active:scale-95'
                    : 'bg-stone-950/80 border border-stone-900 text-stone-600 cursor-not-allowed opacity-50'
                }`}
              >
                {isUnlocked ? (
                  <>
                    <span className="font-bold">{lvl}</span>
                    {isCompleted && (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 absolute bottom-1 right-1" />
                    )}
                  </>
                ) : (
                  <Lock className="w-4 h-4 text-stone-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
