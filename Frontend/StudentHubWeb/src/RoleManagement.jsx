import React, { useState, useEffect } from 'react';
import './App.css';

const RoleManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const roles = [
        { value: 'ROLE_USER', label: 'User', color: '#6c757d' },
        { value: 'ROLE_MODERATOR', label: 'Moderator', color: '#fd7e14' },
        { value: 'ROLE_EDITOR', label: 'Editor', color: '#20c997' },
        { value: 'ROLE_ADMIN', label: 'Admin', color: '#dc3545' }
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/api/users/admin/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to fetch users');
            }
        } catch (err) {
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, action, role = null) => {
        setError('');
        setSuccessMessage('');

        try {
            const token = localStorage.getItem('authToken');
            let url;
            let body = {};

            switch (action) {
                case 'promote':
                    url = `${API_URL}/api/users/admin/roles/promote/${userId}`;
                    break;
                case 'demote':
                    url = `${API_URL}/api/users/admin/roles/demote/${userId}`;
                    break;
                case 'set':
                    url = `${API_URL}/api/users/admin/roles/set`;
                    body = { user_id: userId, role: role };
                    break;
                case 'add':
                    url = `${API_URL}/api/users/admin/roles/add`;
                    body = { user_id: userId, role: role };
                    break;
                case 'remove':
                    url = `${API_URL}/api/users/admin/roles/remove`;
                    body = { user_id: userId, role: role };
                    break;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {                setSuccessMessage(data.message);
                await fetchUsers();
                setSelectedUser(null);
                setNewRole('');
            } else {
                setError(data.error || 'Failed to update user role');
            }
        } catch (err) {
            setError('Network error occurred');
        }
    };

    const getRoleColor = (roleName) => {
        const role = roles.find(r => r.value === roleName);
        return role ? role.color : '#6c757d';
    };

    const getRoleLabel = (roleName) => {
        const role = roles.find(r => r.value === roleName);
        return role ? role.label : roleName;
    };

    const getHighestRole = (userRoles) => {
        const roleHierarchy = ['ROLE_ADMIN', 'ROLE_EDITOR', 'ROLE_MODERATOR', 'ROLE_USER'];
        for (const role of roleHierarchy) {
            if (userRoles.includes(role)) {
                return role;
            }
        }
        return 'ROLE_USER';
    };

    if (loading) {
        return (
            <div className="admin-container">
                <div className="admin-card">
                    <h2>Loading users...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Role Management</h1>
                <p>Manage user roles and permissions</p>
            </div>

            {error && (
                <div className="alert alert-danger">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {successMessage && (
                <div className="alert alert-success">
                    <strong>Success:</strong> {successMessage}
                </div>
            )}

            <div className="admin-card">
                <div className="card-header">
                    <h3>All Users ({users.length})</h3>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Avatar</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Primary Role</th>
                                    <th>All Roles</th>
                                    <th>Study Program</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>
                                            <div className="user-avatar">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.full_name} />
                                                ) : (
                                                    <div className="avatar-placeholder">
                                                        {user.full_name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <strong>{user.full_name}</strong>
                                        </td>
                                        <td>
                                            <span className="email-text">{user.email}</span>
                                        </td>
                                        <td>
                                            <span 
                                                className="role-badge" 
                                                style={{ backgroundColor: getRoleColor(user.role) }}
                                            >
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="roles-container">
                                                {user.roles.map(role => (
                                                    <span 
                                                        key={role}
                                                        className="role-badge small" 
                                                        style={{ backgroundColor: getRoleColor(role) }}
                                                    >
                                                        {getRoleLabel(role)}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="study-program">
                                                {user.study_program || 'Not specified'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="date-text">
                                                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="admin-button small"
                                                    onClick={() => setSelectedUser(user)}
                                                >
                                                    Manage
                                                </button>
                                                {!user.roles.includes('ROLE_ADMIN') && (
                                                    <button
                                                        className="admin-button small promote"
                                                        onClick={() => handleRoleChange(user.id, 'promote')}
                                                    >
                                                        Promote to Admin
                                                    </button>
                                                )}
                                                {user.roles.includes('ROLE_ADMIN') && user.role === 'ROLE_ADMIN' && (
                                                    <button
                                                        className="admin-button small demote"
                                                        onClick={() => handleRoleChange(user.id, 'demote')}
                                                    >
                                                        Demote from Admin
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>            {selectedUser && (
                <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Manage User: {selectedUser.full_name}</h3>
                            <button 
                                className="close-button"
                                onClick={() => setSelectedUser(null)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="user-info">
                                <p><strong>Email:</strong> {selectedUser.email}</p>
                                <p><strong>Current Primary Role:</strong> 
                                    <span 
                                        className="role-badge" 
                                        style={{ backgroundColor: getRoleColor(selectedUser.role), marginLeft: '10px' }}
                                    >
                                        {getRoleLabel(selectedUser.role)}
                                    </span>
                                </p>
                                <p><strong>All Roles:</strong></p>
                                <div className="roles-container">
                                    {selectedUser.roles.map(role => (
                                        <span 
                                            key={role}
                                            className="role-badge" 
                                            style={{ backgroundColor: getRoleColor(role) }}
                                        >
                                            {getRoleLabel(role)}
                                            {role !== 'ROLE_USER' && (
                                                <button
                                                    className="remove-role-btn"
                                                    onClick={() => handleRoleChange(selectedUser.id, 'remove', role)}
                                                    title="Remove this role"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="role-actions">
                                <h4>Quick Actions</h4>
                                <div className="quick-actions">
                                    {roles.map(role => (
                                        <button
                                            key={role.value}
                                            className={`admin-button ${selectedUser.role === role.value ? 'active' : ''}`}
                                            onClick={() => handleRoleChange(selectedUser.id, 'set', role.value)}
                                            style={{ backgroundColor: role.color }}
                                        >
                                            Set as {role.label}
                                        </button>
                                    ))}
                                </div>

                                <h4>Add Role</h4>
                                <div className="add-role">
                                    <select 
                                        value={newRole} 
                                        onChange={(e) => setNewRole(e.target.value)}
                                        className="role-select"
                                    >
                                        <option value="">Select a role to add</option>
                                        {roles.filter(role => !selectedUser.roles.includes(role.value)).map(role => (
                                            <option key={role.value} value={role.value}>
                                                {role.label}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        className="admin-button"
                                        onClick={() => {
                                            if (newRole) {
                                                handleRoleChange(selectedUser.id, 'add', newRole);
                                            }
                                        }}
                                        disabled={!newRole}
                                    >
                                        Add Role
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleManagement;
