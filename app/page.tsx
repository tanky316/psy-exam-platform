"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pt-16">
      
      {/* 導覽列 (簡單版) */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="text-2xl">🧠</span> 心理師數據庫
          </div>
          <div className="hidden md:flex gap-4">
            <Link href="/login" className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium">登入</Link>
            <Link href="/login" className="px-4 py-2 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-700">免費註冊</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-4 py-20 text-center bg-gradient-to-b from-white to-blue-50">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-6">
          專為 2025 諮商心理師高考設計
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
          用數據驅動你的<br/><span className="text-blue-600">備考策略</span>
        </h1>
        <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto">
          整合歷屆試題、AI 智能解析、申論題詳解以及錯題分析系統。<br className="hidden md:block" />
          別再盲目刷題，找出弱點精準複習。
        </p>
        <div className="flex gap-4 justify-center">
           <Link href="/login" className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg">
             立即開始練習 →
           </Link>
           <Link href="#features" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50">
             了解功能
           </Link>
        </div>
      </main>

      {/* 特色區塊 */}
      <section id="features" className="py-20 px-4 max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
         <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">弱點雷達圖</h3>
            <p className="text-slate-500">自動分析你的答題紀錄，用數據告訴你該加強哪一個科目。</p>
         </div>
         <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">AI 智能解析</h3>
            <p className="text-slate-500">不只告訴你答案，更解釋為什麼。結合知識庫，建立完整觀念。</p>
         </div>
         <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">📕</div>
            <h3 className="text-xl font-bold mb-2">專屬錯題本</h3>
            <p className="text-slate-500">答錯的題目自動收藏，考前衝刺只需複習這一本。</p>
         </div>
      </section>

      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-100">
        © {new Date().getFullYear()} 心理師數據庫. All rights reserved.
      </footer>
    </div>
  );
}