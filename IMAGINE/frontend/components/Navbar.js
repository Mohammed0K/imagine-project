
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur bg-white/60 dark:bg-neutral-950/50 border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">IMAGINE</Link>
        <div className="flex gap-4 text-sm">
          <Link href="/destinations" className="hover:underline">الوجهات</Link>
          <Link href="/book" className="hover:underline">الحجوزات</Link>
          <a href="https://vision2030.gov.sa" target="_blank" rel="noreferrer" className="opacity-70 hover:opacity-100">رؤية 2030</a>
        </div>
      </div>
    </nav>
  );
}
