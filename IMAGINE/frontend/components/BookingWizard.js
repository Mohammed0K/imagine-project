
import { useState } from "react";

const TYPES = [
  { value: "car", label: "سيارة" },
  { value: "room", label: "غرفة فندق" },
  { value: "guide", label: "مرشد سياحي" },
  { value: "camp", label: "كامبينق" },
  { value: "trip", label: "رحلة برية" },
];

const LOCATIONS = [
  "جدة البلد","الدرعية","حي طريف","العلا","النفود","الطائف","أبها","القصيم","الأحساء","البحر الأحمر"
];

export default function BookingWizard() {
  const [type, setType] = useState("room");
  const [loc, setLoc] = useState("العلا");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [guests, setGuests] = useState(2);

  function handleSubmit(e){
    e.preventDefault();
    const qs = new URLSearchParams({ type, loc, from, to, guests });
    window.location.href = `/book?${qs.toString()}`;
  }

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-5 gap-3 bg-white/70 dark:bg-neutral-900/70 border rounded-2xl p-4">
      <select value={type} onChange={e=>setType(e.target.value)} className="rounded-xl border px-3 py-2">
        {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      <select value={loc} onChange={e=>setLoc(e.target.value)} className="rounded-xl border px-3 py-2">
        {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
      <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="rounded-xl border px-3 py-2" />
      <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="rounded-xl border px-3 py-2" />
      <div className="flex gap-2">
        <input type="number" min="1" value={guests} onChange={e=>setGuests(e.target.value)} className="w-full rounded-xl border px-3 py-2" placeholder="الضيوف" />
        <button className="rounded-xl px-4 bg-black text-white dark:bg-white dark:text-black">ابحث</button>
      </div>
    </form>
  );
}
