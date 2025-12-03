"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ReportButton from "./ReportButton";   // 引用你原本的組件
import BookmarkButton from "./BookmarkButton"; // 引用你原本的組件

// 強力清潔工具：移除前後引號、移除空白 (避免資料庫髒資料導致誤判)
const cleanText = (text: string) => {
  if (!text) return "";
  return text.trim().replace(/^["']|["']$/g, "");
};

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
  const [isReviewMode, setIsReviewMode] = useState(false); // 新增：檢討模式狀態

  const currentQ = questions[currentIndex];
  
  // 安全解析選項 (處理有些選項存成 JSON 字串，有些是陣列的情況)
  let safeOptions: string[] = [];
  try {
    if (currentQ) {
      safeOptions = Array.isArray(currentQ.options) ? currentQ.options : JSON.parse(currentQ.options);
    }
  } catch (e) { 
    try {
        const cleaned = currentQ.options.replace(/^["']|["']$/g, "").replace(/\\"/g, '"');
        safeOptions = JSON.parse(cleaned);
    } catch (e2) {
        safeOptions = [];
    }
  }

  // 1. 倒數計時邏輯
  useEffect(() => {
    if (isSubmitted) return;
    if (timeLeft <= 0) {
      handleSubmit(); // 時間到自動交卷
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  // 格式化時間 mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 2. 選擇答案
  const handleSelect = (option: string) => {
    if (isSubmitted) return; // 交卷後不能改
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: option }));
  };

  // 3. 交卷處理
  const handleSubmit = async () => {
    setIsSubmitted(true);
    let correctCount = 0;
    const mistakes: any[] = [];

    // 計算分數
    questions.forEach((q) => {
      const userAnswer = userAnswers[q.id];
      // 比對時忽略引號差異
      if (userAnswer && cleanText(userAnswer) === cleanText(q.answer)) {
        correctCount++;
      } else {
        mistakes.push(q.id);
      }
    });

    const finalScore = (correctCount / questions.length) * 100;
    setScore(finalScore);

    // 寫入 Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // A. 寫入考試紀錄
      await supabase.from('exam_records').insert({
        user_id: user.id,
        score: Math.round(finalScore),
        total_questions: questions.length,
        mistake_ids: mistakes,
        duration_seconds: (timeLimit * 60) - timeLeft
      });

      // B. 寫入錯題本 (如果有錯題)
      if (mistakes.length > 0) {
        const inserts = mistakes.map(qid => ({ user_id: user.id, question_id: qid }));
        // 使用 upsert 或 insert (視你的 unique constraint 而定，這裡用簡單 insert)
        await supabase.from('wrong_answers').insert(inserts);
      }
    }
  };

  // --- 畫面 A: 考試成績單 (交卷後顯示) ---
  if (isSubmitted && !isReviewMode) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-2xl shadow-xl border border-slate-200 text-center animate-in zoom-in-95 mt-10">
        <div className="text-4xl mb-4">🏆</div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">考試結束！</h2>
        <p className="text-slate-500">您的模擬考成績如下</p>
        
        <div className="my-8 p-8 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="text-7xl font-extrabold text-blue-600 tracking-tight">
            {score.toFixed(0)}
            <span className="text-2xl text-slate-400 ml-2 font-normal">分</span>
          </div>
        </div>

        <div className="flex justify-center gap-8 text-sm text-slate-600 mb-8">
          <div><span className="block font-bold text-lg">{questions.length}</span>總題數</div>
          <div><span className="block font-bold text-lg text-green-600">{Math.round((score / 100) * questions.length)}</span>答對</div>
          <div><span className="block font-bold text-lg text-red-500">{questions.length - Math.round((score / 100) * questions.length)}</span>答錯</div>
        </div>

        <p className="text-xs text-slate-400 mb-8 bg-yellow-50 text-yellow-700 py-2 px-4 rounded-full inline-block">
          💡 答錯的題目已自動加入您的「錯題本」
        </p>
        
        <div className="flex gap-4">
            <button 
                onClick={onExit} 
                className="flex-1 bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors"
            >
                回到大廳
            </button>
            <button 
                onClick={() => { setIsReviewMode(true); setCurrentIndex(0); }} 
                className="flex-1 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-transform hover:scale-[1.02] shadow-lg"
            >
                檢討考卷 📝
            </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return <div className="text-center p-10">題目載入中...</div>;

  // --- 畫面 B: 考試進行中 / 檢討模式 ---
  return (
    <div className="max-w-4xl mx-auto">
      {/* 頂部資訊列：顯示倒數或檢討狀態 */}
      <div className={`flex justify-between items-center mb-6 text-white p-4 rounded-xl shadow-md relative z-20 transition-colors ${isReviewMode ? 'bg-purple-900' : 'bg-slate-800'}`}>
        <div className="font-mono text-xl font-bold flex items-center gap-2">
          {isReviewMode ? (
             <span className="text-purple-200">🔍 檢討模式</span>
          ) : (
             <><span className="text-amber-400">⏳</span> {formatTime(timeLeft)}</>
          )}
        </div>
        <div className="text-sm font-medium">
          題號：<span className="text-xl font-bold text-white mx-1">{currentIndex + 1}</span> 
          <span className="text-slate-400">/ {questions.length}</span>
        </div>
        
        {isReviewMode ? (
            <button onClick={onExit} className="bg-white/20 hover:bg-white/30 text-white text-xs px-4 py-2 rounded-lg font-bold">
                離開
            </button>
        ) : (
            <button 
                onClick={() => { if(confirm('確定要提早交卷嗎？無法再修改答案喔！')) handleSubmit(); }}
                className="bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-2 rounded-lg font-bold transition-colors"
            >
                交卷
            </button>
        )}
      </div>

      <div className="bg-white p-6 md:p-10 rounded-2xl border border-slate-200 shadow-sm min-h-[500px] flex flex-col relative">
        
        {/* 收藏按鈕 (右上角) */}
        <div className="absolute top-6 right-6 z-10">
            <BookmarkButton questionId={currentQ.id} />
        </div>

        <div className="flex-1">
          {/* 題目內容 */}
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-relaxed pr-12 whitespace-pre-wrap">
            {currentQ.content}
          </h3>

          {/* 選項列表 */}
          <div className="space-y-3">
            {safeOptions.length > 0 ? safeOptions.map((opt, idx) => {
              // 狀態判斷
              const isSelected = userAnswers[currentQ.id] === opt;
              const isCorrectOpt = cleanText(opt) === cleanText(currentQ.answer);
              
              let containerClass = "border-slate-100 text-slate-600 hover:bg-slate-50"; 
              let badgeClass = "bg-slate-100 text-slate-400"; 

              if (!isReviewMode) {
                  // === 考試中 ===
                  if (isSelected) {
                      containerClass = "bg-blue-50 border-blue-500 text-blue-800 ring-1 ring-blue-500";
                      badgeClass = "bg-blue-600 text-white";
                  }
              } else {
                  // === 檢討模式 ===
                  if (isCorrectOpt) {
                      // 正確答案顯示綠色
                      containerClass = "bg-green-50 border-green-500 text-green-900 ring-1 ring-green-500 font-bold";
                      badgeClass = "bg-green-600 text-white";
                  } else if (isSelected && !isCorrectOpt) {
                      // 選錯的顯示紅色
                      containerClass = "bg-red-50 border-red-500 text-red-900 opacity-60";
                      badgeClass = "bg-red-500 text-white";
                  } else {
                      // 其他無關選項變淡
                      containerClass = "opacity-40 grayscale";
                  }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(opt)}
                  disabled={isReviewMode} // 檢討模式下禁止修改
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center group ${containerClass}`}
                >
                  <span className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-sm mr-4 font-bold transition-colors ${badgeClass}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-lg">{cleanText(opt)}</span>
                  
                  {/* 檢討模式下的文字提示 */}
                  {isReviewMode && isCorrectOpt && <span className="ml-auto text-green-600 font-bold text-sm">✓ 正解</span>}
                  {isReviewMode && isSelected && !isCorrectOpt && <span className="ml-auto text-red-500 font-bold text-sm">✕ 你的選擇</span>}
                </button>
              );
            }) : (
              <div className="text-center text-red-400 p-4 border border-red-100 rounded-lg bg-red-50">
                ⚠️ 選項格式異常 (ID: {currentQ.id})
              </div>
            )}
          </div>

          {/* 解析區塊 (只在檢討模式顯示) */}
          {isReviewMode && (
              <div className="mt-8 p-6 bg-slate-50 rounded-xl border-l-4 border-slate-400 animate-in fade-in slide-in-from-top-2">
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <span>💡</span> 解析 / 詳解
                  </h4>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {currentQ.explanation || "本題暫無解析說明。"}
                  </p>
              </div>
          )}
        </div>

        {/* 底部導覽區 */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            {/* 上一題 */}
            <button 
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} 
              disabled={currentIndex === 0} 
              className="px-4 md:px-6 py-3 text-slate-500 hover:text-slate-800 font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 hover:bg-slate-50 rounded-lg transition-colors"
            >
              ← 上一題
            </button>
            
            {/* 進度條 */}
            <div className="hidden md:block w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${isReviewMode ? 'bg-purple-600' : 'bg-slate-800'}`} 
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>

            {/* 下一題 */}
            <button 
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))} 
              disabled={currentIndex === questions.length - 1} 
              className="px-4 md:px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-transform active:scale-95"
            >
              下一題 →
            </button>
          </div>

          {/* 回報按鈕 (靠右) */}
          <div className="flex justify-end pt-2">
            <ReportButton questionId={currentQ.id} />
          </div>
        </div>
      </div>
    </div>
  );
}