"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function KnowledgeCategoryCard({ category }: { category: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 設定預設顯示幾篇 (改為 3 篇，讓版面更緊湊)
  const PREVIEW_LIMIT = 3;
  const articles = category.articles || [];
  const total = articles.length;
  
  const visibleArticles = isExpanded ? articles : articles.slice(0, PREVIEW_LIMIT);
  const remainingCount = total - PREVIEW_LIMIT;

  return (
    <div className="flex flex-col h-full">
      {/* 分類標題區 - 極簡風格 */}
      <div className="mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center">
          {/* 前面的裝飾線 */}
          <span className="w-1 h-5 bg-blue-600 mr-3 rounded-full"></span>
          {category.title}
        </h3>
        <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
          {total}
        </span>
      </div>
      
      {/* 文章列表區 */}
      <div className="flex-1">
        {total > 0 ? (
          <>
            <ul className="space-y-2">
              {visibleArticles.map((article: any) => (
                <li key={article._id}>
                  <Link
                    href={`/dashboard/knowledge/${article.slug?.current}`}
                    className="group flex items-center text-slate-600 hover:text-blue-600 transition-colors py-1"
                  >
                    {/* 小圓點 icon */}
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2.5 group-hover:bg-blue-500 transition-colors"></span>
                    <span className="text-sm truncate group-hover:translate-x-1 transition-transform">
                      {article.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* 查看更多按鈕 - 改為文字連結風格 */}
            {total > PREVIEW_LIMIT && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-3 text-xs font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
              >
                {isExpanded ? (
                  <>▲ 收起</>
                ) : (
                  <>+ 還有 {remainingCount} 篇文章...</>
                )}
              </button>
            )}
          </>
        ) : (
          // 空狀態 - 改為極簡的灰色文字，不佔空間
          <div className="text-xs text-slate-300 italic py-2 pl-4">
            ( 資料建置中 )
          </div>
        )}
      </div>
    </div>
  );
}