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
  const [user, setUser] = useState<any>(null); // 使用 any 以便容納 profile 資料
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      // 1. 先確認登入
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // 如果沒登入，踢回去 (開發測試時若覺得煩可先註解掉下一行)
        // router.push('/login');
      } else {
        // 2. [關鍵] 去 profiles 表查這個人的等級
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // 3. 把 user (帳號資料) 和 profile (會員檔案) 合併存起來
        // 這樣 user.email 和 user.is_vip 都可以用
        setUser({ ...user, ...profile });
      }
    };
    checkUser();
  }, [router]);

  return (
    <div className="flex h-screen bg-white">
      {/* --- 左側側邊欄 Sidebar --- */}
      <aside className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col fixed md:relative h-full z-10">

        {/* Logo 區 */}
        <div className="p-6 border-b border-slate-100">
          <Link href="/">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight cursor-pointer">
              🧠 心理師數據庫
            </h1>
          </Link>
          <p className="text-xs text-slate-500 mt-1">v1.0.0 Pro</p>
        </div>

        {/* 選單區 */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
            平台功能
          </div>
          <Link href="/dashboard" className="flex items-center px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <span className="mr-3">🏠</span> 總覽
          </Link>
          <Link href="/dashboard/knowledge" className="flex items-center px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <span className="mr-3">📂</span> 心理學資料庫
          </Link>
          <Link href="/dashboard/exam" className="flex items-center px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <span className="mr-3">📝</span> 國考題庫
          </Link>
          <Link href="/dashboard/research" className="flex items-center px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <span className="mr-3">📚</span> 最新研究
          </Link>
          <Link href="/dashboard/mistakes" className="flex items-center px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <span className="mr-3">📒</span> 我的錯題
          </Link>
          <Link href="/dashboard/recruitment" className="flex items-center px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <span className="mr-3">📢</span> 受試者徵求
          </Link>
          <Link href="/dashboard/about" className="flex items-center px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <span className="mr-3">👤</span> 關於作者
          </Link>
        </nav>

        {/* 使用者區塊 */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center overflow-hidden">
            {/* 頭像：顯示 Email 首字，VIP 變金色，免費會員變藍色 */}
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs ${user?.is_vip ? 'bg-amber-500' : 'bg-blue-600'}`}>
              {user?.email ? user.email.charAt(0).toUpperCase() : 'G'}
            </div>

            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-slate-700 truncate" title={user?.email}>
                {user?.email || '載入中...'}
              </p>

              {/* [修改] 顯示會員等級 */}
              <p className={`text-xs font-bold mt-0.5 ${user?.is_vip ? 'text-amber-500' : 'text-slate-500'}`}>
                {user?.is_vip ? '👑 VIP尊榮會員' : '🌱 免費會員'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- 右側主要內容區 --- */}
      <main className="flex-1 overflow-y-auto bg-white p-8 ml-64 md:ml-0">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}