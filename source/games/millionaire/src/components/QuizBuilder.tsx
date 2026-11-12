import React, { useState } from 'react';
import { X, Edit3, Plus, Download, Upload, Check, Trash2 } from 'lucide-react';
import { Question } from '../data/questions';

interface QuizBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  customQuestions: Question[];
  onSaveCustomQuestions: (questions: Question[]) => void;
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({
  isOpen,
  onClose,
  customQuestions,
  onSaveCustomQuestions
}) => {
  const [questions, setQuestions] = useState<Question[]>(customQuestions);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');

  // Form State for adding new question
  const [level, setLevel] = useState<number>(1);
  const [category, setCategory] = useState<string>('ثقافة عامة');
  const [qText, setQText] = useState<string>('');
  const [opt0, setOpt0] = useState<string>('');
  const [opt1, setOpt1] = useState<string>('');
  const [opt2, setOpt2] = useState<string>('');
  const [opt3, setOpt3] = useState<string>('');
  const [correctIdx, setCorrectIdx] = useState<0 | 1 | 2 | 3>(0);
  const [explanation, setExplanation] = useState<string>('');
  const [hostHint, setHostHint] = useState<string>('');

  if (!isOpen) return null;

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !opt0.trim() || !opt1.trim() || !opt2.trim() || !opt3.trim()) {
      alert('يرجى ملء جميع حقول السؤال والخيارات للأربعة!');
      return;
    }

    const newQ: Question = {
      id: `custom_${Date.now()}`,
      level,
      category,
      question: qText.trim(),
      options: [opt0.trim(), opt1.trim(), opt2.trim(), opt3.trim()],
      correct: correctIdx,
      explanation: explanation.trim() || 'إجابة مخصصة من صانع الأسئلة.',
      hostHint: hostHint.trim() || 'فكر بتركيز قبل الإجابة.'
    };

    const updated = [...questions, newQ];
    setQuestions(updated);
    onSaveCustomQuestions(updated);

    // Reset Form
    setQText('');
    setOpt0('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setExplanation('');
    setHostHint('');
    setActiveTab('list');
  };

  const handleDelete = (id: string) => {
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated);
    onSaveCustomQuestions(updated);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `millionaire_quiz_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            setQuestions(parsed);
            onSaveCustomQuestions(parsed);
            alert('تم استيراد حزمة الأسئلة بنجاح!');
          }
        } catch (err) {
          alert('ملف JSON غير صالح.');
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-400/50 rounded-xl text-amber-400">
              <Edit3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-300">صانع الأسئلة والمسابقات المخصصة</h3>
              <p className="text-xs text-slate-400">أنشئ أسئلتك الخاصة أو قم باستيراد حزمة مسابقات جديدة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Switcher & Export/Import Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'list' ? 'bg-amber-500 text-slate-950 font-extrabold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              قائمة الأسئلة ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'add' ? 'bg-amber-500 text-slate-950 font-extrabold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plus className="w-4 h-4" /> إضافة سؤال جديد
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> تصدير JSON
            </button>
            <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5" /> استيراد JSON
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'list' ? (
            <div className="space-y-3">
              {questions.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm bg-slate-950 rounded-xl border border-slate-850">
                  لا توجد أسئلة مخصصة بعد. انقر على "إضافة سؤال جديد" للبدء!
                </div>
              ) : (
                questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 hover:border-amber-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-xs font-bold">
                          المستوى {q.level}
                        </span>
                        <span className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {q.category}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded transition-colors"
                        title="حذف السؤال"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="font-bold text-slate-100 text-sm">{idx + 1}. {q.question}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded border ${
                            oIdx === q.correct
                              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          {['أ', 'ب', 'ج', 'د'][oIdx]}: {opt} {oIdx === q.correct && '✓ (صحيحة)'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={handleAddQuestion} className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">مستوى الصعوبة (1-15):</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    {Array.from({ length: 15 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>المستوى {i + 1}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">المجال / التصنيف:</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    placeholder="مثل: ثقافة عامة، تاريخ، علوم"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">نص السؤال:</label>
                <textarea
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white"
                  placeholder="اكتب نص السؤال هنا..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">الخيار (أ):</label>
                  <input
                    type="text"
                    value={opt0}
                    onChange={(e) => setOpt0(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">الخيار (ب):</label>
                  <input
                    type="text"
                    value={opt1}
                    onChange={(e) => setOpt1(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">الخيار (ج):</label>
                  <input
                    type="text"
                    value={opt2}
                    onChange={(e) => setOpt2(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">الخيار (د):</label>
                  <input
                    type="text"
                    value={opt3}
                    onChange={(e) => setOpt3(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-emerald-400 block mb-1">الخيار الصحيح:</label>
                <div className="grid grid-cols-4 gap-2">
                  {['أ', 'ب', 'ج', 'د'].map((label, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setCorrectIdx(idx as 0 | 1 | 2 | 3)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        correctIdx === idx
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      الخيار ({label})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">تلميح المذيع (اختياري):</label>
                <input
                  type="text"
                  value={hostHint}
                  onChange={(e) => setHostHint(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  placeholder="تلميح يساعد المتسابق..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" /> حفظ السؤال في الحزمة
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-slate-200 font-bold text-sm rounded-xl hover:bg-slate-700 transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
