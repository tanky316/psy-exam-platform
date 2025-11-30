import { client } from '@/lib/sanity';
import Link from 'next/link';

export const revalidate = 0;

export default async function ResearchPage() {
  const posts = await client.fetch(`*[_type == "post"] | order(_createdAt desc) {
    _id, title, slug, _createdAt
  }`);

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">🔬 最新研究專欄</h2>
          <p className="text-slate-500 mt-2">探索心理學前沿趨勢、期刊選讀與實務應用。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {posts.map((post: any) => (
          <Link 
            href={`/blog/${post.slug?.current}`} 
            key={post._id}
            className="group block"
          >
            {/* 偽圖片區塊 (如果有真實圖片可替換) */}
            <div className="aspect-video bg-slate-100 rounded-xl mb-4 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-purple-50 group-hover:scale-105 transition-transform duration-500"></div>
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-600">
                專欄文章
              </div>
            </div>

            <div className="space-y-2">
              <time className="text-xs text-slate-400 uppercase tracking-wider">
                {new Date(post._createdAt).toLocaleDateString('zh-TW')}
              </time>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                {post.title}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2">
                點擊閱讀完整內容，深入了解此議題的詳細分析...
              </p>
              <span className="inline-block text-sm font-bold text-blue-600 mt-2 group-hover:translate-x-1 transition-transform">
                閱讀更多 →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}