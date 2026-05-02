import React, { useState } from 'react';
import { api } from '../utils/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.name.trim().length < 3) { setError('Name must be at least 3 characters'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (!form.role) { setError('Please select a role'); return; }
    setLoading(true);
    try {
      await api.register(form);
      setSuccess(true);
      setTimeout(() => window.location.hash = '#/login', 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <h1>SalonSync</h1>
          <p>Create your account</p>
        </div>
        <h2>Get started</h2>
        {error && <div className="alert alert-error">⚠ {error}</div>}
        {success && <div className="alert alert-success">✓ Account created! Redirecting...</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Enter your name" value={form.name} onChange={set('name')} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Enter your email" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Minimum 8 characters" value={form.password} onChange={set('password')} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={set('role')} required>
              <option value="">Select Role</option>
              <option value="customer">Customer</option>
              <option value="staff">Salon Staff</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            disabled={loading || success}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account?{' '}
          <a onClick={() => window.location.hash = '#/login'}>Sign in</a>
        </div>
      </div>
    </div>
  );
}
