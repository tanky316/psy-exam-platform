import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'recruitment',
  title: '受試者徵求 (Recruitment)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '研究標題',
      type: 'string',
    }),
    defineField({
      name: 'researcher',
      title: '研究單位/主持人',
      type: 'string', // 例如：台大心理所 陳XX
    }),
    defineField({
      name: 'reward',
      title: '參與報酬',
      type: 'string', // 例如：200元超商禮券
    }),
    defineField({
      name: 'deadline',
      title: '截止日期',
      type: 'date',
    }),
    defineField({
      name: 'link',
      title: '報名連結 (Google表單)',
      type: 'url',
    }),
    defineField({
      name: 'description',
      title: '研究說明',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'isActive',
      title: '是否徵求中',
      type: 'boolean',
      initialValue: true,
    }),
  ],
});