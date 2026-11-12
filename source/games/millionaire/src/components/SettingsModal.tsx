import React from 'react';
import { X, Settings, User, DollarSign, Clock, Volume2, VolumeX, Save, Sliders } from 'lucide-react';
import { CURRENCIES, CATEGORIES } from '../data/questions';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  currencyCode: string;
  setCurrencyCode: (code: string) => void;
  timerDuration: number; // 0 = unlimited, 30, 45, 60
  setTimerDuration: (sec: number) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  playerName,
  setPlayerName,
  currencyCode,
  setCurrencyCode,
  timerDuration,
  setTimerDuration,
  selectedCategory,
  setSelectedCategory,
  isMuted,
  onToggleMute
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl p-6 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-400/50 rounded-xl text-amber-400">
              <Settings className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-300">إعدادات المسابقة</h3>
              <p className="text-xs text-slate-400">تخصيص تجربة اللعب والتجربة الصوتية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Options */}
        <div className="space-y-5">
          
          {/* Player Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              اسم المتسابق:
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="أدخل اسمك هنا..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Currency Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              عملة المسابقة:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CURRENCIES.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => setCurrencyCode(curr.code)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    currencyCode === curr.code
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-extrabold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {curr.name} ({curr.symbol})
                </button>
              ))}
            </div>
          </div>

          {/* Timer Duration */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              توقيت إجابة السؤال:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '30 ثانية', val: 30 },
                { label: '45 ثانية', val: 45 },
                { label: '60 ثانية', val: 60 },
                { label: 'بدون وقت', val: 0 }
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setTimerDuration(item.val)}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all ${
                    timerDuration === item.val
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-extrabold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              تخصص الأسئلة المستهدفة:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400 transition-colors"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Audio Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
              <span className="text-xs font-bold text-slate-200">المؤثرات الصوتية والموسيقى</span>
            </div>
            <button
              onClick={onToggleMute}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isMuted ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {isMuted ? 'معطل' : 'مفعل'}
            </button>
          </div>

        </div>

        {/* Save Button */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            حفظ التغييرات ومتابعة
          </button>
        </div>

      </div>
    </div>
  );
};
