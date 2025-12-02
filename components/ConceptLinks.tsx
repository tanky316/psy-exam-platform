import Link from "next/link";

export default function ConceptLinks({ slugs }: { slugs: string | null }) {
  if (!slugs) return null;

  // 1. 用逗號切割字串
  const links = slugs.split(',').map(s => s.trim()).filter(Boolean);

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {links.map((slug, index) => (
        <Link 
          key={slug}
          href={`/dashboard/knowledge/${slug}`}
          target="_blank"
          className="inline-flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 hover:bg-blue-100 hover:border-blue-300 transition-colors"
        >
          📖 延伸閱讀 {links.length > 1 ? `(${index + 1})` : ''}
        </Link>
      ))}
    </div>
  );
}