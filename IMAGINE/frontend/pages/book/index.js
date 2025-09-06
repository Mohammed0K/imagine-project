
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CategoryCard from "../../components/CategoryCard";
import BookingWizard from "../../components/BookingWizard";

const CATS = [
  { type:"car", title:"سيارة", subtitle:"إيجار سيارات للرحلات", emoji:"🚗" },
  { type:"room", title:"غرفة فندق", subtitle:"فنادق وشقق مفروشة", emoji:"🏨" },
  { type:"guide", title:"مرشد سياحي", subtitle:"خبراء محليين للوجهات", emoji:"🧭" },
  { type:"camp", title:"كامبينق", subtitle:"تجارب صحراوية وجبلية", emoji:"🏕️" },
  { type:"trip", title:"رحلة برية", subtitle:"مسارات سفاري وهايكنق", emoji:"🛻" },
];

export default function Book(){
  const router = useRouter();
  const { type, loc, from, to, guests } = router.query;

  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold">الحجوزات</h1>
        <p className="opacity-80 mt-2">اختر نوع الحجز وأكمل التفاصيل</p>

        <div className="mt-5">
          <BookingWizard />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {CATS.map((c)=> <CategoryCard key={c.type} c={c} />)}
        </div>

        {type && (
          <div className="mt-8 rounded-2xl border p-4 bg-white/60 dark:bg-neutral-900/60">
            <h2 className="font-semibold mb-2">نتائج مبدئية</h2>
            <p className="text-sm opacity-80">النوع: {type} | الموقع: {loc || "—"} | من: {from || "—"} | إلى: {to || "—"} | الضيوف: {guests || "—"}</p>
            <p className="mt-3 text-sm opacity-80">هنا سيتم ربط النتائج من API لاحقًا.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
