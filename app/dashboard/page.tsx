"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { client } from "@/lib/sanity";
import MistakeChart from "@/components/MistakeChart";

export default function DashboardPage() {
  // [修改 1] 將 userEmail 改為 displayName，預設值為 "準心理師"
  const [displayName, setDisplayName] = useState("準心理師");
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [dailyTopic, setDailyTopic] = useState<any>(null);
  const router = useRouter();

  // 1. 國考倒數計時邏輯 (設定為 2026 年)
  const examDate = new Date('2026-07-20');
  const today = new Date();
  const diffTime = Math.max(0, examDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // 2. 初始化數據
  useEffect(() => {
    const initData = async () => {
      // (A) 驗證使用者
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // [修改 2] 抓取 Profile 資料以顯示暱稱
      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .single();

      // 優先使用暱稱，沒有則使用 Email 前綴
      const nameToShow = profile?.nickname || user.email?.split('@')[0] || "準心理師";
      setDisplayName(nameToShow);

      // (B) 抓取最新公告 (Sanity)
      try {
        const newsData = await client.fetch(`*[_type == "announcement"] | order(publishedAt desc)[0...3]`);
        setAnnouncements(newsData);
      } catch (e) { console.error("公告載入失敗", e); }

      // (C) 抓取每日一讀 (Sanity - 隨機取一篇)
      try {
        const topics = await client.fetch(`*[_type == "knowledge"][0...10] { title, slug, categories[]->{title} }`);
        if (topics.length > 0) {
          const random = topics[Math.floor(Math.random() * topics.length)];
          setDailyTopic(random);
        }
      } catch (e) { console.error("每日一讀載入失敗", e); }
    };

    initData();
  }, [router]);

  return (
    <div className="space-y-8 font-sans text-slate-900">
      
      {/* 1. 歡迎標題 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {/* [修改 3] 直接顯示 displayName，不再需要 split */}
            Yo~<span className="text-blue-600">{displayName}</span> ！
          </h1>
          <p className="text-slate-500 mt-2">準備好今天的練習了嗎？這是目前的學習概況：</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs text-slate-400">今天是 {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* 2. Hero 區塊：倒數計時 + 每日一讀 */}
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-8">
          {/* 左側：倒數資訊 */}
          <div className="relative z-10 max-w-lg w-full">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">距離 115 年高考還有：</h2>
              <div className="flex gap-4 items-center mt-4">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4 min-w-[100px] text-center border border-white/10">
                      <div className="text-4xl font-extrabold text-blue-400">{diffDays}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Days Left</div>
                  </div>
                  <div className="flex flex-col text-sm text-slate-400 space-y-1">
                      <span className="flex items-center gap-2">📅 考試日期：2026/07/20</span>
                      <span className="text-blue-200">💪 堅持就是勝利！</span>
                  </div>
              </div>
          </div>

          {/* 右側：每日一讀卡片 */}
          {dailyTopic && (
              <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl w-full lg:w-80 hover:bg-white/20 transition-all cursor-pointer group">
                  <Link href={`/dashboard/knowledge/${dailyTopic.slug?.current}`}>
                      <div className="flex justify-between items-start mb-2">
                          <div className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              💡 Daily Pick
                          </div>
                          <span className="text-xs text-slate-400 group-hover:text-white transition-colors">每日一讀</span>
                      </div>
                      <h3 className="font-bold text-lg mb-3 line-clamp-2 leading-snug">{dailyTopic.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                          {dailyTopic.categories?.map((c: any) => (
                              <span key={c.title} className="text-[10px] bg-slate-800/80 px-2 py-1 rounded text-slate-300 border border-slate-700">
                                  {c.title}
                              </span>
                          ))}
                      </div>
                      <div className="text-xs text-right text-blue-300 group-hover:translate-x-1 transition-transform">
                          點擊閱讀 →
                      </div>
                  </Link>
              </div>
          )}

          {/* 裝飾背景 */}
          <div className="absolute right-0 bottom-0 opacity-5 text-[10rem] transform translate-x-10 translate-y-10 select-none pointer-events-none">⏳</div>
      </div>

      {/* 3. 核心功能區 (Grid 佈局) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 左側：雷達圖 + 快捷入口 (佔 2 欄) */}
          <div className="lg:col-span-2 space-y-6">
               {/* 雷達圖元件 (自動抓取錯題數據) */}
               <MistakeChart />
               
               {/* 四大功能捷徑 */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link href="/dashboard/exam" className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📝</div>
                      <div>
                          <h4 className="font-bold text-slate-900">模擬題庫</h4>
                          <p className="text-xs text-slate-500">歷屆試題與計時測驗</p>
                      </div>
                  </Link>
                  <Link href="/dashboard/knowledge" className="bg-white p-6 rounded-xl border border-slate-200 hover:border-green-500 hover:shadow-md transition-all group flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📚</div>
                      <div>
                          <h4 className="font-bold text-slate-900">知識資料庫</h4>
                          <p className="text-xs text-slate-500">核心考點詳解</p>
                      </div>
                  </Link>
                  <Link href="/dashboard/mistakes" className="bg-white p-6 rounded-xl border border-slate-200 hover:border-red-500 hover:shadow-md transition-all group flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📕</div>
                      <div>
                          <h4 className="font-bold text-slate-900">錯題本</h4>
                          <p className="text-xs text-slate-500">複習您的學習弱點</p>
                      </div>
                  </Link>
                  <Link href="/dashboard/bookmarks" className="bg-white p-6 rounded-xl border border-slate-200 hover:border-yellow-500 hover:shadow-md transition-all group flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⭐</div>
                      <div>
                          <h4 className="font-bold text-slate-900">收藏夾</h4>
                          <p className="text-xs text-slate-500">重點題目隨時複習</p>
                      </div>
                  </Link>
               </div>
          </div>

          {/* 右側：側邊資訊欄 (佔 1 欄) */}
          <div className="space-y-6">
              
              {/* 公告欄 */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-900">📢 最新公告</h3>
                      <span className="text-xs text-slate-400">System News</span>
                  </div>
                  <div className="space-y-4">
                      {announcements.length > 0 ? announcements.map((news: any) => (
                          <div key={news._id} className="pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                              <div className="flex items-center gap-2 mb-1">
                                  <span className={`w-2 h-2 rounded-full ${news.isImportant ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                                  <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{news.title}</h4>
                              </div>
                              <p className="text-xs text-slate-500 pl-4">{new Date(news.publishedAt).toLocaleDateString()}</p>
                          </div>
                      )) : (
                          <div className="text-center text-slate-400 text-sm py-4">目前無最新公告</div>
                      )}
                  </div>
              </div>

              {/* 招募廣告 */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100">
                  <h3 className="font-bold text-indigo-900 text-sm mb-2">🎓 學術研究招募</h3>
                  <p className="text-xs text-indigo-700/80 mb-3">尋找受試者或參與研究，累積學術資源。</p>
                  <Link href="/dashboard/recruitment" className="text-xs font-bold text-indigo-600 hover:underline">
                      前往佈告欄 →
                  </Link>
              </div>
          </div>
      </div>

    </div>
  );
}