import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className='navbar-top'>
        <h2>{user.full_name}</h2>
        <button onClick={onLogout}>Logout</button>
        <hr />
      </div>
      <div className='navbar-middle'>
        <ul>
          <li>
            <Link
              to="/" 
              className={isActive('/dashboard') ? 'active' : ''}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/users" 
              className={isActive('/users') ? 'active' : ''}
            >
              User Management
            </Link>
          </li>
          <li>
            <Link 
              to="/bussiness" 
              className={isActive('/bussiness') ? 'active' : ''}
            >
              Business
            </Link>
          </li>
          <li>
            <Link 
              to="/events" 
              className={isActive('/events') ? 'active' : ''}
            >
              Events Management
            </Link>
          </li>
          <li>
            <Link 
              to="/posts" 
              className={isActive('/posts') ? 'active' : ''}
            >
              Posts Management
            </Link>
          </li>
        </ul>
      </div>
      <div className='navbar-bottom'>
        <hr />
        <p>StudentHub</p>
      </div>
    </nav>
  );
};

export default Navbar;
