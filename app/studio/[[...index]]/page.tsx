"use client";

import { NextStudio } from 'next-sanity/studio';
import config from '@/sanity.config'; // 使用 @ 直接指到根目錄，比較穩

export default function StudioPage() {
  return <NextStudio config={config} />;
}