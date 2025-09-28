import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import GuideCard from '../../components/GuideCard';



const data=[{id:1,name:'Ali',region:'Riyadh',languages:['ar','en'],bio:'Culture tours.'},
{id:2,name:'Noura',region:'AlUla',languages:['ar'],bio:'Hiking.'}];

export default function Guides(){
    return(<div><Navbar/><div className='container'>
        <h2>Guides</h2>
        <div className='grid'>{data.map(g=><GuideCard key={g.id} guide={g}/>)}</div>
        </div><Footer/></div>)
        
    }