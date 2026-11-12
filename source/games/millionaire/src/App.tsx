import { useState, useEffect, useRef } from 'react';
import { QUESTIONS_DATABASE, MONEY_LADDER, CURRENCIES, Question } from './data/questions';
import { soundFx } from './utils/audio';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { QuestionBox } from './components/QuestionBox';
import { MoneyLadder } from './components/MoneyLadder';
import { LifelinesBar, LifelineState } from './components/LifelinesBar';
import { AudiencePollModal } from './components/AudiencePollModal';
import { PhoneFriendModal } from './components/PhoneFriendModal';
import { AskHostModal } from './components/AskHostModal';
import { BankModal } from './components/BankModal';
import { VictoryModal } from './components/VictoryModal';
import { SettingsModal } from './components/SettingsModal';
import { StatsModal, GameRecord } from './components/StatsModal';
import { QuizBuilder } from './components/QuizBuilder';
import { Trophy } from 'lucide-react';

export function App() {
  // Navigation & Screen State
  const [screen, setScreen] = useState<'home' | 'playing' | 'victory' | 'gameover'>('home');

  // User Settings
  const [playerName, setPlayerName] = useState<string>(() => localStorage.getItem('millionaire_player_name') || 'متسابق المليون');
  const [currencyCode, setCurrencyCode] = useState<string>(() => localStorage.getItem('millionaire_currency') || 'MAD');
  const [timerDuration, setTimerDuration] = useState<number>(30); // 30 seconds default
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Saved Data
  const [customQuestions, setCustomQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem('millionaire_custom_questions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [gameHistory, setGameHistory] = useState<GameRecord[]>(() => {
    try {
      const saved = localStorage.getItem('millionaire_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active Game State
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [timer, setTimer] = useState<number>(30);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [confirmedOption, setConfirmedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [_isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [eliminatedIndices, setEliminatedIndices] = useState<number[]>([]);
  const [isDoubleDipActive, setIsDoubleDipActive] = useState<boolean>(false);
  const [doubleDipUsedCount, setDoubleDipUsedCount] = useState<number>(0);
  const [isBanked, setIsBanked] = useState<boolean>(false);
  const [finalPrize, setFinalPrize] = useState<number>(0);

  // Lifelines
  const [lifelines, setLifelines] = useState<LifelineState>({
    fiftyFifty: false,
    audience: false,
    phone: false,
    host: false,
    switch: false,
    doubleDip: false
  });

  // Modals
  const [isAudienceOpen, setIsAudienceOpen] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isHostOpen, setIsHostOpen] = useState(false);
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isLadderDrawerOpen, setIsLadderDrawerOpen] = useState(false);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Save changes to localstorage
  useEffect(() => {
    localStorage.setItem('millionaire_player_name', playerName);
  }, [playerName]);

  useEffect(() => {
    localStorage.setItem('millionaire_currency', currencyCode);
  }, [currencyCode]);

  useEffect(() => {
    localStorage.setItem('millionaire_custom_questions', JSON.stringify(customQuestions));
  }, [customQuestions]);

  useEffect(() => {
    localStorage.setItem('millionaire_history', JSON.stringify(gameHistory));
  }, [gameHistory]);

  const activeCurrency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  // Helper to pick 15 questions
  const generateGameQuestions = () => {
    const allPool = [...QUESTIONS_DATABASE, ...customQuestions];
    const chosen: Question[] = [];

    for (let level = 1; level <= 15; level++) {
      let candidatePool = allPool.filter(q => q.level === level);

      if (selectedCategory !== 'all') {
        const catFiltered = candidatePool.filter(q => q.category === selectedCategory);
        if (catFiltered.length > 0) {
          candidatePool = catFiltered;
        }
      }

      if (candidatePool.length > 0) {
        const randomQ = candidatePool[Math.floor(Math.random() * candidatePool.length)];
        chosen.push(randomQ);
      } else {
        // Fallback to any pool question for that level
        const fallbackPool = QUESTIONS_DATABASE.filter(q => q.level === level);
        const randomQ = fallbackPool[Math.floor(Math.random() * fallbackPool.length)] || QUESTIONS_DATABASE[0];
        chosen.push(randomQ);
      }
    }

    return chosen;
  };

  // Start new Classic game
  const handleStartClassic = () => {
    const questions = generateGameQuestions();
    setGameQuestions(questions);
    setCurrentLevelIndex(0);
    resetQuestionState();
    setLifelines({
      fiftyFifty: false,
      audience: false,
      phone: false,
      host: false,
      switch: false,
      doubleDip: false
    });
    setIsBanked(false);
    setFinalPrize(0);
    setScreen('playing');
    soundFx.startAmbient();
  };

  // Start Speed Game
  const handleStartSpeed = () => {
    handleStartClassic();
    setTimerDuration(60); // 60s total timer
  };

  // Reset for next level
  const resetQuestionState = () => {
    setSelectedOption(null);
    setConfirmedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(null);
    setEliminatedIndices([]);
    setIsDoubleDipActive(false);
    setDoubleDipUsedCount(0);
    setTimer(timerDuration > 0 ? timerDuration : 30);
  };

  // Countdown Timer Effect
  useEffect(() => {
    if (screen === 'playing' && timerDuration > 0 && !isAnswerChecked && !isBankOpen && !isAudienceOpen && !isPhoneOpen && !isHostOpen) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            handleTimeOut();
            return 0;
          }
          if (prev <= 6) {
            soundFx.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen, currentLevelIndex, timerDuration, isAnswerChecked, isBankOpen, isAudienceOpen, isPhoneOpen, isHostOpen]);

  // Timeout Logic
  const handleTimeOut = () => {
    soundFx.playWrong();
    setIsAnswerChecked(true);
    setIsCorrect(false);

    setTimeout(() => {
      endGame(false, false);
    }, 2000);
  };

  // Handle Option Selection
  const handleSelectOption = (idx: number) => {
    if (isAnswerChecked || confirmedOption !== null) return;

    setSelectedOption(idx);
    setConfirmedOption(idx);
    soundFx.playLockIn();

    // Small suspense pause before checking
    setTimeout(() => {
      checkAnswer(idx);
    }, 1500);
  };

  // Check Answer Logic
  const checkAnswer = (chosenIdx: number) => {
    const currentQ = gameQuestions[currentLevelIndex];
    const correct = currentQ.correct === chosenIdx;

    if (correct) {
      soundFx.playCorrect();
      setIsAnswerChecked(true);
      setIsCorrect(true);

      setTimeout(() => {
        if (currentLevelIndex === 14) {
          // Reached Million!
          setFinalPrize(1000000);
          endGame(true, false);
        } else {
          // Advance to next level
          setCurrentLevelIndex(prev => prev + 1);
          resetQuestionState();
        }
      }, 2000);

    } else {
      // Wrong Answer
      if (isDoubleDipActive && doubleDipUsedCount < 1) {
        // Double Dip Lifeline saves first wrong guess!
        soundFx.playWrong();
        setDoubleDipUsedCount(1);
        setEliminatedIndices(prev => [...prev, chosenIdx]);
        setConfirmedOption(null);
        setSelectedOption(null);
      } else {
        soundFx.playWrong();
        setIsAnswerChecked(true);
        setIsCorrect(false);

        setTimeout(() => {
          endGame(false, false);
        }, 2500);
      }
    }
  };

  // End Game Helper
  const endGame = (isWin: boolean, banked: boolean) => {
    soundFx.stopAmbient();
    let earned = 0;

    if (banked) {
      earned = currentLevelIndex > 0 ? MONEY_LADDER[currentLevelIndex - 1] : 0;
    } else if (isWin) {
      earned = 1000000;
    } else {
      // Check safety points
      if (currentLevelIndex >= 9) {
        earned = MONEY_LADDER[9]; // 32,000 Safety
      } else if (currentLevelIndex >= 4) {
        earned = MONEY_LADDER[4]; // 1,000 Safety
      } else {
        earned = 0;
      }
    }

    setFinalPrize(earned);
    setIsBanked(banked);

    // Record game
    const record: GameRecord = {
      id: `game_${Date.now()}`,
      date: new Date().toLocaleDateString('ar-MA'),
      playerName,
      prize: earned,
      questionsAnswered: isWin ? 15 : banked ? currentLevelIndex : currentLevelIndex,
      isWin,
      isBanked: banked
    };

    setGameHistory(prev => [record, ...prev]);
    setScreen(isWin ? 'victory' : 'gameover');
  };

  // Bank Money Confirm
  const handleBankConfirm = () => {
    setIsBankOpen(false);
    endGame(false, true);
  };

  // LIFELINES LOGIC
  const handleUseFiftyFifty = () => {
    if (lifelines.fiftyFifty) return;
    const currentQ = gameQuestions[currentLevelIndex];
    const wrongIndices = [0, 1, 2, 3].filter(i => i !== currentQ.correct);
    
    // Pick 2 wrong indices at random to eliminate
    const shuffled = wrongIndices.sort(() => 0.5 - Math.random());
    const toEliminate = shuffled.slice(0, 2);

    setEliminatedIndices(toEliminate);
    setLifelines(prev => ({ ...prev, fiftyFifty: true }));
    soundFx.playLifeline();
  };

  const handleUseAudience = () => {
    if (lifelines.audience) return;
    setIsAudienceOpen(true);
    setLifelines(prev => ({ ...prev, audience: true }));
  };

  const handleUsePhone = () => {
    if (lifelines.phone) return;
    setIsPhoneOpen(true);
    setLifelines(prev => ({ ...prev, phone: true }));
  };

  const handleUseHost = () => {
    if (lifelines.host) return;
    setIsHostOpen(true);
    setLifelines(prev => ({ ...prev, host: true }));
  };

  const handleUseSwitch = () => {
    if (lifelines.switch) return;
    soundFx.playLifeline();

    // Replace current level question with another candidate from pool
    const currentLvl = currentLevelIndex + 1;
    const pool = QUESTIONS_DATABASE.filter(q => q.level === currentLvl && q.id !== gameQuestions[currentLevelIndex].id);
    const replacement = pool[Math.floor(Math.random() * pool.length)] || QUESTIONS_DATABASE[0];

    const newGameQs = [...gameQuestions];
    newGameQs[currentLevelIndex] = replacement;
    setGameQuestions(newGameQs);

    resetQuestionState();
    setLifelines(prev => ({ ...prev, switch: true }));
  };

  const handleUseDoubleDip = () => {
    if (lifelines.doubleDip) return;
    soundFx.playLifeline();
    setIsDoubleDipActive(true);
    setLifelines(prev => ({ ...prev, doubleDip: true }));
  };

  const currentQ = gameQuestions[currentLevelIndex];
  const currentPrize = currentLevelIndex > 0 ? MONEY_LADDER[currentLevelIndex - 1] : 0;
  const highScore = gameHistory.length > 0 ? Math.max(...gameHistory.map(g => g.prize)) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-cairo selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden">
      
      {/* Background Animated Hexagon Mesh Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-25">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-900/40 via-amber-500/10 to-blue-900/40 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Header Bar */}
      <Header
        playerName={playerName}
        currencySymbol={activeCurrency.symbol}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(soundFx.toggleMute())}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenBuilder={() => setIsBuilderOpen(true)}
        onBankMoney={() => setIsBankOpen(true)}
        currentPrize={currentPrize}
        isInGame={screen === 'playing'}
        onHomeClick={() => {
          soundFx.stopAmbient();
          setScreen('home');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col justify-center relative z-10">
        
        {screen === 'home' && (
          <HomeScreen
            playerName={playerName}
            setPlayerName={setPlayerName}
            onStartClassic={handleStartClassic}
            onStartSpeed={handleStartSpeed}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenStats={() => setIsStatsOpen(true)}
            onOpenBuilder={() => setIsBuilderOpen(true)}
            currencySymbol={activeCurrency.symbol}
            highScore={highScore}
          />
        )}

        {screen === 'playing' && currentQ && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start my-auto">
            
            {/* Left/Main Column: Question & Lifelines */}
            <div className="lg:col-span-8 flex flex-col space-y-6">
              
              {/* Lifelines Bar */}
              <LifelinesBar
                lifelines={lifelines}
                onUseFiftyFifty={handleUseFiftyFifty}
                onUseAudience={handleUseAudience}
                onUsePhone={handleUsePhone}
                onUseHost={handleUseHost}
                onUseSwitch={handleUseSwitch}
                onUseDoubleDip={handleUseDoubleDip}
                disabled={isAnswerChecked || confirmedOption !== null}
              />

              {/* Question & Options */}
              <QuestionBox
                question={currentQ}
                levelIndex={currentLevelIndex}
                eliminatedIndices={eliminatedIndices}
                isDoubleDipActive={isDoubleDipActive}
                doubleDipUsedCount={doubleDipUsedCount}
                timer={timer}
                maxTimer={timerDuration}
                isTimerEnabled={timerDuration > 0}
                onSelectOption={handleSelectOption}
                selectedOption={selectedOption}
                confirmedOption={confirmedOption}
                isAnswerChecked={isAnswerChecked}
              />

              {/* Host Commentary Banner during active question */}
              {isAnswerChecked && (
                <div className={`w-full p-4 rounded-xl border text-sm font-semibold text-center animate-fadeIn ${_isCorrect ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/80 border-rose-500/50 text-rose-200'}`}>
                  <p className="font-bold mb-1">
                    {_isCorrect ? '✨ إجابة صحيحة وممتازة! ننتقل للسؤال التالي...' : '❌ للأسف! إجابة غير صحيحة.'}
                  </p>
                  <p className="text-xs opacity-90">{currentQ.explanation}</p>
                </div>
              )}

            </div>

            {/* Right Column: Money Ladder Sidebar */}
            <div className="hidden lg:block lg:col-span-4 h-[580px]">
              <MoneyLadder
                currentLevelIndex={currentLevelIndex}
                currencySymbol={activeCurrency.symbol}
              />
            </div>

            {/* Mobile Drawer Toggle Button for Money Ladder */}
            <div className="lg:hidden fixed bottom-4 left-4 z-30">
              <button
                onClick={() => setIsLadderDrawerOpen(true)}
                className="p-3 bg-amber-500 text-slate-950 font-bold rounded-full shadow-2xl flex items-center gap-2 border-2 border-amber-300 animate-bounce"
              >
                <Trophy className="w-5 h-5" />
                <span className="text-xs font-black">سلم المبالغ</span>
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Footer Branding */}
      <footer className="w-full py-3 text-center text-xs text-slate-400 border-t border-slate-900 bg-slate-950/90 relative z-10">
        من سيربح المليون • مسابقة الثقافة العامة الذهبية التفاعلية © {new Date().getFullYear()}
      </footer>

      {/* MODALS */}

      {/* Audience Poll Modal */}
      {currentQ && (
        <AudiencePollModal
          isOpen={isAudienceOpen}
          onClose={() => setIsAudienceOpen(false)}
          correctIndex={currentQ.correct}
          eliminatedIndices={eliminatedIndices}
          level={currentLevelIndex + 1}
          options={currentQ.options}
        />
      )}

      {/* Phone a Friend Modal */}
      {currentQ && (
        <PhoneFriendModal
          isOpen={isPhoneOpen}
          onClose={() => setIsPhoneOpen(false)}
          question={currentQ.question}
          options={currentQ.options}
          correctIndex={currentQ.correct}
        />
      )}

      {/* Ask Host Modal */}
      {currentQ && (
        <AskHostModal
          isOpen={isHostOpen}
          onClose={() => setIsHostOpen(false)}
          hint={currentQ.hostHint}
          question={currentQ.question}
        />
      )}

      {/* Bank Winnings Modal */}
      <BankModal
        isOpen={isBankOpen}
        onClose={() => setIsBankOpen(false)}
        onConfirm={handleBankConfirm}
        currentPrize={currentPrize}
        currencySymbol={activeCurrency.symbol}
      />

      {/* Victory & Game Over Modal */}
      <VictoryModal
        isOpen={screen === 'victory' || screen === 'gameover'}
        isWin={screen === 'victory'}
        isBanked={isBanked}
        prize={finalPrize}
        currencySymbol={activeCurrency.symbol}
        playerName={playerName}
        questionsAnswered={currentLevelIndex}
        onRestart={handleStartClassic}
        onHome={() => {
          soundFx.stopAmbient();
          setScreen('home');
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        playerName={playerName}
        setPlayerName={setPlayerName}
        currencyCode={currencyCode}
        setCurrencyCode={setCurrencyCode}
        timerDuration={timerDuration}
        setTimerDuration={setTimerDuration}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(soundFx.toggleMute())}
      />

      {/* Stats Modal */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        gameHistory={gameHistory}
        onClearHistory={() => setGameHistory([])}
        currencySymbol={activeCurrency.symbol}
      />

      {/* Quiz Builder Modal */}
      <QuizBuilder
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        customQuestions={customQuestions}
        onSaveCustomQuestions={(qs) => setCustomQuestions(qs)}
      />

      {/* Mobile Money Ladder Drawer */}
      {isLadderDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-md p-4 animate-fadeIn lg:hidden">
          <div className="w-full max-w-sm h-full max-h-[85vh] bg-slate-900 rounded-2xl p-4 overflow-hidden border-2 border-amber-500/50 flex flex-col">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-500/30">
              <span className="font-bold text-amber-300 text-sm">سلم المبالغ والجوائز</span>
              <button
                onClick={() => setIsLadderDrawerOpen(false)}
                className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700"
              >
                إغلاق
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <MoneyLadder
                currentLevelIndex={currentLevelIndex}
                currencySymbol={activeCurrency.symbol}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
