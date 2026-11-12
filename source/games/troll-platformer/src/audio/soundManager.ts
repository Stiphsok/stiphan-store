class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public enabled: boolean = true;
  public volume: number = 0.7;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.enabled ? this.volume : 0;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(enabled ? this.volume : 0, this.ctx.currentTime);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.enabled ? this.volume : 0, this.ctx.currentTime);
    }
  }

  // Helper to create oscillator with envelope
  private playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    startVol: number = 0.25,
    freqEnd?: number
  ) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(10, freqEnd), t + duration);
    }

    gain.gain.setValueAtTime(startVol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  // Jump Sound: Quick upbeat sweep
  public playJump() {
    if (!this.enabled) return;
    this.playTone(160, 'square', 0.12, 0.2, 440);
  }

  // Land Sound: Soft low thud
  public playLand() {
    if (!this.enabled) return;
    this.playTone(90, 'sine', 0.08, 0.25, 40);
  }

  // Platform Crumble: Crunchy noise burst
  public playPlatformCrumble() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, t);
    filter.Q.value = 3;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
  }

  // Spike Trigger: Metallic "shing!" / snap
  public playSpikeTrigger() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Coin Sound: Crisp two-tone chime
  public playCoin() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, t); // B5
    gain1.gain.setValueAtTime(0.2, t);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(t);
    osc1.stop(t + 0.08);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, t + 0.08); // E6
    gain2.gain.setValueAtTime(0.22, t + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(t + 0.08);
    osc2.stop(t + 0.25);
  }

  // Button Click: UI click sound
  public playButton() {
    if (!this.enabled) return;
    this.playTone(600, 'triangle', 0.04, 0.15, 300);
  }

  // Warning alert sound (2 lives remaining)
  public playWarning() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    [0, 0.12].forEach((offset) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, t + offset);
      gain.gain.setValueAtTime(0.2, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, t + offset + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t + offset);
      osc.stop(t + offset + 0.08);
    });
  }

  // Level Complete Fanfare: 8-bit joyful victory jingle
  public playLevelComplete() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const notes = [
      { f: 523.25, d: 0.08 }, // C5
      { f: 659.25, d: 0.08 }, // E5
      { f: 783.99, d: 0.08 }, // G5
      { f: 1046.50, d: 0.25 } // C6
    ];

    let timeOffset = 0;
    const t = this.ctx.currentTime;

    notes.forEach((note) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, t + timeOffset);

      gain.gain.setValueAtTime(0.2, t + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.01, t + timeOffset + note.d);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t + timeOffset);
      osc.stop(t + timeOffset + note.d);
      timeOffset += note.d;
    });
  }

  // Ad Reward Fanfare: magical chime
  public playAdReward() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);
      gain.gain.setValueAtTime(0.25, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.3);
    });
  }

  // Main Death Sound + Evil Laugh Trigger
  public playDeath() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    // 1. Initial splat/squish impact
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.18);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.2);

    // 2. Play one of 5 randomized hilarious evil villain troll laughs!
    const laughType = Math.floor(Math.random() * 5);
    setTimeout(() => {
      switch (laughType) {
        case 0:
          this.playMwahahaLaugh();
          break;
        case 1:
          this.playCheekyGiggle();
          break;
        case 2:
          this.playGoofyWahWahLaugh();
          break;
        case 3:
          this.playGoblinChortle();
          break;
        case 4:
        default:
          this.playRaspyDevilLaugh();
          break;
      }
    }, 120);
  }

  // Laugh 1: Classic Deep Villain "Mwa-ha-ha-ha-ha!"
  public playMwahahaLaugh() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Pitches for "MWA - HA - HA - HA - HA"
    const laughPitches = [160, 220, 200, 180, 150];
    const durations = [0.18, 0.14, 0.14, 0.14, 0.3];

    let offset = 0;
    laughPitches.forEach((pitch, i) => {
      const osc = this.ctx!.createOscillator();
      const filter = this.ctx!.createBiquadFilter();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(pitch, t + offset);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.85, t + offset + durations[i]);

      // Formant vocal vowel filter ("AH" sound ~ 700Hz - 1100Hz)
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800 + i * 50, t + offset);
      filter.Q.value = 4;

      gain.gain.setValueAtTime(0.35, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, t + offset + durations[i]);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t + offset);
      osc.stop(t + offset + durations[i]);

      offset += durations[i] * 0.85; // slight overlap for realistic rhythm
    });
  }

  // Laugh 2: Cheeky Troll High-Pitched Giggle "Hee-hee-hee-hee-hee!"
  public playCheekyGiggle() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const bursts = 6;
    for (let i = 0; i < bursts; i++) {
      const offset = i * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = 580 + (i % 2 === 0 ? 60 : 0);
      osc.frequency.setValueAtTime(baseFreq, t + offset);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, t + offset + 0.05);

      gain.gain.setValueAtTime(0.25, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, t + offset + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + offset);
      osc.stop(t + offset + 0.06);
    }
  }

  // Laugh 3: Goofy Cartoon Wah-Wah + Chuckle
  public playGoofyWahWahLaugh() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Wah-wah slide
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.linearRampToValueAtTime(180, t + 0.35);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.38);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.38);

    // Followed by snarky "heh heh"
    [0.4, 0.52].forEach((offset, idx) => {
      const chuckOsc = this.ctx!.createOscillator();
      const chuckGain = this.ctx!.createGain();
      chuckOsc.type = 'triangle';
      chuckOsc.frequency.setValueAtTime(320 - idx * 40, t + offset);
      chuckGain.gain.setValueAtTime(0.25, t + offset);
      chuckGain.gain.exponentialRampToValueAtTime(0.01, t + offset + 0.09);
      chuckOsc.connect(chuckGain);
      chuckGain.connect(this.masterGain!);
      chuckOsc.start(t + offset);
      chuckOsc.stop(t + offset + 0.09);
    });
  }

  // Laugh 4: Goblin Chortle
  public playGoblinChortle() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const pitches = [400, 480, 520, 460, 390, 320];
    pitches.forEach((freq, idx) => {
      const offset = idx * 0.065;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + offset);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.85, t + offset + 0.05);

      gain.gain.setValueAtTime(0.22, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, t + offset + 0.055);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t + offset);
      osc.stop(t + offset + 0.055);
    });
  }

  // Laugh 5: Raspy Devil Laugh
  public playRaspyDevilLaugh() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const laughNotes = [130, 155, 140, 115];
    laughNotes.forEach((freq, idx) => {
      const offset = idx * 0.12;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + offset);
      osc.frequency.linearRampToValueAtTime(freq * 0.8, t + offset + 0.1);

      gain.gain.setValueAtTime(0.35, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, t + offset + 0.11);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t + offset);
      osc.stop(t + offset + 0.11);
    });
  }
}

export const soundManager = new SoundManager();
