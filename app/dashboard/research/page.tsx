import { client } from '@/lib/sanity';
import Link from 'next/link';

// 設定為 0 代表每次進來都抓最新的資料，不快取
export const revalidate = 0;

export default async function ResearchPage() {
  // 1. 去 Sanity 抓文章
  const posts = await client.fetch(`*[_type == "post"] | order(_createdAt desc) {
    _id, 
    title, 
    slug, 
    _createdAt
  }`);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">最新研究專欄</h2>
        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          共 {posts.length} 篇文章
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length > 0 ? (
          posts.map((post: any) => (
            <Link 
              href={`/blog/${post.slug?.current}`} 
              key={post._id}
              className="group block bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md transition-all h-full flex flex-col"
            >
              {/* 裝飾用的圖示 */}
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                📄
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-purple-700">
                {post.title}
              </h3>
              
              <div className="mt-auto pt-4 flex items-center justify-between text-sm text-slate-400">
                <span>{new Date(post._createdAt).toLocaleDateString('zh-TW')}</span>
                <span className="group-hover:translate-x-1 transition-transform">閱讀全文 →</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p>目前還沒有發布任何研究文章。</p>
            <p className="text-sm mt-2">請前往 <a href="/studio" className="text-blue-600 underline">後台 (Studio)</a> 撰寫第一篇！</p>
          </div>
        )}
      </div>
    </div>
  );
}