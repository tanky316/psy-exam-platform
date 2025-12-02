"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function MockExamBoard({ 
  questions, 
  timeLimit, 
  onExit 
}: { 
  questions: any[], 
  timeLimit: number,
  onExit: () => void 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const currentQ = questions[currentIndex];
  
  // 安全解析選項
  let safeOptions: string[] = [];
  try {
    safeOptions = Array.isArray(currentQ.options) ? currentQ.options : JSON.parse(currentQ.options);
  } catch (e) { safeOptions = [] }

  // 倒數計時器
  useEffect(() => {
    if (isSubmitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelect = (option: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: option }));
  };

  const handleSubmit = async () => {
    let correctCount = 0;
    const mistakes: any[] = [];

    questions.forEach((q) => {
      if (userAnswers[q.id] === q.answer) {
        correctCount++;
      } else if (userAnswers[q.id]) {
        mistakes.push(q.id);
      }
    });

    // [修改] 計算分數 (保留小數，不四捨五入)
    const finalScore = (correctCount / questions.length) * 100;
    setScore(finalScore);
    setIsSubmitted(true);

    // 存錯題
    const { data: { user } } = await supabase.auth.getUser();
    if (user && mistakes.length > 0) {
      const inserts = mistakes.map(qid => ({ user_id: user.id, question_id: qid }));
      await supabase.from('wrong_answers').insert(inserts);
    }
  };

  // --- 考試結果畫面 ---
  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-2xl shadow-xl border border-slate-200 text-center animate-in zoom-in-95 mt-10">
        <div className="text-4xl mb-4">🏆</div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">考試結束！</h2>
        <p className="text-slate-500">您的模擬考成績如下</p>
        
        <div className="my-8 p-8 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="text-7xl font-extrabold text-blue-600 tracking-tight">
            {/* [修改] 顯示小數點後 2 位 */}
            {score.toFixed(2)}
            <span className="text-2xl text-slate-400 ml-2 font-normal">分</span>
          </div>
        </div>

        <div className="flex justify-center gap-8 text-sm text-slate-600 mb-8">
          <div>
            <span className="block font-bold text-lg">{questions.length}</span>
            總題數
          </div>
          <div>
            <span className="block font-bold text-lg text-green-600">
              {Math.round((score / 100) * questions.length)}
            </span>
            答對題數
          </div>
          <div>
            <span className="block font-bold text-lg text-red-500">
              {questions.length - Math.round((score / 100) * questions.length)}
            </span>
            答錯題數
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-8 bg-yellow-50 text-yellow-700 py-2 px-4 rounded-full inline-block">
          💡 答錯的題目已自動加入您的「錯題本」
        </p>
        
        <div>
          <button 
            onClick={onExit} 
            className="w-full bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-transform hover:scale-[1.02] shadow-lg"
          >
            離開並查看解析
          </button>
        </div>
      </div>
    );
  }

  // --- 考試進行中畫面 ---
  return (
    <div className="max-w-4xl mx-auto">
      {/* 頂部資訊列 */}
      <div className="flex justify-between items-center mb-6 bg-slate-800 text-white p-4 rounded-xl shadow-md relative z-20">
        <div className="font-mono text-xl font-bold flex items-center gap-2">
          <span className="text-amber-400">⏳</span> {formatTime(timeLeft)}
        </div>
        <div className="text-sm font-medium">
          進度：<span className="text-xl font-bold text-white mx-1">{currentIndex + 1}</span> 
          <span className="text-slate-400">/ {questions.length}</span>
        </div>
        <button 
          onClick={() => { if(confirm('確定要提早交卷嗎？無法再修改答案喔！')) handleSubmit(); }}
          className="bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-2 rounded-lg font-bold transition-colors"
        >
          交卷
        </button>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-2xl border border-slate-200 shadow-sm min-h-[600px] flex flex-col relative">
        
        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
            {/* [修改] 移除這裡原本顯示的 #{currentQ.id} */}
            {currentQ.content}
          </h3>

          <div className="space-y-3">
            {safeOptions.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(opt)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center group ${
                  userAnswers[currentQ.id] === opt 
                    ? 'bg-blue-50 border-blue-500 text-blue-800' 
                    : 'hover:bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-200'
                }`}
              >
                <span className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-sm mr-4 font-bold transition-colors ${
                   userAnswers[currentQ.id] === opt 
                     ? 'bg-blue-600 text-white' 
                     : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-lg">{opt}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-6 py-3 text-slate-500 hover:text-slate-800 font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 hover:bg-slate-50 rounded-lg transition-colors"
          >
            ← 上一題
          </button>
          
          <div className="hidden md:block w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          <button
            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={currentIndex === questions.length - 1}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-transform active:scale-95"
          >
            下一題 →
          </button>
        </div>
      </div>
    </div>
  );
}