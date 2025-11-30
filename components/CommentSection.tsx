"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// 接收一個 slug 參數，用來區分這是哪篇文章的留言
export default function CommentSection({ topicSlug }: { topicSlug: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. 初始化：抓取使用者 & 抓取現有留言
  useEffect(() => {
    const init = async () => {
      // 抓使用者
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // 抓留言 (順便關聯出 profiles 裡的 email 或名字)
      // 注意：這裡我們簡單抓 profiles 的 email，實際專案可以抓暱稱
      const { data: commentsData } = await supabase
        .from('comments')
        .select(`
          id, content, created_at, user_id,
          profile:profiles ( email, is_vip )
        `)
        .eq('topic_slug', topicSlug)
        .order('created_at', { ascending: false }); // 新的在上面

      if (commentsData) setComments(commentsData);
      setLoading(false);
    };

    init();
  }, [topicSlug]);

  // 2. 送出留言
  const handleSubmit = async () => {
    if (!newComment.trim() || !user) return;

    const { error } = await supabase.from('comments').insert({
      user_id: user.id,
      content: newComment,
      topic_slug: topicSlug,
    });

    if (!error) {
      setNewComment('');
      // 重新整理頁面以顯示新留言 (簡單暴力法)
      window.location.reload();
    } else {
      alert('留言失敗：' + error.message);
    }
  };

  // 3. 刪除留言
  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除這則留言嗎？')) return;
    
    await supabase.from('comments').delete().eq('id', id);
    setComments(comments.filter(c => c.id !== id));
  };

  if (loading) return <div className="p-4 text-slate-400">載入討論區...</div>;

  return (
    <div className="mt-12 bg-slate-50 p-6 rounded-xl border border-slate-200">
      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
        💬 討論區 ({comments.length})
      </h3>

      {/* 輸入框區塊 */}
      {user ? (
        <div className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px]"
            placeholder="分享您的看法或是提問..."
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim()}
              className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              發布留言
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-6 bg-white rounded-lg text-center border border-dashed border-slate-300">
          <p className="text-slate-500 mb-2">登入後即可參與討論</p>
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            前往登入 →
          </Link>
        </div>
      )}

      {/* 留言列表 */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {/* 頭像 */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${comment.profile?.is_vip ? 'bg-amber-500' : 'bg-blue-600'}`}>
                    {comment.profile?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      {comment.profile?.email?.split('@')[0] || '匿名使用者'}
                      {comment.profile?.is_vip && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 rounded border border-amber-200">VIP</span>}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>

                {/* 刪除按鈕 (只有自己能看見) */}
                {user && user.id === comment.user_id && (
                  <button 
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                  >
                    刪除
                  </button>
                )}
              </div>
              
              <p className="text-slate-700 whitespace-pre-wrap pl-10 text-sm leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-400 text-sm py-4">
            目前還沒有留言，成為第一個發言的人吧！
          </p>
        )}
      </div>
    </div>
  );
}