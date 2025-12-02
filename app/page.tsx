"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  // 控制手機版選單開關
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900">
      
      {/* --- 1. 頂部導覽列 (Navbar) --- */}
      <nav className="w-full border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
              <span className="text-2xl">🧠</span>
              <span className="font-bold text-xl tracking-tight">心理師數據庫</span>
            </div>

            {/* 電腦版選單 (Desktop) - 螢幕大時顯示 */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login" className="text-slate-500 hover:text-slate-900 font-medium px-3 py-2 transition-colors">
                會員登入
              </Link>
              <Link 
                href="/login" 
                className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-bold hover:bg-slate-800 transition-transform hover:scale-105 shadow-md"
              >
                免費註冊
              </Link>
            </div>

            {/* 手機版選單按鈕 (Mobile) - 螢幕小時顯示 */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-slate-600 hover:bg-slate-100 focus:outline-none"
              >
                {/* 漢堡圖示 */}
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 手機版下拉選單 (Mobile Menu Dropdown) */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 shadow-lg animate-in slide-in-from-top-2">
            <div className="px-4 pt-4 pb-6 space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">會員專區</p>
              <Link 
                href="/login" 
                className="block w-full text-center bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                登入帳號
              </Link>
              <Link 
                href="/login" 
                className="block w-full text-center bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-md"
                onClick={() => setIsMenuOpen(false)}
              >
                ✨ 免費註冊
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* --- 2. 主要內容區 (Hero) --- */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 sm:py-24 text-center">
        
        <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 border border-blue-100">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          專為諮商心理師國考設計
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 max-w-4xl leading-tight">
          結合 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">AI 智能解析</span> <br className="hidden sm:block" />
          與完整知識體系的備考平台
        </h1>

        <p className="text-lg sm:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          不再只是刷題。我們整合了歷屆試題、錯題分析、申論題詳解以及心理學知識庫，助您一次通過諮商心理師高考。
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            href="/login" 
            className="w-full sm:w-auto inline-flex items-center justify-center bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all hover:scale-105 shadow-xl"
          >
            立即開始練習 →
          </Link>
        </div>

        {/* 數據展示 */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center w-full max-w-4xl border-t border-slate-100 pt-12">
          <div>
            <div className="text-3xl font-bold text-slate-900">10+</div>
            <div className="text-sm text-slate-500 mt-1">歷年考題收錄</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">AI</div>
            <div className="text-sm text-slate-500 mt-1">智能解析輔助</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">100%</div>
            <div className="text-sm text-slate-500 mt-1">申論題詳解</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">VIP</div>
            <div className="text-sm text-slate-500 mt-1">知識庫連動</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 py-8 border-t border-slate-200 text-center text-sm text-slate-400">
        <p>© {new Date().getFullYear()} 諮商心理師國考數據庫. All rights reserved.</p>
      </footer>
    </div>
  );
}