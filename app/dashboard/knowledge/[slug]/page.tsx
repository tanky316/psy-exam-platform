import { client } from '@/lib/sanity';
import { PortableText } from '@portabletext/react';
import Link from 'next/link';
import CommentSection from '@/components/CommentSection'; // [新增]

export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function KnowledgeDetailPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  // 抓取文章內容，順便抓分類名稱
  const article = await client.fetch(
    `*[_type == "knowledge" && slug.current == $slug][0]{
      title,
      content,
      categories[]->{title}
    }`,
    { slug: decodedSlug }
  );

  if (!article) {
    return <div className="p-8 text-center text-slate-500">找不到此條目...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 麵包屑導航 */}
      <div className="mb-6 text-sm text-slate-500">
        <Link href="/dashboard/knowledge" className="hover:text-blue-600">
          📚 資料庫
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900 font-medium">{article.title}</span>
      </div>

      <article className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-slate-200">
        <header className="mb-8 border-b border-slate-100 pb-8">
          {/* 顯示分類標籤 */}
          <div className="flex gap-2 mb-4">
            {article.categories?.map((cat: any) => (
              <span key={cat.title} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
                {cat.title}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            {article.title}
          </h1>
        </header>

        {/* 文章內容 */}
        <div className="prose prose-slate prose-lg max-w-none">
          <PortableText value={article.content} />
        </div>
        <div className="prose prose-slate prose-lg max-w-none">
          <PortableText value={article.content} />
        </div>

        {/* [新增] 插入留言板，並傳入目前的 slug 當作識別碼 */}
        <div className="border-t border-slate-100 mt-12 pt-8">
          <CommentSection topicSlug={decodedSlug} />
        </div>
      </article>
    </div>
  );
}