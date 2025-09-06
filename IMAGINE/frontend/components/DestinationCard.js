
import Link from "next/link";

export default function DestinationCard({ d }) {
  return (
    <Link href={`/destinations/${d.slug}`} className="group relative block overflow-hidden rounded-2xl border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={d.image} alt={d.name} className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-3 left-3 right-3 text-white">
        <h3 className="text-lg font-semibold">{d.name}</h3>
        <p className="text-xs opacity-90">{d.subtitle}</p>
      </div>
    </Link>
  );
}
