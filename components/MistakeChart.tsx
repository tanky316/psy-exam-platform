"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// 定義顏色，讓不同科目有不同顏色
const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#6366f1'];

export default function MistakeChart({ mistakes }: { mistakes: any[] }) {
  // 1. 資料處理：統計各科目的錯題數
  const stats: Record<string, number> = {};
  
  mistakes.forEach(m => {
    const subject = m.question?.subject || '其他';
    stats[subject] = (stats[subject] || 0) + 1;
  });

  // 2. 轉換成圖表需要的格式
  const data = Object.entries(stats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count) // 錯最多的排前面
    .slice(0, 5); // 只顯示前 5 名

  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
        <span className="text-2xl mb-2">📊</span>
        <p>累積錯題後，這裡將顯示您的弱點分析</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={100} 
            tick={{ fontSize: 11, fill: '#64748b' }} 
            interval={0}
          />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="count" barSize={20} radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}