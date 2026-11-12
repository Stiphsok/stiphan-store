import React from 'react';
import { Users, PhoneCall, Sparkles, RefreshCw, ShieldAlert } from 'lucide-react';

export interface LifelineState {
  fiftyFifty: boolean;
  audience: boolean;
  phone: boolean;
  host: boolean;
  switch: boolean;
  doubleDip: boolean;
}

interface LifelinesBarProps {
  lifelines: LifelineState;
  onUseFiftyFifty: () => void;
  onUseAudience: () => void;
  onUsePhone: () => void;
  onUseHost: () => void;
  onUseSwitch: () => void;
  onUseDoubleDip: () => void;
  disabled?: boolean;
}

export const LifelinesBar: React.FC<LifelinesBarProps> = ({
  lifelines,
  onUseFiftyFifty,
  onUseAudience,
  onUsePhone,
  onUseHost,
  onUseSwitch,
  onUseDoubleDip,
  disabled = false
}) => {
  return (
    <div className="w-full bg-slate-900/90 border border-amber-500/30 rounded-2xl p-3 shadow-lg flex items-center justify-around flex-wrap gap-2">
      
      {/* 50:50 */}
      <button
        disabled={disabled || lifelines.fiftyFifty}
        onClick={onUseFiftyFifty}
        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
          lifelines.fiftyFifty
            ? 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-40'
            : 'bg-slate-800/90 border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-400 active:scale-95 shadow-md'
        }`}
        title="حذف إجابتين خائطتين (50:50)"
      >
        <span className="font-extrabold text-sm font-mono flex items-center gap-1">
          50:50
        </span>
        <span className="text-[10px] mt-0.5 font-bold">حذف 2</span>
      </button>

      {/* Audience */}
      <button
        disabled={disabled || lifelines.audience}
        onClick={onUseAudience}
        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
          lifelines.audience
            ? 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-40'
            : 'bg-slate-800/90 border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-400 active:scale-95 shadow-md'
        }`}
        title="رأي جمهور القاعة"
      >
        <Users className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-bold">الجمهور</span>
      </button>

      {/* Phone a Friend */}
      <button
        disabled={disabled || lifelines.phone}
        onClick={onUsePhone}
        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
          lifelines.phone
            ? 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-40'
            : 'bg-slate-800/90 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-400 active:scale-95 shadow-md'
        }`}
        title="الاتصال بصديق"
      >
        <PhoneCall className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-bold">اتصال</span>
      </button>

      {/* Ask Host */}
      <button
        disabled={disabled || lifelines.host}
        onClick={onUseHost}
        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
          lifelines.host
            ? 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-40'
            : 'bg-slate-800/90 border-purple-500/40 text-purple-300 hover:bg-purple-500 hover:text-slate-950 hover:border-purple-400 active:scale-95 shadow-md'
        }`}
        title="رأي وتلميح المذيع"
      >
        <Sparkles className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-bold">المذيع</span>
      </button>

      {/* Switch Question */}
      <button
        disabled={disabled || lifelines.switch}
        onClick={onUseSwitch}
        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
          lifelines.switch
            ? 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-40'
            : 'bg-slate-800/90 border-blue-500/40 text-blue-300 hover:bg-blue-500 hover:text-slate-950 hover:border-blue-400 active:scale-95 shadow-md'
        }`}
        title="تغيير السؤال الحالي"
      >
        <RefreshCw className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-bold">تغيير</span>
      </button>

      {/* Double Dip */}
      <button
        disabled={disabled || lifelines.doubleDip}
        onClick={onUseDoubleDip}
        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
          lifelines.doubleDip
            ? 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-40'
            : 'bg-slate-800/90 border-pink-500/40 text-pink-300 hover:bg-pink-500 hover:text-slate-950 hover:border-pink-400 active:scale-95 shadow-md'
        }`}
        title="محاولتان لاختيار الإجابة الصحيحة"
      >
        <ShieldAlert className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-bold">محاولتان</span>
      </button>

    </div>
  );
};
