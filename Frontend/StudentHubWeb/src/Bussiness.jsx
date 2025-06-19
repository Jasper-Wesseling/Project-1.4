import React, { useState } from "react";
import './Business.css';
import './AdminComponents.css';

const API_URL = import.meta.env.VITE_API_URL;

const Bussiness = () => {    
    const [form, setForm] = useState({
        bio: "",
        name: "",
        email: "",
        password: "",
        interests: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setForm({
            bio: "",
            name: "",
            email: "",
            password: "",
            interests: "",
        });
        setSubmitted(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_URL + '/api/users/bussiness/new', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    full_name: form.name,
                    email: form.email,
                    password: form.password,
                    bio: form.bio,
                    interests: form.interests,
                }),
            });
            
            if (!res.ok) {
                // Fix: Only read the response body once
                let errorMessage = "Registration failed";
                try {
                    const errorData = await res.json();
                    if (errorData.violations && Array.isArray(errorData.violations)) {
                        const messages = errorData.violations.map(v => `${v.propertyPath}: ${v.message}`).join('\n');
                        errorMessage = "Registration failed:\n" + messages;
                    } else {
                        errorMessage = "Registration failed: " + (errorData.error || errorData.message || "Unknown error");
                    }
                } catch (jsonErr) {
                    // If JSON parsing fails, it means the response isn't JSON
                    errorMessage = `Registration failed: ${res.status} - ${res.statusText}`;
                }
                
                alert(errorMessage);
                setLoading(false);
                return;
            }
            
            const data = await res.json();
            setSubmitted(true);
            
        } catch (e) {
            console.error('Registration error:', e);
            alert("Registration failed: " + e.message);
        }
        setLoading(false);
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1 className="admin-title">Business Management</h1>
                <button 
                    className="admin-button admin-button-secondary"
                    onClick={resetForm}
                    disabled={!submitted}
                >
                    Create Another
                </button>
            </div>
            
            <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>
                Manage your business operations and create new business accounts.
            </p>

            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div className="admin-container" style={{ marginBottom: 0 }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#333' }}>
                        Create Business Account
                    </h2>
                    
                    {submitted ? (
                        <div className="alert alert-success">
                            🎉 Business account created successfully! The admin can now login with the provided credentials.
                        </div>
                    ) : (
                        <form onSubmit={handleRegister} className="modal-form">
                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: '600', 
                                    color: '#333' 
                                }}>
                                    Business Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    className="modal-input"
                                    placeholder="Enter business name"
                                />
                            </div>

                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: '600', 
                                    color: '#333' 
                                }}>
                                    Business Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={form.bio}
                                    onChange={handleChange}
                                    required
                                    className="modal-input"
                                    placeholder="Describe your business..."
                                    rows="4"
                                    style={{ resize: 'vertical' }}
                                />
                            </div>
                            
                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: '600', 
                                    color: '#333' 
                                }}>
                                    Admin Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="modal-input"
                                    placeholder="admin@business.com"
                                />
                            </div>
                            
                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: '600', 
                                    color: '#333' 
                                }}>
                                    Initial Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    className="modal-input"
                                    placeholder="Create a secure password"
                                />
                            </div>

                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: '600', 
                                    color: '#333' 
                                }}>
                                    Business Interests
                                </label>
                                <input
                                    type="text"
                                    name="interests"
                                    value={form.interests}
                                    onChange={handleChange}
                                    required
                                    className="modal-input"
                                    placeholder="e.g., Technology, Education, Healthcare"
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                className="admin-button admin-button-primary"
                                style={{ width: '100%', marginTop: '1rem' }}
                                disabled={loading}
                            >
                                {loading ? 'Creating Account...' : 'Create Business Account'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Bussiness;