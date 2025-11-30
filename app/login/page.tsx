"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 處理登入
  const handleLogin = async () => {
    console.log("1. 開始登入流程..."); // [偵錯點]
    setLoading(true);
    setMessage('');
    
    try {
      // 呼叫 Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("2. Supabase 回傳結果:", { data, error }); // [偵錯點] 看看這裡印出什麼

      if (error) {
        // 如果有錯誤，顯示出來
        console.error("登入失敗:", error.message);
        setMessage(`登入失敗: ${error.message}`);
        setLoading(false);
      } else {
        // 登入成功
        console.log("3. 登入成功，準備跳轉...");
        setMessage('登入成功！正在進入系統...');
        
        // 使用 window.location.replace 比 href 更強烈，且不會留上一頁紀錄
        window.location.replace('/dashboard');
      }
    } catch (err) {
      console.error("發生未預期的錯誤:", err);
      setMessage('發生系統錯誤，請看 Console');
      setLoading(false);
    }
  };

  // 處理註冊
  const handleSignUp = async () => {
    setLoading(true);
    setMessage('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      console.log("註冊結果:", data);
      setMessage('註冊成功！系統已自動登入，請再次點擊「登入」按鈕進入，或檢查 Email。');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          登入心理師數據庫
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="name@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {/* 顯示錯誤訊息區域 */}
          {message && (
            <div className={`p-3 text-sm rounded-lg ${message.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {message}
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {loading ? '處理中...' : '登入'}
            </button>
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 bg-white text-slate-900 border border-slate-300 py-3 rounded-lg font-bold hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              註冊帳號
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}