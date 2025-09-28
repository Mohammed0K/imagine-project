import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';


export default function Register(){
    return(<div><Navbar/>
    <div className='container'>
        <h2>Register</h2>
        <form onSubmit={e=>e.preventDefault()}>
            <input placeholder='Full name'/> 
            <input placeholder='Email'/>
             <select defaultValue='TOURIST'>
                <option>TOURIST</option>
                <option>GUIDE</option>
                </select>
                 <input placeholder='Password' type='password'/>
                  <button className='btn primary'>Create account</button>
                  </form>
                  </div><Footer/></div>)
    }