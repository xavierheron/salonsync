import React from 'react';

export default function RegisterPage() {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-brand">
          <h1>SalonSync</h1>
          <p>Smart POS & Appointment Management</p>
        </div>

        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>

        <h2 style={{ marginBottom: '0.8rem' }}>Registration Disabled</h2>

        <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginBottom: '1.8rem', lineHeight: 1.6 }}>
          This is a demo version of SalonSync. Please use the demo accounts below to explore the platform.
        </p>

        <div style={{
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '1.2rem',
          marginBottom: '1.5rem',
          textAlign: 'left',
        }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)', marginBottom: '0.8rem' }}>
            Demo Accounts
          </div>
          {[
            { role: 'Customer', email: 'customer@demo.com', password: 'demo1234' },
            { role: 'Staff', email: 'staff@demo.com', password: 'demo1234' },
            { role: 'Admin', email: 'admin@demo.com', password: 'demo1234' },
          ].map((a, i) => (
            <div key={i} style={{
              padding: '0.6rem 0',
              borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.15rem' }}>
                  {a.role}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>{a.email}</div>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text3)', fontFamily: 'monospace' }}>
                {a.password}
              </div>
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => window.location.hash = '#/login'}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}