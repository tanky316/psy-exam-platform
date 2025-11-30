import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'author',
  title: '作者/團隊介紹 (Author)',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: '姓名',
      type: 'string',
    }),
    defineField({
      name: 'role',
      title: '頭銜/職稱',
      type: 'string', // 例如：諮商心理師 / 平台創辦人
    }),
    defineField({
      name: 'avatar',
      title: '大頭照',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'bio',
      title: '詳細介紹 (履歷/經歷)',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'specialties',
      title: '專長領域 (標籤)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'socials',
      title: '社群/聯絡連結',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'platform', title: '平台名稱', type: 'string' }, // 例如：Facebook, Email
            { name: 'url', title: '連結', type: 'url' },
          ],
        },
      ],
    }),
  ],
});