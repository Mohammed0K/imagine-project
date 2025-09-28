import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
export default function Login(){
    return(<div><Navbar/><div className='container'>
        <h2>Login</h2>
        <form onSubmit={e=>e.preventDefault()}>
            <input placeholder='Email'/>
             <input placeholder='Password' type='password'/>
              <button className='btn primary'>Sign in</button>
              </form></div><Footer/></div>)
}