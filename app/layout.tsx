import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "諮商心理師國考數據庫",
  description: "結合 AI 解析與完整知識體系的備考平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      {/* suppressHydrationWarning={true} 
        是用來忽略瀏覽器擴充功能(如翻譯、比價插件)偷偷修改 DOM 而導致的報錯
      */}
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}