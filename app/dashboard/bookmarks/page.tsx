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

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVip, setIsVip] = useState(false);
  const router = useRouter();

  // 移除收藏
  const removeBookmark = async (id: number) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
    await supabase.from('bookmarks').delete().eq('id', id);
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. 抓 VIP
      const { data: profile } = await supabase.from('profiles').select('is_vip').eq('id', user.id).single();
      setIsVip(profile?.is_vip || false);

      // 2. 抓收藏
      const { data } = await supabase
        .from('bookmarks')
        .select(`
          id,
          created_at,
          question:questions (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setBookmarks(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-20 text-center text-slate-500 animate-pulse">正在讀取收藏夾...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <span className="text-yellow-400 text-4xl">★</span> 我的收藏夾
          </h2>
          <p className="text-slate-500 mt-2">
            共收藏 <span className="font-bold text-amber-600 text-lg mx-1">{bookmarks.length}</span> 題重要考點
          </p>
        </div>
        <Link 
          href="/dashboard/exam" 
          className="mt-4 md:mt-0 px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-700 transition-colors"
        >
          + 去發掘更多
        </Link>
      </div>
      
      {bookmarks.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
          <div className="text-5xl mb-4 text-slate-300">☆</div>
          <p className="text-xl text-slate-800 font-bold mb-2">收藏夾是空的</p>
          <p className="text-slate-500">看到重要的題目，記得點擊右上角的星星喔！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bookmarks.map((item) => {
            const q = item.question;
            if (!q) return null;
            
            const isEssay = q.type === 'essay';
            
            return (
              <div key={item.id} className="bg-white p-6 rounded-xl border border-amber-100 shadow-sm hover:shadow-md transition-all relative group">
                
                {/* 移除收藏按鈕 (實心星星) */}
                <button 
                  onClick={() => removeBookmark(item.id)}
                  className="absolute top-4 right-4 text-yellow-400 hover:text-slate-300 transition-colors text-2xl leading-none p-1"
                  title="取消收藏"
                >
                  ★
                </button>

                <div className="flex flex-wrap gap-2 mb-4 pr-10">
                  <span className={`text-xs px-2 py-1 rounded font-bold border ${isEssay ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                    {isEssay ? '📝 申論' : '☑️ 選擇'}
                  </span>
                  <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded font-mono">
                    {q.year} | {q.subject}
                  </span>
                </div>
                
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
                         解析內容已隱藏...請升級會員以查看完整解析與知識點連動。
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
            );
          })}
        </div>
      )}
    </div>
  );
}