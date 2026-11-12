import { GridSize } from '../types/game';

export function getNeighbors(index: number, size: GridSize): number[] {
  const neighbors: number[] = [];
  const row = Math.floor(index / size);
  const col = index % size;

  if (row > 0) neighbors.push(index - size); // Up
  if (row < size - 1) neighbors.push(index + size); // Down
  if (col > 0) neighbors.push(index - 1); // Left
  if (col < size - 1) neighbors.push(index + 1); // Right

  return neighbors;
}

export function createSolvedBoard(size: GridSize): number[] {
  return Array.from({ length: size * size }, (_, i) => i);
}

export function isBoardSolved(tiles: number[]): boolean {
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] !== i) return false;
  }
  return true;
}

/**
 * Shuffles the puzzle by performing a random walk of valid moves from the empty slot.
 * This mathematically guarantees 100% solvability for any grid size.
 */
export function shuffleBoard(size: GridSize): { tiles: number[]; emptyIndex: number } {
  const total = size * size;
  const tiles = createSolvedBoard(size);
  let emptyIndex = total - 1;
  let lastMove: number | null = null;

  // Number of random swaps based on board size
  const steps = size === 3 ? 90 : size === 4 ? 160 : 260;

  for (let i = 0; i < steps; i++) {
    const neighbors = getNeighbors(emptyIndex, size);
    // Filter out the direct undo move to create better dispersion
    const candidateNeighbors = neighbors.filter((n) => n !== lastMove);
    const chosenList = candidateNeighbors.length > 0 ? candidateNeighbors : neighbors;
    const nextMove = chosenList[Math.floor(Math.random() * chosenList.length)];

    // Swap empty tile with neighbor
    tiles[emptyIndex] = tiles[nextMove];
    tiles[nextMove] = total - 1;

    lastMove = emptyIndex;
    emptyIndex = nextMove;
  }

  // Ensure it's not accidentally solved right after shuffling
  if (isBoardSolved(tiles)) {
    const neighbors = getNeighbors(emptyIndex, size);
    const nextMove = neighbors[0];
    tiles[emptyIndex] = tiles[nextMove];
    tiles[nextMove] = total - 1;
    emptyIndex = nextMove;
  }

  return { tiles, emptyIndex };
}

/**
 * Calculates Manhattan distance sum for the current board state
 */
export function calculateManhattanDistance(tiles: number[], size: GridSize): number {
  let distance = 0;
  const emptyValue = size * size - 1;

  for (let i = 0; i < tiles.length; i++) {
    const val = tiles[i];
    if (val === emptyValue) continue;

    const currentRow = Math.floor(i / size);
    const currentCol = i % size;
    const targetRow = Math.floor(val / size);
    const targetCol = val % size;

    distance += Math.abs(currentRow - targetRow) + Math.abs(currentCol - targetCol);
  }

  return distance;
}

/**
 * Determines the best tile index adjacent to empty to slide next (Hint system)
 */
export function findBestHintTile(tiles: number[], emptyIndex: number, size: GridSize): number | null {
  const neighbors = getNeighbors(emptyIndex, size);
  if (neighbors.length === 0) return null;

  let bestNeighbor: number | null = null;
  let minDistance = Infinity;

  for (const n of neighbors) {
    // Simulate moving tile n into emptyIndex
    const testTiles = [...tiles];
    testTiles[emptyIndex] = testTiles[n];
    testTiles[n] = size * size - 1;

    const dist = calculateManhattanDistance(testTiles, size);
    if (dist < minDistance) {
      minDistance = dist;
      bestNeighbor = n;
    }
  }

  // If no improvement found, pick the neighbor that is not currently in its correct target position
  if (bestNeighbor === null) {
    bestNeighbor = neighbors.find((n) => tiles[n] !== n) ?? neighbors[0];
  }

  return bestNeighbor;
}

/**
 * Format seconds into mm:ss
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}
