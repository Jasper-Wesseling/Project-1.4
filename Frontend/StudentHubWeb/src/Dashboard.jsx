import React from 'react';
import './Dashboard.css';
import './AdminComponents.css';

const Dashboard = ({ user }) => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome to StudentHub Admin</h1>
        <div className="role-badge role-badge-admin">
          Admin Dashboard
        </div>
      </div>
      
      <div className="alert alert-info">
        <strong>Welcome back, {user.full_name}!</strong> You're logged in as an administrator.
      </div>      <div className="dashboard-grid">
        <a href="/users" className="dashboard-link">
          <div className="dashboard-card dashboard-quick-action">
            <span className="dashboard-card-icon">👥</span>
            <h3>User Management</h3>
            <p>Manage user accounts, roles, and permissions</p>
          </div>
        </a>

        <a href="/bussiness" className="dashboard-link">
          <div className="dashboard-card dashboard-stat">
            <span className="dashboard-card-icon">🏢</span>
            <h3>Business Management</h3>
            <p>Create and manage business accounts</p>
          </div>
        </a>

        <a href="/events" className="dashboard-link">
          <div className="dashboard-card dashboard-warning">
            <span className="dashboard-card-icon">📅</span>
            <h3>Event Management</h3>
            <p>Organize and manage events (Coming Soon)</p>
            <button className="dashboard-button dashboard-button-warning" disabled>
              Coming Soon
            </button>
          </div>
        </a>

        <a href="/posts" className="dashboard-link">
          <div className="dashboard-card dashboard-secondary">
            <span className="dashboard-card-icon">📝</span>
            <h3>Posts Management</h3>
            <p>Moderate and manage user posts (Coming Soon)</p>
            <button className="dashboard-button dashboard-button-warning" disabled>
              Coming Soon
            </button>
          </div>
        </a>
      </div>

      <div className="dashboard-overview">
        <h3 className="dashboard-overview-title">📊 System Overview</h3>
        <div className="dashboard-stats-grid">
          <div className="dashboard-stat-card dashboard-stat-blue">
            <div className="dashboard-stat-value">Active</div>
            <div className="dashboard-stat-label">System Status</div>
          </div>
          
          <div className="dashboard-stat-card dashboard-stat-purple">
            <div className="dashboard-stat-value">Web</div>
            <div className="dashboard-stat-label">Admin Panel</div>
          </div>
          
          <div className="dashboard-stat-card dashboard-stat-green">
            <div className="dashboard-stat-value">Online</div>
            <div className="dashboard-stat-label">Backend API</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
