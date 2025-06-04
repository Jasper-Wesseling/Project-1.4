import { use, useEffect, useState } from 'react';
import './UserManagement.css';
const API_URL = import.meta.env.VITE_API_URL;


const UserManagement = () => {
    const jwt = localStorage.getItem('token'); // Retrieve JWT from localStorage or your auth storage
    const [users, setUsers] = useState([]);
    const fetchUsers = () => {
        fetch(`${API_URL}/api/users/admin/getall`, {
            headers: { Authorization: `Bearer ${jwt}` }
        })
            .then(res => res.json())
            .then(data => {
            // Only update if something changed
            setUsers(data);
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const [selectedRoles, setSelectedRoles] = useState('');

    const handleRoleChange = (userId, newRole) => {
        fetch(`${API_URL}/api/users/admin/role`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${jwt}` },
            body: JSON.stringify({ "id": userId, "role": newRole }),
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    fetchUsers();
                }
                setSelectedRoles(newRole);
            })
            .catch(err => console.error(err));
    };

    const handleBan = (userId) => {
        fetch(`${API_URL}/api/users/admin/ban`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${jwt}` },
            body: JSON.stringify({ "id": userId}),
        })
            .then(() => fetchUsers()) // Always refresh the list after banning
            .catch(err => console.error(err));
    };

    const roles = ['ROLE_USER', 'ROLE_ADMIN'];

    return (
        <>
            <h1>User Management</h1>
            <div className='user-management-container'>
                <h2>User List</h2>
                <div className="user-list-scrollable" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', marginBottom: '1rem' }}>
                    {users.length === 0 ? (
                        <div>No users found.</div>
                    ) : (
                        <ul>
                            {users.map(user => (
                                <li key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                    <span
                                        style={{
                                            ...(user.disabled ? { textDecoration: 'line-through', color: 'red' } : {})
                                        }}
                                    >
                                        {user.email}
                                    </span>
                                    <select
                                        value={user.roles.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' : 'ROLE_USER'}
                                        onChange={e => handleRoleChange(user.id, e.target.value)}
                                    >
                                        {roles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                    <button type="button" onClick={() => handleBan(user.id)} style={{ color: 'red' }}>
                                        Ban
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}

export default UserManagement;