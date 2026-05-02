import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './AppRouter';
import './styles/global.css';

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.2rem',
    }}>
      <h1 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '2.2rem',
        color: 'var(--gold)',
        letterSpacing: '0.06em',
      }}>
        SalonSync
      </h1>
      <div style={{
        width: 36,
        height: 36,
        border: '3px solid var(--border)',
        borderTop: '3px solid var(--gold)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider loadingScreen={<LoadingScreen />}>
      <AppRouter />
    </AuthProvider>
  );
}