import { client } from '@/lib/sanity';
import { PortableText } from '@portabletext/react';
import Link from 'next/link';

export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPost({ params }: Props) {
  
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  // [關鍵修改] GROQ 查詢語法升級
  // 我們利用 ^._createdAt (這篇文章的時間) 來找比它早或比它晚的文章
  const post = await client.fetch(
    `*[_type == "post" && slug.current == $slug][0]{
      title,
      _createdAt,
      content,
      "prev": *[_type == "post" && _createdAt < ^._createdAt] | order(_createdAt desc)[0] { 
        title, 
        slug 
      },
      "next": *[_type == "post" && _createdAt > ^._createdAt] | order(_createdAt asc)[0] { 
        title, 
        slug 
      }
    }`,
    { slug: decodedSlug }
  );

  if (!post) {
    return <div className="p-10 text-center">找不到這篇文章...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <article className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8 md:p-12">
        {/* 文章標頭 */}
        <header className="mb-8 border-b border-slate-100 pb-8">
          <Link href="/dashboard/research" className="text-slate-500 hover:text-blue-600 text-sm mb-4 inline-block font-bold">
            ← 回最新研究
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {post.title}
          </h1>
          <time className="text-slate-400 text-sm">
            {new Date(post._createdAt).toLocaleDateString('zh-TW')}
          </time>
        </header>

        {/* 文章內文區 */}
        <div className="prose prose-slate prose-lg max-w-none mb-12">
          <PortableText value={post.content} />
        </div>

        {/* [新增] 上一篇 / 下一篇 導航區 */}
        <div className="border-t border-slate-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 上一篇 (往左) */}
          {post.prev ? (
            <Link 
              href={`/blog/${post.prev.slug.current}`}
              className="group flex flex-col items-start text-left p-4 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
            >
              <span className="text-xs text-slate-400 mb-1 group-hover:text-blue-500 font-bold">← 上一篇</span>
              <span className="text-slate-700 font-medium group-hover:text-blue-700 line-clamp-1">
                {post.prev.title}
              </span>
            </Link>
          ) : (
            <div className="p-4 text-slate-300 text-sm">沒有更早的文章了</div>
          )}

          {/* 下一篇 (往右) */}
          {post.next ? (
            <Link 
              href={`/blog/${post.next.slug.current}`}
              className="group flex flex-col items-end text-right p-4 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
            >
              <span className="text-xs text-slate-400 mb-1 group-hover:text-blue-500 font-bold">下一篇 →</span>
              <span className="text-slate-700 font-medium group-hover:text-blue-700 line-clamp-1">
                {post.next.title}
              </span>
            </Link>
          ) : (
            <div className="p-4 text-slate-300 text-sm text-right">這是最新的一篇</div>
          )}
        </div>

      </article>
    </main>
  );
}