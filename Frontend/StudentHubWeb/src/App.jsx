import { useState } from 'react';
import './App.css';
import Login from './Login.jsx';
import BanUser from './BanUser.jsx';
import Navbar from './Navbar.jsx';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; 

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

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
        <Navbar user={user} onLogout={handleLogout} />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<div>Dashboard - Home page (protected)</div>} />
            <Route path="/ban" element={<BanUser />} />
            <Route path="/events" element={<div>Events Management (coming soon)</div>} />
            <Route path="/posts" element={<div>Posts Management (coming soon)</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
