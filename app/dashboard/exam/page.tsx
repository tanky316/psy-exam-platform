"use client"; // 因為有篩選互動，這頁必須是 Client Component

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ExamBoard from '@/components/ExamBoard';

export default function ExamPage() {
  // --- 狀態管理區 ---
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 篩選條件
  const [mode, setMode] = useState<'browse' | 'quiz'>('browse'); // 預設為閱覽模式
  const [yearFilter, setYearFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');

  // --- 抓資料邏輯 ---
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      let query = supabase.from('questions').select('*');

      // 如果有選年份，就加上過濾條件
      if (yearFilter !== 'ALL') {
        query = query.eq('year', yearFilter);
      }
      // 如果有選科目
      if (subjectFilter !== 'ALL') {
        query = query.eq('subject', subjectFilter);
      }

      const { data, error } = await query;
      
      if (data) setQuestions(data);
      setLoading(false);
    };

    fetchQuestions();
  }, [yearFilter, subjectFilter]); // 當篩選條件改變時，重新抓資料

  // --- 畫面渲染區 ---
  return (
    <div className="space-y-6">
      
      {/* 標題與控制列 */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">歷屆試題練習</h2>
          
          {/* 模式切換按鈕 */}
          <div className="flex bg-slate-100 p-1 rounded-lg mt-4 md:mt-0">
            <button
              onClick={() => setMode('browse')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                mode === 'browse' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              📖 閱覽模式
            </button>
            <button
              onClick={() => setMode('quiz')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                mode === 'quiz' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              📝 測驗模式
            </button>
          </div>
        </div>

        {/* 篩選下拉選單 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select 
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-slate-700 bg-white"
          >
            <option value="ALL">所有年份</option>
            <option value="113-1">113年 第1次</option>
            <option value="112-2">112年 第2次</option>
            <option value="112-1">112年 第1次</option>
          </select>

          <select 
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-slate-700 bg-white"
          >
            <option value="ALL">所有科目</option>
            <option value="諮商與心理治療理論">諮商與心理治療理論</option>
            <option value="發展心理學">發展心理學</option>
            <option value="變態心理學">變態心理學</option>
            <option value="家族治療">家族治療</option>
          </select>
          
          {/* 這裡先做個樣子，未來可以做更複雜的標籤搜尋 */}
          <div className="p-2 border border-slate-300 rounded-lg text-slate-400 bg-slate-50 cursor-not-allowed">
            🔍 標籤搜尋 (開發中)
          </div>
        </div>
      </div>

      {/* --- 結果顯示區 --- */}
      {loading ? (
        <div className="text-center py-10 text-slate-500">載入題庫中...</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          找不到符合條件的題目，請嘗試其他篩選條件。
        </div>
      ) : mode === 'quiz' ? (
        // === 測驗模式 ===
        // 直接使用我們之前寫好的 ExamBoard，它本身就有計分功能
        <div className="flex justify-center">
           <ExamBoard questions={questions} />
        </div>
      ) : (
        // === 閱覽模式 (List View) ===
        // 列出所有題目，直接顯示答案，方便快速複習
        <div className="grid gap-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-mono">
                  {q.year || '年份未標示'} | {q.subject || '未分類'}
                </span>
                <span className="text-slate-400 text-xs">#{q.id}</span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                {idx + 1}. {q.content}
              </h3>

              {/* 選項區 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 pl-4 border-l-2 border-slate-100">
                {(q.options as any).map((opt: string, i: number) => (
                  <div key={i} className={`text-sm ${opt === q.answer ? 'text-green-700 font-bold' : 'text-slate-600'}`}>
                    {String.fromCharCode(65 + i)}. {opt}
                  </div>
                ))}
              </div>

              {/* 答案與詳解 (閱覽模式直接顯示) */}
              <div className="bg-green-50 p-4 rounded-lg text-sm">
                <p className="font-bold text-green-800 mb-1">✅ 正確答案：{q.answer}</p>
                <p className="text-slate-700 leading-relaxed"><span className="font-semibold">解析：</span>{q.explanation}</p>
                
                {/* 標籤顯示 */}
                {q.tags && q.tags.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {q.tags.map((tag: string) => (
                      <span key={tag} className="text-xs bg-white text-green-600 border border-green-200 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}