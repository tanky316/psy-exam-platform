"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

type ChartData = {
  subject: string;
  count: number;
  fullMark: number; // 用於控制圖表縮放比例
};

export default function MistakeChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMistakes, setTotalMistakes] = useState(0);

  useEffect(() => {
    async function fetchMistakes() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // --- 步驟 1: 先抓出該使用者的所有錯題 ID ---
        const { data: mistakeRecords, error: mistakeError } = await supabase
          .from('wrong_answers')
          .select('question_id')
          .eq('user_id', user.id);

        if (mistakeError) throw mistakeError;

        // 如果沒有錯題，直接結束
        if (!mistakeRecords || mistakeRecords.length === 0) {
          setData([]);
          setTotalMistakes(0);
          setLoading(false);
          return;
        }

        setTotalMistakes(mistakeRecords.length);

        // --- 步驟 2: 收集 ID 並去 questions 表格抓分類 ---
        // 提取所有的 question_id
        const questionIds = mistakeRecords.map((r: any) => r.question_id);

        // 使用 .in() 查询這些題目的詳細資料 (包含 category)
        const { data: questionsData, error: questionError } = await supabase
          .from('questions')
          .select('category')
          .in('id', questionIds);

        if (questionError) throw questionError;

        // --- 步驟 3: 統計數據 ---
        const stats: Record<string, number> = {};
        
        questionsData?.forEach((q: any) => {
          // 如果沒有分類，歸類為 "其他"
          const category = q.category || '其他';
          stats[category] = (stats[category] || 0) + 1;
        });

        // --- 步驟 4: 格式化給 Recharts 使用 ---
        // 找出最大值，作為圖表的滿分基準 (避免圖形太擠或太小)
        const maxCount = Math.max(...Object.values(stats), 0);
        const fullMark = Math.max(maxCount, 5); // 至少以 5 為底

        const chartData = Object.keys(stats).map(subject => ({
          subject,
          count: stats[subject],
          fullMark: fullMark, 
        }));

        setData(chartData);
      } catch (err: any) {
        // 顯示具體的錯誤訊息以便除錯
        console.error('Error fetching mistake stats:', err.message || err);
      } finally {
        setLoading(false);
      }
    }

    fetchMistakes();
  }, []);

  // --- 載入中狀態 ---
  if (loading) {
    return (
      <div className="w-full h-[300px] md:h-[400px] bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
        <div className="text-slate-400 animate-pulse flex flex-col items-center">
          <span className="text-2xl">📊</span>
          <span className="text-sm mt-2">分析數據中...</span>
        </div>
      </div>
    );
  }

  // --- 無資料狀態 ---
  if (totalMistakes === 0) {
    return (
      <div className="w-full h-[300px] md:h-[400px] bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-slate-400">
        <span className="text-4xl mb-4">🎉</span>
        <p className="font-bold text-slate-600">目前沒有錯題紀錄</p>
        <p className="text-xs mt-2">快去參加模擬考，累積數據吧！</p>
      </div>
    );
  }

  // --- 圖表顯示 ---
  return (
    <div className="w-full h-[300px] md:h-[400px] bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
      <div className="flex justify-between items-start mb-2 px-2">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-red-500 rounded-full"></span>
          弱點分析雷達圖
        </h3>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          累計錯題: <span className="text-red-500 font-bold">{totalMistakes}</span>
        </span>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 'auto']} 
              tick={false} 
              axisLine={false} 
            />
            <Radar
              name="錯誤次數"
              dataKey="count"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.5}
            />
            <Tooltip 
              cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '12px'
              }}
              itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}