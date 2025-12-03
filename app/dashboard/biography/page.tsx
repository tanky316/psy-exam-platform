import { client } from '@/lib/sanity';
import Link from 'next/link';
import imageUrlBuilder from '@sanity/image-url';

export const revalidate = 0;

const builder = imageUrlBuilder(client);
function urlFor(source: any) {
  return builder.image(source);
}

export default async function BiographyPage() {
  // 抓取所有心理學家資料
  const bios = await client.fetch(`
    *[_type == "biography"] | order(name asc) {
      _id,
      name,
      slug,
      avatar,
      famousFor
    }
  `);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12 border-b border-slate-200 pb-8">
         <h2 className="text-3xl font-extrabold text-slate-900">🧠 心理學家名人堂</h2>
         <p className="text-slate-500 mt-3">
           認識那些形塑現代心理學的大師，探索他們的生平與核心思想。
         </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {bios.length > 0 ? (
          bios.map((bio: any) => (
            <Link 
              key={bio._id} 
              href={`/dashboard/biography/${bio.slug?.current}`}
              className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
            >
              {/* 照片區 */}
              <div className="aspect-square bg-slate-100 overflow-hidden relative">
                {bio.avatar ? (
                  <img 
                    src={urlFor(bio.avatar).width(400).height(400).url()} 
                    alt={bio.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-200">👤</div>
                )}
                {/* 名字覆蓋層 */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                  <h3 className="text-white font-bold text-lg">{bio.name}</h3>
                </div>
              </div>

              {/* 標籤區 */}
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {bio.famousFor?.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 text-xs text-right text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  閱讀生平 →
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500">資料建置中...</p>
            <p className="text-sm mt-2">請至 Sanity 後台新增心理學家資料</p>
          </div>
        )}
      </div>
    </div>
  );
}