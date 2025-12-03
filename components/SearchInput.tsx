"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce"; // 如果沒安裝這套件，可以用簡單的 onKeyDown 替代，這裡示範最簡單的 onKeyDown 版本

export default function SearchInput() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  // 處理搜尋邏輯
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    // 更新網址，但不刷新頁面 (Next.js 會自動觸發 Server Component 重抓資料)
    replace(`/dashboard/knowledge?${params.toString()}`);
  };

  return (
    <div className="max-w-xl mx-auto mb-12 relative group z-10">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-200"></div>
      <input
        type="text"
        placeholder="🔍 搜尋關鍵字（輸入後按 Enter...）"
        defaultValue={searchParams.get("q")?.toString()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch((e.target as HTMLInputElement).value);
          }
        }}
        // 也可以選擇 onChange 就觸發，但建議搭配 Debounce 避免請求過多
        // onChange={(e) => handleSearch(e.target.value)} 
        className="relative w-full pl-6 pr-4 py-4 rounded-full border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-600 bg-white"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
        按 Enter 搜尋
      </div>
    </div>
  );
}