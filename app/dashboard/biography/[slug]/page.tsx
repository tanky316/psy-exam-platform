import { client } from '@/lib/sanity';
import { PortableText } from '@portabletext/react';
import imageUrlBuilder from '@sanity/image-url';
import Link from 'next/link';
import RichText from '@/components/RichText';

export const revalidate = 0;

const builder = imageUrlBuilder(client);
function urlFor(source: any) {
  return builder.image(source);
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function BiographyDetailPage({ params }: Props) {
  const { slug } = await params;
  
  const bio = await client.fetch(
    `*[_type == "biography" && slug.current == $slug][0]{
      name,
      avatar,
      bio,
      famousFor
    }`,
    { slug }
  );

  if (!bio) return <div>查無此人</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
         <Link href="/dashboard/biography" className="text-sm text-slate-500 hover:text-blue-600 font-bold">
           ← 回名人堂
         </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* 頭部介紹區 */}
        <div className="md:flex bg-slate-900 text-white">
          <div className="md:w-1/3 aspect-[3/4] relative">
             {bio.avatar && (
               <img 
                 src={urlFor(bio.avatar).width(600).url()} 
                 alt={bio.name}
                 className="absolute inset-0 w-full h-full object-cover"
               />
             )}
          </div>
          <div className="p-8 md:p-12 md:w-2/3 flex flex-col justify-center">
             <h1 className="text-4xl font-extrabold mb-4">{bio.name}</h1>
             <div>
               <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider font-bold">著名理論 / 貢獻</p>
               <div className="flex flex-wrap gap-2">
                 {bio.famousFor?.map((tag: string) => (
                   <span key={tag} className="bg-white/20 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                     {tag}
                   </span>
                 ))}
               </div>
             </div>
          </div>
        </div>

        {/* 傳記內容 */}
        <div className="p-8 md:p-12">
<div className="mt-8">
  <RichText content={bio.bio} />
          </div>
        </div>
      </div>
    </div>
  );
}