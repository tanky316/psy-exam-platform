import { client } from '@/lib/sanity';
import Link from 'next/link';
import RecruitmentCard from '@/components/RecruitmentCard'; // 引入新元件

export const revalidate = 0;

export default async function RecruitmentPage() {
  const posts = await client.fetch(`
    *[_type == "recruitment"] | order(deadline asc) {
      _id, title, researcher, reward, deadline, link, isActive, description
    }
  `);

  return (
    <div className="space-y-8">
      {/* 標題區塊省略...請保留原本的標題 */}
      <div className="border-b border-slate-200 pb-6 flex justify-between items-center">
         <h2 className="text-3xl font-bold text-slate-900">📢 受試者徵求</h2>
         <Link href="/dashboard/recruitment/new" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold">+ 我要刊登</Link>
      </div>

      <div className="grid gap-6">
        {posts.length > 0 ? (
          posts.map((post: any) => (
            <RecruitmentCard key={post._id} post={post} />
          ))
        ) : (
          <div>目前無徵求...</div>
        )}
      </div>
    </div>
  );
}