import React from 'react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '2rem',
        color: 'var(--gold)',
        letterSpacing: '0.06em',
        marginBottom: '2rem',
      }}>
        SalonSync
      </h1>
      <div style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '6rem',
        color: 'var(--border2)',
        lineHeight: 1,
        marginBottom: '1rem',
      }}>
        404
      </div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text)' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text2)', marginBottom: '2rem', maxWidth: 360 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        className="btn btn-primary"
        onClick={() => window.location.hash = '#/'}
      >
        Back to Home
      </button>
    </div>
  );
}