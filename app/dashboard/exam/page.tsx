"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ExamBoard from '@/components/ExamBoard';
import Link from 'next/link';

// 洗牌演算法
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
  
  // [升級] 動態選單資料
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  // 模式與篩選
  const [mode, setMode] = useState<'browse' | 'quiz'>('browse');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [tagFilter, setTagFilter] = useState('ALL');
  const [onlyMistakes, setOnlyMistakes] = useState(false);

  // --- 初始化邏輯：抓取所有篩選選項 (年份、科目、標籤) ---
  useEffect(() => {
    const initPage = async () => {
      // 1. 檢查 VIP
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_vip')
          .eq('id', user.id)
          .single();
        setIsVip(profile?.is_vip || false);
      }

      // 2. [關鍵升級] 一次抓取所有題目資訊來製作選單 (只抓 metadata，不抓內容以節省流量)
      const { data: allData } = await supabase
        .from('questions')
        .select('year, subject, tags');

      if (allData) {
        // A. 整理年份 (去重複 + 排序：新的在前)
        const years = Array.from(new Set(allData.map(d => d.year).filter(Boolean)))
          .sort((a, b) => (b as string).localeCompare(a as string));
        setAvailableYears(years as string[]);

        // B. 整理科目 (去重複 + 排序)
        const subjects = Array.from(new Set(allData.map(d => d.subject).filter(Boolean)))
          .sort(); // 筆畫排序
        setAvailableSubjects(subjects as string[]);

        // C. 整理標籤 (去重複 + 扁平化)
        const tags = Array.from(new Set(allData.flatMap(d => d.tags || []))).sort();
        setAvailableTags(tags);
      }
    };

    initPage();
  }, []);

  // --- 抓題目邏輯 (當篩選條件改變時觸發) ---
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setQuestions([]);

      const { data: { user } } = await supabase.auth.getUser();
      let rawQuestions: any[] = [];

      if (onlyMistakes) {
        // === 模式 A: 從錯題本抓 ===
        if (!user) {
          alert("請先登入才能使用錯題功能");
          setOnlyMistakes(false);
          setLoading(false);
          return;
        }
        const { data } = await supabase
          .from('wrong_answers')
          .select('question:questions(*)')
          .eq('user_id', user.id);

        if (data) {
          rawQuestions = data.map((item: any) => item.question);
        }
      } else {
        // === 模式 B: 從總題庫抓 ===
        let query = supabase.from('questions').select('*');
        
        if (yearFilter !== 'ALL') query = query.eq('year', yearFilter);
        if (subjectFilter !== 'ALL') query = query.eq('subject', subjectFilter);
        if (tagFilter !== 'ALL') query = query.contains('tags', [tagFilter]);
        
        query = query.order('id', { ascending: true });

        const { data } = await query;
        if (data) rawQuestions = data;
      }

      // 前端二次過濾
      if (onlyMistakes) {
        if (yearFilter !== 'ALL') rawQuestions = rawQuestions.filter(q => q.year === yearFilter);
        if (subjectFilter !== 'ALL') rawQuestions = rawQuestions.filter(q => q.subject === subjectFilter);
        if (tagFilter !== 'ALL') rawQuestions = rawQuestions.filter(q => q.tags?.includes(tagFilter));
      }

      // 洗牌邏輯
      const essayQuestions = rawQuestions.filter(q => q.type === 'essay');
      const choiceQuestions = rawQuestions.filter(q => q.type !== 'essay');
      const shuffledChoices = shuffleArray(choiceQuestions);

      setQuestions([...shuffledChoices, ...essayQuestions]);
      setLoading(false);
    };

    fetchQuestions();
  }, [yearFilter, subjectFilter, tagFilter, onlyMistakes]);

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

        {/* 動態篩選器 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. 年份 (自動抓取) */}
          <select 
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="p-3 border border-slate-300 rounded-lg text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="ALL">📅 所有年份</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year} </option>
            ))}
          </select>

          {/* 2. 科目 (自動抓取) */}
          <select 
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="p-3 border border-slate-300 rounded-lg text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="ALL">📚 所有科目</option>
            {availableSubjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          
          {/* 3. 標籤 (自動抓取) */}
          <select 
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="p-3 border border-slate-300 rounded-lg text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="ALL">🏷️ 標籤篩選 (全部)</option>
            {availableTags.map(tag => (
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
          <p>{onlyMistakes ? '太強了！沒有錯題 🎉' : '找不到符合條件的題目。'}</p>
          <button 
            onClick={() => {setYearFilter('ALL'); setSubjectFilter('ALL'); setTagFilter('ALL'); setOnlyMistakes(false)}} 
            className="text-blue-600 underline mt-4 hover:text-blue-800"
          >
            重置所有篩選條件
          </button>
        </div>
      ) : mode === 'quiz' ? (
        <div className="flex justify-center">
           <ExamBoard questions={questions} />
        </div>
      ) : (
        // === 閱覽模式 ===
        <div className="grid gap-4">
          {questions.map((q, idx) => {
            const isEssay = q.type === 'essay';
            
            // 安全處理選項
            let safeOptions: string[] = [];
            if (Array.isArray(q.options)) {
              safeOptions = q.options;
            } else if (typeof q.options === 'string') {
              try { safeOptions = JSON.parse(q.options); } catch (e) { safeOptions = []; }
            }

            return (
              <div 
                key={q.id} 
                className={`bg-white p-6 rounded-xl border transition-colors ${
                  isEssay ? 'border-purple-200 hover:border-purple-400' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
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

                {!isEssay && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 pl-4 border-l-2 border-slate-100">
                    {safeOptions.map((opt: string, i: number) => (
                      <div key={i} className={`text-sm ${opt === q.answer ? 'text-green-700 font-bold' : 'text-slate-600'}`}>
                        {String.fromCharCode(65 + i)}. {opt}
                      </div>
                    ))}
                  </div>
                )}

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
                        <Link href={`/dashboard/knowledge/${q.concept_slug}`} target="_blank" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors bg-white px-3 py-2 rounded border border-blue-200 hover:border-blue-400">
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
                        解析內容已隱藏...
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