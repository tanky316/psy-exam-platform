"use client";

import { useState } from "react";
import QuestionCard from "./QuestionCard";

export default function ExamBoard({ questions }: { questions: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 計算進度
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const currentQuestion = questions[currentIndex];

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert("恭喜！您已完成所有今日測驗！");
    }
  };

  return (
    <div className="w-full max-w-2xl">
      {/* 進度條 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-500 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% 完成</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div 
            className="bg-slate-900 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* 關鍵技巧：加上 key={currentQuestion.id} 
         這樣當題目切換時，React 會強制重新產生卡片，
         原本的「正確答案」顏色才會消失，變回全新的狀態。
      */}
      <QuestionCard 
        key={currentQuestion.id} 
        question={currentQuestion} 
      />

      {/* 切換按鈕區 */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2 text-slate-500 disabled:opacity-30 hover:text-slate-900"
        >
          ← 上一題
        </button>

        <button
          onClick={handleNext}
          className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          {currentIndex === questions.length - 1 ? '完成測驗' : '下一題 →'}
        </button>
      </div>
    </div>
  );
}