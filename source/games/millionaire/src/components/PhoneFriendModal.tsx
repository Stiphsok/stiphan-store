import React, { useState } from 'react';
import { PhoneCall, X, User, PhoneOff, CheckCircle2, MessageSquareText } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface PhoneFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
}

interface Friend {
  id: string;
  name: string;
  role: string;
  avatarBg: string;
}

const FRIENDS: Friend[] = [
  { id: '1', name: 'أ. أحمد التازي', role: 'مدرس تاريخ وأدب عربي', avatarBg: 'from-blue-600 to-indigo-800' },
  { id: '2', name: 'د. مريم بناني', role: 'باحثة في العلوم والفيزياء', avatarBg: 'from-emerald-600 to-teal-800' },
  { id: '3', name: 'أ. سعيد الإدريسي', role: 'موسوعة الجغرافيا والأرقام', avatarBg: 'from-amber-600 to-amber-800' },
  { id: '4', name: 'حمزة (صديق مقرب)', role: 'متابع للثقافة العامة والرياضة', avatarBg: 'from-purple-600 to-pink-800' }
];

export const PhoneFriendModal: React.FC<PhoneFriendModalProps> = ({
  isOpen,
  onClose,
  options,
  correctIndex
}) => {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [friendAdvice, setFriendAdvice] = useState<string>('');
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0);

  if (!isOpen) return null;

  const startCall = (friend: Friend) => {
    setSelectedFriend(friend);
    setCallState('calling');
    soundFx.playLifeline();

    setTimeout(() => {
      setCallState('connected');

      // Generate realistic advice with confidence
      const isCorrect = Math.random() < 0.82; // 82% chance friend knows right answer
      const suggestedIdx = isCorrect ? correctIndex : Math.floor(Math.random() * 4);
      const labels = ['أ', 'ب', 'ج', 'د'];

      const conf = isCorrect ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 30) + 50;
      setConfidenceLevel(conf);

      let text = `مرحباً! أظن بثقة أن الإجابة الصحيحة هي الخيار (${labels[suggestedIdx]}) - "${options[suggestedIdx]}". `;
      if (conf > 85) {
        text += `أنا متأكد بنسبة كبيرة جداً من هذه المعلومة! توكل على الله واسحب الجائزة!`;
      } else {
        text += `لست متأكداً 100%، لكن يغلب على ظني أن الخيار ${labels[suggestedIdx]} هو الصحيح.`;
      }

      setFriendAdvice(text);
    }, 2500);
  };

  const handleClose = () => {
    setCallState('idle');
    setSelectedFriend(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500/50 rounded-2xl shadow-2xl p-6 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-500/30 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 border border-emerald-400/50 rounded-xl text-emerald-400">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-emerald-300">الاتصال بصديق</h3>
              <p className="text-xs text-slate-400">اختر صديقك للمساعدة عبر الهاتف</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* State 1: Choose Friend */}
        {callState === 'idle' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              من بين أصدقائك، من تريد الاتصال به لمساعدتك في هذا السؤال؟
            </p>
            <div className="space-y-3">
              {FRIENDS.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => startCall(friend)}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-850 rounded-xl transition-all group text-right"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${friend.avatarBg} flex items-center justify-center font-bold text-white shadow-md border border-white/20`}>
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                        {friend.name}
                      </div>
                      <div className="text-xs text-slate-400">{friend.role}</div>
                    </div>
                  </div>
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* State 2: Calling Animation */}
        {callState === 'calling' && selectedFriend && (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 animate-ping absolute inset-0"></div>
              <div className={`relative w-24 h-24 rounded-full bg-gradient-to-tr ${selectedFriend.avatarBg} flex items-center justify-center shadow-xl border-2 border-emerald-400`}>
                <User className="w-12 h-12 text-white" />
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-100">{selectedFriend.name}</h4>
              <p className="text-emerald-400 text-sm mt-1 animate-pulse">جاري جرس الهاتف والتوصيل...</p>
            </div>

            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-rose-600/30 text-rose-300 border border-rose-500/50 rounded-full flex items-center gap-2 hover:bg-rose-600 hover:text-white transition-all text-sm font-semibold"
            >
              <PhoneOff className="w-4 h-4" />
              إنهاء المكالمة
            </button>
          </div>
        )}

        {/* State 3: Connected & Advice */}
        {callState === 'connected' && selectedFriend && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${selectedFriend.avatarBg} flex items-center justify-center font-bold text-white shadow`}>
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-emerald-300">{selectedFriend.name}</div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  مكالمة متصلة - درجة الثقة: {confidenceLevel}%
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <MessageSquareText className="w-4 h-4" />
                رد الصديق على السؤال:
              </div>
              <p className="text-slate-100 text-sm leading-relaxed font-medium bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                "{friendAdvice}"
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-lg hover:bg-emerald-400 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              شكر الصديق والعودة للمسابقة
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
