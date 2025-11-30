import { client } from '@/lib/sanity';
import { PortableText } from '@portabletext/react';

export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPost({ params }: Props) {
  
  const { slug } = await params;

  // [關鍵修正] 強制把網址的亂碼轉回中文 (例如 %E6%B8%AC -> 測試)
  const decodedSlug = decodeURIComponent(slug);

  // [監視器] 請看 VS Code 下方的終端機，會印出這兩行
  console.log('--------------------------------');
  console.log('原始 Slug:', slug);
  console.log('解碼後 Slug:', decodedSlug);
  console.log('--------------------------------');

  const post = await client.fetch(
    `*[_type == "post" && slug.current == $slug][0]{
      title,
      _createdAt,
      content
    }`,
    { slug: decodedSlug } // 改用解碼後的中文去查
  );

  if (!post) {
    // 如果還是找不到，把失敗的原因印出來
    return (
      <div className="p-10 text-center space-y-4">
        <h2 className="text-xl font-bold text-red-500">找不到這篇文章...</h2>
        <div className="text-sm text-slate-500 bg-slate-100 p-4 rounded text-left inline-block">
          <p>系統正在尋找 Slug 為：<strong>{decodedSlug}</strong> 的文章</p>
          <p>請檢查 Sanity 後台該文章的 Slug 欄位是否完全一致。</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <article className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8 md:p-12">
        <header className="mb-8 border-b border-slate-100 pb-8">
          <a href="/" className="text-slate-500 hover:text-blue-600 text-sm mb-4 inline-block">
            ← 回首頁
          </a>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {post.title}
          </h1>
          <time className="text-slate-400 text-sm">
            {new Date(post._createdAt).toLocaleDateString('zh-TW')}
          </time>
        </header>

        <div className="prose prose-slate prose-lg max-w-none">
          <PortableText value={post.content} />
        </div>
      </article>
    </main>
  );
}