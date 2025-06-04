import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  return (
    // vertical nav
    <nav className="navbar">
      <div>
        <h2>{user.full_name}</h2>
        <button onClick={onLogout}>Logout</button>
        <hr />
        <ul>
          <li>
            <Link to="/users">User Management</Link>
          </li>
          <li>
            <Link to="/bussiness">Bussiness</Link>
          </li>
          <li>
            <Link to="/events">Events Management</Link>
          </li>
          <li>
            <Link to="/posts">Posts Management</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
