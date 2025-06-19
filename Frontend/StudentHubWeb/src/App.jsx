import { useEffect, useState } from 'react';
import './App.css';
import Login from './Login.jsx';
import Navbar from './Navbar.jsx';
import UserManagement from './UserManagement.jsx';
import Bussiness from './Bussiness.jsx';
import Dashboard from './Dashboard.jsx';
import PostManagement from './PostManagement.jsx';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  useEffect(() => {
    if (!token) return;
    try {
      const [, payload] = token.split(".");
      if (!payload) return;
      const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
      if (!decoded.exp) return;
      const expiresIn = decoded.exp * 1000 - Date.now();
      if (expiresIn <= 0) {
        handleLogout();
        return;
      }
      const timer = setTimeout(() => {
        handleLogout();
      }, expiresIn);

      return () => clearTimeout(timer);
    } catch (e) {
      handleLogout();
    }
  }, [token]);

  const handleLogin = (jwt, userObj) => {
    setToken(jwt);
    setUser(userObj);
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(userObj));
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!token) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} onLogout={handleLogout} />        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/bussiness" element={<Bussiness />} />
            <Route path="/events" element={<div>Events Management (coming soon)</div>} />
            <Route path="/posts" element={<PostManagement />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
