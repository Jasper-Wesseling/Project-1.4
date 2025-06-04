import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">      <div className="navbar-left">
        <Link to="/admin" className="logo">
          StudentHub
        </Link>
      </div>
      <div className="navbar-center">        <ul className="nav-links">
          <li>
            <Link to="/admin">Dashboard</Link>
          </li>
          <li>
            <Link to="/admin/ban">Ban User</Link>
          </li>
          <li>
            <Link to="/admin/roles">Role Management</Link>
          </li>
          <li>
            <Link to="/admin/events">Events</Link>
          </li>
          <li>
            <Link to="/admin/posts">Posts</Link>
          </li>
        </ul>
      </div>
      <div className="navbar-right">
        <div className="user-welcome">
          <span className="welcome-text">Welcome, {user?.full_name || user?.email || 'User'}!</span>
        </div>
        <button onClick={onLogout} className="logout-btn">
          <i className="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
