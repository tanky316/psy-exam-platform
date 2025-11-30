"use client";

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

// 關鍵：從 schemas 資料夾引入我們剛剛定義好的列表 (會自動讀取 schemas/index.ts)
import { schemaTypes } from './schemas';

// 使用環境變數，如果讀不到則使用您的 Project ID (硬編碼備用)
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'nyer9yxd';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
  basePath: '/studio', // 後台路徑
  projectId,
  dataset,
  
  // 使用官方的結構工具
  plugins: [structureTool()],

  // 載入 schema 設定
  schema: {
    types: schemaTypes,
  },
});