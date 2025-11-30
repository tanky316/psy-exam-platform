import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'biography',
  title: '心理學家生平 (Biography)',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: '心理學家姓名',
      type: 'string', // 例如：Sigmund Freud
    }),
    defineField({
      name: 'slug',
      title: '網址代稱',
      type: 'slug',
      options: { source: 'name' },
    }),
    defineField({
      name: 'avatar',
      title: '照片/肖像',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'bio',
      title: '生平簡介',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'famousFor',
      title: '著名理論 (標籤)',
      type: 'array',
      of: [{ type: 'string' }], // 例如：精神分析、夢的解析
    }),
  ],
});