import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, Code, Play } from 'lucide-react';
import { AdRewardType } from '../../types/game';
import { adManager, DEFAULT_ADMOB_CONFIG } from '../../ads/AdManager';
import { soundManager } from '../../audio/soundManager';

interface AdRewardedModalProps {
  rewardType: AdRewardType;
  onRewardComplete: () => void;
  onClose: () => void;
}

export const AdRewardedModal: React.FC<AdRewardedModalProps> = ({
  rewardType,
  onRewardComplete,
  onClose
}) => {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [completed, setCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'admob_docs'>('video');

  useEffect(() => {
    if (secondsLeft > 0) {
      const timer = setTimeout(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!completed) {
      setCompleted(true);
      soundManager.playAdReward();
    }
  }, [secondsLeft, completed]);

  const handleClaimReward = () => {
    adManager.completeReward(rewardType);
    onRewardComplete();
  };

  const getRewardDescription = () => {
    switch (rewardType) {
      case 'extra_lives':
        return '+3 Extra Lives / Attempts';
      case 'second_chance':
        return 'Instant Revive (Second Chance)';
      case 'level_bonus_coins':
        return '+50 Bonus Coins';
      case 'reveal_hints':
        return 'Troll Trap Radar (Reveals Hidden Hazards)';
      case 'daily_bonus':
        return 'Daily Troll Box (+3 Lives & 100 Coins)';
      default:
        return 'Bonus Reward';
    }
  };

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col p-4 z-50 animate-pop-in">
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col bg-stone-900 border-2 border-amber-500 rounded-3xl p-4 shadow-2xl overflow-hidden">
        {/* Top Header with Countdown / Close */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 font-pixel text-[10px] font-bold">
              ADVERTISEMENT
            </span>
            <span className="text-xs text-stone-300 font-sans">
              {completed ? 'Reward Ready!' : `Reward in ${secondsLeft}s`}
            </span>
          </div>

          {/* Close button available only after completion or to cancel */}
          <button
            onClick={() => {
              if (completed) {
                handleClaimReward();
              } else {
                adManager.cancelAd();
                onClose();
              }
            }}
            className="p-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch between Ad Creative & AdMob Integration Info */}
        <div className="flex gap-2 py-2 border-b border-stone-800">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-1.5 rounded-xl font-sans text-xs font-bold cursor-pointer transition-colors ${
              activeTab === 'video'
                ? 'bg-amber-500 text-stone-950'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            Video Simulation
          </button>
          <button
            onClick={() => setActiveTab('admob_docs')}
            className={`flex-1 py-1.5 rounded-xl font-sans text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'admob_docs'
                ? 'bg-amber-500 text-stone-950'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>AdMob Setup</span>
          </button>
        </div>

        {/* Tab 1: Video Ad Simulation */}
        {activeTab === 'video' ? (
          <div className="flex-1 flex flex-col justify-between py-2">
            {/* Mock Ad Creative Banner */}
            <div className="relative flex-1 rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-stone-950 border border-purple-500/40 p-4 flex flex-col items-center justify-center text-center overflow-hidden">
              <div className="absolute top-2 left-2 flex items-center gap-1 text-[9px] text-stone-400 bg-black/40 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Google AdMob Compliant</span>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg mb-3 animate-pulse">
                <Play className="w-8 h-8 text-stone-950 ml-1 fill-stone-950" />
              </div>

              <h4 className="text-white font-bold text-base mb-1">
                TROLL QUEST: MOROCCO EDITION
              </h4>
              <p className="text-purple-200 text-xs mb-3">
                Download now on Google Play & App Store!
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((5 - secondsLeft) / 5) * 100}%` }}
                />
              </div>

              <div className="text-[11px] text-stone-400 font-pixel">
                Reward: <span className="text-yellow-400">{getRewardDescription()}</span>
              </div>
            </div>

            {/* Bottom Claim Reward Button */}
            <div className="pt-3">
              {completed ? (
                <button
                  onClick={handleClaimReward}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 hover:brightness-110 active:scale-95 text-stone-950 font-pixel text-xs font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all animate-bounce"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  <span>CLAIM REWARD ({getRewardDescription()})</span>
                </button>
              ) : (
                <div className="w-full py-3 px-4 rounded-2xl bg-stone-800 text-stone-400 font-pixel text-[11px] text-center">
                  WATCHING AD... ({secondsLeft}s)
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Tab 2: Real AdMob SDK Setup Documentation */
          <div className="flex-1 overflow-y-auto py-2 pr-1 space-y-2 text-stone-300 text-xs">
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
              <h5 className="font-bold text-amber-400 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Native Android AdMob Integration
              </h5>
              <p className="text-[11px] text-stone-400 mb-2">
                This game has an architecture built to plug directly into Google AdMob via Capacitor or Cordova.
              </p>
              <div className="font-mono text-[10px] bg-stone-900 p-2 rounded-lg text-emerald-400 overflow-x-auto">
                <div>npm install @capacitor-community/admob</div>
                <div>npx cap sync</div>
              </div>
            </div>

            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
              <h5 className="font-bold text-yellow-300 text-[11px] mb-1">Configured Test Unit IDs:</h5>
              <ul className="text-[10px] font-mono space-y-1 text-stone-400">
                <li><span className="text-stone-300">App ID:</span> {DEFAULT_ADMOB_CONFIG.adMobAppId}</li>
                <li><span className="text-stone-300">Rewarded ID:</span> {DEFAULT_ADMOB_CONFIG.rewardedAdUnitId}</li>
                <li><span className="text-stone-300">Interstitial ID:</span> {DEFAULT_ADMOB_CONFIG.interstitialAdUnitId}</li>
                <li><span className="text-stone-300">Banner ID:</span> {DEFAULT_ADMOB_CONFIG.bannerAdUnitId}</li>
              </ul>
            </div>

            <div className="p-2.5 bg-amber-950/40 rounded-xl border border-amber-500/40 text-[11px] text-amber-200">
              When packaged as an Android APK, `adManager.isNativeAdMobAvailable()` automatically detects the native SDK and serves live AdMob video ads.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
