"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'reports' | 'recruitments'>('reports');
  const [reports, setReports] = useState<any[]>([]);
  const [recruitments, setRecruitments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // 初始化：檢查權限並抓資料
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 檢查是否為管理員
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) {
        alert("您沒有權限進入此頁面");
        router.push('/dashboard');
        return;
      }
      setIsAdmin(true);

      // 抓取資料
      await fetchData();
    };
    init();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // 1. 抓錯誤回報 (包含題目內容)
    const { data: reportsData } = await supabase
      .from('reports')
      .select('*, question:questions(content)')
      .order('created_at', { ascending: false });
    
    if (reportsData) setReports(reportsData);

    // 2. 抓刊登申請
    const { data: recruitData } = await supabase
      .from('recruitment_submissions')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (recruitData) setRecruitments(recruitData);
    
    setLoading(false);
  };

  // 處理一般刪除 (解決回報 或 拒絕申請)
  const handleResolve = async (table: string, id: number) => {
    if (!confirm('確定要刪除此紀錄嗎？(此動作無法復原)')) return;
    
    const { error } = await supabase.from(table).delete().eq('id', id);
    
    if (error) {
      alert('刪除失敗: ' + error.message);
      return;
    }
    
    // 更新畫面
    if (table === 'reports') {
      setReports(prev => prev.filter(r => r.id !== id));
    } else {
      setRecruitments(prev => prev.filter(r => r.id !== id));
    }
  };

  // [關鍵] 處理「一鍵刊登」
  const handleApprove = async (submission: any) => {
    if (!confirm(`確定要刊登「${submission.title}」嗎？`)) return;

    try {
      // 1. 呼叫後端 API 寫入 Sanity
      const res = await fetch('/api/approve-recruitment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });

      if (res.ok) {
        alert('✅ 刊登成功！已發布至前台。');
        
        // 2. 刊登成功後，從申請表中刪除該筆紀錄
        await supabase.from('recruitment_submissions').delete().eq('id', submission.id);
        
        // 3. 更新畫面
        setRecruitments(prev => prev.filter(r => r.id !== submission.id));
      } else {
        const errorData = await res.json();
        alert('❌ 刊登失敗: ' + (errorData.message || '未知錯誤'));
      }
    } catch (e) {
      console.error(e);
      alert('❌ 系統發生錯誤，請檢查 Console');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
        🛡️ 管理員後台
      </h2>

      {/* 分頁切換 */}
      <div className="flex gap-4 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-2 px-4 font-bold transition-colors border-b-2 ${
            activeTab === 'reports' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'
          }`}
        >
          錯誤回報 <span className="ml-1 text-xs bg-slate-100 px-2 py-0.5 rounded-full">{reports.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('recruitments')}
          className={`pb-2 px-4 font-bold transition-colors border-b-2 ${
            activeTab === 'recruitments' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'
          }`}
        >
          研究刊登申請 <span className="ml-1 text-xs bg-slate-100 px-2 py-0.5 rounded-full">{recruitments.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 animate-pulse">資料載入中...</div>
      ) : (
        <div className="space-y-4">
          
          {/* --- 錯誤回報列表 --- */}
          {activeTab === 'reports' && (
            reports.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                🎉 目前沒有待處理的錯誤回報。
              </div>
            ) : (
              reports.map(item => (
                <div key={item.id} className="bg-white p-6 rounded-xl border border-red-100 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start hover:shadow-md transition-shadow">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded font-bold">題號 #{item.question_id}</span>
                      <span className="font-bold text-slate-800 text-lg">{item.reason}</span>
                      <span className="text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="font-bold block mb-1 text-slate-400 text-xs">題目預覽：</span>
                      {item.question?.content || '(題目已被刪除)'}
                    </div>

                    {item.description && (
                      <p className="text-sm text-slate-700 mt-2">
                        <span className="font-bold">詳細說明：</span>{item.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-3 w-full md:w-auto">
                    {/* 如果題目存在，提供快速連結去檢查 */}
                    {item.question && (
                      <Link 
                        href={`/dashboard/exam?id=${item.question_id}`} // 這邊僅為示意，實際上 exam 頁面可能需要支援 ?id= 篩選才能直達，或者您手動去題庫找
                        className="text-center px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        前往題庫檢查 (手動)
                      </Link>
                    )}
                    <button 
                      onClick={() => handleResolve('reports', item.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm transition-colors"
                    >
                      ✓ 標記已解決 (刪除)
                    </button>
                  </div>
                </div>
              ))
            )
          )}

          {/* --- 研究申請列表 --- */}
          {activeTab === 'recruitments' && (
            recruitments.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                📭 目前沒有待審核的申請。
              </div>
            ) : (
              recruitments.map(item => (
                <div key={item.id} className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                      <p className="text-sm text-blue-600 font-medium mt-1">主持人：{item.researcher}</p>
                    </div>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                      申請日：{new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm text-slate-600 mb-6">
                    <p><strong className="text-slate-900">Email:</strong> {item.email}</p>
                    <p><strong className="text-slate-900">報酬:</strong> {item.reward}</p>
                    <p><strong className="text-slate-900">截止日期:</strong> {item.deadline}</p>
                    <p><strong className="text-slate-900">IRB 字號:</strong> {item.irb_number || '未提供'}</p>
                    <p className="col-span-full"><strong className="text-slate-900">報名連結:</strong> <a href={item.link} target="_blank" className="text-blue-500 underline hover:text-blue-700">{item.link}</a></p>
                    
                    <div className="col-span-full bg-slate-50 p-4 rounded-lg border border-slate-200 mt-2">
                      <strong className="block text-slate-900 mb-2">研究說明內容：</strong>
                      <p className="whitespace-pre-wrap leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                     <button 
                       onClick={() => handleResolve('recruitment_submissions', item.id)}
                       className="px-5 py-2 border border-red-200 text-red-500 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors"
                     >
                       ✕ 拒絕並刪除
                     </button>
                     
                     <button 
                       onClick={() => handleApprove(item)}
                       className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md transition-transform active:scale-95 flex items-center gap-2"
                     >
                       <span>🚀</span> 審核通過並刊登
                     </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
}