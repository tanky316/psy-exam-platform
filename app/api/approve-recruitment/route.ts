import { createClient } from "next-sanity";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto"; // ✅ 新增：引入 UUID 生成器

// 設定一個擁有寫入權限的 Sanity Client
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: "2024-03-12",
  useCdn: false,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, researcher, reward, deadline, link, description } = body;

    // ✅ 關鍵修正：Sanity 的 Array 項目必須包含 "_key"
    // 我們使用 randomUUID() 為每個區塊生成唯一識別碼
    const doc = {
      _type: 'recruitment',
      title,
      researcher,
      reward,
      deadline,
      link,
      isActive: true, // 預設開啟
      description: [
        {
          _key: randomUUID(), // 必填：段落的 Key
          _type: 'block',
          children: [
            {
              _key: randomUUID(), // 必填：文字 spans 的 Key
              _type: 'span',
              text: description || '詳情請見報名連結。',
            },
          ],
        },
      ],
    };

    const result = await writeClient.create(doc);

    return NextResponse.json({ message: 'Success', id: result._id }, { status: 200 });
  } catch (error) {
    console.error('Sanity Create Error:', error);
    return NextResponse.json({ message: 'Error creating document' }, { status: 500 });
  }
}