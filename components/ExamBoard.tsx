"use client";

import { useState } from "react";
import BookmarkButton from "./BookmarkButton";
import ReportButton from "./ReportButton";
import Link from "next/link";

// 清潔工具
const cleanText = (text: string) => {
  if (!text) return "";
  return text.trim().replace(/^["']|["']$/g, "");
};

export default function ExamBoard({ 
  questions, 
  timeLimit, // 雖然一般測驗模式不一定用得到，但保留介面彈性
  onExit 
}: { 
  questions: any[], 
  timeLimit?: number,
  onExit?: () => void 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showAnswer, setShowAnswer] = useState(false); // 一般測驗模式：是否顯示答案

  // --- 🔴 關鍵修復 1：全域安全檢查 ---
  // 如果傳入的 questions 是空的，直接顯示提示，不要繼續執行渲染
  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="text-4xl mb-4">📭</div>
        <h3 className="text-xl font-bold text-slate-700">目前沒有題目</h3>
        <p className="text-slate-500 mb-6">請嘗試調整篩選條件</p>
        {onExit && (
          <button 
            onClick={onExit}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            返回列表
          </button>
        )}
      </div>
    );
  }

  // 安全獲取當前題目
  const currentQ = questions[currentIndex];

  // --- 🔴 關鍵修復 2：索引安全檢查 ---
  // 萬一 currentIndex 超出範圍 (例如題目被過濾掉了)，重置或報錯
  if (!currentQ) {
    if (currentIndex > 0) {
      setCurrentIndex(0); // 嘗試回到第一題
      return <div>重置題目中...</div>;
    }
    return <div>載入題目發生錯誤 (Index Error)</div>;
  }

  // 處理選項解析
  let safeOptions: string[] = [];
  try {
    if (Array.isArray(currentQ.options)) {
      safeOptions = currentQ.options;
    } else if (typeof currentQ.options === 'string') {
      const cleaned = currentQ.options.replace(/^["']|["']$/g, "").replace(/\\"/g, '"');
      safeOptions = JSON.parse(cleaned);
    }
  } catch (e) {
    safeOptions = [];
  }

  const isEssay = currentQ.type === 'essay';

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* 進度條與控制列 */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="text-sm font-bold text-slate-600">
          題號 <span className="text-blue-600 text-lg">{currentIndex + 1}</span> / {questions.length}
        </div>
        
        {onExit && (
          <button 
            onClick={onExit} 
            className="text-slate-400 hover:text-slate-700 font-bold text-sm px-3 py-1 rounded hover:bg-slate-100 transition-colors"
          >
            ✕ 結束測驗
          </button>
        )}
      </div>

      <div className="bg-white p-6 md:p-10 rounded-2xl border border-slate-200 shadow-sm min-h-[500px] flex flex-col relative transition-all">
        
        {/* 收藏按鈕 (右上角) */}
        <div className="absolute top-6 right-6 z-10">
            <BookmarkButton questionId={currentQ.id} />
        </div>

        <div className="flex-1">
          {/* 題目標籤 */}
          <div className="flex flex-wrap gap-2 mb-4 pr-10">
             {isEssay ? (
               <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded border border-purple-200 font-bold">📝 申論</span>
             ) : (
               <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded border border-blue-100 font-bold">☑️ 選擇</span>
             )}
             <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded font-mono">{currentQ.year}</span>
             <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded font-mono">{currentQ.subject}</span>
          </div>

          {/* 題目內容 */}
          <h3 className="text-xl font-bold text-slate-800 mb-8 leading-relaxed whitespace-pre-wrap">
            {currentQ.content}
          </h3>

          {/* 選項區域 */}
          {!isEssay && (
            <div className="space-y-3">
              {safeOptions.map((opt, idx) => {
                const isSelected = userAnswers[currentQ.id] === opt;
                const isCorrect = cleanText(opt) === cleanText(currentQ.answer);
                
                // 樣式邏輯：只有在「顯示答案」且「選錯/選對」時才變色
                let containerClass = "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-blue-300";
                let badgeClass = "bg-slate-100 text-slate-400";

                if (showAnswer) {
                  if (isCorrect) {
                    containerClass = "bg-green-50 border-green-500 text-green-800 ring-1 ring-green-500 font-bold";
                    badgeClass = "bg-green-600 text-white";
                  } else if (isSelected && !isCorrect) {
                    containerClass = "bg-red-50 border-red-500 text-red-800";
                    badgeClass = "bg-red-500 text-white";
                  } else {
                    containerClass = "opacity-50 grayscale";
                  }
                } else if (isSelected) {
                   containerClass = "bg-blue-50 border-blue-500 text-blue-800 ring-1 ring-blue-500";
                   badgeClass = "bg-blue-600 text-white";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!showAnswer) {
                        setUserAnswers(prev => ({ ...prev, [currentQ.id]: opt }));
                      }
                    }}
                    disabled={showAnswer} // 顯示答案後鎖定
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center group ${containerClass}`}
                  >
                    <span className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-sm mr-4 font-bold transition-colors ${badgeClass}`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-lg">{cleanText(opt)}</span>
                    
                    {showAnswer && isCorrect && <span className="ml-auto text-green-600 font-bold text-sm">✓ 正解</span>}
                    {showAnswer && isSelected && !isCorrect && <span className="ml-auto text-red-500 font-bold text-sm">✕ 您的選擇</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* 申論題提示 */}
          {isEssay && (
             <div className="p-6 bg-purple-50 rounded-xl border border-purple-100 text-purple-800 mb-4">
               <p className="font-bold mb-2">💡 思考方向：</p>
               <p className="text-sm opacity-80">申論題建議先在腦中構思架構，或寫在紙上，再點擊下方按鈕查看參考解析。</p>
             </div>
          )}

          {/* 解析區塊 (按按鈕後顯示) */}
          {showAnswer && (
            <div className="mt-8 animate-in fade-in slide-in-from-top-2">
               <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-slate-400">
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <span>📝</span> 解析 / 詳解
                  </h4>
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {currentQ.explanation || "本題暫無解析說明。"}
                  </div>
                  {currentQ.concept_slug && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                       <Link href={`/dashboard/knowledge/${currentQ.concept_slug}`} target="_blank" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
                          📖 閱讀相關知識點 →
                       </Link>
                    </div>
                  )}
               </div>
            </div>
          )}

        </div>

        {/* 底部操作區 */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col gap-4">
          
          {/* 送出/查看解析按鈕 */}
          {!showAnswer ? (
             <button 
               onClick={() => setShowAnswer(true)}
               disabled={!isEssay && !userAnswers[currentQ.id]} // 選擇題沒選不能看
               className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
             >
               {isEssay ? '查看參考解析' : '送出答案'}
             </button>
          ) : (
             <div className="text-center text-sm text-slate-400 mb-2">
               已顯示解析，請前往下一題
             </div>
          )}

          <div className="flex justify-between items-center">
            <button 
              onClick={() => {
                setCurrentIndex(prev => Math.max(0, prev - 1));
                setShowAnswer(false); // 切換題目時重置解析狀態
              }} 
              disabled={currentIndex === 0} 
              className="px-6 py-3 text-slate-500 hover:text-slate-800 font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 hover:bg-slate-50 rounded-lg transition-colors"
            >
              ← 上一題
            </button>
            
            <button 
              onClick={() => {
                setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1));
                setShowAnswer(false);
              }} 
              disabled={currentIndex === questions.length - 1} 
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-transform active:scale-95"
            >
              下一題 →
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <ReportButton questionId={currentQ.id} />
          </div>
        </div>

      </div>
    </div>
  );
}