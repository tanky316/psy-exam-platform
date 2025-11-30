import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'post',
  title: '最新研究/專欄 (Post)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '文章標題',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: '網址代稱',
      type: 'slug',
      options: { source: 'title' },
    }),
    defineField({
      name: 'publishedAt',
      title: '發布時間',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'content',
      title: '內文',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
});