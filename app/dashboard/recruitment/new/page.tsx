"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// ... (保留原本 import)

export default function NewRecruitmentPage() {
  const [formData, setFormData] = useState({ 
    title: '', researcher: '', link: '', 
    email: '', irb_number: '', description: '' // [新增]
  });
  // ... (保留 loading, router)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('請先登入');

    // 存入 Supabase
    const { error } = await supabase.from('recruitment_submissions').insert({
      user_id: user.id,
      ...formData
    });
    // ... (保留後續處理)
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold mb-6">📝 申請刊登研究</h2>
      <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 text-sm">
        💡 說明：您的申請送出後將由管理員進行審核，審核通過後即會刊登於佈告欄。
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ... (保留原本欄位) ... */}
        
        {/* [新增] 聯絡 Email */}
        <div>
          <label className="block text-sm font-medium mb-1">聯絡 Email</label>
          <input required type="email" className="w-full p-2 border rounded" 
             onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>

        {/* [新增] IRB 字號 */}
        <div>
          <label className="block text-sm font-medium mb-1">研究倫理審查字號 (IRB)</label>
          <input className="w-full p-2 border rounded" placeholder="如：112-REC-001 (選填)"
             onChange={e => setFormData({...formData, irb_number: e.target.value})} />
        </div>

        {/* [新增] 詳細說明 */}
        <div>
          <label className="block text-sm font-medium mb-1">研究詳細說明 (招募條件、流程等)</label>
          <textarea required className="w-full p-2 border rounded h-32" 
             onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>

        {/* 連結欄位 */}
        <div>
          <label className="block text-sm font-medium mb-1">報名連結 (Google Form)</label>
          <input required type="url" className="w-full p-2 border rounded" 
             onChange={e => setFormData({...formData, link: e.target.value})} />
        </div>

        <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700">
          {loading ? '提交中...' : '送出申請'}
        </button>
      </form>
    </div>
  );
}