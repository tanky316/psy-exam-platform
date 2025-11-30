import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'category',
  title: '考科分類 (Category)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '分類名稱',
      type: 'string', // 例如：變態心理學
    }),
    defineField({
      name: 'description',
      title: '描述',
      type: 'text',
    }),
  ],
});