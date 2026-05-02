import React from 'react';
import Navbar from '../components/Navbar';

const NAV = [
  { label: 'How It Works', href: '#/how-it-works' },
  { label: 'Login', href: '#/login' },
  { label: 'Sign Up', href: '#/register', cta: true },
];

const FEATURES = [
  { icon: '📅', title: 'Appointment Scheduling', desc: 'Customers book and manage salon appointments online with ease.' },
  { icon: '💳', title: 'POS Payments', desc: 'Securely process card payments through our integrated payment system.' },
  { icon: '📋', title: 'Customer Records', desc: 'Store and manage customer profiles and full service history.' },
  { icon: '📊', title: 'Business Reports', desc: 'Real-time revenue charts and performance metrics for your salon.' },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar links={NAV} />

      <section className="hero">
        <h1>Smart POS & Booking<br />for <em>Modern Salons</em></h1>
        <p>Manage bookings, payments, and customers all in one elegant platform.</p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={() => window.location.hash = '#/login'}>
            Start Booking
          </button>
          <button className="btn btn-secondary" onClick={() => window.location.hash = '#/how-it-works'}>
            See How It Works
          </button>
        </div>
      </section>

      <section className="features-section" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 className="section-title">Platform Features</h2>
        <p className="section-sub">Everything your salon needs in one place</p>
        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <p>© 2026 <span>SalonSync</span>. All rights reserved.</p>
      </footer>
    </div>
  );
}
