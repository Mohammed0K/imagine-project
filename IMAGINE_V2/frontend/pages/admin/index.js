import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';



export default function Admin(){
    return(<div><Navbar/><div className='container'>
        <h2>Admin Dashboard</h2>
        <p>Pending guides, users, reviews...</p>
        </div><Footer/></div>)
}