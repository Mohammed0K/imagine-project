
import Link from "next/link";

export default function CategoryCard({ c }) {
  return (
    <Link href={`/book?type=${c.type}`} className="rounded-2xl border p-4 hover:shadow">
      <div className="text-2xl">{c.emoji}</div>
      <h3 className="mt-2 font-semibold">{c.title}</h3>
      <p className="text-sm opacity-80">{c.subtitle}</p>
    </Link>
  );
}
