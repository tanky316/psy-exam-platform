const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' }); // 讀取環境變數

// 1. 設定 Supabase 連線
// 請確認您的 .env.local 檔案裡有這兩個變數
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 錯誤：找不到環境變數，請確認 .env.local 檔案存在');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const results = [];

// 2. 開始讀取 CSV
console.log('⏳ 開始讀取 data.csv...');

fs.createReadStream('data.csv')
  .pipe(csv())
  .on('data', (data) => {
    // 這裡負責把 Excel 的每一行，轉換成 Supabase 的格式
    
    // 處理選項：把四個欄位合併成一個陣列
    const options = [
      data.option_a?.trim(),
      data.option_b?.trim(),
      data.option_c?.trim(),
      data.option_d?.trim()
    ].filter(Boolean); // 過濾掉空的選項

    // 處理標籤：把 "標籤1,標籤2" 切割成陣列
    const tags = data.tags ? data.tags.split(',').map(t => t.trim()) : [];

    // 建立一筆準備寫入的資料
    const question = {
      content: data.content?.trim(),
      // 將選項轉成 JSON 字串，因為 Supabase 存的是 jsonb
      options: JSON.stringify(options), 
      answer: data.answer?.trim(),
      explanation: data.explanation?.trim() || '詳解建置中...',
      year: data.year?.trim(),
      subject: data.subject?.trim(),
      tags: tags,
      type: 'choice', // 預設匯入的都是選擇題
    };

    // 簡單檢查必填欄位
    if (question.content && question.answer) {
      results.push(question);
    }
  })
  .on('end', async () => {
    console.log(`📊 共讀取到 ${results.length} 題，準備匯入 Supabase...`);

    // 3. 分批寫入 (Supabase 有一次寫入數量的限制，我們分批 50 題傳一次)
    const BATCH_SIZE = 50;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < results.length; i += BATCH_SIZE) {
      const batch = results.slice(i, i + BATCH_SIZE);
      
      const { error } = await supabase
        .from('questions')
        .insert(batch);

      if (error) {
        console.error(`❌ 第 ${i + 1} - ${i + batch.length} 筆匯入失敗:`, error.message);
        failCount += batch.length;
      } else {
        console.log(`✅ 第 ${i + 1} - ${i + batch.length} 筆匯入成功`);
        successCount += batch.length;
      }
    }

    console.log('-----------------------------------');
    console.log(`🎉 任務結束！成功: ${successCount} 題，失敗: ${failCount} 題`);
  });