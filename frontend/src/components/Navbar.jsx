import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ links = [] }) {
  const { logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <header className="navbar">
        <h1 className="logo" onClick={() => window.location.hash = '#/'}>SalonSync</h1>
        <nav>
          {links.map((link, i) => (
            link.action === 'logout'
              ? <button key={i} className="nav-link" onClick={() => setShowConfirm(true)} style={{ cursor: 'pointer' }}>Logout</button>
              : <a
                  key={i}
                  className={link.cta ? 'nav-cta' : ''}
                  onClick={() => window.location.hash = link.href}
                  style={{ cursor: 'pointer' }}
                >
                  {link.label}
                </a>
          ))}
        </nav>
      </header>

      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <h3>Log out?</h3>
            <p style={{ color: 'var(--text2)', marginTop: '0.5rem' }}>
              Are you sure you want to log out of SalonSync?
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowConfirm(false)}>Stay</button>
              <button className="btn btn-danger" onClick={logout}>Yes, Log Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}