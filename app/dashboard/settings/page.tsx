"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [nickname, setNickname] = useState("");
  const router = useRouter();

  // 1. 載入資料
  useEffect(() => {
    const getProfile = async () => {
      // 驗證登入
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // 抓取 Profile 資料
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
        // 如果資料庫有暱稱就顯示，沒有就顯示空字串
        setNickname(data.nickname || "");
      }
      setLoading(false);
    };

    getProfile();
  }, [router]);

  // 2. 更新資料 (修改暱稱)
  const handleUpdate = async () => {
    if (!user) return;
    setUpdating(true);

    const { error } = await supabase
      .from('profiles')
      .update({ 
        nickname: nickname,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      alert("更新失敗：" + error.message);
    } else {
      alert("個人資料更新成功！🎉\n回到首頁就能看到新暱稱囉！");
      // 更新本地狀態，讓畫面不用重整也變更
      setProfile({ ...profile, nickname });
      router.refresh(); // 通知 Next.js 重新抓取 Server Component 資料
    }
    setUpdating(false);
  };

  // 3. 重設密碼 (發送 Email)
  const handleResetPassword = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/dashboard/settings/reset-password`,
    });
    if (error) alert("發送失敗：" + error.message);
    else alert(`重設密碼信件已發送至 ${user.email}，請查收信箱。`);
  };

  if (loading) return <div className="p-20 text-center text-slate-500 animate-pulse">正在載入設定...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-12">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          ⚙️ 個人設定
        </h1>

        {/* 1. VIP 狀態卡片 */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
          {/* 背景裝飾 */}
          <div className={`absolute top-0 right-0 p-4 transition-transform group-hover:scale-110 ${profile?.is_vip ? 'text-amber-500' : 'text-slate-100'}`}>
            <span className="text-8xl opacity-20">👑</span>
          </div>
          
          <h2 className="text-xl font-bold text-slate-800 mb-6 relative z-10">會員狀態</h2>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className={`w-20 h-20 rounded-full flex-shrink-0 flex items-center justify-center text-3xl shadow-inner ${profile?.is_vip ? 'bg-gradient-to-br from-amber-100 to-yellow-300 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
              {profile?.is_vip ? 'VIP' : 'Free'}
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">
                {profile?.is_vip ? "尊榮 VIP 會員" : "一般免費會員"}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {profile?.is_vip 
                  ? "您享有無限瀏覽詳解、知識庫完整閱讀權限，以及優先客服支援。" 
                  : "目前僅能瀏覽部分解析。升級 VIP 解鎖歷屆試題詳解與完整知識庫。"}
              </p>
            </div>
          </div>

          {!profile?.is_vip && (
            <div className="mt-8 pt-6 border-t border-slate-100 relative z-10">
              <button 
                onClick={() => alert("感謝您的支持！金流串接功能開發中，敬請期待！")}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-bold rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                🚀 立即升級 VIP
              </button>
            </div>
          )}
        </div>

        {/* 2. 基本資料表單 */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-6">基本資料</h2>
          
          <div className="space-y-6">
            {/* Email (唯讀) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">登入信箱 (無法修改)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={user?.email} 
                  disabled 
                  className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed select-none"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">✉️</span>
              </div>
            </div>

            {/* 暱稱 (可修改) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">顯示暱稱</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={nickname} 
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="請輸入您想顯示的名稱"
                  className="w-full p-3 pl-10 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">👤</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 ml-1">這個名稱將顯示在首頁歡迎詞與留言板中。</p>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={handleUpdate}
                disabled={updating}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {updating ? "儲存中..." : "儲存變更"}
              </button>
            </div>
          </div>
        </div>

        {/* 3. 帳號安全 */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-6">帳號安全</h2>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-700 flex items-center gap-2">
                🔒 修改密碼
              </p>
              <p className="text-xs text-slate-500 mt-1">
                我們會發送一封重設密碼的安全連結到您的信箱。
              </p>
            </div>
            <button 
              onClick={handleResetPassword}
              className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors text-sm whitespace-nowrap shadow-sm"
            >
              發送重設信
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}