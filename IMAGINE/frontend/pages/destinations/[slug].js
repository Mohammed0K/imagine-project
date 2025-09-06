
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const DATA = [
  { slug:"jeddah-albalad", name:"جدة البلد", image:"https://share.google/images/7YGfdrV9Y2itipmCF", info:"حي تاريخي على البحر الأحمر" },
  { slug:"diriyah", name:"الدرعية", image:"https://images.unsplash.com/photo-1542353436-312f0b63b6f8?q=80&w=1200&auto=format&fit=crop", info:"العاصمة التاريخية للدولة السعودية الأولى" },
  { slug:"atturaif", name:"حي طريف", image:"https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop", info:"موقع تراث عالمي في الدرعية" },
  { slug:"alula", name:"العلا", image:"https://images.unsplash.com/photo-1591604129939-2056f309266f?q=80&w=1200&auto=format&fit=crop", info:"جبال وصخور ساحرة وتجارب أثرية" },
  { slug:"nafud", name:"النفود", image:"https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1200&auto=format&fit=crop", info:"كثبان رملية ورحلات برية" },
  { slug:"taif", name:"الطائف", image:"https://images.unsplash.com/photo-1619383888835-d7d12e08a3b8?q=80&w=1200&auto=format&fit=crop", info:"مصايف وورود وأسواق" },
  { slug:"abha", name:"أبها", image:"https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200&auto=format&fit=crop", info:"جبال السروات والضباب" },
  { slug:"qassim", name:"القصيم", image:"https://images.unsplash.com/photo-1519683109079-d5f539e154fc?q=80&w=1200&auto=format&fit=crop", info:"مزارع وتمور وتجارب ريفية" },
  { slug:"ahsa", name:"الأحساء", image:"https://images.unsplash.com/photo-1539314696303-6a0b267e68a1?q=80&w=1200&auto=format&fit=crop", info:"واحة ونخيل وبيوت طينية" },
  { slug:"redsea", name:"البحر الأحمر", image:"https://images.unsplash.com/photo-1505735457224-9e49b9b4d0a4?q=80&w=1200&auto=format&fit=crop", info:"شواطئ وغوص وجزر" },
];

export default function DestinationDetail(){
  const { query } = useRouter();
  const d = DATA.find(x => x.slug === query.slug);
  return (
    <div>
      <Navbar/>
      {!d ? <div className="max-w-5xl mx-auto p-6">لا توجد وجهة</div> : (
        <main>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={d.image} alt={d.name} className="w-full h-[48vh] object-cover" />
          <section className="max-w-5xl mx-auto p-6">
            <h1 className="text-3xl font-bold">{d.name}</h1>
            <p className="opacity-80 mt-2">{d.info}</p>
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={`${d.image}&ixid=${i}`} alt="" className="h-48 w-full object-cover rounded-xl"/>
              ))}
            </div>
          </section>
        </main>
      )}
      <Footer/>
    </div>
  );
}
