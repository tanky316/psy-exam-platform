"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReportButton from '@/components/ReportButton';

// 清理工具
const cleanText = (text: string) => {
  if (!text) return "";
  return text.trim().replace(/^["']|["']$/g, "");
};

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVip, setIsVip] = useState(false);
  const router = useRouter();

  const removeMistake = async (id: number) => {
    // 樂觀更新 UI (先刪除畫面上的，再發送請求，感覺比較快)
    setMistakes(prev => prev.filter(m => m.id !== id));
    await supabase.from('wrong_answers').delete().eq('id', id);
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. 抓取 VIP 狀態
      const { data: profile } = await supabase.from('profiles').select('is_vip').eq('id', user.id).single();
      setIsVip(profile?.is_vip || false);

      // 2. 抓取錯題 (關聯題目資料)
      const { data } = await supabase
        .from('wrong_answers')
        .select(`
          id,
          created_at,
          question:questions (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setMistakes(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-20 text-center text-slate-500 animate-pulse">正在整理您的錯題...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <span className="text-4xl">📕</span> 我的錯題本
          </h2>
          <p className="text-slate-500 mt-2">
            共累積 <span className="font-bold text-red-600 text-lg mx-1">{mistakes.length}</span> 題待複習
          </p>
        </div>
        <Link 
          href="/dashboard/exam" 
          className="mt-4 md:mt-0 px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-700 transition-colors"
        >
          + 去練習更多
        </Link>
      </div>
      
      {mistakes.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-xl text-slate-800 font-bold mb-2">太棒了！目前沒有錯題</p>
          <p className="text-slate-500">保持這個節奏，繼續刷題吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mistakes.map((item) => {
            const q = item.question;
            if (!q) return null; // 避免題目被刪除導致報錯
            
            const isEssay = q.type === 'essay';
            let safeOptions: string[] = [];
            try {
              safeOptions = Array.isArray(q.options) ? q.options : JSON.parse(q.options);
            } catch(e) { safeOptions = [] }

            return (
              <div key={item.id} className="bg-white p-6 rounded-xl border border-red-100 shadow-sm hover:shadow-md transition-all relative group">
                
                {/* 移除按鈕 (右上角) */}
                <button 
                  onClick={() => removeMistake(item.id)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors p-2"
                  title="我學會了，移除此題"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>

                {/* 標籤列 */}
                <div className="flex flex-wrap gap-2 mb-4 pr-10">
                  <span className={`text-xs px-2 py-1 rounded font-bold border ${isEssay ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                    {isEssay ? '📝 申論' : '☑️ 選擇'}
                  </span>
                  <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded font-mono">
                    {q.year} | {q.subject}
                  </span>
                </div>
                
                {/* 題目 */}
                <h3 className="text-lg font-bold text-slate-800 mb-4 leading-relaxed">
                  {q.content}
                </h3>
                
                {/* 答案與詳解區 */}
                <div className="bg-slate-50 rounded-lg overflow-hidden">
                   {isVip ? (
                     <div className="p-4">
                       <div className="flex justify-between items-center mb-3">
                         <p className={`font-bold ${isEssay ? 'text-purple-700' : 'text-green-700'}`}>
                           {isEssay ? '💡 參考解析' : `✅ 正確答案：${cleanText(q.answer)}`}
                         </p>
                         <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">VIP</span>
                       </div>
                       <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                         {q.explanation?.replace(/\\n/g, '\n')}
                       </div>
                       {q.concept_slug && (
                          <Link href={`/dashboard/knowledge/${q.concept_slug}`} target="_blank" className="inline-flex items-center text-xs font-bold text-blue-600 mt-3 hover:underline">
                            📖 延伸閱讀
                          </Link>
                       )}
                     </div>
                   ) : (
                     <div className="p-4 relative">
                       <p className="font-bold text-slate-300 blur-[3px] mb-2">正確答案：VIP可見</p>
                       <p className="text-sm text-slate-300 blur-[3px] leading-relaxed">
                         這是一段非常精彩的解析，關於這個題目的詳細觀念與解題技巧...
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
                   <span className="text-xs text-slate-400">錯誤時間：{new Date(item.created_at).toLocaleDateString()}</span>
                   <ReportButton questionId={q.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}