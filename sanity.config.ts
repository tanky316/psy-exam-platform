"use client";

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

// 這是我們定義文章格式的地方
const postSchema = {
  name: 'post',
  title: '文章 (Post)',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: '標題',
      type: 'string',
    },
    {
      name: 'slug',
      title: '網址代稱 (Slug)',
      type: 'slug',
      options: { source: 'title' },
    },
    {
      name: 'content',
      title: '內文',
      type: 'array',
      of: [{ type: 'block' }], // 這是 Sanity 強大的富文本編輯器
    },
  ],
};

const projectId = 'nyer9yxd';
const dataset = 'production';

export default defineConfig({
  basePath: '/studio', // 後台的網址路徑
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: {
    types: [postSchema],
  },
});