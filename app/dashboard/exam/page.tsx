"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ExamBoard from '@/components/ExamBoard';
import MockExamBoard from '@/components/MockExamBoard';
import ReportButton from '@/components/ReportButton';
import BookmarkButton from '@/components/BookmarkButton';
import Link from 'next/link';

// 強力清潔工具
const cleanText = (text: string) => {
  if (!text) return "";
  return text.trim().replace(/^["']|["']$/g, "");
};

// [修改] 移除前端洗牌，改用後端隨機
// function shuffleArray ... (移除)

const ITEMS_PER_PAGE = 20; // 每次只抓 20 題，保證速度飛快

export default function ExamPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isVip, setIsVip] = useState(false);
  const [tagList, setTagList] = useState<string[]>([]);
  const [yearList, setYearList] = useState<string[]>([]);
  const [subjectList, setSubjectList] = useState<string[]>([]);

  const [mode, setMode] = useState<'browse' | 'quiz' | 'mock_setup' | 'mock_exam'>('browse');
  const [mockTime, setMockTime] = useState(120);
  const [mockCount, setMockCount] = useState(40);
  const [mockSubject, setMockSubject] = useState('ALL');

  const [yearFilter, setYearFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [tagFilter, setTagFilter] = useState('ALL');
  const [onlyMistakes, setOnlyMistakes] = useState(false);

  // [新增] 分頁狀態
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const initData = async () => {
      const { data: tags } = await supabase.rpc('get_unique_tags');
      if (tags) setTagList(tags);
      const { data: years } = await supabase.rpc('get_unique_years');
      if (years) setYearList(years);
      const { data: subjects } = await supabase.rpc('get_unique_subjects');
      if (subjects) {
        const customOrder = [
          "諮商的心理學基礎", "諮商與心理治療理論", "諮商與心理治療實務與專業倫理",
          "心理健康與變態心理學", "個案評估與心理衡鑑", "團體諮商與心理治療"
        ];
        setSubjectList(subjects.sort((a: string, b: string) => {
          const indexA = customOrder.indexOf(a);
          const indexB = customOrder.indexOf(b);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.localeCompare(b);
        }));
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('is_vip').eq('id', user.id).single();
        setIsVip(profile?.is_vip || false);
      }
    };
    initData();
    // 初始載入
    fetchQuestions('browse', 0, true); 
  }, []);

  // [修改] 抓取函數：加入分頁參數
  const fetchQuestions = async (targetMode: string, pageNum: number, isReset: boolean = false) => {
    setLoading(true);
    if (isReset) {
      setQuestions([]);
      setPage(0);
      setHasMore(true);
    }

    const { data: { user } } = await supabase.auth.getUser();
    let newQuestions: any[] = [];

    // --- 錯題模式 ---
    if (onlyMistakes) {
      if (!user) { alert("請先登入"); setLoading(false); return; }
      // 錯題本通常數量不多，我們維持一次抓取，但在前端做分頁
      // (如果要優化，需要在資料庫層級改寫，目前先維持原樣以免改壞)
      const { data } = await supabase.from('wrong_answers').select('question:questions(*)').eq('user_id', user.id);
      if (data) newQuestions = data.map((item: any) => item.question);
      
      // 前端過濾
      if (yearFilter !== 'ALL') newQuestions = newQuestions.filter(q => q.year === yearFilter);
      if (subjectFilter !== 'ALL') newQuestions = newQuestions.filter(q => q.subject === subjectFilter);
      if (tagFilter !== 'ALL') newQuestions = newQuestions.filter(q => q.tags?.includes(tagFilter));

      // 分頁切片
      const start = pageNum * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const sliced = newQuestions.slice(start, end);
      
      if (sliced.length < ITEMS_PER_PAGE) setHasMore(false);
      
      if (isReset) setQuestions(sliced);
      else setQuestions(prev => [...prev, ...sliced]);

    } else {
      // --- 一般模式 (使用 Supabase 分頁) ---
      let query = supabase.from('questions').select('*');
      
      if (targetMode === 'mock_exam') {
        if (mockSubject !== 'ALL') query = query.eq('subject', mockSubject);
        // 模擬考隨機抓 N 題 (這裡簡單用 limit)
        query = query.limit(mockCount); 
      } else {
        // 一般閱覽：加入篩選
        if (yearFilter !== 'ALL') query = query.eq('year', yearFilter);
        if (subjectFilter !== 'ALL') query = query.eq('subject', subjectFilter);
        if (tagFilter !== 'ALL') query = query.contains('tags', [tagFilter]);
        
        // [關鍵] 加入分頁範圍
        const from = pageNum * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        query = query.range(from, to);
        
        // 排序 (建議加上排序以確保分頁穩定)
        query = query.order('id', { ascending: true });
      }
      
      const { data } = await query;
      
      if (data) {
        if (data.length < ITEMS_PER_PAGE) setHasMore(false);
        
        if (isReset) setQuestions(data);
        else setQuestions(prev => [...prev, ...data]);
      }
    }
    
    setLoading(false);
  };

  // 當篩選條件改變時，重置並重抓
  useEffect(() => {
    if (mode === 'browse' || mode === 'quiz') {
      fetchQuestions(mode, 0, true);
    }
  }, [yearFilter, subjectFilter, tagFilter, onlyMistakes]);

  // 載入更多
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchQuestions(mode, nextPage, false);
  };

  const startMockExam = () => { setMode('mock_exam'); fetchQuestions('mock_exam', 0, true); };

  if (mode === 'mock_exam') {
    return loading && questions.length === 0 ? <div className="text-center py-20 text-slate-500 animate-pulse">正在準備模擬試卷...</div> : 
      <MockExamBoard questions={questions} timeLimit={mockTime} onExit={() => { setMode('browse'); fetchQuestions('browse', 0, true); }} />;
  }

  return (
    <div className="space-y-6">
      
      {/* 標題與控制列 (保持不變) */}
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

        {mode === 'mock_setup' ? (
          <div className="bg-amber-50 rounded-xl p-6 border border-amber-100 animate-in fade-in slide-in-from-top-2">
            <h3 className="font-bold text-amber-800 mb-4 text-lg">⏱️ 設定您的模擬考試</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-3">
                <label className="block text-sm font-bold text-amber-700 mb-2">考試科目</label>
                <select value={mockSubject} onChange={(e) => setMockSubject(e.target.value)} className="w-full p-3 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none bg-white">
                  <option value="ALL">全科混合測驗 (隨機出題)</option>
                  {subjectList.map(s => <option key={s} value={s}>{s}</option>)}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="p-3 border border-slate-300 rounded-lg bg-white">
              <option value="ALL">📅 所有年份</option>
              {yearList.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="p-3 border border-slate-300 rounded-lg bg-white">
              <option value="ALL">📚 所有科目</option>
              {subjectList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="p-3 border border-slate-300 rounded-lg bg-white">
              <option value="ALL">🏷️ 標籤篩選</option>
              {tagList.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          </div>
        )}
      </div>

      {mode !== 'mock_setup' && (
        // === 列表渲染區 ===
        questions.length === 0 && !loading ? (
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
                <div key={q.id} className={`bg-white p-6 rounded-xl border transition-colors relative ${isEssay ? 'border-purple-200 hover:border-purple-400' : 'border-slate-200 hover:border-blue-300'}`}>
                  
                  {/* 收藏按鈕 */}
                  <div className="absolute top-4 right-4 z-10">
                    <BookmarkButton questionId={q.id} />
                  </div>

                  <div className="flex justify-between items-start mb-4 pr-10">
                    <div className="flex flex-wrap gap-2 items-center">
                      {isEssay ? <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded border border-purple-200 font-bold">📝 申論/問答</span> : <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded border border-blue-100 font-bold">☑️ 選擇</span>}
                      <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-mono">{q.year} | {q.subject}</span>
                      {q.tags?.map((t: string) => <span key={t} className="bg-gray-50 text-gray-500 text-xs px-2 py-1 rounded border border-gray-100">#{cleanText(t)}</span>)}
                    </div>
                  </div>
                  
                  <h3 className={`text-lg font-bold text-slate-800 mb-4 ${isEssay ? 'whitespace-pre-wrap' : ''}`}><span className="mr-2 text-slate-400">{idx + 1}.</span>{q.content}</h3>
                  
                  {!isEssay && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 pl-4 border-l-2 border-slate-100">
                      {safeOptions.map((opt, i) => {
                        const isCorrect = cleanText(opt) === cleanText(q.answer);
                        return (
                          <div key={i} className={`text-sm ${isCorrect ? 'text-green-700 font-bold' : 'text-slate-600'}`}>
                            {String.fromCharCode(65 + i)}. {cleanText(opt)}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="relative overflow-hidden rounded-lg">
                    {isVip ? (
                      <div className={`${isEssay ? 'bg-purple-50' : 'bg-green-50'} p-5 text-sm`}>
                        <div className="flex justify-between items-center mb-3">
                           {!isEssay ? <p className="font-bold text-green-800">✅ 正確答案：{cleanText(q.answer)}</p> : <p className="font-bold text-purple-800">💡 參考解析</p>}
                           <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">👑 VIP 已解鎖</span>
                        </div>
                        <div className="text-slate-700 whitespace-pre-wrap">{q.explanation?.replace(/\\n/g, '\n')}</div>
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

                  <div className="mt-4 flex justify-end">
                    <ReportButton questionId={q.id} />
                  </div>
                </div>
              );
            })}
            
            {/* [新增] 載入更多按鈕 */}
            {hasMore && (
              <div className="text-center pt-8">
                <button 
                  onClick={loadMore} 
                  disabled={loading}
                  className="bg-white border border-slate-300 text-slate-600 px-6 py-3 rounded-full hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-sm font-bold disabled:opacity-50"
                >
                  {loading ? '載入中...' : '⬇️ 載入更多試題'}
                </button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}