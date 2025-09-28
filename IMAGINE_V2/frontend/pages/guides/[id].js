import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {useRouter} from 'next/router';



export default function Guide(){
    const {id}=useRouter().query;
    return(<div><Navbar/><div className='container'>
        <h2>Guide #{id}</h2>
        <a className='btn primary' href='/bookings'>Request Booking</a>
        
        </div><Footer/></div>)
        
    }