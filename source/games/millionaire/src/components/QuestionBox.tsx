import React, { useState, useEffect } from 'react';
import { Question } from '../data/questions';
import { Volume2, VolumeX, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { speechEngine } from '../utils/speech';

interface QuestionBoxProps {
  question: Question;
  levelIndex: number;
  eliminatedIndices: number[]; // 50:50 eliminated indices
  isDoubleDipActive: boolean;
  doubleDipUsedCount: number;
  timer: number;
  maxTimer: number;
  isTimerEnabled: boolean;
  onSelectOption: (optionIndex: number) => void;
  selectedOption: number | null;
  confirmedOption: number | null;
  isAnswerChecked: boolean;
}

export const QuestionBox: React.FC<QuestionBoxProps> = ({
  question,
  levelIndex,
  eliminatedIndices,
  isDoubleDipActive,
  doubleDipUsedCount,
  timer,
  maxTimer,
  isTimerEnabled,
  onSelectOption,
  selectedOption,
  confirmedOption,
  isAnswerChecked
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const prefixes = ['أ', 'ب', 'ج', 'د'];

  const handleSpeak = () => {
    if (isSpeaking) {
      speechEngine.cancel();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const fullText = `${question.question}. الخيارات هي: أ، ${question.options[0]}. ب، ${question.options[1]}. ج، ${question.options[2]}. د، ${question.options[3]}.`;
      speechEngine.speak(fullText, () => setIsSpeaking(false));
    }
  };

  useEffect(() => {
    // Stop speech synthesis when question changes
    speechEngine.cancel();
    setIsSpeaking(false);
  }, [question.id]);

  const progressPct = maxTimer > 0 ? (timer / maxTimer) * 100 : 100;

  return (
    <div className="w-full flex flex-col items-center justify-between space-y-6">
      
      {/* Timer Bar & Level Info */}
      <div className="w-full flex items-center justify-between bg-slate-900/80 border border-amber-500/30 rounded-xl px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 font-black text-sm">
            {levelIndex + 1}
          </span>
          <div>
            <span className="text-xs text-slate-400 block">تصنيف السؤال</span>
            <span className="text-xs font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
              {question.category}
            </span>
          </div>
        </div>

        {/* Speak Question Button */}
        <button
          onClick={handleSpeak}
          className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold ${
            isSpeaking
              ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-400 hover:text-amber-300'
          }`}
          title="قراءة السؤال بصوت المذيع"
        >
          {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{isSpeaking ? 'إيقاف الصوت' : 'قراءة بصوت المذيع'}</span>
        </button>

        {/* Countdown Timer */}
        {isTimerEnabled && maxTimer > 0 && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">الوقت المتبقي</span>
              <span className={`text-sm font-mono font-black ${timer <= 5 ? 'text-rose-400 animate-ping' : 'text-amber-300'}`}>
                {timer} ثانية
              </span>
            </div>
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  className="stroke-slate-800"
                  strokeWidth="3"
                  fill="transparent"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  className={`transition-all duration-1000 ${timer <= 5 ? 'stroke-rose-500' : 'stroke-amber-400'}`}
                  strokeWidth="3"
                  strokeDasharray={100}
                  strokeDashoffset={100 - progressPct}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Double Dip Active Banner */}
      {isDoubleDipActive && (
        <div className="w-full py-2 px-4 bg-purple-950/80 border border-purple-500/60 rounded-xl text-purple-200 text-xs font-bold flex items-center justify-center gap-2 animate-pulse shadow-md">
          <ShieldAlert className="w-4 h-4 text-purple-400" />
          <span>وسيلة المحاولتان مفعّلة! المحاولة الحالية: {doubleDipUsedCount + 1} من 2</span>
        </div>
      )}

      {/* Main Question Display Box */}
      <div className="relative w-full min-h-[140px] flex items-center justify-center bg-gradient-to-r from-slate-950 via-indigo-950/90 to-slate-950 border-2 border-amber-500/60 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(245,158,11,0.15)] group">
        
        {/* Decorative Side Pins */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-400 rotate-45 border-2 border-slate-950 shadow"></div>
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-400 rotate-45 border-2 border-slate-950 shadow"></div>

        <h2 className="text-xl md:text-2xl font-black text-slate-100 leading-relaxed max-w-3xl drop-shadow">
          {question.question}
        </h2>
      </div>

      {/* 4 Options Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, idx) => {
          const isEliminated = eliminatedIndices.includes(idx);
          const isSelected = selectedOption === idx;
          const isConfirmed = confirmedOption === idx;
          const isThisCorrect = isAnswerChecked && question.correct === idx;
          const isThisWrongConfirmed = isAnswerChecked && isConfirmed && question.correct !== idx;

          let btnStyle = 'bg-slate-900/90 border-amber-500/30 text-slate-200 hover:border-amber-400 hover:bg-slate-850 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]';

          if (isEliminated) {
            btnStyle = 'bg-slate-950/40 border-slate-850 text-slate-600 cursor-not-allowed opacity-30';
          } else if (isThisCorrect) {
            btnStyle = 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 border-emerald-300 text-white shadow-[0_0_25px_rgba(16,185,129,0.7)] animate-pulse font-extrabold';
          } else if (isThisWrongConfirmed) {
            btnStyle = 'bg-gradient-to-r from-rose-600 via-rose-700 to-rose-600 border-rose-400 text-white shadow-[0_0_25px_rgba(244,63,94,0.7)] font-extrabold';
          } else if (isConfirmed) {
            btnStyle = 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 border-amber-200 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse font-extrabold';
          } else if (isSelected) {
            btnStyle = 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] font-bold';
          }

          return (
            <button
              key={idx}
              disabled={isEliminated || isAnswerChecked}
              onClick={() => {
                if (!isEliminated && !isAnswerChecked) {
                  soundFx.playClick();
                  onSelectOption(idx);
                }
              }}
              className={`relative min-h-[64px] flex items-center justify-between px-5 py-3 rounded-xl border-2 transition-all duration-200 group text-right ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm transition-all ${
                  isThisCorrect
                    ? 'bg-white text-emerald-700 shadow'
                    : isThisWrongConfirmed
                    ? 'bg-white text-rose-700 shadow'
                    : isConfirmed
                    ? 'bg-slate-950 text-amber-400 shadow'
                    : isSelected
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 group-hover:bg-amber-500 group-hover:text-slate-950'
                }`}>
                  {prefixes[idx]}
                </span>
                <span className="font-bold text-base md:text-lg">
                  {isEliminated ? '— — —' : option}
                </span>
              </div>

              {isThisCorrect && <Sparkles className="w-5 h-5 text-white animate-spin" />}
              {isThisWrongConfirmed && <AlertCircle className="w-5 h-5 text-white" />}
            </button>
          );
        })}
      </div>

    </div>
  );
};
