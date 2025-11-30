"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type QuestionProps = {
  question: {
    id: number;
    type?: string; // 支援 'choice' 或 'essay'
    content: string;
    options: any; // 選項通常是 JSON 陣列
    answer: string;
    explanation: string;
  };
};

export default function QuestionCard({ question }: QuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 處理選擇題的點擊
  const handleSelect = (option: string) => {
    if (showResult) return;
    setSelectedOption(option);
  };

  // 檢查答案 (通用邏輯)
  const checkAnswer = async () => {
    setShowResult(true);

    // 只有「選擇題」且「答錯」時，才自動加入錯題本
    // 申論題屬於自我檢測，不自動計入錯題
    if (question.type !== 'essay' && selectedOption && selectedOption !== question.answer) {
      await saveMistake();
    }
  };

  // 儲存錯題到資料庫
  const saveMistake = async () => {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // 避免重複加入 (雖然後端 RLS 沒擋，但前端可以優化體驗)
      // 這裡直接 Insert，Supabase 也不會報錯
      await supabase.from('wrong_answers').insert({
        user_id: user.id,
        question_id: question.id,
      });
    }
    setIsSaving(false);
  };

  // ==========================================
  // 模式 A: 申論題 / 問答題 (Essay Mode)
  // ==========================================
  if (question.type === 'essay') {
    return (
      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-lg border border-purple-200 my-4 relative animate-in fade-in slide-in-from-bottom-4">
        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded mb-3 inline-block font-bold">
          📝 申論/問答題
        </span>
        
        <h3 className="text-xl font-bold text-slate-800 mb-6 leading-relaxed whitespace-pre-wrap">
          {question.content}
        </h3>
        
        {!showResult ? (
          <button 
            onClick={checkAnswer} 
            className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-md"
          >
            查看參考解析
          </button>
        ) : (
          <div className="mt-4 p-6 bg-purple-50 rounded-xl border border-purple-100 animate-in fade-in duration-500">
            <p className="font-bold text-purple-900 mb-3 text-lg">💡 參考解析 / 評分重點</p>
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {question.explanation}
            </div>
            
            {/* 申論題也可以手動加入錯題本 (可選功能) */}
            <button 
              onClick={() => { if(!isSaving) saveMistake(); }}
              className="mt-4 text-xs text-slate-400 hover:text-red-500 underline"
            >
              {isSaving ? "儲存中..." : "覺得這題很難？加入錯題本複習"}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 模式 B: 選擇題 (Choice Mode - 預設)
  // ==========================================
  return (
    <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-lg border border-slate-200 my-4 relative animate-in fade-in slide-in-from-bottom-4">
      
      {/* 錯題提示標籤 */}
      {showResult && selectedOption !== question.answer && (
        <div className="absolute top-4 right-4 text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100 flex items-center">
          {isSaving ? (
            <span className="animate-pulse">💾 記錄中...</span>
          ) : (
            <span>📒 已加入錯題本</span>
          )}
        </div>
      )}

      <h3 className="text-xl font-bold text-slate-800 mb-6 leading-relaxed">
        {question.content}
      </h3>

      <div className="space-y-3">
        {/* 安全檢查：確保 options 存在且是陣列 */}
        {Array.isArray(question.options) && question.options.map((opt: string, index: number) => {
          let btnClass = "w-full text-left p-4 rounded-lg border transition-all relative overflow-hidden ";
          
          if (showResult) {
            // 公布答案後
            if (opt === question.answer) {
              btnClass += "bg-green-100 border-green-500 text-green-900 font-bold ring-1 ring-green-500";
            } else if (opt === selectedOption) {
              btnClass += "bg-red-100 border-red-500 text-red-900";
            } else {
              btnClass += "bg-slate-50 border-slate-200 opacity-50";
            }
          } else {
            // 作答中
            if (selectedOption === opt) {
              btnClass += "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500 shadow-sm";
            } else {
              btnClass += "hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300";
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(opt)}
              className={btnClass}
              disabled={showResult}
            >
              <div className="flex items-center relative z-10">
                <span className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full border text-sm mr-3 font-medium transition-colors
                  ${showResult && opt === question.answer ? 'border-green-600 bg-green-200 text-green-800' : 'border-current'}
                `}>
                  {String.fromCharCode(65 + index)}
                </span>
                {opt}
              </div>
            </button>
          );
        })}
      </div>

      {/* 按鈕區 */}
      {!showResult ? (
        <button
          onClick={checkAnswer}
          disabled={!selectedOption}
          className="mt-8 w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
        >
          送出答案
        </button>
      ) : (
        // 結果與詳解
        <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className={`p-5 rounded-lg border ${selectedOption === question.answer ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">
                {selectedOption === question.answer ? '🎉' : '❌'}
              </span>
              <p className={`font-bold text-lg ${selectedOption === question.answer ? 'text-green-800' : 'text-red-800'}`}>
                {selectedOption === question.answer ? '答對了！' : '答錯了，再接再厲！'}
              </p>
            </div>
            
            <div className="text-slate-700 leading-relaxed mt-3 pt-3 border-t border-black/5">
              <span className="font-bold block mb-1 text-slate-900">解析：</span>
              {question.explanation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}