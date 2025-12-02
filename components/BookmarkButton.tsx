"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function BookmarkButton({ questionId }: { questionId: number }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. 初始化：檢查這題有沒有被收藏過
  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .single();

      if (data) setIsBookmarked(true);
      setLoading(false);
    };
    checkStatus();
  }, [questionId]);

  // 2. 切換收藏狀態
  const toggleBookmark = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('請先登入才能收藏題目');
      setLoading(false);
      return;
    }

    if (isBookmarked) {
      // 取消收藏
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('question_id', questionId);
      setIsBookmarked(false);
    } else {
      // 加入收藏
      await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          question_id: questionId
        });
      setIsBookmarked(true);
    }
    setLoading(false);
  };

  if (loading) return <span className="text-gray-300 text-xl animate-pulse">☆</span>;

  return (
    <button 
      onClick={toggleBookmark}
      className={`text-2xl transition-transform active:scale-125 focus:outline-none ${
        isBookmarked ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-400'
      }`}
      title={isBookmarked ? "取消收藏" : "加入收藏"}
    >
      {isBookmarked ? '★' : '☆'}
    </button>
  );
}