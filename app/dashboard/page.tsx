"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { client } from "@/lib/sanity";
import { supabase } from "@/lib/supabase";
import MistakeChart from "@/components/MistakeChart"; // [新增] 引入圖表

export default function DashboardHome() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [mistakeCount, setMistakeCount] = useState<number | null>(null);
  const [dailyTopic, setDailyTopic] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [allMistakes, setAllMistakes] = useState<any[]>([]); // [新增] 儲存完整錯題資料給圖表用
  
  // 國考倒數
  const examDate = new Date('2025-07-20');
  const today = new Date();
  const diffTime = Math.abs(examDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  useEffect(() => {
    // 1. 抓公告
    const fetchNews = async () => {
      const data = await client.fetch(`*[_type == "announcement"] | order(publishedAt desc)[0...3]`);
      setAnnouncements(data);
    };

    // 2. 每日一讀
    const fetchRandomTopic = async () => {
      const topics = await client.fetch(`*[_type == "knowledge"][0...10] { title, slug, categories[]->{title} }`);
      if (topics.length > 0) {
        const random = topics[Math.floor(Math.random() * topics.length)];
        setDailyTopic(random);
      }
    };

    // 3. 抓使用者數據 (包含圖表資料)
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // [修改] 抓取錯題資料 (需要關聯題目 subject)
        const { data, count } = await supabase
          .from('wrong_answers')
          .select('question:questions(subject)', { count: 'exact' })
          .eq('user_id', user.id);
          
        setMistakeCount(count);
        if (data) setAllMistakes(data);
      }
    };

    fetchNews();
    fetchRandomTopic();
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
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
        
        <div className="absolute right-0 bottom-0 opacity-5 text-9xl transform translate-x-10 translate-y-10 select-none">
          ⏳
        </div>
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/exam" className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">📝</div>
          <h4 className="font-bold text-slate-900">國考題庫</h4>
          <p className="text-xs text-slate-500 mt-1">累積刷題，精熟考點</p>
        </Link>
        <Link href="/dashboard/knowledge" className="bg-white p-6 rounded-xl border border-slate-200 hover:border-green-500 hover:shadow-md transition-all group">
          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">📚</div>
          <h4 className="font-bold text-slate-900">知識資料庫</h4>
          <p className="text-xs text-slate-500 mt-1">六大考科理論詳解</p>
        </Link>
        <Link href="/dashboard/recruitment" className="bg-white p-6 rounded-xl border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all group">
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">📢</div>
          <h4 className="font-bold text-slate-900">受試者徵求</h4>
          <p className="text-xs text-slate-500 mt-1">尋找研究資源</p>
        </Link>
        <Link href="/dashboard/about" className="bg-white p-6 rounded-xl border border-slate-200 hover:border-amber-500 hover:shadow-md transition-all group">
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">👤</div>
          <h4 className="font-bold text-slate-900">關於作者</h4>
          <p className="text-xs text-slate-500 mt-1">諮商督導與服務</p>
        </Link>
      </div>
      
      {/* Stats & News */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* [修改] 學習弱點分析圖表 */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-slate-900">📊 弱點分析 (錯題分布)</h3>
             <Link href="/dashboard/mistakes" className="text-xs text-blue-600 hover:underline">前往錯題本 →</Link>
          </div>
          
          <div className="flex gap-6 flex-col md:flex-row">
             {/* 左側數字 */}
             <div className="flex-shrink-0 flex flex-row md:flex-col gap-4 md:w-32">
                <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center flex-1">
                  <p className="text-xs text-red-600 mb-1 font-bold">累積錯題</p>
                  <p className="text-3xl font-extrabold text-red-700">
                    {mistakeCount !== null ? mistakeCount : '-'}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center flex-1">
                  <p className="text-xs text-blue-600 mb-1 font-bold">本週活躍</p>
                  <p className="text-xs text-blue-400 mt-1">持續練習!</p>
                </div>
             </div>
             
             {/* 右側圖表 */}
             <div className="flex-1 bg-white">
                {/* 載入圖表元件 */}
                <MistakeChart mistakes={allMistakes} />
             </div>
          </div>
        </div>

        {/* 公告欄 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
           <h3 className="font-bold text-slate-900 mb-4 flex items-center">
             📢 平台最新公告
           </h3>
           <div className="space-y-4 flex-1">
             {announcements.length > 0 ? announcements.map((news: any) => (
               <div key={news._id} className="flex items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                 <div className={`mt-1.5 w-2 h-2 rounded-full mr-3 flex-shrink-0 ${news.isImportant ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                 <div>
                   <h4 className="text-slate-800 font-medium hover:text-blue-600 cursor-pointer text-sm">{news.title}</h4>
                   <p className="text-xs text-slate-400 mt-1">
                     {new Date(news.publishedAt).toLocaleDateString()}
                   </p>
                 </div>
               </div>
             )) : (
               <div className="text-slate-400 italic text-sm py-8 text-center">目前無最新公告</div>
             )}
           </div>
           
           <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-2">覺得平台不錯嗎？</p>
              <button className="w-full py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                 分享給朋友
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}