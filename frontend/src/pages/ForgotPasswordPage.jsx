import React, { useState } from 'react';
import { api } from '../utils/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
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

        <h2>Reset Password</h2>

        {sent ? (
          <div>
            <div className="alert alert-success">
              If that email is registered, a reset link has been sent. Check your inbox.
            </div>
            <button className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
              onClick={() => window.location.hash = '#/login'}>
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && <div className="alert alert-error">⚠ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="Enter your email" required
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="auth-footer">
              <a onClick={() => window.location.hash = '#/login'} style={{ cursor: 'pointer' }}>
                Back to Login
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
