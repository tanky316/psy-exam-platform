import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "nyer9yxd", // 您的 Project ID
  dataset: "production",
  apiVersion: "2024-03-12",
  useCdn: false, // 開發模式下設為 false，這樣您改文章後網頁才會立刻變
});