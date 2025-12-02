const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 1. 設定 Supabase 連線
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// 這裡使用您的 service_role key (請確認您有沒有換回正確的 key，或者直接貼上 service_role key)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiY2dtZ3F4Y21scm5mamF4ZGxoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDUwNjkzNSwiZXhwIjoyMDgwMDgyOTM1fQ.hoUc_-Y6xZx-NL7390axtPQXNgm9lMAcUx61o93IHgg'; 
// ⚠️ 如果匯入失敗顯示權限錯誤，請記得像上次一樣，把上面這行換成 service_role key

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 錯誤：找不到環境變數，請確認 .env.local 檔案存在');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const results = [];

console.log('⏳ 開始讀取 data.csv...');

fs.createReadStream('data.csv')
  .pipe(csv())
  .on('data', (data) => {
    const options = [
      data.option_a?.trim(),
      data.option_b?.trim(),
      data.option_c?.trim(),
      data.option_d?.trim()
    ].filter(Boolean);

    const tags = data.tags ? data.tags.split(',').map(t => t.trim()) : [];
    const type = data.type?.trim() || 'choice';

    const question = {
      content: data.content?.trim(),
      options: JSON.stringify(options),
      answer: data.answer?.trim() || '', // 允許為空字串
      explanation: data.explanation?.trim() || '詳解建置中...',
      year: data.year?.trim(),
      subject: data.subject?.trim(),
      tags: tags,
      type: type, 
    };

    // [關鍵修正] 檢查邏輯放寬：
    // 1. 題目內容必填
    // 2. 如果是選擇題 (choice)，必須有答案
    // 3. 如果是申論題 (essay)，答案可以是空的 (只要有解析就好)
    const isValidChoice = type === 'choice' && question.answer;
    const isValidEssay = type === 'essay'; // 申論題只要有題目就算通過

    if (question.content && (isValidChoice || isValidEssay)) {
      results.push(question);
    }
  })
  .on('end', async () => {
    console.log(`📊 共讀取到 ${results.length} 題，準備匯入 Supabase...`);

    const BATCH_SIZE = 50;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < results.length; i += BATCH_SIZE) {
      const batch = results.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from('questions').insert(batch);

      if (error) {
        console.error(`❌ 匯入失敗:`, error.message);
        failCount += batch.length;
      } else {
        successCount += batch.length;
      }
    }

    console.log('-----------------------------------');
    console.log(`🎉 任務結束！成功: ${successCount} 題，失敗: ${failCount} 題`);
  });