const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 請確認這裡有讀到 Service Role Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SANITY_DATASET; 

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 錯誤：找不到 Key，請確認 .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const results = [];

console.log('⏳ 正在讀取 data.csv...');

fs.createReadStream('data.csv')
  .pipe(csv())
  .on('data', (data) => {
    // [關鍵] 這裡負責把 CSV 的四個欄位合併成一個 JSON 陣列
    const options = [
      data.option_a?.trim(),
      data.option_b?.trim(),
      data.option_c?.trim(),
      data.option_d?.trim()
    ].filter(val => val && val !== ""); // 過濾掉空值

    const question = {
      type: data.type?.trim() || 'choice',
      year: data.year?.trim(),
      subject: data.subject?.trim(),
      content: data.content?.trim(),
      // 這裡轉成 JSON 字串，資料庫才存得進去
      options: JSON.stringify(options), 
      answer: data.answer?.trim(),
      explanation: data.explanation?.trim() || '詳解建置中...',
      tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
    };

    if (question.content) {
      results.push(question);
    }
  })
  .on('end', async () => {
    // ... (後面的匯入邏輯不變)
    console.log(`📊 共讀取到 ${results.length} 題...`);
    
    // 批次寫入
    const BATCH_SIZE = 50;
    for (let i = 0; i < results.length; i += BATCH_SIZE) {
        const batch = results.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('questions').insert(batch);
        if(error) console.error('匯入錯誤:', error);
        else console.log(`✅ 成功匯入第 ${i+1} 批`);
    }
  });