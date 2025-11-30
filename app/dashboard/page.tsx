import Link from "next/link";
import React from "react"; // 加這行保平安

export default function DashboardHome() {
  return (
    <div className="space-y-8">
      {/* 歡迎標題 */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">早安，準心理師 👋</h2>
        <p className="text-slate-500 mt-2">準備好開始今天的學習進度了嗎？</p>
      </div>

      {/* 卡片選擇區 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 國考題庫卡片 */}
        <Link href="/dashboard/exam" className="group block p-6 border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
            📝
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">國考題庫練習</h3>
          <p className="text-slate-500 text-sm">
            收錄近 10 年諮商心理師高考歷屆試題，包含 AI 解析與錯題分析。
          </p>
        </Link>

        {/* 最新研究卡片 */}
        <Link href="/dashboard/research" className="group block p-6 border border-slate-200 rounded-xl hover:border-purple-400 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
            📚
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">最新研究專欄</h3>
          <p className="text-slate-500 text-sm">
            瀏覽由專業團隊撰寫的臨床實務文章、Bowen 理論應用與趨勢分析。
          </p>
        </Link>

      </div>
    </div>
  );
}