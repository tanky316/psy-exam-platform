"use client"; // 這行魔法咒語告訴 Next.js 這是要在瀏覽器跑的互動元件

import { useState } from "react";

// 定義題目的格式 (TypeScript 會幫我們檢查)
type QuestionProps = {
  question: {
    id: number;
    content: string;
    options: any; // 暫時用 any，因為資料庫傳來的是 JSON
    answer: string;
    explanation: string;
  };
};

export default function QuestionCard({ question }: QuestionProps) {
  // 記錄使用者選了哪個選項
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  // 記錄是否已經交卷 (顯示詳解)
  const [showResult, setShowResult] = useState(false);

  // 處理點擊選項
  const handleSelect = (option: string) => {
    if (showResult) return; // 如果已經看過答案，就不讓改了
    setSelectedOption(option);
  };

  // 檢查答案
  const checkAnswer = () => {
    if (!selectedOption) return;
    setShowResult(true);
  };

  return (
    <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-lg border border-slate-200 my-4">
      {/* 題目 */}
      <h3 className="text-xl font-bold text-slate-800 mb-6 leading-relaxed">
        {question.content}
      </h3>

      {/* 選項列表 */}
      <div className="space-y-3">
        {question.options.map((opt: string, index: number) => {
          // 判斷按鈕顏色邏輯
          let btnClass = "w-full text-left p-4 rounded-lg border transition-all ";
          
          if (showResult) {
            // 公布答案後的狀態
            if (opt === question.answer) {
              btnClass += "bg-green-100 border-green-500 text-green-800 font-bold"; // 正確答案顯示綠色
            } else if (opt === selectedOption && opt !== question.answer) {
              btnClass += "bg-red-100 border-red-500 text-red-800"; // 選錯顯示紅色
            } else {
              btnClass += "bg-slate-50 border-slate-200 opacity-50"; // 其他選項變淡
            }
          } else {
            // 作答中的狀態
            if (selectedOption === opt) {
              btnClass += "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500"; // 選中狀態
            } else {
              btnClass += "hover:bg-slate-50 border-slate-200 text-slate-700"; // 一般狀態
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(opt)}
              className={btnClass}
              disabled={showResult}
            >
              <div className="flex items-center">
                <span className="w-6 h-6 flex items-center justify-center rounded-full border border-current text-xs mr-3">
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
          className="mt-6 w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          送出答案
        </button>
      ) : (
        // 詳解區 (答題後出現)
        <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className={`p-5 rounded-lg border ${selectedOption === question.answer ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className="font-bold text-lg mb-2">
              {selectedOption === question.answer ? '🎉 答對了！' : '❌ 答錯了，再接再厲！'}
            </p>
            <div className="text-slate-700 leading-relaxed">
              <span className="font-semibold block mb-1">解析：</span>
              {question.explanation}
            </div>
          </div>
          
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 w-full py-3 border border-slate-300 text-slate-600 rounded-lg font-bold hover:bg-slate-50"
          >
            再試一次 (重新整理)
          </button>
        </div>
      )}
    </div>
  );
}