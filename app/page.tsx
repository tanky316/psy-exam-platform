"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      
      {/* --- 1. 頂部導覽列 (Navbar) --- */}
      <nav className="w-full border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl mr-2">🧠</span>
              <h1 className="font-bold text-xl text-slate-900 tracking-tight">
                心理師數據庫
              </h1>
            </div>

            {/* 電腦版選單 (Desktop Menu) */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">
                會員登入
              </Link>
              <Link 
                href="/login" 
                className="bg-slate-900 text-white px-5 py-2 rounded-full font-bold hover:bg-slate-800 transition-colors shadow-md"
              >
                免費註冊
              </Link>
            </div>

            {/* 手機版選單按鈕 (Mobile Hamburger) */}
            <div className="md:hidden flex items-center">
              <Link 
                href="/login" 
                className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg mr-2"
              >
                登入 / 註冊
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* --- 2. 主要內容區 (Hero Section) --- */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24 text-center">
        
        <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-sm font-bold mb-6 animate-in fade-in slide-in-from-bottom-4">
          🚀 專為諮商心理師國考設計
        </span>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 max-w-4xl leading-tight">
          結合 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">AI 智能解析</span> 與 <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-amber-500">完整知識體系</span> 的備考平台
        </h1>

        <p className="text-lg sm:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          不再只是刷題。我們整合了歷屆試題、錯題分析、申論題詳解以及心理學知識庫，助您一次通過諮商心理師高考。
        </p>
        
        {/* 手機版與電腦版通用的主按鈕 */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4">
          <Link 
            href="/login" 
            className="w-full sm:w-auto inline-flex items-center justify-center bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            立即開始練習 →
          </Link>
          
          <Link 
            href="#features" 
            className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors"
          >
            了解更多功能
          </Link>
        </div>

        {/* 數據展示 (Social Proof) */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center w-full max-w-4xl border-t border-slate-100 pt-12">
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

      {/* --- 3. 頁尾 (Footer) --- */}
      <footer className="bg-slate-50 py-8 border-t border-slate-200 text-center text-sm text-slate-400">
        <p>© {new Date().getFullYear()} 諮商心理師國考數據庫. All rights reserved.</p>
      </footer>
    </div>
  );
}