"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ReportButton({ questionId }: { questionId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('答案有誤');
  const [desc, setDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('請先登入');
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from('reports').insert({
      user_id: user.id,
      question_id: questionId,
      reason,
      description: desc
    });

    if (!error) {
      alert('感謝您的回報！我們會盡快審核。');
      setIsOpen(false);
      setDesc('');
    } else {
      alert('回報失敗，請稍後再試。');
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
      >
        <span>🚩</span> 回報試題錯誤
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-lg mb-4 text-slate-800">回報試題錯誤</h3>
            
            <label className="block text-sm font-medium mb-2 text-slate-600">錯誤類型</label>
            <select 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4"
            >
              <option value="答案有誤">答案有誤</option>
              <option value="題目有錯字">題目有錯字</option>
              <option value="解析不完整">解析不完整</option>
              <option value="其他">其他</option>
            </select>

            <label className="block text-sm font-medium mb-2 text-slate-600">詳細說明 (選填)</label>
            <textarea 
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full p-2 border rounded-lg mb-6 h-24 text-sm"
              placeholder="請簡述您發現的問題..."
            />

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm"
              >
                取消
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 disabled:opacity-50"
              >
                {isSubmitting ? '傳送中...' : '送出回報'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}