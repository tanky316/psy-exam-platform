import Link from 'next/link';
import React from 'react'; // 明確引入 React 避免錯誤

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-white">
      {/* --- 左側側邊欄 Sidebar --- */}
      <aside className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col fixed md:relative h-full z-10">
        
        {/* Logo 區 */}
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            🧠 心理師數據庫
          </h1>
          <p className="text-xs text-slate-500 mt-1">v1.0.0 Pro</p>
        </div>

        {/* 選單區 */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
            平台功能
          </div>
          
          <Link href="/dashboard" className="flex items-center px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <span className="mr-3">🏠</span>
            總覽 (Home)
          </Link>

          <Link href="/dashboard/exam" className="flex items-center px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <span className="mr-3">📝</span>
            國考題庫 (Exam)
          </Link>

          <Link href="/dashboard/research" className="flex items-center px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
            <span className="mr-3">📚</span>
            最新研究 (Research)
          </Link>
        </nav>

        {/* 底部使用者區 */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              U
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-700">User</p>
              <p className="text-xs text-slate-500">標準會員</p>
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