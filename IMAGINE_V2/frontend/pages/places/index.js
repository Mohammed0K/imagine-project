import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PlaceCard from '../../components/PlaceCard';


const data=[{id:1,name:'Diriyah',region:'Riyadh',description:'Historic district.'},
    {id:2,name:'AlUla',region:'Madina',description:'Rock formations.'}];
    
    export default function Places(){
        return(
        <div><Navbar/>
        <div className='container'>
            <h2>Places</h2>
            
            <div className='grid'>{data.map(p=><PlaceCard key={p.id} place={p}/>)}
            </div>
            </div>
            <Footer/>
            </div>)
            
        }