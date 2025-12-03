import { client } from '@/lib/sanity';
import { PortableText } from '@portabletext/react';
import imageUrlBuilder from '@sanity/image-url';
import RichText from '@/components/RichText';

export const revalidate = 0;

// 設定圖片網址產生器
const builder = imageUrlBuilder(client);
function urlFor(source: any) {
  return builder.image(source);
}

export default async function AboutPage() {
  // 抓取第一筆作者資料 (假設只有您一位創辦人)
  const author = await client.fetch(`
    *[_type == "author"][0] {
      name,
      role,
      avatar,
      bio,
      specialties,
      socials
    }
  `);

  if (!author) {
    return <div className="p-8 text-center text-slate-500">尚無作者資料，請至後台新增。</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* 上半部：背景與個人簡介 */}
        <div className="p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8 border-b border-slate-100">
          
          {/* 大頭照 */}
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0 bg-slate-100">
            {author.avatar && (
              <img 
                src={urlFor(author.avatar).width(400).height(400).url()} 
                alt={author.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* 姓名與頭銜 */}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{author.name}</h1>
            <p className="text-xl text-blue-600 font-medium mb-4">{author.role}</p>
            
            {/* 專長標籤 */}
            {author.specialties && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                {author.specialties.map((tag: string) => (
                  <span key={tag} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 社群連結按鈕 */}
            {author.socials && (
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {author.socials.map((social: any) => (
                  <a 
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    {social.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 下半部：詳細介紹 (PortableText) */}
        <div className="p-8 md:p-12 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 mb-6 border-l-4 border-blue-600 pl-4">
            關於我 / 品牌故事
          </h2>
          <div className="mt-4">
  <RichText content={author.bio} />
</div>
        </div>

      </div>
    </div>
  );
}