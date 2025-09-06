
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DestinationCard from "../components/DestinationCard";
import BookingWizard from "../components/BookingWizard";

const HERO = "https://images.unsplash.com/photo-1591604129939-2056f309266f?q=80&w=1600&auto=format&fit=crop";

const DESTS = [
  { slug:"jeddah-albalad", name:"جدة البلد", subtitle:"تراث البحر الأحمر", image:"https://share.google/images/7YGfdrV9Y2itipmCF" },
  { slug:"redsea", name:"البحر الأحمر", subtitle:"جزر وشعاب مرجانية", image:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop" },
  { slug:"diriyah", name:"الدرعية", subtitle:"تاريخ وهوية", image:"https://images.unsplash.com/photo-1542353436-312f0b63b6f8?q=80&w=1200&auto=format&fit=crop" },
  { slug:"atturaif", name:"حي طريف", subtitle:"تراث عالمي", image:"https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop" },
  { slug:"taif", name:"الطائف", subtitle:"مصايف وورود", image:"https://images.unsplash.com/photo-1619383888835-d7d12e08a3b8?q=80&w=1200&auto=format&fit=crop" },
  { slug:"abha", name:"أبها", subtitle:"جبال وضباب", image:"https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200&auto=format&fit=crop" },
  { slug:"alula", name:"العلا", subtitle:"جبال وآثار", image:"https://images.unsplash.com/photo-1591604129939-2056f309266f?q=80&w=1200&auto=format&fit=crop" },
  { slug:"nafud", name:"النفود", subtitle:"كثبان ورحلات", image:"https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1200&auto=format&fit=crop" },
];

export default function Home(){
  return (
    <div>
      <Navbar/>
      <header className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HERO} alt="" className="w-full h-[56vh] object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6">
          <h1 className="text-3xl md:text-5xl font-bold text-white">اكتشف السعودية</h1>
          <p className="text-white/90 mt-2">صور وتجارب وحجوزات لوجهات مثل جدة البلد، الدرعية، العلا، الطائف، أبها، والبحر الأحمر</p>
          <div className="mt-4">
            <BookingWizard/>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold">وجهات مميزة</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
          {DESTS.map(d => <DestinationCard key={d.slug} d={d}/>)}
        </div>
      </main>
      <Footer/>
    </div>
  );
}
