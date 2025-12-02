"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import QuestionCard from '@/components/QuestionCard';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBookmarks = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 抓取收藏表，並關聯抓出題目資料
      const { data, error } = await supabase
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

    fetchBookmarks();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">載入收藏中...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
        <span className="text-yellow-400 mr-2 text-3xl">★</span> 我的收藏題庫
      </h2>
      
      {bookmarks.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <p className="text-lg text-slate-600 mb-2">您的收藏夾是空的。</p>
          <p className="text-slate-400">在練習題目時點擊右上角的星星，即可收藏題目！</p>
          <a href="/dashboard/exam" className="text-blue-600 underline mt-4 inline-block">
            前往題庫練習
          </a>
        </div>
      ) : (
        <div className="grid gap-8">
          {bookmarks.map((item) => (
            <div key={item.id} className="relative">
              {/* 顯示題目卡片 */}
              <QuestionCard question={item.question} />
              
              {/* 顯示收藏時間 */}
              <div className="absolute top-0 left-0 -mt-6 text-xs text-slate-400 pl-2">
                收藏於：{new Date(item.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}