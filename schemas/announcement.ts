import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'announcement',
  title: '平台公告',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: '公告標題', type: 'string' }),
    defineField({ name: 'publishedAt', title: '發布時間', type: 'datetime', initialValue: () => new Date().toISOString() }),
    defineField({ name: 'isImportant', title: '是否為重要置頂', type: 'boolean' }),
  ],
});