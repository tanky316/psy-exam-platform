"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ExamBoard from '@/components/ExamBoard';
import MockExamBoard from '@/components/MockExamBoard';
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
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isVip, setIsVip] = useState(false);
  
  // [關鍵修改] 改成從資料庫動態抓取清單
  const [tagList, setTagList] = useState<string[]>([]);
  const [yearList, setYearList] = useState<string[]>([]);
  const [subjectList, setSubjectList] = useState<string[]>([]);

  // 模式控制
  const [mode, setMode] = useState<'browse' | 'quiz' | 'mock_setup' | 'mock_exam'>('browse');
  
  // 模擬考設定
  const [mockTime, setMockTime] = useState(120);
  const [mockCount, setMockCount] = useState(40);
  const [mockSubject, setMockSubject] = useState('ALL');

  // 篩選
  const [yearFilter, setYearFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [tagFilter, setTagFilter] = useState('ALL');
  const [onlyMistakes, setOnlyMistakes] = useState(false);

  // --- 初始化：抓取所有下拉選單資料 ---
  useEffect(() => {
    const initData = async () => {
      // 1. 抓標籤
      const { data: tags } = await supabase.rpc('get_unique_tags');
      if (tags) setTagList(tags);

      // 2. [新增] 抓年份
      const { data: years } = await supabase.rpc('get_unique_years');
      if (years) setYearList(years);

   // 3. [新] 抓科目並依照指定順序排列
      const { data: subjects } = await supabase.rpc('get_unique_subjects');
      if (subjects) {
        // 定義您想要的完美順序
        const customOrder = [
          "諮商的心理學基礎",
          "諮商與心理治療理論",
          "諮商與心理治療實務與專業倫理",
          "心理健康與變態心理學",
          "個案評估與心理衡鑑",
          "團體諮商與心理治療"
        ];

        // 排序邏輯：
        // 如果科目在清單裡，就照清單排；
        // 如果有新科目不在清單裡 (例如 "其他")，就把它們放到最後面
        const sortedSubjects = subjects.sort((a: string, b: string) => {
          const indexA = customOrder.indexOf(a);
          const indexB = customOrder.indexOf(b);
          
          // 兩者都在清單中，比順序
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          // A 在清單，B 不在 -> A 排前面
          if (indexA !== -1) return -1;
          // B 在清單，A 不在 -> B 排前面
          if (indexB !== -1) return 1;
          // 都不在清單，照筆畫排
          return a.localeCompare(b);
        });

        setSubjectList(sortedSubjects);
      }

      // 4. 檢查 VIP
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('is_vip').eq('id', user.id).single();
        setIsVip(profile?.is_vip || false);
      }
    };
    initData();
    
    // 首次載入題目
    fetchQuestions('browse'); 
  }, []);

  // --- 抓取題目函數 ---
  const fetchQuestions = async (targetMode: string) => {
    setLoading(true);
    setQuestions([]);

    const { data: { user } } = await supabase.auth.getUser();
    let rawQuestions: any[] = [];

    // 取得原始資料
    if (onlyMistakes) {
      if (!user) {
        alert("請先登入");
        setLoading(false);
        return;
      }
      const { data } = await supabase.from('wrong_answers').select('question:questions(*)').eq('user_id', user.id);
      if (data) rawQuestions = data.map((item: any) => item.question);
    } else {
      let query = supabase.from('questions').select('*');
      
      // 資料庫層級篩選 (模擬考只篩科目，一般模式篩全部)
      if (targetMode === 'mock_exam') {
        if (mockSubject !== 'ALL') query = query.eq('subject', mockSubject);
      } else {
        if (yearFilter !== 'ALL') query = query.eq('year', yearFilter);
        if (subjectFilter !== 'ALL') query = query.eq('subject', subjectFilter);
        if (tagFilter !== 'ALL') query = query.contains('tags', [tagFilter]);
      }
      
      const { data } = await query;
      if (data) rawQuestions = data;
    }

    // 前端層級過濾 (針對錯題模式的補強)
    if (onlyMistakes && targetMode !== 'mock_exam') {
      if (yearFilter !== 'ALL') rawQuestions = rawQuestions.filter(q => q.year === yearFilter);
      if (subjectFilter !== 'ALL') rawQuestions = rawQuestions.filter(q => q.subject === subjectFilter);
      if (tagFilter !== 'ALL') rawQuestions = rawQuestions.filter(q => q.tags?.includes(tagFilter));
    }

    // 處理顯示邏輯
    if (targetMode === 'mock_exam') {
      const choices = rawQuestions.filter(q => q.type !== 'essay');
      const limit = Math.min(choices.length, mockCount);
      const shuffled = shuffleArray(choices).slice(0, limit);
      setQuestions(shuffled);
    } else {
      const essays = rawQuestions.filter(q => q.type === 'essay');
      const choices = rawQuestions.filter(q => q.type !== 'essay');
      setQuestions([...shuffleArray(choices), ...essays]);
    }
    
    setLoading(false);
  };

  // 當篩選條件改變時自動重抓
  useEffect(() => {
    if (mode === 'browse' || mode === 'quiz') {
      fetchQuestions(mode);
    }
  }, [yearFilter, subjectFilter, tagFilter, onlyMistakes]);

  const startMockExam = () => {
    setMode('mock_exam');
    fetchQuestions('mock_exam');
  };

  if (mode === 'mock_exam') {
    return loading ? (
      <div className="text-center py-20 text-slate-500 animate-pulse">正在準備模擬試卷...</div>
    ) : (
      <MockExamBoard 
        questions={questions} 
        timeLimit={mockTime} 
        onExit={() => { setMode('browse'); fetchQuestions('browse'); }} 
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 控制面板 */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            歷屆試題練習
            {onlyMistakes && <span className="ml-3 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">錯題特訓</span>}
          </h2>
          
          <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
            <label className="flex items-center cursor-pointer select-none bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
              <input type="checkbox" className="mr-2" checked={onlyMistakes} onChange={(e) => setOnlyMistakes(e.target.checked)} />
              <span className="text-sm font-bold text-slate-700">只練錯題</span>
            </label>

            <div className="h-8 w-px bg-slate-200 mx-1 hidden xl:block"></div>

            <div className="flex bg-slate-100 p-1 rounded-lg w-full xl:w-auto overflow-x-auto">
              <button onClick={() => setMode('browse')} className={`flex-1 xl:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${mode === 'browse' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>📖 閱覽</button>
              <button onClick={() => setMode('quiz')} className={`flex-1 xl:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${mode === 'quiz' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>📝 測驗</button>
              <button onClick={() => setMode('mock_setup')} className={`flex-1 xl:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${mode === 'mock_setup' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-slate-500 hover:text-amber-600'}`}>⏱️ 模擬考</button>
            </div>
          </div>
        </div>

        {/* 模擬考設定 */}
        {mode === 'mock_setup' ? (
          <div className="bg-amber-50 rounded-xl p-6 border border-amber-100 animate-in fade-in slide-in-from-top-2">
            <h3 className="font-bold text-amber-800 mb-4 text-lg">⏱️ 設定您的模擬考試</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-3">
                <label className="block text-sm font-bold text-amber-700 mb-2">考試科目</label>
                <select 
                  value={mockSubject} 
                  onChange={(e) => setMockSubject(e.target.value)} 
                  className="w-full p-3 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none bg-white"
                >
                  <option value="ALL">全科混合測驗 (隨機出題)</option>
                  {/* 動態渲染科目選單 */}
                  {subjectList.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-700 mb-2">考試時間 (分鐘)</label>
                <input type="number" value={mockTime} onChange={(e) => setMockTime(Number(e.target.value))} className="w-full p-3 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-700 mb-2">題目數量</label>
                <input type="number" value={mockCount} onChange={(e) => setMockCount(Number(e.target.value))} className="w-full p-3 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none" />
              </div>
            </div>
            <button onClick={startMockExam} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-md transition-transform hover:scale-[1.01]">開始計時考試</button>
          </div>
        ) : (
          // 一般篩選器
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 年份篩選 (動態) */}
            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="p-3 border border-slate-300 rounded-lg bg-white">
              <option value="ALL">📅 所有年份</option>
              {yearList.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {/* 科目篩選 (動態) */}
            <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="p-3 border border-slate-300 rounded-lg bg-white">
              <option value="ALL">📚 所有科目</option>
              {subjectList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            
            {/* 標籤篩選 (動態) */}
            <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="p-3 border border-slate-300 rounded-lg bg-white">
              <option value="ALL">🏷️ 標籤篩選</option>
              {tagList.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* 結果列表 (保持不變，省略細節) */}
      {mode !== 'mock_setup' && (
        // ... 這裡請保留您原本的列表顯示程式碼 ...
        // (為了版面簡潔，這裡省略了中間的渲染部分，請務必保留原檔案中這部分的代碼)
        loading ? (
          <div className="text-center py-10 text-slate-500">{onlyMistakes ? '正在挖掘您的錯題...' : '正在從題庫抽題...'}</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p>找不到符合條件的題目。</p>
            <button onClick={() => {setYearFilter('ALL'); setSubjectFilter('ALL'); setTagFilter('ALL'); setOnlyMistakes(false)}} className="text-blue-600 underline mt-4">重置條件</button>
          </div>
        ) : mode === 'quiz' ? (
          <div className="flex justify-center"><ExamBoard questions={questions} /></div>
        ) : (
          <div className="grid gap-4">
            {questions.map((q, idx) => {
              const isEssay = q.type === 'essay';
              let safeOptions: string[] = [];
              if (Array.isArray(q.options)) safeOptions = q.options;
              else if (typeof q.options === 'string') { try { safeOptions = JSON.parse(q.options); } catch (e) { safeOptions = []; } }

              return (
                <div key={q.id} className={`bg-white p-6 rounded-xl border transition-colors ${isEssay ? 'border-purple-200 hover:border-purple-400' : 'border-slate-200 hover:border-blue-300'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap gap-2 items-center">
                      {isEssay ? <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded border border-purple-200 font-bold">📝 申論/問答</span> : <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded border border-blue-100 font-bold">☑️ 選擇</span>}
                      <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-mono">{q.year} | {q.subject}</span>
                      {q.tags?.map((t: string) => <span key={t} className="bg-gray-50 text-gray-500 text-xs px-2 py-1 rounded border border-gray-100">#{t}</span>)}
                    </div>
                    {/* ID 移除 */}
                  </div>
                  <h3 className={`text-lg font-bold text-slate-800 mb-4 ${isEssay ? 'whitespace-pre-wrap' : ''}`}><span className="mr-2 text-slate-400">{idx + 1}.</span>{q.content}</h3>
                  {!isEssay && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 pl-4 border-l-2 border-slate-100">
                      {safeOptions.map((opt, i) => (
                        <div key={i} className={`text-sm ${opt === q.answer ? 'text-green-700 font-bold' : 'text-slate-600'}`}>{String.fromCharCode(65 + i)}. {opt}</div>
                      ))}
                    </div>
                  )}
                  <div className="relative overflow-hidden rounded-lg">
                    {isVip ? (
                      <div className={`${isEssay ? 'bg-purple-50' : 'bg-green-50'} p-5 text-sm`}>
                        <div className="flex justify-between items-center mb-3">
                           {!isEssay ? <p className="font-bold text-green-800">✅ 正確答案：{q.answer}</p> : <p className="font-bold text-purple-800">💡 參考解析</p>}
                           <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">👑 VIP 已解鎖</span>
                        </div>
                        <div className="text-slate-700 whitespace-pre-wrap">{q.explanation}</div>
                        {q.concept_slug && <Link href={`/dashboard/knowledge/${q.concept_slug}`} target="_blank" className="inline-flex items-center text-blue-600 font-bold mt-3 hover:underline">📖 延伸閱讀</Link>}
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-4 text-sm relative">
                        <p className="font-bold text-slate-300 blur-[3px]">{isEssay ? '參考解析' : '正確答案'}</p>
                        <p className="text-slate-300 blur-[3px]">解析內容已隱藏...</p>
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px]">
                          <div className="text-2xl mb-2">🔒</div>
                          <button className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-slate-700">升級 VIP 解鎖</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}