import React from 'react';
import Navbar from '../components/Navbar';

const NAV = [
  { label: 'Home', href: '#/' },
  { label: 'Login', href: '#/login' },
  { label: 'Sign Up', href: '#/register', cta: true },
];

const STEPS = [
  { icon: '🏪', num: '01', title: 'Sign Up & Setup', desc: 'Create your salon account and configure services, staff, and availability in minutes.' },
  { icon: '📱', num: '02', title: 'Customers Book', desc: 'Share your booking link. Customers select services and schedule appointments online.' },
  { icon: '🗓️', num: '03', title: 'Manage Appointments', desc: 'View your schedule, handle changes, and track all appointments from your dashboard.' },
  { icon: '💳', num: '04', title: 'Process Payments', desc: 'Complete transactions securely at checkout using our integrated POS system.' },
];

export default function HowItWorksPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar links={NAV} />

      <section className="hero" style={{ paddingBottom: '3rem' }}>
        <h1>How <em>SalonSync</em> Works</h1>
        <p>Four simple steps to transform your salon operations.</p>
      </section>

      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 2rem 4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {STEPS.map((s, i) => (
            <div key={i} className="card" style={{ position: 'relative', paddingTop: '2rem' }}>
              <div style={{
                position: 'absolute', top: '1.2rem', right: '1.2rem',
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '3rem', color: 'var(--border2)', fontWeight: 300, lineHeight: 1
              }}>
                {s.num}
              </div>
              <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>{s.icon}</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{s.title}</h3>
              <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>{s.desc}</p>
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
