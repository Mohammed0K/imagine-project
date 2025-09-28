export default function Navbar(){
    
    return(
    <nav className='nav'>
        <a className='brand' href='/'>Imagine</a>
        <a href='/places'>Places</a>
        <a href='/guides'>Guides</a>
        <a href='/bookings'>Bookings</a>
        <a href='/admin'>Admin</a>
        <a href='/auth/login'>Login</a>
        <a href='/auth/register'>Register</a>
        </nav>)
        
    }