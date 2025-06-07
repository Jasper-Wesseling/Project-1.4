import React, { useState } from "react";
import './Business.css';
import './AdminComponents.css';

const Bussiness = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();        setLoading(true);
        
        setTimeout(() => {
            setSubmitted(true);
            setLoading(false);
        }, 1000);
    };

    const resetForm = () => {
        setForm({ name: "", email: "", password: "" });
        setSubmitted(false);
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
                        <form onSubmit={handleSubmit} className="modal-form">
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