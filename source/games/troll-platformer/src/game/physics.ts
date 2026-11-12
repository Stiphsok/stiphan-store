import { Platform, Spike, Coin } from '../types/game';

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

// AABB Overlap check
export function checkAABB(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// Precise Spike Collision Check
// A spike is a triangle, so we can use a slightly contracted hitbox or triangle point check
// so players don't die unfairly when grazing empty corner space!
export function checkSpikeCollision(player: BoundingBox, spike: Spike): boolean {
  // If spike is still hidden and not revealed, it doesn't kill yet
  if (spike.hidden && !spike.revealed) {
    return false;
  }

  // Contract player box slightly for fair retro platformer feel (2px horizontal grace)
  const playerHitbox: BoundingBox = {
    x: player.x + 3,
    y: player.y + 2,
    w: player.w - 6,
    h: player.h - 2
  };

  const spikeHitbox: BoundingBox = {
    x: spike.x + 2,
    y: spike.y + (spike.dir === 'down' ? 0 : 2),
    w: spike.w - 4,
    h: spike.h - 2
  };

  return checkAABB(playerHitbox, spikeHitbox);
}

// Check if player is standing on a platform
export function resolvePlatformCollision(
  player: { x: number; y: number; w: number; h: number; vx: number; vy: number },
  prevY: number,
  platforms: Platform[]
): { grounded: boolean; platform: Platform | null } {
  let grounded = false;
  let standingPlatform: Platform | null = null;

  for (const plat of platforms) {
    if (plat.isBroken) continue; // broken crumbling platform has no collision

    // Check horizontal overlap
    const horizontalOverlap =
      player.x + player.w - 3 > plat.x &&
      player.x + 3 < plat.x + plat.w;

    if (!horizontalOverlap) continue;

    // Check if player landed on top from above
    const playerFeetPrev = prevY + player.h;
    const playerFeetNow = player.y + player.h;

    if (playerFeetPrev <= plat.y + 4 && playerFeetNow >= plat.y && player.vy >= 0) {
      player.y = plat.y - player.h;
      player.vy = 0;
      grounded = true;
      standingPlatform = plat;
      break;
    }
  }

  return { grounded, platform: standingPlatform };
}

// Check Coin Collection
export function checkCoinCollection(player: BoundingBox, coin: Coin): boolean {
  if (coin.collected) return false;
  const coinBox: BoundingBox = {
    x: coin.x - 7,
    y: coin.y - 7,
    w: 14,
    h: 14
  };
  return checkAABB(player, coinBox);
}

// Check Exit Reach
export function checkExitDoor(player: BoundingBox, exit: { x: number; y: number; w: number; h: number }): boolean {
  const exitBox: BoundingBox = {
    x: exit.x + 4,
    y: exit.y + 6,
    w: exit.w - 8,
    h: exit.h - 6
  };
  return checkAABB(player, exitBox);
}
