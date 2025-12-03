import { createClient } from "next-sanity";
import { NextResponse } from "next/server";

// 設定一個擁有寫入權限的 Sanity Client
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN, // 讀取我們剛剛設的 Token
  apiVersion: "2024-03-12",
  useCdn: false,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, researcher, reward, deadline, link, description } = body;

    // 在 Sanity 建立新文件
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
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: description || '詳情請見報名連結。',
            },
          ],
        },
      ],
    };

    await writeClient.create(doc);

    return NextResponse.json({ message: 'Success' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}