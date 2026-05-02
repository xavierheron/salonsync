import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { formatDate, formatTime, getPrice } from '../utils/helpers';

const NAV = [
  { label: 'Dashboard', href: '#/customer' },
  { label: 'Book Appointment', href: '#/book' },
  { label: 'My Appointments', href: '#/appointments' },
  { label: 'Payments', href: '#/payments' },
  { label: 'Profile', href: '#/profile' },
  { label: 'Logout', action: 'logout' },
];

const STATUS_CLASS = {
  'Pending Payment': 'badge-pending',
  'Paid': 'badge-paid',
  'Completed': 'badge-completed',
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState(null);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const bookings = await api.getMyAppointments();
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const future = bookings
          .filter(b => new Date(b.date) >= today)
          .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
        setUpcoming(future[0] || null);
        setStats({
          total: bookings.length,
          paid: bookings.filter(b => b.status === 'Paid' || b.status === 'Completed').length,
          pending: bookings.filter(b => b.status === 'Pending Payment').length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <Navbar links={NAV} />
      <div className="page">
        <div className="dashboard-header">
          <div>
            <h1>{user?.isFirstLogin ? 'Welcome, ' : 'Welcome back, '}<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{user?.name}</em></h1>
            <p>Here's an overview of your appointments</p>
          </div>
          <button className="btn btn-primary" onClick={() => window.location.hash = '#/book'}>
            + Book Appointment
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-label">Total Bookings</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-label">Paid / Done</div>
            <div className="stat-value">{stats.paid}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-label">Pending Payment</div>
            <div className="stat-value">{stats.pending}</div>
          </div>
        </div>

        <div className="card card-gold" style={{ marginBottom: '2rem' }}>
          <div className="upcoming-badge">Next Appointment</div>
          {loading ? (
            <p style={{ color: 'var(--text2)' }}>Loading...</p>
          ) : upcoming ? (
            <div>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>{upcoming.service}</h3>
              <p style={{ color: 'var(--text2)', fontSize: '0.95rem' }}>
                {formatDate(upcoming.date)} at {formatTime(upcoming.time)}
              </p>
              <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <span className={`badge ${STATUS_CLASS[upcoming.status] || ''}`}>{upcoming.status}</span>
                <span style={{ color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem' }}>
                  ${upcoming.price}
                </span>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text2)' }}>No upcoming appointments. Ready to book one?</p>
          )}
        </div>

        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Quick Actions
        </h3>
        <div className="quick-actions">
          {[
            { icon: '📅', label: 'Book Appointment', href: '#/book' },
            { icon: '📋', label: 'My Appointments', href: '#/appointments' },
            { icon: '💳', label: 'Make Payment', href: '#/payments' },
          ].map((a, i) => (
            <div key={i} className="action-card" onClick={() => window.location.hash = a.href}>
              <div className="action-icon">{a.icon}</div>
              <div className="action-label">{a.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}