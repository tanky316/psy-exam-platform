import { client } from '@/lib/sanity';
import Link from 'next/link';
import SearchInput from '@/components/SearchInput';
import MobileCategorySelect from '@/components/MobileCategorySelect'; // ✅ 引入新元件

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function KnowledgeBasePage(props: Props) {
  const searchParams = await props.searchParams;
  const queryTerm = typeof searchParams.q === 'string' ? searchParams.q : '';
  const selectedCat = typeof searchParams.cat === 'string' ? searchParams.cat : '';

  // 1. 抓取所有分類
  const categories = await client.fetch(`
    *[_type == "category"] | order(title asc) {
      title,
      "count": count(*[_type == "knowledge" && references(^._id)])
    }
  `);

  // 2. 建構 GROQ 查詢
  let filter = `_type == "knowledge"`;
  const params: any = {};

  if (queryTerm) {
    filter += ` && (title match $term + "*" || description match $term + "*")`;
    params.term = queryTerm;
  }

  if (selectedCat && selectedCat !== 'All') {
    filter += ` && $cat in categories[]->title`;
    params.cat = selectedCat;
  }

  const articles = await client.fetch(`
    *[${filter}] | order(publishedAt desc) {
      _id, title, "slug": slug.current, description, publishedAt, 
      categories[]->{title}
    }
  `, params);

  return (
    <div className="min-h-screen bg-slate-50 pt-10 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 頂部標題與搜尋 */}
        <div className="mb-10">
           <h1 className="text-3xl font-extrabold text-slate-900 mb-6">🧠 心理學知識資料庫</h1>
           <SearchInput />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* --- 左側：分類導航 (Sidebar - Server Component OK) --- */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h3 className="font-bold text-slate-800 mb-4 px-2 flex items-center gap-2">
                📂 分類索引
              </h3>
              <div className="space-y-1">
                <Link 
                  href="/dashboard/knowledge" 
                  className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!selectedCat ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span>📚 全部文章</span>
                </Link>

                {categories.map((cat: any) => (
                  cat.count > 0 && (
                    <Link 
                      key={cat.title}
                      href={`/dashboard/knowledge?cat=${encodeURIComponent(cat.title)}`}
                      className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCat === cat.title ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <span>{cat.title}</span>
                      <span className="bg-slate-100 text-slate-400 py-0.5 px-2 rounded-full text-xs">
                        {cat.count}
                      </span>
                    </Link>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* --- 手機版分類選單 (使用 Client Component 解決報錯) --- */}
          <MobileCategorySelect 
            categories={categories} 
            selectedCat={selectedCat} 
          />

          {/* --- 右側：文章列表 --- */}
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 篩選狀態提示 */}
            {selectedCat && (
              <div className="col-span-full flex items-center gap-2 mb-2">
                <span className="text-sm text-slate-500">目前篩選：</span>
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                  {selectedCat}
                  <Link href="/dashboard/knowledge" className="hover:text-blue-200">✕</Link>
                </span>
              </div>
            )}

            {articles.length > 0 ? (
              articles.map((post: any) => (
                <Link 
                  href={`/dashboard/knowledge/${post.slug}`} 
                  key={post._id}
                  className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden h-full"
                >
                   <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                   <div className="p-5 flex-1 flex flex-col">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.categories?.slice(0, 2).map((cat: any) => (
                          <span key={cat.title} className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                            {cat.title}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
                        {post.description}
                      </p>
                      <div className="text-xs text-slate-400 pt-3 border-t border-slate-50">
                        {new Date(post.publishedAt || Date.now()).toLocaleDateString()}
                      </div>
                   </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-slate-300">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-slate-600 font-bold">此分類下暫無文章</p>
                <Link href="/dashboard/knowledge" className="text-blue-600 text-sm mt-2 hover:underline">
                  查看全部文章
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}