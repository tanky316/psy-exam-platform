"use client";

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname(); // 用來判斷現在在哪一頁，讓圖示變色

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
         // router.push('/login'); 
      } else {
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

  // 登出功能
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/'); // 登出後踢回首頁
    router.refresh();
  };

  // 定義選單項目
  const navItems = [
    { name: '總覽', href: '/dashboard', icon: '🏠' },
    { name: '題庫', href: '/dashboard/exam', icon: '📝' },
    { name: '知識', href: '/dashboard/knowledge', icon: '📚' },
    { name: '徵求', href: '/dashboard/recruitment', icon: '📢' },
    { name: '錯題', href: '/dashboard/mistakes', icon: '📒' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* --- 電腦版側邊欄 (Desktop Sidebar) --- */}
      <aside className="hidden md:flex w-64 border-r border-slate-200 bg-white flex-col fixed h-full z-10">
        <div className="p-6 border-b border-slate-100">
          <Link href="/">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight cursor-pointer">
              🧠 心理師數據庫
            </h1>
          </Link>
          <p className="text-xs text-slate-500 mt-1">v1.0.0 Pro</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                pathname === item.href ? 'bg-slate-100 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="mr-3">{item.icon}</span> {item.name}
            </Link>
          ))}
          <Link href="/dashboard/about" className="flex items-center px-3 py-2 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="mr-3">👤</span> 關於作者
          </Link>
        </nav>

        {/* 使用者與登出區塊 */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center mb-3">
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs ${user?.is_vip ? 'bg-amber-500' : 'bg-blue-600'}`}>
              {user?.email ? user.email.charAt(0).toUpperCase() : 'G'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-xs font-bold text-slate-700 truncate">{user?.email || '載入中...'}</p>
              <p className={`text-[10px] font-bold ${user?.is_vip ? 'text-amber-600' : 'text-slate-500'}`}>
                {user?.is_vip ? '👑 VIP會員' : '🌱 免費會員'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full py-1.5 text-xs text-red-500 border border-red-200 rounded hover:bg-red-50 transition-colors"
          >
            登出帳號
          </button>
        </div>
      </aside>

      {/* --- 手機版底部導航 (Mobile Bottom Nav) --- */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 z-50 flex justify-around items-center h-16 pb-safe">
        {navItems.map((item) => (
          <Link 
            key={item.href}
            href={item.href} 
            className={`flex flex-col items-center justify-center w-full h-full ${
              pathname === item.href ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <span className="text-xl mb-0.5">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        ))}
        {/* 手機版登出按鈕 (放在更多裡面，這裡簡單做，直接放最後一個) */}
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center justify-center w-full h-full text-slate-400"
        >
          <span className="text-xl mb-0.5">🚪</span>
          <span className="text-[10px] font-medium">登出</span>
        </button>
      </div>

      {/* --- 右側主要內容區 (配合手機版底部留白) --- */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 md:ml-64 mb-16 md:mb-0">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}