import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', role: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(form);
      login(data.user, data.token);
      const routes = { customer: '#/customer', staff: '#/staff', admin: '#/admin' };
      window.location.hash = routes[data.user.role] || '#/';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <h1>SalonSync</h1>
          <p>Smart POS & Appointment Management</p>
        </div>

        <h2>Welcome</h2>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Enter your email" required
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" required
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select required value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="">Select Role</option>
              <option value="customer">Customer</option>
              <option value="staff">Salon Staff</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
          <a onClick={() => window.location.hash = '#/forgot-password'}
            style={{ fontSize: '0.85rem', color: 'var(--text2)', cursor: 'pointer' }}>
            Forgot your password?
          </a>
        </div>

        <div className="auth-footer">
          Don't have an account?{' '}
          <a onClick={() => window.location.hash = '#/register'}>Create one</a>
        </div>
      </div>
    </div>
  );
}