"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const pathname = usePathname(); // 用來判斷目前在哪一頁，可以做 Active 樣式

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // 定義選單項目，方便維護
  const navItems = [
    { name: "模擬考試", href: "/dashboard/exam", icon: "✍️" },
    { name: "我的錯題", href: "/dashboard/mistakes", icon: "📕" },
    { name: "收藏題目", href: "/dashboard/bookmarks", icon: "⭐" },
    { name: "研究招募", href: "/dashboard/recruitment", icon: "📢" },
    { name: "知識庫", href: "/dashboard/knowledge", icon: "🧠" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-[999] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          
          {/* Logo */}
          <Link href="/dashboard" className="flex-shrink-0 flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <span className="font-bold text-xl tracking-tight text-slate-900 hidden md:block">心理師數據庫</span>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">Dashboard</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'}`}
                >
                  {item.name}
                </Link>
              );
            })}
            
            <div className="h-4 w-[1px] bg-slate-300 mx-2"></div>

            {/* 用戶資訊與設定 */}
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard/settings"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${pathname === '/dashboard/settings' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
                title="個人設定"
              >
                <span>⚙️</span>
                <span className="text-sm font-medium max-w-[100px] truncate">{userEmail?.split('@')[0]}</span>
              </Link>
              
              <button 
                onClick={handleLogout}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700 transition-transform hover:scale-105 shadow-sm text-sm"
              >
                登出
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-slate-800 hover:bg-slate-100 border border-slate-200 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl z-[998] animate-in slide-in-from-top-2">
          <div className="p-4 space-y-2">
            <div className="px-4 py-2 text-sm text-slate-400 border-b border-slate-100 mb-2 flex justify-between items-center">
              <span>登入者：{userEmail}</span>
              <Link href="/dashboard/settings" className="text-blue-600 font-bold" onClick={() => setIsMenuOpen(false)}>
                ⚙️ 設定
              </Link>
            </div>
            
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className="block px-4 py-3 rounded-lg hover:bg-slate-50 font-bold text-slate-700 flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>{item.icon}</span> {item.name}
              </Link>
            ))}
            
            <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-lg text-red-500 font-bold hover:bg-red-50 mt-2">
              登出
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}