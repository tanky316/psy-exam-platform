import { client } from '@/lib/sanity';
import { PortableText } from '@portabletext/react';
import Link from 'next/link';
import CommentSection from '@/components/CommentSection';

// 強制刷新資料
export const revalidate = 0;

// 定義 Sanity 內容的樣式 (讓文章排版更漂亮)
const ptComponents = {
  block: {
    h2: ({ children }: any) => <h2 className="text-2xl font-bold mt-10 mb-4 text-slate-800 border-l-4 border-blue-500 pl-4">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-bold mt-8 mb-3 text-slate-700">{children}</h3>,
    normal: ({ children }: any) => <p className="mb-4 text-slate-600 leading-relaxed text-lg">{children}</p>,
    blockquote: ({ children }: any) => <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-500 my-6 bg-slate-50 p-4 rounded-r-lg">{children}</blockquote>,
  },
  list: {
    bullet: ({ children }: any) => <ul className="list-disc pl-6 mb-6 text-slate-600 space-y-2">{children}</ul>,
    number: ({ children }: any) => <ol className="list-decimal pl-6 mb-6 text-slate-600 space-y-2">{children}</ol>,
  },
  marks: {
    link: ({ children, value }: any) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined;
      return (
        <a href={value.href} rel={rel} className="text-blue-600 underline hover:text-blue-800 font-medium transition-colors">
          {children}
        </a>
      );
    },
    strong: ({ children }: any) => <strong className="font-bold text-slate-900 bg-yellow-100 px-1 rounded">{children}</strong>,
  },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function KnowledgeDetailPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  // 抓取文章內容
  const article = await client.fetch(
    `*[_type == "knowledge" && slug.current == $slug][0]{
      title,
      content,
      publishedAt,
      categories[]->{title}
    }`,
    { slug: decodedSlug }
  );

  if (!article) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500">
        <h1 className="text-6xl mb-4">404</h1>
        <p className="text-lg">找不到此條目...</p>
        <Link href="/dashboard/knowledge" className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700">
          回知識庫首頁
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      
      {/* 頂部閱讀進度條 (視覺裝飾) */}
        <div 
        className="h-full bg-blue-500 w-full origin-left scale-x-0 animate-[progress_1s_ease-out_forwards]">
        </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* 麵包屑導航 */}
        <div className="mb-8 text-sm text-slate-500 flex items-center gap-2">
          <Link href="/dashboard" className="hover:text-blue-600 transition-colors">儀表板</Link>
          <span>/</span>
          <Link href="/dashboard/knowledge" className="hover:text-blue-600 transition-colors">知識庫</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium truncate max-w-[200px]">{article.title}</span>
        </div>

        <article>
          {/* 文章標頭 */}
          <header className="mb-10 text-center">
            <div className="flex justify-center gap-2 mb-4">
              {article.categories?.map((cat: any) => (
                <span key={cat.title} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                  {cat.title}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              {article.title}
            </h1>
            <div className="text-slate-400 text-sm flex justify-center items-center gap-4">
               <span>📅 發布於：{new Date(article.publishedAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </header>

          <hr className="border-slate-100 mb-10" />

          {/* 文章內容 (Portable Text) - 已修復重複顯示的問題 */}
          <div className="prose prose-slate prose-lg max-w-none prose-headings:scroll-mt-24">
            {article.content ? (
              <PortableText value={article.content} components={ptComponents} />
            ) : (
              <p className="text-slate-400 italic text-center py-10">（此文章目前沒有內容）</p>
            )}
          </div>

          {/* 底部導航 */}
          <div className="mt-16 pt-10 border-t border-slate-100 flex justify-between">
             <Link href="/dashboard/knowledge" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition-colors">
                ← 返回列表
             </Link>
             <Link href="/dashboard/exam" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition-colors">
                去練習相關考題 →
             </Link>
          </div>

          {/* 留言板區塊 */}
          <div className="mt-16 bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              💬 讀書筆記與討論
            </h3>
            <CommentSection topicSlug={decodedSlug} />
          </div>
        </article>
      </div>
    </div>
  );
}