import React from 'react';
import { DollarSign, ShieldCheck } from 'lucide-react';

interface BankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPrize: number;
  currencySymbol: string;
}

export const BankModal: React.FC<BankModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentPrize,
  currencySymbol
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl p-6 text-slate-100 text-center">
        
        <div className="w-16 h-16 bg-amber-500/20 border-2 border-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-400">
          <DollarSign className="w-8 h-8 animate-bounce" />
        </div>

        <h3 className="text-2xl font-black text-amber-300 mb-2">قرار الانسحاب بالرصيد</h3>
        
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          هل أنت متاكد من الانسحاب والاحتفاظ برصيدك الحالي قبل المغامرة بالسؤال القادم؟
        </p>

        <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-4 mb-6 shadow-inner">
          <span className="text-xs text-slate-400 block mb-1">الجائزة المؤكدة التي ستأخذها معك:</span>
          <span className="text-3xl font-black text-amber-400 tracking-wider">
            {currentPrize.toLocaleString()} {currencySymbol}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all border border-slate-700"
          >
            متابعة اللعب
          </button>
          
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            تأكيد الانسحاب
          </button>
        </div>

      </div>
    </div>
  );
};
