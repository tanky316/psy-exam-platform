"use client";

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUser({ ...user, ...profile });
      }
    };
    checkUser();
  }, [router]);

  return (
    <div className="flex h-screen bg-white">
      
      {/* --- 電腦版側邊欄 (Sidebar) --- */}
      {/* [修改] 加上 hidden md:flex：在手機上隱藏，在中型螢幕以上顯示 */}
      <aside className="hidden md:flex w-64 border-r border-slate-200 bg-slate-50 flex-col fixed h-full z-10">
        
        <div className="p-6 border-b border-slate-100">
          <Link href="/">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight cursor-pointer">
              🧠 心理師數據庫
            </h1>
          </Link>
          <p className="text-xs text-slate-500 mt-1">v1.0.0 Pro</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
            平台功能
          </div>
          <Link href="/dashboard" className="flex items-center px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <span className="mr-3">🏠</span> 總覽
          </Link>
          <Link href="/dashboard/exam" className="flex items-center px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <span className="mr-3">📝</span> 國考題庫
          </Link>
          <Link href="/dashboard/knowledge" className="flex items-center px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <span className="mr-3">📚</span> 知識資料庫
          </Link>
          <Link href="/dashboard/research" className="flex items-center px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <span className="mr-3">🔬</span> 最新研究
          </Link>
          <Link href="/dashboard/recruitment" className="flex items-center px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <span className="mr-3">📢</span> 受試者徵求
          </Link>
          <Link href="/dashboard/mistakes" className="flex items-center px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <span className="mr-3">📒</span> 我的錯題
          </Link>
          <Link href="/dashboard/about" className="flex items-center px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <span className="mr-3">👤</span> 關於作者
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center overflow-hidden">
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs ${user?.is_vip ? 'bg-amber-500' : 'bg-blue-600'}`}>
              {user?.email ? user.email.charAt(0).toUpperCase() : 'G'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-slate-700 truncate" title={user?.email}>
                {user?.email || '載入中...'}
              </p>
              <p className={`text-xs font-bold mt-0.5 ${user?.is_vip ? 'text-amber-500' : 'text-slate-500'}`}>
                {user?.is_vip ? '👑 VIP尊榮會員' : '🌱 免費會員'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- 手機版底部導航列 (Bottom Bar) --- */}
      {/* [新增] 這是手機專用的選單，固定在底部，只在手機顯示 (md:hidden) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center p-3 z-50 shadow-lg pb-safe">
        <Link href="/dashboard" className="flex flex-col items-center text-slate-600 hover:text-blue-600">
          <span className="text-xl">🏠</span>
          <span className="text-[10px]">總覽</span>
        </Link>
        <Link href="/dashboard/exam" className="flex flex-col items-center text-slate-600 hover:text-blue-600">
          <span className="text-xl">📝</span>
          <span className="text-[10px]">題庫</span>
        </Link>
        <Link href="/dashboard/knowledge" className="flex flex-col items-center text-slate-600 hover:text-blue-600">
          <span className="text-xl">📚</span>
          <span className="text-[10px]">知識</span>
        </Link>
        <Link href="/dashboard/recruitment" className="flex flex-col items-center text-slate-600 hover:text-blue-600">
          <span className="text-xl">📢</span>
          <span className="text-[10px]">徵求</span>
        </Link>
        <Link href="/dashboard/about" className="flex flex-col items-center text-slate-600 hover:text-blue-600">
          <span className="text-xl">👤</span>
          <span className="text-[10px]">作者</span>
        </Link>
      </div>

      {/* --- 主要內容區 --- */}
      {/* [修改] pb-24: 手機版底部留白給導航列; md:ml-64: 電腦版左邊留白給側邊欄; ml-0: 手機版左邊不留白 */}
      <main className="flex-1 overflow-y-auto bg-white p-4 md:p-8 ml-0 md:ml-64 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
// fix mobile layout。