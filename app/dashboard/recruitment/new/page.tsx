"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function NewRecruitmentPage() {
  const [formData, setFormData] = useState({ 
    title: '', 
    researcher: '', 
    link: '', 
    email: '', 
    irb_number: '', 
    description: '',
    reward: '',    // [新增]
    deadline: ''   // [新增]
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('請先登入');
        return;
      }

      const { error } = await supabase.from('recruitment_submissions').insert({
        user_id: user.id,
        ...formData
      });

      if (error) throw error;

      alert('提交成功！我們將在審核後刊登您的研究。');
      router.push('/dashboard/recruitment');
      
    } catch (error: any) {
      console.error(error);
      alert('提交失敗：' + error.message);
    } finally {
      setLoading(false); // [關鍵] 無論成功失敗，都要把 Loading 關掉
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold mb-6">📝 申請刊登研究</h2>
      <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 text-sm">
        💡 說明：您的申請送出後將由管理員進行審核，審核通過後即會刊登於佈告欄。
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium mb-1">研究標題</label>
          <input required name="title" className="w-full p-2 border rounded" onChange={handleChange} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">單位/主持人</label>
            <input required name="researcher" className="w-full p-2 border rounded" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">聯絡 Email</label>
            <input required name="email" type="email" className="w-full p-2 border rounded" onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">參與報酬</label>
            <input required name="reward" className="w-full p-2 border rounded" placeholder="例如：200元禮券" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">截止日期</label>
            <input required name="deadline" type="date" className="w-full p-2 border rounded" onChange={handleChange} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">研究倫理審查字號 (IRB)</label>
          <input name="irb_number" className="w-full p-2 border rounded" placeholder="如：112-REC-001 (選填)" onChange={handleChange} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">研究詳細說明</label>
          <textarea required name="description" className="w-full p-2 border rounded h-32" placeholder="請說明招募對象、研究流程..." onChange={handleChange} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">報名連結 (Google Form)</label>
          <input required name="link" type="url" className="w-full p-2 border rounded" onChange={handleChange} />
        </div>

        <button disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded font-bold hover:bg-slate-800 disabled:opacity-50">
          {loading ? '提交中...' : '送出申請'}
        </button>
      </form>
    </div>
  );
}