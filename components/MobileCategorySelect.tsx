"use client";

import { useRouter } from "next/navigation";

type Props = {
  categories: any[];
  selectedCat: string;
};

export default function MobileCategorySelect({ categories, selectedCat }: Props) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'All') {
      router.push('/dashboard/knowledge');
    } else {
      router.push(`/dashboard/knowledge?cat=${encodeURIComponent(val)}`);
    }
  };

  return (
    <div className="lg:hidden col-span-1 mb-4">
      <select
        className="w-full p-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
        onChange={handleChange}
        value={selectedCat || 'All'}
      >
        <option value="All">📚 全部文章</option>
        {categories.map((cat: any) => (
          cat.count > 0 && (
            <option key={cat.title} value={cat.title}>
              {cat.title} ({cat.count})
            </option>
          )
        ))}
      </select>
    </div>
  );
}