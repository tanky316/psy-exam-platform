"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ReportButton from "./ReportButton";
import BookmarkButton from "./BookmarkButton"; // [新增]

type QuestionProps = {
  question: {
    id: number;
    type?: string;
    content: string;
    options: any;
    answer: string;
    explanation: string;
  };
};

const cleanText = (text: string) => {
  if (!text) return "";
  return text.trim().replace(/^["']|["']$/g, "");
};

export default function QuestionCard({ question }: QuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [safeOptions, setSafeOptions] = useState<string[]>([]);

  useEffect(() => {
    let opts: string[] = [];
    if (Array.isArray(question.options)) {
      opts = question.options;
    } else if (typeof question.options === 'string') {
      try {
        opts = JSON.parse(question.options);
      } catch (e) {
        try {
          const cleaned = question.options.replace(/^["']|["']$/g, "").replace(/\\"/g, '"');
          opts = JSON.parse(cleaned);
        } catch (e2) {
          opts = [];
        }
      }
    }
    setSafeOptions(opts);
    setSelectedOption(null);
    setShowResult(false);
    setIsSaving(false);
  }, [question]);

  const handleSelect = (option: string) => {
    if (showResult) return;
    setSelectedOption(option);
  };

  const isCorrect = (opt: string) => {
    return cleanText(opt) === cleanText(question.answer);
  };

  const checkAnswer = async () => {
    setShowResult(true);
    const currentIsCorrect = selectedOption && isCorrect(selectedOption);
    
    if (question.type !== 'essay' && !currentIsCorrect) {
      await saveMistake();
    }
  };

  const saveMistake = async () => {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('wrong_answers').insert({
        user_id: user.id,
        question_id: question.id,
      });
    }
    setIsSaving(false);
  };

  // --- 申論題模式 ---
  if (question.type === 'essay') {
    return (
      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-lg border border-purple-200 my-4 relative animate-in fade-in slide-in-from-bottom-4">
        {/* [新增] 收藏按鈕 (絕對定位在右上角) */}
        <div className="absolute top-4 right-4 z-10">
          <BookmarkButton questionId={question.id} />
        </div>

        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded mb-3 inline-block font-bold">
          📝 申論/問答題
        </span>
        <h3 className="text-xl font-bold text-slate-800 mb-6 leading-relaxed whitespace-pre-wrap pr-8">
          {question.content}
        </h3>
        
        {!showResult ? (
          <button onClick={checkAnswer} className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-md">
            查看參考解析
          </button>
        ) : (
          <div className="mt-4 p-6 bg-purple-50 rounded-xl border border-purple-100 animate-in fade-in">
            <p className="font-bold text-purple-900 mb-3 text-lg">💡 參考解析 / 評分重點</p>
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {question.explanation?.replace(/\\n/g, '\n')}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <ReportButton questionId={question.id} />
        </div>
      </div>
    );
  }

  // --- 選擇題模式 ---
  return (
    <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-lg border border-slate-200 my-4 relative animate-in fade-in slide-in-from-bottom-4">
      
      {/* [新增] 收藏按鈕 + 錯題提示的排版 */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
        {showResult && selectedOption && !isCorrect(selectedOption) && (
          <div className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
            {isSaving ? "💾..." : "📒 已加入錯題"}
          </div>
        )}
        <BookmarkButton questionId={question.id} />
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-6 leading-relaxed pr-8">
        {question.content}
      </h3>

      <div className="space-y-3">
        {safeOptions.length > 0 ? (
          safeOptions.map((opt: string, index: number) => {
            let btnClass = "w-full text-left p-4 rounded-lg border transition-all relative overflow-hidden ";
            if (showResult) {
              if (isCorrect(opt)) {
                btnClass += "bg-green-100 border-green-500 text-green-900 font-bold ring-1 ring-green-500";
              } else if (selectedOption === opt) {
                btnClass += "bg-red-100 border-red-500 text-red-900";
              } else {
                btnClass += "bg-slate-50 border-slate-200 opacity-50";
              }
            } else {
              if (selectedOption === opt) {
                btnClass += "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500 shadow-sm";
              } else {
                btnClass += "hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300";
              }
            }

            return (
              <button key={index} onClick={() => handleSelect(opt)} className={btnClass} disabled={showResult}>
                <div className="flex items-center relative z-10">
                  <span className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full border text-sm mr-3 font-medium transition-colors ${showResult && isCorrect(opt) ? 'border-green-600 bg-green-200 text-green-800' : 'border-current'}`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  {cleanText(opt)}
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg">
            ⚠️ 選項載入異常
          </div>
        )}
      </div>

      {!showResult ? (
        <button onClick={checkAnswer} disabled={!selectedOption} className="mt-8 w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md">
          送出答案
        </button>
      ) : (
        <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className={`p-5 rounded-lg border ${selectedOption && isCorrect(selectedOption) ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className={`font-bold text-lg mb-2 ${selectedOption && isCorrect(selectedOption) ? 'text-green-800' : 'text-red-800'}`}>
              {selectedOption && isCorrect(selectedOption) ? '🎉 答對了！' : '❌ 答錯了，再接再厲！'}
            </p>
            <div className="text-slate-700 leading-relaxed pt-2 border-t border-black/5">
              <span className="font-bold text-slate-900">解析：</span>{question.explanation?.replace(/\\n/g, '\n')}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <ReportButton questionId={question.id} />
      </div>
    </div>
  );
}