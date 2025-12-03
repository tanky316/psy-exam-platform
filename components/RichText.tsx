"use client";

import { PortableText } from '@portabletext/react';
import { client } from '@/lib/sanity';
import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';

// 設定圖片網址產生器
const builder = imageUrlBuilder(client);
function urlFor(source: any) {
  return builder.image(source);
}

// 定義渲染規則
const myPortableTextComponents = {
  // 1. 處理插入在文章中的圖片
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <div className="my-8 relative w-full h-96 rounded-lg overflow-hidden">
          <img
            src={urlFor(value).url()}
            alt={value.alt || '文章圖片'}
            className="object-contain w-full h-full"
          />
        </div>
      );
    },
  },
  
  // 2. 處理列表 (Bullet list & Number list)
  list: {
    bullet: ({ children }: any) => <ul className="list-disc pl-5 my-4 space-y-2">{children}</ul>,
    number: ({ children }: any) => <ol className="list-decimal pl-5 my-4 space-y-2">{children}</ol>,
  },

  // 3. 處理段落與標題 (加強樣式)
  block: {
    h1: ({ children }: any) => <h1 className="text-3xl font-bold mt-8 mb-4 text-slate-900">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-800 border-l-4 border-blue-500 pl-3">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-bold mt-6 mb-3 text-slate-800">{children}</h3>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-slate-300 pl-4 italic my-6 text-slate-600 bg-slate-50 py-2 pr-2 rounded-r">
        {children}
      </blockquote>
    ),
    normal: ({ children }: any) => <p className="mb-4 leading-relaxed text-slate-700">{children}</p>,
  },

  // 4. 處理文字樣式 (粗體、連結)
  marks: {
    link: ({ children, value }: any) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined;
      return (
        <a 
          href={value.href} 
          rel={rel} 
          target="_blank"
          className="text-blue-600 hover:underline font-medium"
        >
          {children}
        </a>
      );
    },
    strong: ({ children }: any) => <strong className="font-bold text-slate-900">{children}</strong>,
  },
};

export default function RichText({ content }: { content: any }) {
  return (
    // 這裡還是保留 prose 作為基底，但上面定義的 components 會覆蓋預設行為
    <div className="prose prose-slate prose-lg max-w-none">
      <PortableText value={content} components={myPortableTextComponents} />
    </div>
  );
}