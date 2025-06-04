import { useState } from 'react';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL;

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });
      if (!res.ok) throw new Error('Login failed');      const data = await res.json();
      const jwt = data.token || data.access_token;
      if (!jwt) throw new Error('No token received');
      const userRes = await fetch(`${API_URL}/api/users/get`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!userRes.ok) throw new Error('User fetch failed');
      const userObj = await userRes.json();
      if (!userObj.roles.includes('ROLE_ADMIN')) {
        throw new Error('Wrong Permissions');
      }
      onLogin(jwt, userObj);
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <div className="login-container">
      <div className="login-top-section">
        <div className="login-logo-area">
          <h1 className="login-logo">StudentHub</h1>
          <p className="login-subtitle">Admin Panel</p>
        </div>
      </div>
      <div className="login-form-section">
        <h2 className="login-title">Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            className="login-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button className="login-button" type="submit">continue</button>
        </form>
        {error && <div className="login-error">{error}</div>}
        <p className="login-note">Admin privileges required</p>
      </div>
    </div>
  );
}

export default Login;
