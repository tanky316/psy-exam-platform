import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'knowledge',
  title: '心理學資料庫 (Knowledge)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',  // <--- 1. 這裡的名字
      title: '理論/概念名稱',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: '網址代稱 (Slug)',
      type: 'slug',
      options: {
        source: 'title', // <--- 2. 這裡必須跟上面那個名字一模一樣
        maxLength: 96,
      },
    }),
    defineField({
      name: 'categories',
      title: '所屬考科',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'category' } }], // 關聯到剛剛定義的分類
    }),
    defineField({
      name: 'content',
      title: '完整內容',
      type: 'array',
      of: [{ type: 'block' }], // 富文本編輯器
    }),
  ],
});