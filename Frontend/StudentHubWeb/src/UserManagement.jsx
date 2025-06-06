import { useEffect, useState } from 'react';
import './UserManagement.css';
import './AdminComponents.css';
const API_URL = import.meta.env.VITE_API_URL;

const UserManagement = () => {
    const jwt = localStorage.getItem('token');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/users/admin/getall`, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data);
            setError('');
        } catch (err) {
            setError('Failed to load users: ' + err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const response = await fetch(`${API_URL}/api/users/admin/role`, {
                method: 'PUT',
                headers: { 
                    Authorization: `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "id": userId, "role": newRole }),
            });
            
            if (!response.ok) throw new Error('Failed to update role');
            
            const data = await response.json();
            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                await fetchUsers();
            }
            setSuccess(`Role updated successfully to ${newRole}`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to update role: ' + err.message);
            setTimeout(() => setError(''), 3000);
            console.error(err);
        }
    };

    const handleBan = async (userId, type) => {
        try {
            const response = await fetch(`${API_URL}/api/users/admin/ban`, {
                method: 'PUT',
                headers: { 
                    Authorization: `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "id": userId, type: type }),
            });
            
            if (!response.ok) throw new Error('Failed to update ban status');
            
            await fetchUsers();
            setSuccess(`User ${type ? 'banned' : 'unbanned'} successfully`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to update ban status: ' + err.message);
            setTimeout(() => setError(''), 3000);
            console.error(err);
        }
    };

    const roles = ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_TEMP'];    const getRoleBadgeClass = (userRoles) => {
        if (userRoles.includes('ROLE_ADMIN')) return 'role-badge role-badge-admin';
        if (userRoles.includes('ROLE_TEMP')) return 'role-badge role-badge-temp';
        return 'role-badge role-badge-user';
    };

    const getRoleDisplayName = (userRoles) => {
        if (userRoles.includes('ROLE_ADMIN')) return 'Admin';
        if (userRoles.includes('ROLE_TEMP')) return 'Temp';
        return 'User';
    };

    if (loading) {
        return (
            <div className="admin-container">
                <div className="admin-header">
                    <h1 className="admin-title">User Management</h1>
                </div>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1 className="admin-title">User Management</h1>
                <button 
                    className="admin-button admin-button-primary"
                    onClick={fetchUsers}
                >
                    Refresh Users
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    {success}
                </div>
            )}

            {users.length === 0 ? (
                <div className="alert alert-info">
                    No users found.
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Full Name</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td style={{
                                        ...(user.disabled ? { 
                                            textDecoration: 'line-through', 
                                            color: '#dc3545',
                                            opacity: 0.7
                                        } : {})
                                    }}>
                                        {user.email}
                                    </td>
                                    <td style={{
                                        ...(user.disabled ? { 
                                            textDecoration: 'line-through', 
                                            color: '#dc3545',
                                            opacity: 0.7
                                        } : {})
                                    }}>
                                        {user.full_name || 'N/A'}
                                    </td>
                                    <td>
                                        <span className={getRoleBadgeClass(user.roles)}>
                                            {getRoleDisplayName(user.roles)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`role-badge ${user.disabled ? 'role-badge-admin' : 'role-badge-user'}`}>
                                            {user.disabled ? 'Banned' : 'Active'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <select
                                                className="modal-select"
                                                style={{ width: 'auto', padding: '0.5rem', fontSize: '0.875rem' }}
                                                value={
                                                    user.roles.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' :
                                                    user.roles.includes('ROLE_TEMP') ? 'ROLE_TEMP' : 'ROLE_USER'
                                                }
                                                onChange={e => handleRoleChange(user.id, e.target.value)}
                                            >
                                                {roles.map(role => (
                                                    <option key={role} value={role}>
                                                        {role.replace('ROLE_', '')}
                                                    </option>
                                                ))}
                                            </select>
                                            
                                            {user.disabled ? (
                                                <button 
                                                    type="button" 
                                                    className="admin-button admin-button-secondary"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                    onClick={() => handleBan(user.id, false)}
                                                >
                                                    Unban
                                                </button>
                                            ) : (
                                                <button 
                                                    type="button" 
                                                    className="admin-button admin-button-danger"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                    onClick={() => handleBan(user.id, true)}
                                                >
                                                    Ban
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default UserManagement;