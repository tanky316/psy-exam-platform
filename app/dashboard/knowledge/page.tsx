import { client } from '@/lib/sanity';
import KnowledgeCategoryCard from '@/components/KnowledgeCategoryCard'; // 引入新元件

export const revalidate = 0;

export default async function KnowledgeBasePage() {
  const categories = await client.fetch(`
    *[_type == "category"] | order(_createdAt asc) {
      _id, title, description,
      "articles": *[_type == "knowledge" && references(^._id)] { _id, title, slug }
    }
  `);

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-16 border-b border-slate-100 pb-10">
         <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">🧠 心理學知識庫</h2>
         <p className="text-slate-500 mt-3 max-w-2xl mx-auto text-lg">
           系統化整理六大核心考科概念，您的數位隨身辭典。
         </p>
      </div>

      {/* Grid 排版設定：增加了 gap-x-12 讓左右間距更寬，讀起來更舒服 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
        {categories.map((cat: any) => (
          <KnowledgeCategoryCard key={cat._id} category={cat} />
        ))}
      </div>
    </div>
  );
}