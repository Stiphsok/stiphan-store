import React, { useEffect, useRef } from 'react';
import { GridSize, BoardTheme } from '../types/game';
import { getNeighbors } from '../utils/puzzle';
import { sound } from '../utils/sound';

interface GameBoardProps {
  gridSize: GridSize;
  tiles: number[];
  emptyIndex: number;
  currentImgUrl: string;
  theme: BoardTheme;
  showNumbers: boolean;
  hintIndex: number | null;
  isPeeking: boolean;
  isWon: boolean;
  onMoveTile: (index: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gridSize,
  tiles,
  emptyIndex,
  currentImgUrl,
  theme,
  showNumbers,
  hintIndex,
  isPeeking,
  isWon,
  onMoveTile,
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const emptyValue = gridSize * gridSize - 1;

  // Handle tile click with support for line-shift (clicking same row/column)
  const handleTileClick = (index: number) => {
    if (isWon || index === emptyIndex) return;

    const neighbors = getNeighbors(emptyIndex, gridSize);
    if (neighbors.includes(index)) {
      sound.playSlide();
      onMoveTile(index);
    } else {
      // Check if clicked tile shares row or col with empty tile for multi-slide
      const emptyRow = Math.floor(emptyIndex / gridSize);
      const emptyCol = emptyIndex % gridSize;
      const tileRow = Math.floor(index / gridSize);
      const tileCol = index % gridSize;

      if (emptyRow === tileRow) {
        // Same row: slide tiles sequentially towards empty
        const dir = tileCol < emptyCol ? 1 : -1;
        let curr = emptyCol - dir;
        sound.playSlide();
        while (curr !== tileCol - dir) {
          const shiftIdx = emptyRow * gridSize + curr;
          onMoveTile(shiftIdx);
          curr -= dir;
        }
      } else if (emptyCol === tileCol) {
        // Same column: slide tiles sequentially towards empty
        const dir = tileRow < emptyRow ? 1 : -1;
        let curr = emptyRow - dir;
        sound.playSlide();
        while (curr !== tileRow - dir) {
          const shiftIdx = curr * gridSize + emptyCol;
          onMoveTile(shiftIdx);
          curr -= dir;
        }
      } else {
        sound.playError();
      }
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isWon) return;

      const emptyRow = Math.floor(emptyIndex / gridSize);
      const emptyCol = emptyIndex % gridSize;
      let targetIndex: number | null = null;

      // Note: RTL and standard inverted sliding directions
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        // Move tile below empty into empty
        if (emptyRow < gridSize - 1) targetIndex = emptyIndex + gridSize;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        // Move tile above empty into empty
        if (emptyRow > 0) targetIndex = emptyIndex - gridSize;
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        // In Arabic RTL, ArrowLeft moves tile to the left or right
        if (emptyCol < gridSize - 1) targetIndex = emptyIndex + 1;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (emptyCol > 0) targetIndex = emptyIndex - 1;
      }

      if (targetIndex !== null) {
        e.preventDefault();
        sound.playSlide();
        onMoveTile(targetIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [emptyIndex, gridSize, isWon, onMoveTile]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || isWon) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // Minimum swipe threshold
    if (Math.max(absX, absY) < 25) return;

    const emptyRow = Math.floor(emptyIndex / gridSize);
    const emptyCol = emptyIndex % gridSize;
    let targetIndex: number | null = null;

    if (absX > absY) {
      // Horizontal swipe
      if (dx > 0) {
        // Swiped right: try moving tile to left into empty slot
        if (emptyCol > 0) targetIndex = emptyIndex - 1;
      } else {
        // Swiped left: try moving tile to right into empty slot
        if (emptyCol < gridSize - 1) targetIndex = emptyIndex + 1;
      }
    } else {
      // Vertical swipe
      if (dy > 0) {
        // Swiped down: move tile above into empty
        if (emptyRow > 0) targetIndex = emptyIndex - gridSize;
      } else {
        // Swiped up: move tile below into empty
        if (emptyRow < gridSize - 1) targetIndex = emptyIndex + gridSize;
      }
    }

    if (targetIndex !== null) {
      sound.playSlide();
      onMoveTile(targetIndex);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 flex flex-col items-center">
      <div
        ref={boardRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          borderColor: theme.borderColor,
          boxShadow: `0 12px 30px ${theme.shadowColor}, 0 2px 8px rgba(0,0,0,0.6)`,
          backgroundColor: theme.boardBg,
        }}
        className="relative w-full aspect-square max-w-[420px] rounded-2xl p-2 sm:p-2.5 border-[3px] transition-colors duration-300 select-none overflow-hidden touch-none"
      >
        {/* Tiles Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
            gap: gridSize === 3 ? '4px' : gridSize === 4 ? '3px' : '2px',
          }}
          className="w-full h-full"
        >
          {tiles.map((val, index) => {
            const isEmpty = val === emptyValue;
            const isHint = hintIndex === index;
            const isCorrectPosition = val === index;

            if (isEmpty) {
              return (
                <div
                  key="empty-tile"
                  className="w-full h-full rounded-lg bg-[#0d1b2a]/95 flex items-center justify-center border border-dashed border-slate-700/50 shadow-inner"
                >
                  <span className="text-[10px] text-slate-700 font-mono select-none">
                    فارغ
                  </span>
                </div>
              );
            }

            const origRow = Math.floor(val / gridSize);
            const origCol = val % gridSize;
            const bgPosX = (origCol / (gridSize - 1)) * 100;
            const bgPosY = (origRow / (gridSize - 1)) * 100;

            return (
              <div
                key={`tile-${val}`}
                onClick={() => handleTileClick(index)}
                style={{
                  backgroundImage: `url(${currentImgUrl})`,
                  backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                  backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                }}
                className={`relative w-full h-full rounded-lg cursor-pointer transition-transform duration-100 active:scale-95 shadow-sm hover:brightness-105 select-none overflow-hidden group ${
                  isHint
                    ? 'ring-4 ring-yellow-400 ring-offset-1 ring-offset-[#0d1b2a] animate-pulse z-10'
                    : 'border border-black/30'
                }`}
              >
                {/* Number Hint Overlay */}
                {showNumbers && (
                  <div
                    className={`absolute top-1 right-1 w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center shadow-md backdrop-blur-sm transition-all ${
                      isCorrectPosition
                        ? 'bg-emerald-500/90 text-white border border-emerald-300'
                        : 'bg-black/75 text-amber-300 border border-amber-400/50'
                    }`}
                  >
                    {val + 1}
                  </div>
                )}

                {/* Moroccan Geometric Tile Corner Shimmer on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            );
          })}
        </div>

        {/* Ghost Peek Overlay */}
        {isPeeking && (
          <div className="absolute inset-0 z-20 rounded-2xl overflow-hidden bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center p-2 transition-opacity">
            <img
              src={currentImgUrl}
              alt="معاينة كاملة"
              className="w-full h-full object-cover rounded-xl border-2 border-[#fca311] shadow-2xl"
            />
            <div className="absolute bottom-4 bg-black/80 px-3 py-1 rounded-full text-xs font-bold text-[#fca311] border border-[#fca311]/50 shadow-lg">
              👁️ معاينة الصورة الأصلية
            </div>
          </div>
        )}

        {/* Victory Celebration Overlay on Board */}
        {isWon && (
          <div className="absolute inset-0 z-20 rounded-2xl overflow-hidden bg-emerald-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 animate-fadeIn">
            <img
              src={currentImgUrl}
              alt="مكتمل"
              className="w-48 h-48 sm:w-56 sm:h-56 object-cover rounded-2xl border-4 border-[#fca311] shadow-2xl animate-scaleUp"
            />
            <div className="mt-3 px-4 py-1.5 rounded-full bg-[#fca311] text-black font-black text-sm sm:text-base shadow-lg animate-bounce">
              🎉 تيران ناضي! الصورة مكتملة!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
