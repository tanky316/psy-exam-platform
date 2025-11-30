import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="text-center space-y-6 max-w-2xl px-4">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
          諮商心理師國考數據庫
        </h1>
        <p className="text-xl text-slate-500">
          專為心理專業設計的智能備考平台。
        </p>
        
        {/* 模擬登入按鈕 */}
        <Link 
          href="/dashboard" 
          className="inline-block bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all hover:scale-105 shadow-lg"
        >
          進入平台 (模擬登入) →
        </Link>
      </div>
    </main>
  );
}