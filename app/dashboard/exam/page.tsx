"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ExamBoard from '@/components/ExamBoard';
import Link from 'next/link';

const POPULAR_TAGS = [
  "諮商理論", "家族治療", "認知行為治療", "精神分析", 
  "倫理法規", "團體諮商", "變態心理學", "心理衡鑑", "發展心理學", "阿德勒"
];

// --- 工具函式：洗牌演算法 (Fisher-Yates Shuffle) ---
function shuffleArray(array: any[]) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function ExamPage() {
  // --- 狀態管理區 ---
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVip, setIsVip] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // 模式與篩選
  const [mode, setMode] = useState<'browse' | 'quiz'>('browse');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [tagFilter, setTagFilter] = useState('ALL');
  
  // [新增] 只練錯題開關
  const [onlyMistakes, setOnlyMistakes] = useState(false);

  // --- 抓資料邏輯 ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setQuestions([]); // 清空舊資料，避免畫面閃爍

      // 1. 檢查使用者與 VIP
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_vip')
          .eq('id', user.id)
          .single();
        setIsVip(profile?.is_vip || false);
      }

      let rawQuestions: any[] = [];

      // 2. 判斷資料來源
      if (onlyMistakes) {
        // === 模式 A: 從錯題本抓 ===
        if (!user) {
          alert("請先登入才能使用錯題功能");
          setOnlyMistakes(false);
          setLoading(false);
          return;
        }

        // 關聯查詢：抓錯題表，並把原始題目資料 (question:questions(*)) 一起抓出來
        const { data, error } = await supabase
          .from('wrong_answers')
          .select('question:questions(*)') // 這是 Supabase 的關聯語法
          .eq('user_id', user.id);

        if (data) {
          // 整理資料結構：把包在裡面的 question 拿出來變成扁平陣列
          rawQuestions = data.map((item: any) => item.question);
        }
      } else {
        // === 模式 B: 從總題庫抓 ===
        let query = supabase.from('questions').select('*');
        
        // 套用篩選條件 (如果是錯題模式，我們在前端濾，因為 Supabase 巢狀過濾比較複雜)
        if (yearFilter !== 'ALL') query = query.eq('year', yearFilter);
        if (subjectFilter !== 'ALL') query = query.eq('subject', subjectFilter);
        if (tagFilter !== 'ALL') query = query.contains('tags', [tagFilter]);
        
        const { data } = await query;
        if (data) rawQuestions = data;
      }

      // 3. 前端過濾 (針對錯題模式的補強過濾) & 分類處理
      // 如果是錯題模式，我們在這裡手動過濾年份和科目 (因為剛剛只抓了全部錯題)
      if (onlyMistakes) {
        if (yearFilter !== 'ALL') rawQuestions = rawQuestions.filter(q => q.year === yearFilter);
        if (subjectFilter !== 'ALL') rawQuestions = rawQuestions.filter(q => q.subject === subjectFilter);
        if (tagFilter !== 'ALL') rawQuestions = rawQuestions.filter(q => q.tags?.includes(tagFilter));
      }

      // 4. [關鍵] 洗牌邏輯：選擇題打亂，申論題放最後
      const essayQuestions = rawQuestions.filter(q => q.type === 'essay');
      const choiceQuestions = rawQuestions.filter(q => q.type !== 'essay');

      // 隨機打亂選擇題
      const shuffledChoices = shuffleArray(choiceQuestions);

      // 合併：亂序選擇題 + 申論題
      setQuestions([...shuffledChoices, ...essayQuestions]);
      
      setLoading(false);
    };

    fetchData();
  }, [yearFilter, subjectFilter, tagFilter, onlyMistakes]); // 加入 onlyMistakes 依賴

  // --- 畫面渲染區 ---
  return (
    <div className="space-y-6">
      
      {/* 標題與控制列 */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            歷屆試題練習
            {onlyMistakes && <span className="ml-3 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">錯題特訓中</span>}
          </h2>
          
          <div className="flex flex-wrap gap-3 items-center">
            {/* [新增] 只練錯題開關 */}
            <label className="flex items-center cursor-pointer select-none bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={onlyMistakes}
                  onChange={(e) => setOnlyMistakes(e.target.checked)}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${onlyMistakes ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${onlyMistakes ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <div className="ml-3 text-sm font-bold text-slate-700">
                只練錯題
              </div>
            </label>

            <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>

            {/* 模式切換 */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setMode('browse')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === 'browse' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                📖 閱覽
              </button>
              <button
                onClick={() => setMode('quiz')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === 'quiz' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                📝 測驗
              </button>
            </div>
          </div>
        </div>

        {/* 篩選器 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select 
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="p-3 border border-slate-300 rounded-lg text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="ALL">📅 所有年份</option>
            <option value="113-1">113年 第1次</option>
            <option value="112-2">112年 第2次</option>
            <option value="112-1">112年 第1次</option>
          </select>

          <select 
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="p-3 border border-slate-300 rounded-lg text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="ALL">📚 所有科目</option>
            <option value="諮商與心理治療理論">諮商與心理治療理論</option>
            <option value="發展心理學">發展心理學</option>
            <option value="變態心理學">變態心理學</option>
            <option value="家族治療">家族治療</option>
            <option value="諮商與心理治療實務與專業倫理">諮商與心理治療實務與專業倫理</option>
          </select>
          
          <select 
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="p-3 border border-slate-300 rounded-lg text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="ALL">🏷️ 關鍵字/標籤篩選</option>
            {POPULAR_TAGS.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- 結果顯示區 --- */}
      {loading ? (
        <div className="text-center py-10 text-slate-500">
          {onlyMistakes ? '正在挖掘您的錯題...' : '正在從題庫抽題...'}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          {onlyMistakes ? (
            <div>
              <p className="text-lg text-slate-600 font-bold mb-2">太強了！在這個範圍內沒有錯題 🎉</p>
              <p className="text-sm">試著切換年份，或是關閉錯題模式來練習新題目。</p>
            </div>
          ) : (
            <p>找不到符合條件的題目。</p>
          )}
          <button 
            onClick={() => {setYearFilter('ALL'); setSubjectFilter('ALL'); setTagFilter('ALL'); setOnlyMistakes(false)}} 
            className="text-blue-600 underline mt-4 hover:text-blue-800"
          >
            重置所有篩選條件
          </button>
        </div>
      ) : mode === 'quiz' ? (
        // === 測驗模式 (會自動使用洗牌後的順序) ===
        <div className="flex justify-center">
           <ExamBoard questions={questions} />
        </div>
      ) : (
        // === 閱覽模式 (List View) ===
        <div className="grid gap-4">
          {questions.map((q, idx) => {
            const isEssay = q.type === 'essay';
            return (
              <div 
                key={q.id} 
                className={`bg-white p-6 rounded-xl border transition-colors ${
                  isEssay ? 'border-purple-200 hover:border-purple-400' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {/* 題頭資訊 */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-wrap gap-2 items-center">
                    {isEssay ? (
                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded border border-purple-200 font-bold flex items-center">
                        📝 申論/問答
                      </span>
                    ) : (
                      <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded border border-blue-100 flex items-center">
                        ☑️ 選擇題
                      </span>
                    )}
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-mono">
                      {q.year} | {q.subject}
                    </span>
                    {q.tags?.map((t: string) => (
                       <span key={t} className="bg-gray-50 text-gray-500 text-xs px-2 py-1 rounded border border-gray-100">#{t}</span>
                    ))}
                  </div>
                  <span className="text-slate-400 text-xs font-mono">#{q.id}</span>
                </div>
                
                <h3 className={`text-lg font-bold text-slate-800 mb-4 leading-relaxed ${isEssay ? 'whitespace-pre-wrap' : ''}`}>
                  <span className="mr-2 text-slate-400 font-mono">{idx + 1}.</span>
                  {q.content}
                </h3>

                {/* 選項區塊 */}
                {!isEssay && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 pl-4 border-l-2 border-slate-100">
                    {(q.options as any).map((opt: string, i: number) => (
                      <div key={i} className={`text-sm ${opt === q.answer ? 'text-green-700 font-bold' : 'text-slate-600'}`}>
                        {String.fromCharCode(65 + i)}. {opt}
                      </div>
                    ))}
                  </div>
                )}

                {/* 詳解區塊 */}
                <div className="relative overflow-hidden rounded-lg">
                  {isVip ? (
                    <div className={`${isEssay ? 'bg-purple-50' : 'bg-green-50'} p-5 text-sm`}>
                      <div className="flex justify-between items-center mb-3">
                         {!isEssay ? (
                           <p className="font-bold text-green-800">✅ 正確答案：{q.answer}</p>
                         ) : (
                           <p className="font-bold text-purple-800">💡 參考解析 / 評分重點</p>
                         )}
                         <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">👑 VIP 已解鎖</span>
                      </div>
                      
                      <div className="text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap">
                        {!isEssay && <span className="font-semibold">解析：</span>}
                        {q.explanation}
                      </div>
                      
                      {q.concept_slug && (
                        <Link 
                          href={`/dashboard/knowledge/${q.concept_slug}`}
                          target="_blank"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors bg-white px-3 py-2 rounded border border-blue-200 hover:border-blue-400"
                        >
                          📖 延伸閱讀：查看相關理論與概念
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-4 text-sm relative">
                      <p className="font-bold text-slate-300 mb-1 blur-[3px] select-none">
                        {isEssay ? '💡 參考解析內容' : '✅ 正確答案：這是付費內容'}
                      </p>
                      <p className="text-slate-300 leading-relaxed blur-[3px] select-none">
                        解析內容已隱藏...這是一段非常精彩的解析，但很可惜你現在還不能看。
                      </p>
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px]">
                        <div className="text-2xl mb-2">🔒</div>
                        <button className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-slate-700 shadow-lg">
                          升級 VIP 解鎖
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}