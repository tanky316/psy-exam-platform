"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import ReportButton from "@/components/ReportButton";

// 清潔工具
const cleanText = (text: string) => {
  if (!text) return "";
  return text.trim().replace(/^["']|["']$/g, "");
};

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVip, setIsVip] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null); // 控制哪一題展開
  const [filterSubject, setFilterSubject] = useState("ALL");
  const [subjects, setSubjects] = useState<string[]>([]);

  // 1. 抓取收藏資料
  const fetchBookmarks = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // 抓取 VIP 狀態
    const { data: profile } = await supabase.from('profiles').select('is_vip').eq('id', user.id).single();
    setIsVip(profile?.is_vip || false);

    // 抓取收藏 + 題目內容
    const { data, error } = await supabase
      .from('bookmarks')
      .select(`
        id, 
        created_at,
        question:questions (
          id, content, options, answer, explanation, year, subject, type, concept_slug
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setBookmarks(data);
      // 提取所有科目供篩選
      const allSubjects = Array.from(new Set(data.map((item: any) => item.question?.subject).filter(Boolean)));
      setSubjects(allSubjects as string[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  // 2. 移除收藏
  const handleRemove = async (id: number) => {
    // 樂觀更新
    setBookmarks(prev => prev.filter(b => b.id !== id));
    await supabase.from('bookmarks').delete().eq('id', id);
  };

  // 篩選邏輯
  const filteredBookmarks = filterSubject === "ALL" 
    ? bookmarks 
    : bookmarks.filter(b => b.question?.subject === filterSubject);

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* 頁面標題 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <span className="text-4xl text-yellow-500">⭐</span> 我的收藏夾
              <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold">
                {bookmarks.length} 題
              </span>
            </h1>
            <p className="text-slate-500 mt-2">這裡匯集了您標記的重點考題，考前衝刺必備。</p>
          </div>
          
          <div className="flex gap-2">
            <Link href="/dashboard" className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-bold text-sm">
              ← 返回儀表板
            </Link>
            <Link href="/dashboard/exam" className="px-4 py-2 text-white bg-slate-900 rounded-lg hover:bg-slate-700 font-bold text-sm shadow-sm">
              去發掘更多題目
            </Link>
          </div>
        </div>

        {/* 科目篩選器 */}
        {subjects.length > 0 && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center gap-3 overflow-x-auto no-scrollbar">
            <span className="font-bold text-slate-700 whitespace-nowrap">🔍 科目篩選：</span>
            <button 
              onClick={() => setFilterSubject("ALL")}
              className={`px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filterSubject === "ALL" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              全部顯示
            </button>
            {subjects.map(sub => (
              <button 
                key={sub}
                onClick={() => setFilterSubject(sub)}
                className={`px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filterSubject === sub ? "bg-yellow-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* 列表內容 */}
        {loading ? (
          <div className="space-y-4">
             {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white rounded-xl animate-pulse"></div>)}
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="text-6xl mb-4 text-slate-300">📭</div>
            <h3 className="text-xl font-bold text-slate-800">目前沒有相關收藏</h3>
            <p className="text-slate-500 mt-2 mb-6">看到不錯的題目，記得點擊星星符號喔！</p>
            <Link href="/dashboard/exam" className="px-6 py-3 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 transition-colors shadow-sm">
              前往題庫練習
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookmarks.map((item) => {
              const q = item.question;
              if (!q) return null;

              const isExpanded = expandedId === item.id;
              
              // 處理選項
              let safeOptions: string[] = [];
              try {
                  safeOptions = Array.isArray(q.options) ? q.options : JSON.parse(q.options);
              } catch(e) { safeOptions = []; }

              return (
                <div key={item.id} className="bg-white rounded-xl border border-yellow-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative">
                  
                  {/* 取消收藏按鈕 (絕對定位) */}
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-4 right-4 text-yellow-400 hover:text-slate-300 transition-colors p-2 z-10"
                    title="取消收藏"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  </button>

                  {/* 卡片標頭 */}
                  <div className="p-6 border-b border-slate-100 flex justify-between items-start gap-4 bg-gradient-to-r from-white to-yellow-50/30">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-3 pr-8">
                         <span className={`text-xs px-2 py-1 rounded font-bold border ${q.type === 'essay' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                            {q.type === 'essay' ? '📝 申論' : '☑️ 選擇'}
                         </span>
                         <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-bold">
                           {q.year}
                         </span>
                         <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-bold">
                           {q.subject}
                         </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {q.content}
                      </h3>
                    </div>
                  </div>

                  {/* 選項與互動區 */}
                  <div className="p-6">
                    {!isExpanded ? (
                       <button 
                         onClick={() => setExpandedId(item.id)}
                         className="w-full py-3 bg-slate-50 text-slate-600 font-bold rounded-lg hover:bg-yellow-50 hover:text-yellow-700 transition-colors border border-slate-200 flex items-center justify-center gap-2"
                       >
                         <span>👁️</span> 查看選項與解析
                       </button>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        {/* 選項列表 */}
                        {q.type !== 'essay' && (
                          <div className="grid gap-2 mb-6">
                            {safeOptions.map((opt, idx) => {
                               const isCorrect = cleanText(opt) === cleanText(q.answer);
                               return (
                                 <div key={idx} className={`p-3 rounded-lg text-sm border flex items-center ${isCorrect ? 'bg-green-50 border-green-200 text-green-800 font-bold' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 text-xs border ${isCorrect ? 'bg-green-600 text-white border-green-600' : 'bg-white border-slate-300'}`}>
                                      {String.fromCharCode(65 + idx)}
                                    </span>
                                    {cleanText(opt)}
                                    {isCorrect && <span className="ml-auto text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">正解</span>}
                                 </div>
                               )
                            })}
                          </div>
                        )}

                        {/* 解析區塊 */}
                        <div className="bg-slate-50 p-5 rounded-xl border-l-4 border-slate-400">
                           <div className="flex justify-between items-center mb-2">
                             <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-800">💡 解析說明</h4>
                                {isVip && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">VIP</span>}
                             </div>
                             <button onClick={() => setExpandedId(null)} className="text-xs text-slate-400 hover:text-slate-600 underline">
                               收起
                             </button>
                           </div>
                           
                           {isVip ? (
                             <>
                               <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                 {q.explanation || "暫無詳細解析。"}
                               </p>
                               {q.concept_slug && (
                                  <Link href={`/dashboard/knowledge/${q.concept_slug}`} target="_blank" className="inline-flex items-center text-xs font-bold text-blue-600 mt-3 hover:underline">
                                    📖 延伸閱讀
                                  </Link>
                               )}
                             </>
                           ) : (
                             <div className="relative">
                               <p className="text-sm text-slate-300 blur-[3px] leading-relaxed select-none">
                                 這是一段非常精彩的解析，關於這個題目的詳細觀念與解題技巧...請升級會員查看完整內容。
                               </p>
                               <div className="absolute inset-0 flex items-center justify-center">
                                 <button className="bg-slate-800 text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-slate-700 shadow-sm">
                                   🔒 升級 VIP 解鎖
                                 </button>
                               </div>
                             </div>
                           )}
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                           <span className="text-xs text-slate-400">收藏日期：{new Date(item.created_at).toLocaleDateString()}</span>
                           <ReportButton questionId={q.id} />
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
    </div>
  );
}