import { AdRewardType } from '../types/game';

export interface AdConfig {
  adMobAppId: string;
  rewardedAdUnitId: string;
  interstitialAdUnitId: string;
  bannerAdUnitId: string;
  isTestMode: boolean;
}

// Google Official Test Ad Unit IDs for Android
export const DEFAULT_ADMOB_CONFIG: AdConfig = {
  adMobAppId: 'ca-app-pub-3940256099942544~3347511713',
  rewardedAdUnitId: 'ca-app-pub-3940256099942544/5224354917',
  interstitialAdUnitId: 'ca-app-pub-3940256099942544/1033173712',
  bannerAdUnitId: 'ca-app-pub-3940256099942544/6300978111',
  isTestMode: true
};

export type AdStateCallback = (state: 'loading' | 'playing' | 'completed' | 'failed' | 'closed') => void;

class AdManager {
  private config: AdConfig = { ...DEFAULT_ADMOB_CONFIG };
  private lastInterstitialTime: number = 0;
  private levelCompletionsSinceLastInterstitial: number = 0;
  private claimedTokens: Set<string> = new Set();
  private isSimulatedAdActive: boolean = false;
  private currentRewardType: AdRewardType | null = null;
  private onRewardGranted: ((type: AdRewardType) => void) | null = null;
  private onAdClosed: (() => void) | null = null;
  private onAdStateChange: AdStateCallback | null = null;

  constructor() {
    this.loadClaimedTokens();
  }

  private loadClaimedTokens() {
    try {
      const saved = localStorage.getItem('stiphan_claimed_tokens');
      if (saved) {
        const arr = JSON.parse(saved);
        this.claimedTokens = new Set(arr);
      }
    } catch {
      // Ignore storage errors
    }
  }

  private saveClaimedTokens() {
    try {
      localStorage.setItem('stiphan_claimed_tokens', JSON.stringify(Array.from(this.claimedTokens)));
    } catch {
      // Ignore storage errors
    }
  }

  public getConfig(): AdConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<AdConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // Check if native AdMob SDK is available (e.g. running inside Capacitor / Cordova Android APK)
  public isNativeAdMobAvailable(): boolean {
    const w = window as unknown as { admob?: unknown; Capacitor?: { isNativePlatform?: () => boolean } };
    return !!(w.admob || (w.Capacitor && w.Capacitor.isNativePlatform && w.Capacitor.isNativePlatform()));
  }

  // Interstitial Ad Trigger: Frequency capped (every 3-4 levels completed and > 90s cooldown)
  public shouldShowInterstitial(): boolean {
    this.levelCompletionsSinceLastInterstitial++;
    const now = Date.now();
    const cooldownPassed = now - this.lastInterstitialTime > 90000; // 90 seconds
    const countPassed = this.levelCompletionsSinceLastInterstitial >= 3;

    return cooldownPassed && countPassed;
  }

  public recordInterstitialShown() {
    this.lastInterstitialTime = Date.now();
    this.levelCompletionsSinceLastInterstitial = 0;
  }

  // Start a Rewarded Ad request
  public requestRewardedAd(
    type: AdRewardType,
    onSuccess: (type: AdRewardType) => void,
    onClose?: () => void,
    onStateChange?: AdStateCallback
  ) {
    this.currentRewardType = type;
    this.onRewardGranted = onSuccess;
    this.onAdClosed = onClose || null;
    this.onAdStateChange = onStateChange || null;

    if (this.onAdStateChange) this.onAdStateChange('loading');

    // If native AdMob exists on Android APK, invoke native SDK
    if (this.isNativeAdMobAvailable()) {
      this.showNativeRewardedAd(type);
      return;
    }

    // In browser prototype, use the interactive simulated Ad player
    this.isSimulatedAdActive = true;
    if (this.onAdStateChange) this.onAdStateChange('playing');
  }

  // Native AdMob wrapper hook
  private showNativeRewardedAd(type: AdRewardType) {
    try {
      const w = window as unknown as { admob?: { showRewardVideoAd?: (opts: unknown, cb: (res: unknown) => void) => void } };
      if (w.admob && w.admob.showRewardVideoAd) {
        w.admob.showRewardVideoAd({ adId: this.config.rewardedAdUnitId }, (_res: unknown) => {
          this.completeReward(type);
          if (this.onAdClosed) this.onAdClosed();
        });
      } else {
        // Fallback to simulator
        this.isSimulatedAdActive = true;
        if (this.onAdStateChange) this.onAdStateChange('playing');
      }
    } catch {
      this.isSimulatedAdActive = true;
      if (this.onAdStateChange) this.onAdStateChange('playing');
    }
  }

  // Confirm reward claim with unique token to prevent replay attacks
  public completeReward(type: AdRewardType): boolean {
    const claimToken = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    if (this.claimedTokens.has(claimToken)) {
      return false; // Prevent double claims
    }

    this.claimedTokens.add(claimToken);
    this.saveClaimedTokens();

    if (this.onRewardGranted) {
      this.onRewardGranted(type);
    }
    if (this.onAdStateChange) {
      this.onAdStateChange('completed');
    }

    this.isSimulatedAdActive = false;
    this.currentRewardType = null;
    return true;
  }

  public cancelAd() {
    this.isSimulatedAdActive = false;
    this.currentRewardType = null;
    if (this.onAdStateChange) this.onAdStateChange('closed');
    if (this.onAdClosed) this.onAdClosed();
  }

  public isSimulating(): boolean {
    return this.isSimulatedAdActive;
  }

  public getCurrentRewardType(): AdRewardType | null {
    return this.currentRewardType;
  }
}

export const adManager = new AdManager();
