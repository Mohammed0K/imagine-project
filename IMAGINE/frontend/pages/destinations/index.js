
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import DestinationCard from "../../components/DestinationCard";

const DESTS = [
  { slug:"jeddah-albalad", name:"جدة البلد", subtitle:"تراث البحر الأحمر", image:"https://share.google/images/7YGfdrV9Y2itipmCF" },
  { slug:"redsea", name:"البحر الأحمر", subtitle:"جزر وشعاب مرجانية", image:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop" },
  { slug:"diriyah", name:"الدرعية", subtitle:"تاريخ وهوية", image:"https://images.unsplash.com/photo-1542353436-312f0b63b6f8?q=80&w=1200&auto=format&fit=crop" },
  { slug:"atturaif", name:"حي طريف", subtitle:"تراث عالمي", image:"https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop" },
  { slug:"taif", name:"الطائف", subtitle:"مصايف وورود", image:"https://images.unsplash.com/photo-1619383888835-d7d12e08a3b8?q=80&w=1200&auto=format&fit=crop" },
  { slug:"abha", name:"أبها", subtitle:"جبال وضباب", image:"https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200&auto=format&fit=crop" },
  { slug:"alula", name:"العلا", subtitle:"جبال وآثار", image:"https://images.unsplash.com/photo-1591604129939-2056f309266f?q=80&w=1200&auto=format&fit=crop" },
  { slug:"nafud", name:"النفود", subtitle:"كثبان ورحلات", image:"https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1200&auto=format&fit=crop" },
  { slug:"qassim", name:"القصيم", subtitle:"مزارع وتمور", image:"https://images.unsplash.com/photo-1519683109079-d5f539e154fc?q=80&w=1200&auto=format&fit=crop" },
  { slug:"ahsa", name:"الأحساء", subtitle:"واحة ونخيل", image:"https://images.unsplash.com/photo-1539314696303-6a0b267e68a1?q=80&w=1200&auto=format&fit=crop" },
];

export default function Destinations(){
  return (
    <div>
      <Navbar/>
      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold">الوجهات</h1>
        <p className="opacity-80 mt-2">أشهر مناطق المملكة</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DESTS.map((d)=> <DestinationCard key={d.slug} d={d}/>)}
        </div>
      </main>
      <Footer/>
    </div>
  );
}
