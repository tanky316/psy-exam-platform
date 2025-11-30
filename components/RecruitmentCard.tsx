"use client";
import { useState } from 'react';
import { PortableText } from '@portabletext/react';
import Link from 'next/link';

export default function RecruitmentCard({ post }: { post: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 自動判斷是否過期
  const isExpired = post.deadline ? new Date(post.deadline) < new Date() : false;
  // 最終狀態：後台沒關閉 且 時間沒過期
  const isActive = post.isActive && !isExpired;

  return (
    <div className={`bg-white p-6 rounded-xl border shadow-sm transition-all ${isExpanded ? 'ring-2 ring-blue-100' : 'hover:border-blue-300 border-slate-200'}`}>
      <div className="flex flex-col md:flex-row gap-6 relative">
        {/* 狀態標籤 */}
        <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white rounded-bl-lg ${isActive ? 'bg-green-500' : 'bg-slate-400'}`}>
          {isActive ? '徵求中' : '已截止'}
        </div>

        <div className="flex-1 space-y-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <h3 className="text-xl font-bold text-slate-900">{post.title}</h3>
          
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <div className="flex items-center"><span className="mr-2">🏫</span>{post.researcher}</div>
            <div className="flex items-center"><span className="mr-2">🎁</span><span className="text-amber-600 font-bold">{post.reward}</span></div>
            <div className="flex items-center"><span className="mr-2">📅</span>截止：{post.deadline || '未定'}</div>
          </div>

          {/* 內容區域：根據狀態展開或收合 */}
          <div className={`text-slate-500 text-sm ${isExpanded ? '' : 'line-clamp-2'}`}>
             {/* 如果有 description 內容 */}
             {post.description ? <PortableText value={post.description} /> : '點擊查看詳細說明...'}
          </div>
          
          {/* 展開提示 */}
          <div className="text-center md:text-left">
            <button className="text-blue-500 text-xs font-bold hover:underline mt-2">
              {isExpanded ? '▲ 收起內容' : '▼ 展開完整說明'}
            </button>
          </div>
        </div>

        {/* 按鈕區 */}
        <div className="flex items-center justify-end md:w-48 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
          {isActive ? (
            <Link href={post.link || '#'} target="_blank" className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md">
              前往報名 →
            </Link>
          ) : (
            <button disabled className="w-full bg-slate-100 text-slate-400 font-bold py-3 px-6 rounded-lg cursor-not-allowed">
              報名截止
            </button>
          )}
        </div>
      </div>
    </div>
  );
}