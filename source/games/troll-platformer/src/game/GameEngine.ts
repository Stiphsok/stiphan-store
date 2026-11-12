import { LevelData, Platform, Spike, Skin } from '../types/game';
import { resolvePlatformCollision, checkSpikeCollision, checkCoinCollection, checkExitDoor } from './physics';
import { soundManager } from '../audio/soundManager';

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export class GameEngine {
  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private isRunning: boolean = false;

  // Viewport dimensions (9:16 portrait ratio)
  public readonly V_WIDTH = 360;
  public readonly V_HEIGHT = 640;

  // Current Level & State
  public level: LevelData;
  public skin: Skin;
  public hintsRevealed: boolean = false;

  // Player physics
  public player = {
    x: 40,
    y: 520,
    w: 20,
    h: 24,
    vx: 0,
    vy: 0,
    isGrounded: false,
    facing: 'right' as 'left' | 'right',
    state: 'idle' as 'idle' | 'run' | 'jump' | 'fall' | 'dead' | 'win',
    deadTimer: 0,
    walkFrame: 0,
    squishX: 1,
    squishY: 1
  };

  // Jump physics constants
  private readonly RUN_SPEED = 3.6;
  private readonly JUMP_POWER = -8.6;
  private readonly GRAVITY = 0.38;
  private readonly TERMINAL_VELOCITY = 10;

  // Jump feel enhancers: Coyote time & Jump buffering
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private readonly COYOTE_FRAMES = 6;
  private readonly JUMP_BUFFER_FRAMES = 5;

  // Input
  public input: InputState = { left: false, right: false, jump: false };
  private prevJumpInput: boolean = false;

  // Visual effects
  private particles: Particle[] = [];
  private screenShake: number = 0;

  // Cloned dynamic level state
  private activePlatforms: Platform[] = [];
  private activeSpikes: Spike[] = [];

  // Callbacks
  public onDeath?: () => void;
  public onLevelComplete?: () => void;
  public onCoinCollected?: (count: number) => void;

  constructor(canvas: HTMLCanvasElement, level: LevelData, skin: Skin) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;

    this.level = level;
    this.skin = skin;

    this.initLevelState();
  }

  public setLevel(newLevel: LevelData) {
    this.level = newLevel;
    this.initLevelState();
  }

  public setSkin(newSkin: Skin) {
    this.skin = newSkin;
  }

  public setHintsRevealed(revealed: boolean) {
    this.hintsRevealed = revealed;
  }

  public initLevelState() {
    this.player.x = this.level.spawn.x;
    this.player.y = this.level.spawn.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.isGrounded = false;
    this.player.state = 'idle';
    this.player.deadTimer = 0;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.particles = [];
    this.screenShake = 0;

    // Deep clone platforms to preserve mutable moving/crumbling states
    this.activePlatforms = this.level.platforms.map((p) => ({
      ...p,
      isBroken: false,
      isCrumbling: false,
      crumbleTimer: 0,
      origX: p.x,
      origY: p.y
    }));

    // Deep clone spikes
    this.activeSpikes = this.level.spikes.map((s) => ({
      ...s,
      revealed: !s.hidden,
      falling: false,
      vy: 0,
      origY: s.y
    }));
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop();
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public restartLevel() {
    this.initLevelState();
  }

  // Trigger death sequence
  public killPlayer() {
    if (this.player.state === 'dead' || this.player.state === 'win') return;

    this.player.state = 'dead';
    this.player.deadTimer = 35;
    this.screenShake = 12;

    // Spawn funny death confetti particles
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i) / 24;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x: this.player.x + this.player.w / 2,
        y: this.player.y + this.player.h / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        color: i % 2 === 0 ? this.skin.bodyColor : '#111111',
        size: 3 + Math.random() * 4,
        life: 0,
        maxLife: 30 + Math.random() * 15
      });
    }

    // Play splat and randomized evil laugh!
    soundManager.playDeath();

    if (this.onDeath) {
      this.onDeath();
    }
  }

  // Revive player on the spot (Second Chance rewarded ad)
  public revivePlayer() {
    this.player.state = 'idle';
    this.player.y -= 30;
    this.player.vy = -3;
    this.player.deadTimer = 0;
  }

  // Main 60fps Loop
  private loop = () => {
    if (!this.isRunning) return;

    this.update();
    this.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update() {
    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake *= 0.88;
      if (this.screenShake < 0.3) this.screenShake = 0;
    }

    // Dead animation timer
    if (this.player.state === 'dead') {
      this.player.deadTimer--;
      this.updateParticles();
      return;
    }

    // Win animation
    if (this.player.state === 'win') {
      this.updateParticles();
      return;
    }

    // 1. Horizontal Movement
    if (this.input.left) {
      this.player.vx = -this.RUN_SPEED;
      this.player.facing = 'left';
    } else if (this.input.right) {
      this.player.vx = this.RUN_SPEED;
      this.player.facing = 'right';
    } else {
      this.player.vx *= 0.65;
      if (Math.abs(this.player.vx) < 0.1) this.player.vx = 0;
    }

    // 2. Jump Handling (with Buffer & Coyote Time)
    const justPressedJump = this.input.jump && !this.prevJumpInput;
    this.prevJumpInput = this.input.jump;

    if (justPressedJump) {
      this.jumpBufferTimer = this.JUMP_BUFFER_FRAMES;
    } else if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer--;
    }

    if (this.player.isGrounded) {
      this.coyoteTimer = this.COYOTE_FRAMES;
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer--;
    }

    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      // Execute Jump
      this.player.vy = this.JUMP_POWER;
      this.player.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.player.squishX = 0.8;
      this.player.squishY = 1.25;
      soundManager.playJump();

      // Jump dust
      for (let i = 0; i < 4; i++) {
        this.particles.push({
          x: this.player.x + this.player.w / 2 + (Math.random() * 10 - 5),
          y: this.player.y + this.player.h,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 1.5,
          color: '#ffffff',
          size: 3,
          life: 0,
          maxLife: 15
        });
      }
    }

    // Variable jump height: cut vertical speed if jump button released early
    if (!this.input.jump && this.player.vy < -3) {
      this.player.vy *= 0.65;
    }

    // 3. Gravity
    this.player.vy += this.GRAVITY;
    if (this.player.vy > this.TERMINAL_VELOCITY) {
      this.player.vy = this.TERMINAL_VELOCITY;
    }

    // Store previous Y for collision tunneling prevention
    const prevY = this.player.y;

    // Apply movement
    this.player.x += this.player.vx;
    this.player.y += this.player.vy;

    // Keep within horizontal bounds
    if (this.player.x < 10) this.player.x = 10;
    if (this.player.x + this.player.w > this.V_WIDTH - 10) {
      this.player.x = this.V_WIDTH - 10 - this.player.w;
    }

    // 4. Update Platforms (moving & crumbling)
    this.updatePlatforms();

    // 5. Platform Collisions
    const col = resolvePlatformCollision(
      this.player,
      prevY,
      this.activePlatforms
    );

    const wasGrounded = this.player.isGrounded;
    this.player.isGrounded = col.grounded;

    // Landed event
    if (!wasGrounded && this.player.isGrounded) {
      soundManager.playLand();
      this.player.squishX = 1.25;
      this.player.squishY = 0.8;
    }

    // Smooth squish reset
    this.player.squishX += (1 - this.player.squishX) * 0.18;
    this.player.squishY += (1 - this.player.squishY) * 0.18;

    // If standing on a moving platform, inherit its horizontal speed
    if (col.grounded && col.platform && col.platform.vx) {
      this.player.x += col.platform.vx;
    }

    // If standing on a crumbling platform, trigger the collapse timer!
    if (col.grounded && col.platform && col.platform.type === 'crumbling' && !col.platform.isCrumbling) {
      col.platform.isCrumbling = true;
      col.platform.crumbleTimer = 16; // collapses in ~0.26s
      soundManager.playPlatformCrumble();
    }

    // 6. Update Troll Spikes & Check Proximity Triggers
    this.updateSpikes();

    // 7. Check Spike Collisions
    const playerBox = {
      x: this.player.x,
      y: this.player.y,
      w: this.player.w,
      h: this.player.h
    };

    for (const spike of this.activeSpikes) {
      if (checkSpikeCollision(playerBox, spike)) {
        this.killPlayer();
        return;
      }
    }

    // 8. Check Bottom Pit Fall
    if (this.player.y > this.V_HEIGHT - 35) {
      this.killPlayer();
      return;
    }

    // 9. Coin Collections
    this.level.coins.forEach((coin) => {
      if (!coin.collected && checkCoinCollection(playerBox, coin)) {
        coin.collected = true;
        soundManager.playCoin();
        if (this.onCoinCollected) this.onCoinCollected(1);

        // Sparkle particles
        for (let i = 0; i < 8; i++) {
          this.particles.push({
            x: coin.x,
            y: coin.y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            color: '#ffd700',
            size: 3,
            life: 0,
            maxLife: 20
          });
        }
      }
    });

    // 10. Check Exit Door Reach
    if (checkExitDoor(playerBox, this.level.exit)) {
      this.player.state = 'win';
      soundManager.playLevelComplete();

      // Confetti burst
      for (let i = 0; i < 40; i++) {
        this.particles.push({
          x: this.level.exit.x + this.level.exit.w / 2,
          y: this.level.exit.y + this.level.exit.h / 2,
          vx: (Math.random() - 0.5) * 5,
          vy: -Math.random() * 6 - 1,
          color: ['#06d6a0', '#ffd166', '#ef476f', '#118ab2'][Math.floor(Math.random() * 4)],
          size: 4 + Math.random() * 3,
          life: 0,
          maxLife: 50
        });
      }

      if (this.onLevelComplete) {
        setTimeout(() => {
          this.onLevelComplete?.();
        }, 600);
      }
    }

    // Animation frames
    if (Math.abs(this.player.vx) > 0.5) {
      this.player.walkFrame += 0.2;
    } else {
      this.player.walkFrame = 0;
    }

    this.updateParticles();
  }

  private updatePlatforms() {
    for (const plat of this.activePlatforms) {
      // Moving platform logic
      if (plat.vx !== undefined && plat.minX !== undefined && plat.maxX !== undefined) {
        plat.x += plat.vx;
        if (plat.x <= plat.minX) {
          plat.x = plat.minX;
          plat.vx = Math.abs(plat.vx);
        } else if (plat.x >= plat.maxX) {
          plat.x = plat.maxX;
          plat.vx = -Math.abs(plat.vx);
        }
      }

      // Crumbling platform logic
      if (plat.isCrumbling && !plat.isBroken) {
        if (plat.crumbleTimer !== undefined && plat.crumbleTimer > 0) {
          plat.crumbleTimer--;
          // Little shake effect
          plat.x = (plat.origX || plat.x) + (Math.random() * 3 - 1.5);
          if (plat.crumbleTimer === 0) {
            plat.isBroken = true;
            // Spawn crumble debris
            for (let i = 0; i < 10; i++) {
              this.particles.push({
                x: plat.x + Math.random() * plat.w,
                y: plat.y + Math.random() * plat.h,
                vx: (Math.random() - 0.5) * 2,
                vy: 1 + Math.random() * 3,
                color: '#ffe45e',
                size: 4,
                life: 0,
                maxLife: 25
              });
            }
          }
        }
      }
    }
  }

  private updateSpikes() {
    for (const spike of this.activeSpikes) {
      // Hidden spike trigger check
      if (spike.hidden && !spike.revealed && spike.triggerDistance) {
        const dist = Math.hypot(
          (this.player.x + this.player.w / 2) - (spike.x + spike.w / 2),
          (this.player.y + this.player.h / 2) - (spike.y + spike.h / 2)
        );

        if (dist <= spike.triggerDistance) {
          spike.revealed = true;
          soundManager.playSpikeTrigger();

          // Smoke puff when hidden spike snaps out
          for (let i = 0; i < 6; i++) {
            this.particles.push({
              x: spike.x + spike.w / 2,
              y: spike.y + (spike.dir === 'down' ? spike.h : 0),
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              color: '#444444',
              size: 3,
              life: 0,
              maxLife: 16
            });
          }
        }
      }

      // Falling spike trigger
      if (spike.dir === 'down' && spike.revealed) {
        spike.vy = (spike.vy || 0) + 0.45;
        spike.y += spike.vy;
      }
    }
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // particle gravity
      p.life++;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  // === RENDERING PIPELINE ===
  public render() {
    const ctx = this.ctx;

    ctx.save();

    // Screen shake transform
    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
    }

    // 1. Background (Bright iconic orange matching the reference!)
    ctx.fillStyle = '#ff7a00';
    ctx.fillRect(0, 0, this.V_WIDTH, this.V_HEIGHT);

    // Subtle warm gradient overlay
    const grad = ctx.createLinearGradient(0, 0, 0, this.V_HEIGHT);
    grad.addColorStop(0, 'rgba(255, 150, 0, 0.25)');
    grad.addColorStop(1, 'rgba(230, 80, 0, 0.35)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.V_WIDTH, this.V_HEIGHT);

    // 2. Bold Black Level Number at Top (Matching reference!)
    this.renderLevelHeader(ctx);

    // 3. Render Troll Signs (if any)
    this.renderSigns(ctx);

    // 4. Render Exit Door
    this.renderExitDoor(ctx);

    // 5. Render Platforms (Pale yellow with crisp borders)
    this.renderPlatforms(ctx);

    // 6. Render Spikes (Black triangular spikes)
    this.renderSpikes(ctx);

    // 7. Render Coins
    this.renderCoins(ctx);

    // 8. Render Particles
    this.renderParticles(ctx);

    // 9. Render Player (Stiphan)
    if (this.player.state !== 'dead') {
      this.renderPlayer(ctx);
    }

    ctx.restore();
  }

  // Top Level Header: Bold black pixel level number matching reference
  private renderLevelHeader(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = '#111111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Format: e.g. "LEVEL 01" or "01"
    const levelStr = `LEVEL ${this.level.id.toString().padStart(2, '0')}`;
    ctx.font = '900 24px "Silkscreen", "Press Start 2P", monospace';
    ctx.fillText(levelStr, this.V_WIDTH / 2, 28);

    // Era subtitle
    ctx.font = '700 10px "Silkscreen", sans-serif';
    ctx.fillStyle = 'rgba(20, 20, 20, 0.7)';
    ctx.fillText(this.level.title.toUpperCase(), this.V_WIDTH / 2, 58);
    ctx.restore();
  }

  // Minimalist gray exit door
  private renderExitDoor(ctx: CanvasRenderingContext2D) {
    const { x, y, w, h } = this.level.exit;

    ctx.save();
    // Outer door frame (dark charcoal)
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(x - 2, y - 2, w + 4, h + 2);

    // Inner door (cool steel gray)
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(x, y, w, h);

    // Door bevel / depth line
    ctx.fillStyle = '#718096';
    ctx.fillRect(x + 2, y + 2, w - 4, 3);
    ctx.fillRect(x + 2, y + 2, 3, h - 4);

    // Golden / Yellow door handle
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(x + w - 7, y + h / 2 - 2, 4, 5);

    // Door lock keyhole
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(x + w - 6, y + h / 2 + 1, 2, 2);

    // Glowing green top light
    ctx.fillStyle = '#06d6a0';
    ctx.fillRect(x + w / 2 - 3, y - 5, 6, 3);
    ctx.restore();
  }

  // Pale yellow platforms with dark border (Reference style)
  private renderPlatforms(ctx: CanvasRenderingContext2D) {
    for (const plat of this.activePlatforms) {
      if (plat.isBroken) continue;

      ctx.save();
      // Platform fill (pale yellow)
      ctx.fillStyle = plat.type === 'crumbling' ? '#fae588' : '#fff085';
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

      // Top highlight
      ctx.fillStyle = '#fff9a6';
      ctx.fillRect(plat.x, plat.y, plat.w, 3);

      // Dark golden-amber border outline
      ctx.strokeStyle = '#c99700';
      ctx.lineWidth = 2;
      ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);

      // Crumbling cracks animation if active
      if (plat.isCrumbling) {
        ctx.strokeStyle = '#8b5e00';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(plat.x + plat.w * 0.3, plat.y);
        ctx.lineTo(plat.x + plat.w * 0.45, plat.y + plat.h * 0.6);
        ctx.lineTo(plat.x + plat.w * 0.6, plat.y + plat.h);
        ctx.stroke();
      }

      // If Hints are active: highlight crumbling floors with yellow dashed glow
      if (this.hintsRevealed && plat.type === 'crumbling') {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(plat.x - 2, plat.y - 2, plat.w + 4, plat.h + 4);
      }

      ctx.restore();
    }
  }

  // Black triangular spikes (Reference style)
  private renderSpikes(ctx: CanvasRenderingContext2D) {
    for (const spike of this.activeSpikes) {
      // If hidden and not yet triggered, don't draw (or draw hint if unlocked)
      if (spike.hidden && !spike.revealed) {
        if (this.hintsRevealed) {
          ctx.save();
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(spike.x, spike.y, spike.w, spike.h);
          ctx.restore();
        }
        continue;
      }

      ctx.save();
      ctx.fillStyle = '#111111';

      const spikeCount = Math.max(1, Math.floor(spike.w / 14));
      const individualW = spike.w / spikeCount;

      for (let i = 0; i < spikeCount; i++) {
        const sx = spike.x + i * individualW;
        ctx.beginPath();

        if (spike.dir === 'down') {
          // Pointing down from ceiling
          ctx.moveTo(sx, spike.y);
          ctx.lineTo(sx + individualW, spike.y);
          ctx.lineTo(sx + individualW / 2, spike.y + spike.h);
        } else {
          // Pointing up from floor (default)
          ctx.moveTo(sx, spike.y + spike.h);
          ctx.lineTo(sx + individualW, spike.y + spike.h);
          ctx.lineTo(sx + individualW / 2, spike.y);
        }

        ctx.closePath();
        ctx.fill();

        // Subtle specular highlight on spike left edge
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // Coins rendering
  private renderCoins(ctx: CanvasRenderingContext2D) {
    const time = Date.now() * 0.005;
    for (const coin of this.level.coins) {
      if (coin.collected) continue;

      ctx.save();
      const bob = Math.sin(time + coin.x) * 2;
      const cx = coin.x;
      const cy = coin.y + bob;

      // Glow
      ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fill();

      // Coin base
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#b8860b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Dollar/star sign
      ctx.fillStyle = '#b8860b';
      ctx.fillRect(cx - 1, cy - 4, 2, 8);
      ctx.restore();
    }
  }

  // Troll Signs
  private renderSigns(ctx: CanvasRenderingContext2D) {
    if (!this.level.signs) return;

    for (const sign of this.level.signs) {
      ctx.save();
      ctx.font = '700 8px "Silkscreen", monospace';
      const textWidth = ctx.measureText(sign.text).width;
      const boxW = textWidth + 12;
      const boxH = 18;

      // Sign post
      ctx.fillStyle = '#5c4033';
      ctx.fillRect(sign.x + boxW / 2 - 2, sign.y + boxH - 2, 4, 12);

      // Sign board
      ctx.fillStyle = '#fffdf0';
      ctx.fillRect(sign.x, sign.y, boxW, boxH);
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sign.x, sign.y, boxW, boxH);

      // Text
      ctx.fillStyle = '#111111';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sign.text, sign.x + boxW / 2, sign.y + boxH / 2);

      ctx.restore();
    }
  }

  // Player Character: Stiphan
  private renderPlayer(ctx: CanvasRenderingContext2D) {
    ctx.save();

    const { x, y, w, h, facing, squishX, squishY, walkFrame } = this.player;

    // Apply squish & stretch centered on base of character
    ctx.translate(x + w / 2, y + h);
    ctx.scale(squishX, squishY);
    ctx.translate(-(w / 2), -h);

    const legBob = Math.sin(walkFrame * 2) * 2;

    // 1. Shadow underneath
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h + 1, w / 2 + 1, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Character Body
    ctx.fillStyle = this.skin.bodyColor;
    ctx.fillRect(0, 0, w, h);

    // Crisp pixel outline
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, w, h);

    // 3. Legs
    ctx.fillStyle = '#111111';
    if (this.player.isGrounded) {
      // Bobbing feet
      ctx.fillRect(2, h - 3 + legBob, 5, 4);
      ctx.fillRect(w - 7, h - 3 - legBob, 5, 4);
    } else {
      // Tucked jump feet
      ctx.fillRect(3, h - 4, 4, 3);
      ctx.fillRect(w - 7, h - 4, 4, 3);
    }

    // 4. Eyes (Expressive retro pixel eye)
    ctx.fillStyle = '#ffffff';
    const eyeX = facing === 'right' ? w - 9 : 3;
    ctx.fillRect(eyeX, 5, 6, 6);

    // Pupil
    ctx.fillStyle = this.skin.eyeColor;
    const pupilX = facing === 'right' ? eyeX + 2 : eyeX + 1;
    ctx.fillRect(pupilX, 7, 3, 3);

    // 5. Mouth (Goofy determined line or smile)
    ctx.fillStyle = '#111111';
    const mouthX = facing === 'right' ? w - 7 : 4;
    ctx.fillRect(mouthX, 15, 4, 2);

    // 6. Accessories / Skins
    this.renderAccessory(ctx, w);

    ctx.restore();
  }

  // Custom Accessories: Moroccan Tarboosh (Fez), Ninja Headband, Crown, etc.
  private renderAccessory(ctx: CanvasRenderingContext2D, w: number) {
    if (this.skin.accessory === 'tarboosh') {
      // Moroccan Fez: Red conical cap with black tassel
      ctx.fillStyle = '#c9184a';
      ctx.beginPath();
      ctx.moveTo(w / 2 - 6, 0);
      ctx.lineTo(w / 2 + 6, 0);
      ctx.lineTo(w / 2 + 4, -9);
      ctx.lineTo(w / 2 - 4, -9);
      ctx.closePath();
      ctx.fill();

      // Black tassel string and dangling tip
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w / 2, -9);
      ctx.lineTo(w / 2 + 7, -4);
      ctx.stroke();

      ctx.fillStyle = '#111111';
      ctx.fillRect(w / 2 + 6, -4, 3, 3);

    } else if (this.skin.accessory === 'ninja') {
      // Red Ninja Headband with flowing ribbon
      ctx.fillStyle = '#e63946';
      ctx.fillRect(-2, 3, w + 4, 4);

      // Trailing knot behind head
      const knotX = this.player.facing === 'right' ? -5 : w + 1;
      ctx.fillRect(knotX, 3, 4, 3);
      ctx.fillRect(knotX - 2, 5, 3, 5);

    } else if (this.skin.accessory === 'crown') {
      // Golden Crown with ruby center
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(1, 0);
      ctx.lineTo(1, -7);
      ctx.lineTo(5, -3);
      ctx.lineTo(w / 2, -8);
      ctx.lineTo(w - 5, -3);
      ctx.lineTo(w - 1, -7);
      ctx.lineTo(w - 1, 0);
      ctx.closePath();
      ctx.fill();

      // Ruby in center
      ctx.fillStyle = '#d90429';
      ctx.fillRect(w / 2 - 1.5, -4, 3, 3);

    } else if (this.skin.accessory === 'sunglasses') {
      // Thug life pixel shades
      ctx.fillStyle = '#111111';
      const sx = this.player.facing === 'right' ? w - 12 : 1;
      ctx.fillRect(sx, 5, 11, 4);
      // White glare pixel
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx + 2, 5, 2, 1);
      ctx.fillRect(sx + 7, 5, 2, 1);

    } else if (this.skin.accessory === 'devil_horns') {
      // Red devil horns
      ctx.fillStyle = '#9b2226';
      ctx.beginPath();
      ctx.moveTo(2, 0);
      ctx.lineTo(0, -7);
      ctx.lineTo(5, 0);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(w - 5, 0);
      ctx.lineTo(w, -7);
      ctx.lineTo(w - 2, 0);
      ctx.fill();
    }
  }

  // Render particles
  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      const alpha = 1 - p.life / p.maxLife;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.restore();
    }
  }
}
