
export default function EventCard({ e }) {
  return (
    <div className="rounded-2xl shadow p-4 bg-white/70 dark:bg-neutral-900/70 border border-black/5">
      <div className="flex gap-3 items-start">
        {e.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.image} alt={e.name} className="w-24 h-24 object-cover rounded-xl" />
        ) : (
          <div className="w-24 h-24 rounded-xl bg-gray-200 dark:bg-neutral-800" />
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{e.name}</h3>
          <p className="text-sm opacity-80">{e.city} • {e.type}</p>
          {e.starts_at && (
            <p className="text-sm mt-1">Starts: {new Date(e.starts_at).toLocaleString()}</p>
          )}
          {e.price != null && (
            <p className="text-sm mt-1">Price: {e.price} SAR</p>
          )}
        </div>
      </div>
    </div>
  );
}
