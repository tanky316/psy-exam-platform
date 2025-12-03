import { client } from '@/lib/sanity';
import Link from 'next/link';
import RecruitmentCard from '@/components/RecruitmentCard';

// 強制此頁面為動態渲染，確保 searchParams 變動時會重新執行
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const POSTS_PER_PAGE = 5;

// 定義 Props 型別，適應 Next.js 15 的 Promise 寫法
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function RecruitmentPage(props: Props) {
  // 1. 等待參數解析 (解決 Next.js 15 讀不到頁碼的問題)
  const searchParams = await props.searchParams;
  
  // 取得頁碼，預設為 1
  const pageParam = searchParams?.page;
  const currentPage = Number(pageParam) || 1;
  
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;

  // 2. 修改查詢語法
  // coalesce(isActive, false): 如果資料庫裡這欄是空的，就當作 false (避免排序壞掉)
  // | order(...): 先排 isActive (true 在前)，再排截止日期
 const query = `{
    "posts": *[_type == "recruitment"] | order((isActive == true) desc, deadline asc) [${start}...${end}] {
      _id, title, researcher, reward, deadline, link, isActive, description
    },
    "total": count(*[_type == "recruitment"])
  }`;

  // 3. 加上 { cache: 'no-store' } 確保不讀到舊快取
  const data = await client.fetch(query, {}, { cache: 'no-store' });
  const { posts, total } = data;

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-6 flex justify-between items-center">
         <h2 className="text-3xl font-bold text-slate-900">📢 受試者徵求</h2>
         <Link href="/dashboard/recruitment/new" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold">+ 我要刊登</Link>
      </div>

      <div className="grid gap-6">
        {posts.length > 0 ? (
          posts.map((post: any) => (
  <div key={post._id} className="relative">
    {/* Debug 用：暫時顯示狀態 */}
    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs p-1 z-50">
      狀態: {String(post.isActive)}
    </span>
    
    <RecruitmentCard post={post} />
  </div>
))
        ) : (
          <div className="text-gray-500 py-10 text-center">目前無徵求...</div>
        )}
      </div>

      {/* 分頁按鈕區 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-slate-100">
          {currentPage > 1 ? (
            <Link
              href={`?page=${currentPage - 1}`}
              className="px-4 py-2 border rounded hover:bg-slate-50 text-sm"
            >
              ← 上一頁
            </Link>
          ) : (
            <span className="px-4 py-2 border rounded text-slate-300 cursor-not-allowed text-sm">
              ← 上一頁
            </span>
          )}

          <span className="text-sm text-slate-500">
            第 {currentPage} 頁，共 {totalPages} 頁
          </span>

          {currentPage < totalPages ? (
            <Link
              href={`?page=${currentPage + 1}`}
              className="px-4 py-2 border rounded hover:bg-slate-50 text-sm"
            >
              下一頁 →
            </Link>
          ) : (
            <span className="px-4 py-2 border rounded text-slate-300 cursor-not-allowed text-sm">
              下一頁 →
            </span>
          )}
        </div>
      )}
    </div>
  );
}