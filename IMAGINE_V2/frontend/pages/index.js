import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PlaceCard from '../components/PlaceCard';
import GuideCard from '../components/GuideCard';



const places=[{id:1,name:'Diriyah',region:'Riyadh',description:'Historic district.'},
    {id:2,name:'AlUla',region:'Madina',description:'Rock formations.'}];
    
    
const guides=[{id:1,name:'Ali',region:'Riyadh',languages:['ar','en'],bio:'Culture tours.'},
                {id:2,name:'Noura',region:'AlUla',languages:['ar'],bio:'Hiking.'}];

export default function Home(){
    
    return(
    <div><Navbar/>
    <div className='container'>
        
        <h1>Find a local guide</h1>
        <div className='grid'>{places.map(p=><PlaceCard key={p.id} place={p}/>)}</div>
        
        <h2>Top Guides</h2>
        
        <div className='grid'>{guides.map(g=><GuideCard key={g.id} guide={g}/>)}</div>
        
        </div><Footer/></div>)
        
    }