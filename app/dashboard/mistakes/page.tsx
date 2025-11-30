"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 移除錯題的功能 (複習完了就可以刪掉)
  const removeMistake = async (id: number) => {
    await supabase.from('wrong_answers').delete().eq('id', id);
    setMistakes(mistakes.filter(m => m.id !== id)); // 更新畫面
  };

  useEffect(() => {
    const fetchMistakes = async () => {
      // 1. 檢查登入
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 2. 抓取錯題，並「關聯(Join)」抓出原始題目資料
      // 語法 explanation: select(*, question:questions(*)) 意思是我要錯題表的所有欄位，外加對應的那題題目
      const { data, error } = await supabase
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

    fetchMistakes();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">載入錯題中...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">📒 我的錯題本</h2>
      
      {mistakes.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <p className="text-lg text-slate-600 mb-2">太棒了！目前沒有錯題。</p>
          <p className="text-slate-400">快去 <a href="/dashboard/exam" className="text-blue-600 underline">題庫練習</a> 吧！</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {mistakes.map((item) => {
            const q = item.question; // 這是關聯抓出來的題目物件
            return (
              <div key={item.id} className="bg-white p-6 rounded-xl border border-red-100 shadow-sm relative group">
                {/* 移除按鈕 */}
                <button 
                  onClick={() => removeMistake(item.id)}
                  className="absolute top-4 right-4 text-xs bg-white border border-slate-200 text-slate-400 px-3 py-1 rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                >
                  複習完成 (移除)
                </button>

                <div className="text-xs text-red-400 mb-2 font-mono">
                  錯誤時間：{new Date(item.created_at).toLocaleDateString()}
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-4 pr-12">
                  {q.content}
                </h3>
                
                {/* 顯示正確答案與解析 */}
                <div className="bg-slate-50 p-4 rounded-lg text-sm">
                  <p className="font-bold text-green-700 mb-2">✅ 正確答案：{q.answer}</p>
                  <p className="text-slate-600 leading-relaxed"><span className="font-semibold">解析：</span>{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}