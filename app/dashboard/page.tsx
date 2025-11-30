"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { client } from "@/lib/sanity";
import { supabase } from "@/lib/supabase";

export default function DashboardHome() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [mistakeCount, setMistakeCount] = useState<number | null>(null);
  const [dailyTopic, setDailyTopic] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  
  // 計算國考倒數 (假設下次考試是 2025/07/20，您可以每年修改)
  const examDate = new Date('2025-07-20');
  const today = new Date();
  const diffTime = Math.abs(examDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  useEffect(() => {
    // 1. 抓取公告
    const fetchNews = async () => {
      const data = await client.fetch(`*[_type == "announcement"] | order(publishedAt desc)[0...3]`);
      setAnnouncements(data);
    };

    // 2. 隨機推薦一篇文章 (每日一讀)
    const fetchRandomTopic = async () => {
      // 這裡簡單抓最新的 10 篇然後隨機選一篇，避免效能問題
      const topics = await client.fetch(`*[_type == "knowledge"][0...10] { title, slug, categories[]->{title} }`);
      if (topics.length > 0) {
        const random = topics[Math.floor(Math.random() * topics.length)];
        setDailyTopic(random);
      }
    };

    // 3. 抓取學習數據 & 使用者資料
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { count } = await supabase
          .from('wrong_answers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        setMistakeCount(count);
      }
    };

    fetchNews();
    fetchRandomTopic();
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* --- 歡迎橫幅 (Hero Section) --- */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-3xl font-bold mb-2">
            準備好面對挑戰了嗎？
          </h2>
          <p className="text-slate-300 mb-6">
            距離 114 年第二次諮商心理師高考還有：
          </p>
          <div className="flex gap-4 text-center">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 min-w-[80px]">
              <div className="text-3xl font-bold text-blue-400">{diffDays}</div>
              <div className="text-xs text-slate-400 uppercase">Days</div>
            </div>
            <div className="flex flex-col justify-center text-sm text-slate-400 text-left">
              <span>考試日期：2025/07/20</span>
              <span>加油，堅持就是勝利！</span>
            </div>
          </div>
        </div>
        
        {/* 每日一讀卡片 (浮在右邊) */}
        {dailyTopic && (
          <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl w-full md:w-80 hover:bg-white/20 transition-colors cursor-pointer">
            <Link href={`/dashboard/knowledge/${dailyTopic.slug?.current}`}>
              <div className="text-xs text-amber-400 font-bold mb-2 uppercase tracking-wider">
                💡 Daily Pick 每日一讀
              </div>
              <h3 className="font-bold text-lg mb-2 line-clamp-1">{dailyTopic.title}</h3>
              <div className="flex gap-2">
                {dailyTopic.categories?.map((c: any) => (
                  <span key={c.title} className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                    {c.title}
                  </span>
                ))}
              </div>
              <div className="mt-3 text-xs text-right text-blue-300">點擊閱讀 →</div>
            </Link>
          </div>
        )}

        {/* 背景裝飾 */}
        <div className="absolute right-0 bottom-0 opacity-5 text-9xl transform translate-x-10 translate-y-10 select-none">
          ⏳
        </div>
      </div>

      {/* --- 數據儀表板 (Stats & Shortcuts) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. 錯題本狀態 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">待複習錯題</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-red-600">{mistakeCount !== null ? mistakeCount : '-'}</span>
              <span className="text-slate-400">題</span>
            </div>
          </div>
          <Link href="/dashboard/mistakes" className="mt-4 text-sm text-blue-600 font-bold hover:underline">
            前往複習錯題 →
          </Link>
        </div>

        {/* 2. 國考題庫入口 */}
        <Link href="/dashboard/exam" className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-md text-white hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col justify-between group">
          <div>
            <div className="text-blue-100 text-sm font-bold mb-1">開始刷題</div>
            <h3 className="text-2xl font-bold">歷屆試題練習</h3>
          </div>
          <div className="self-end bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
            📝
          </div>
        </Link>

        {/* 3. 最新研究入口 */}
        <Link href="/dashboard/research" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-purple-400 transition-all flex flex-col justify-between group">
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">最新研究</h3>
            <p className="text-slate-800 font-bold">探索心理學前沿趨勢與期刊導讀</p>
          </div>
          <div className="self-end text-purple-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
            閱讀專欄 →
          </div>
        </Link>
      </div>

      {/* --- 底部區塊：公告與其他 --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 公告欄 */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-900 mb-4 flex items-center">
             📢 平台最新公告
           </h3>
           <div className="space-y-4">
             {announcements.length > 0 ? announcements.map((news: any) => (
               <div key={news._id} className="flex items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                 <div className={`mt-1.5 w-2 h-2 rounded-full mr-3 flex-shrink-0 ${news.isImportant ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                 <div>
                   <h4 className="text-slate-800 font-medium hover:text-blue-600 cursor-pointer">{news.title}</h4>
                   <p className="text-xs text-slate-400 mt-1">
                     {new Date(news.publishedAt).toLocaleDateString()}
                   </p>
                 </div>
               </div>
             )) : (
               <div className="text-slate-400 italic text-sm">目前無最新公告</div>
             )}
           </div>
        </div>

        {/* 徵求與關於 */}
        <div className="space-y-4">
          <Link href="/dashboard/recruitment" className="block bg-amber-50 p-4 rounded-xl border border-amber-100 hover:bg-amber-100 transition-colors">
            <h4 className="font-bold text-amber-800 mb-1">📢 受試者徵求</h4>
            <p className="text-xs text-amber-600">刊登或參與學術研究</p>
          </Link>
          
          <Link href="/dashboard/about" className="block bg-slate-50 p-4 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
             <h4 className="font-bold text-slate-700 mb-1">👤 關於作者</h4>
             <p className="text-xs text-slate-500">了解更多服務與背景</p>
          </Link>
        </div>
      </div>
    </div>
  );
}