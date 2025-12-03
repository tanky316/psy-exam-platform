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

  // 2. 優化查詢語法 (GROQ Query)
  // 排序邏輯建議：
  // 1. isActive desc: 手動開啟者優先
  // 2. (deadline > now()) desc: "尚未過期" 優先於 "已過期"
  // 3. _createdAt desc: "最新建立" 的貼文優先 (讓新刊登的研究能被馬上看到)
  const query = `{
    "posts": *[_type == "recruitment"] | order(isActive desc, (deadline > now()) desc, _createdAt desc) [${start}...${end}] {
      _id, 
      title, 
      researcher, 
      reward, 
      deadline, 
      link, 
      isActive, 
      description,
      _createdAt
    },
    "total": count(*[_type == "recruitment"])
  }`;

  // 3. 抓取資料
  const data = await client.fetch(query, {}, { cache: 'no-store' });
  const { posts, total } = data;

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <div className="space-y-8">
      {/* 標題與按鈕區 */}
      <div className="border-b border-slate-200 pb-6 flex justify-between items-center">
         <h2 className="text-3xl font-bold text-slate-900">📢 受試者徵求</h2>
         <Link 
            href="/dashboard/recruitment/new" 
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors shadow-sm"
         >
            + 我要刊登
         </Link>
      </div>

      {/* 列表區 */}
      <div className="grid gap-6">
        {posts.length > 0 ? (
          posts.map((post: any) => {
            // 前端判斷：是否過期 (isActive 為 false 或 截止日 < 今天)
            const isExpired = !post.isActive || new Date(post.deadline) < new Date();

            return (
              <div 
                key={post._id} 
                className={`relative group transition-all duration-300 ${isExpired ? 'opacity-80' : 'hover:-translate-y-1 hover:shadow-md'}`}
              >
                {/* 🎨 UI：已截止印章 (Rubber Stamp Style) */}
                {isExpired && (
                  <div className="absolute top-1/2 right-4 md:right-12 -translate-y-1/2 z-20 pointer-events-none select-none">
                    <div className="
                      border-[3px] border-slate-400 text-slate-400 
                      px-6 py-2 rounded-lg 
                      text-xl md:text-2xl font-black tracking-[0.2em] uppercase
                      -rotate-12 opacity-80
                      bg-white/60 backdrop-blur-[2px]
                      shadow-sm
                    ">
                      已截止
                    </div>
                  </div>
                )}
                
                {/* 卡片本體：如果是過期的，加上灰階濾鏡 */}
                <div className={`${isExpired ? 'grayscale-[0.8] brightness-[0.95]' : ''}`}>
                   <RecruitmentCard post={post} />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-gray-500 py-20 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
            目前沒有徵求中的研究...
          </div>
        )}
      </div>

      {/* 分頁按鈕區 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-slate-100">
          {currentPage > 1 ? (
            <Link
              href={`?page=${currentPage - 1}`}
              className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors text-slate-700"
            >
              ← 上一頁
            </Link>
          ) : (
            <span className="px-4 py-2 border border-slate-100 rounded-lg text-slate-300 cursor-not-allowed text-sm">
              ← 上一頁
            </span>
          )}

          <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-md">
            {currentPage} / {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={`?page=${currentPage + 1}`}
              className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors text-slate-700"
            >
              下一頁 →
            </Link>
          ) : (
            <span className="px-4 py-2 border border-slate-100 rounded-lg text-slate-300 cursor-not-allowed text-sm">
              下一頁 →
            </span>
          )}
        </div>
      )}
    </div>
  );
}