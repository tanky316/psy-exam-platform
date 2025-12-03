"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CommentSection({ topicSlug }: { topicSlug: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. 載入留言與使用者
  useEffect(() => {
    const fetchData = async () => {
      // 抓目前登入者
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      fetchComments();
    };

    fetchData();
  }, [topicSlug]);

  // 獨立抓取留言函式
  const fetchComments = async () => {
    // [修改重點] 使用 profiles(nickname) 進行關聯查詢
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (nickname)
      `)
      .eq('topic_slug', topicSlug)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
    } else if (data) {
      setComments(data);
    }
    setLoading(false);
  };

  // 2. 發送留言
  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    if (!currentUser) {
      alert("請先登入才能留言");
      router.push('/login');
      return;
    }

    const { error } = await supabase.from('comments').insert({
      user_id: currentUser.id,
      topic_slug: topicSlug,
      content: newComment
    });

    if (!error) {
      setNewComment("");
      fetchComments(); // 重新抓取以顯示最新狀態
    } else {
      alert("留言失敗，請稍後再試");
    }
  };

  // 3. 刪除留言
  const handleDelete = async (id: number) => {
    if (!confirm("確定要刪除這則留言嗎？")) return;

    // 樂觀更新 UI
    setComments(prev => prev.filter(c => c.id !== id));

    await supabase.from('comments').delete().eq('id', id);
  };

  // 工具：顯示名稱邏輯
  const getDisplayName = (comment: any) => {
    // 1. 如果有关联到的 nickname 就用 nickname
    if (comment.profiles?.nickname) {
      return comment.profiles.nickname;
    }
    // 2. 否則顯示遮罩 ID
    return `User_${comment.user_id.slice(0, 4)}`;
  };

  return (
    <div className="space-y-8">
      
      {/* 輸入區 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <label className="block text-sm font-bold text-slate-700 mb-2">
          留下您的想法或筆記
        </label>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={currentUser ? "這裡可以寫下讀書心得，或是對文章的疑問..." : "請先登入以參與討論..."}
          disabled={!currentUser}
          className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] text-slate-700"
        />
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-slate-400">
            {currentUser ? "已登入" : "未登入"}
          </span>
          <button
            onClick={handleSubmit}
            disabled={!currentUser || !newComment.trim()}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            送出留言
          </button>
        </div>
      </div>

      {/* 列表區 */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center text-slate-400 py-4">載入討論中...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
            目前還沒有討論，成為第一個留言的人吧！
          </div>
        ) : (
          comments.map((comment) => {
            const displayName = getDisplayName(comment);
            const firstChar = displayName.charAt(0).toUpperCase();

            return (
              <div key={comment.id} className="flex gap-4 group">
                {/* 頭像 (顯示名稱的第一個字) */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-200 shadow-sm">
                  {firstChar}
                </div>
                
                <div className="flex-1">
                  <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                        {displayName}
                        {currentUser && currentUser.id === comment.user_id && (
                          <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-[10px]">我</span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                  
                  {/* 操作按鈕 (僅本人可見) */}
                  {currentUser && currentUser.id === comment.user_id && (
                    <div className="flex gap-3 mt-1 ml-2">
                      <button 
                        onClick={() => handleDelete(comment.id)}
                        className="text-[10px] text-slate-400 hover:text-red-500 font-medium transition-colors"
                      >
                        刪除
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}