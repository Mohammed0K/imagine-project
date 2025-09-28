import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {useRouter} from 'next/router';


export default function Place(){
    const {id}=useRouter().query;return(
    
    <div><Navbar/><div className='container'>
        
        <h2>Place #{id}</h2>
        <p>Details...</p>
        </div><Footer/></div>)
        
    }