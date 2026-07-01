import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../utils/api';
import { formatDate, formatTime, getTodayInJamaica } from '../utils/helpers';

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

export default function AppointmentsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [error, setError] = useState('');
  const today = getTodayInJamaica();

  const isWithin24Hours = (date, time) => {
    const apptDateTime = new Date(`${date}T${time}:00-05:00`);
    return (apptDateTime - new Date()) / (1000 * 60 * 60) < 24;
  };

  const load = async () => {
    try {
      const data = await api.getMyAppointments();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const upcoming = bookings.filter(b => b.date >= today && b.status !== 'Completed');
  const past = bookings.filter(b => b.date < today || b.status === 'Completed');

  const confirmReschedule = async () => {
    if (!modal.date || !modal.time) return;
    if (modal.date < today) { alert('Cannot select a past date'); return; }
    try {
      await api.rescheduleAppointment(modal.id, { date: modal.date, time: modal.time });
      setModal(null);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const doCancel = async () => {
    try {
      await api.cancelAppointment(confirm);
      setConfirm(null);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const tabStyle = (tab) => ({
    padding: '0.6rem 1.4rem',
    borderRadius: 'var(--radius)',
    border: 'none',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '0.88rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: activeTab === tab ? 'var(--gold)' : 'var(--bg3)',
    color: activeTab === tab ? 'var(--bg)' : 'var(--text2)',
  });

  const renderTable = (list, showActions) => {
    if (list.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">{showActions ? '📅' : '🕐'}</div>
          <h3>{showActions ? 'No upcoming appointments' : 'No past appointments'}</h3>
          <p>{showActions ? 'Book your next appointment to get started' : 'Your completed appointments will appear here'}</p>
          {showActions && (
            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }}
              onClick={() => window.location.hash = '#/book'}>Book Now</button>
          )}
        </div>
      );
    }

    return (
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Service</th><th>Date</th><th>Time</th>
              <th>Price</th><th>Status</th>
              {showActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {list.map((b) => (
              <tr key={b._id}>
                <td style={{ fontWeight: 500, color: 'var(--text)' }}>{b.service}</td>
                <td>{formatDate(b.date)}</td>
                <td>{formatTime(b.time)}</td>
                <td style={{ color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
                  ${b.price}
                </td>
                <td><span className={`badge ${STATUS_CLASS[b.status] || ''}`}>{b.status}</span></td>
                {showActions && (
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {b.status !== 'Completed' && (
                        <button className="btn btn-ghost"
                          style={{ padding: '0.35rem 0.8rem', fontSize: '0.82rem' }}
                          onClick={() => setModal({ id: b._id, date: '', time: '' })}>
                          Reschedule
                        </button>
                      )}
                      {isWithin24Hours(b.date, b.time) ? (
                        <button className="btn btn-danger"
                          style={{ padding: '0.35rem 0.8rem', fontSize: '0.82rem', opacity: 0.45, cursor: 'not-allowed' }}
                          disabled title="Cannot cancel within 24 hours of appointment">
                          Cancel
                        </button>
                      ) : (
                        <button className="btn btn-danger"
                          style={{ padding: '0.35rem 0.8rem', fontSize: '0.82rem' }}
                          onClick={() => setConfirm(b._id)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <Navbar links={NAV} />
      <div className="page">
        <div className="dashboard-header">
          <div>
            <h1 className="page-title">My Appointments</h1>
            <p className="page-subtitle">Manage and view your bookings</p>
          </div>
          <button className="btn btn-primary" onClick={() => window.location.hash = '#/book'}>
            + New Booking
          </button>
        </div>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button style={tabStyle('upcoming')} onClick={() => setActiveTab('upcoming')}>
            Upcoming
            {upcoming.length > 0 && (
              <span style={{
                marginLeft: '0.5rem', background: activeTab === 'upcoming' ? 'rgba(0,0,0,0.2)' : 'var(--gold-dim)',
                color: activeTab === 'upcoming' ? 'var(--bg)' : 'var(--gold)',
                borderRadius: '100px', padding: '1px 7px', fontSize: '0.75rem',
              }}>
                {upcoming.length}
              </span>
            )}
          </button>
          <button style={tabStyle('past')} onClick={() => setActiveTab('past')}>
            History
            {past.length > 0 && (
              <span style={{
                marginLeft: '0.5rem', background: activeTab === 'past' ? 'rgba(0,0,0,0.2)' : 'var(--bg2)',
                color: activeTab === 'past' ? 'var(--bg)' : 'var(--text3)',
                borderRadius: '100px', padding: '1px 7px', fontSize: '0.75rem',
              }}>
                {past.length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text2)' }}>Loading appointments...</p>
        ) : (
          activeTab === 'upcoming' ? renderTable(upcoming, true) : renderTable(past, false)
        )}
      </div>

      {/* Reschedule Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Reschedule Appointment</h3>
            <div className="form-group">
              <label>New Date</label>
              <input type="date" min={today} value={modal.date}
                onChange={e => setModal({ ...modal, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>New Time</label>
              <input type="time" value={modal.time}
                onChange={e => setModal({ ...modal, time: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmReschedule}
                disabled={!modal.date || !modal.time}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirm Modal */}
      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Cancel Appointment?</h3>
            <p style={{ color: 'var(--text2)', marginBottom: '0.5rem' }}>
              Are you sure? This cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirm(null)}>Keep It</button>
              <button className="btn btn-danger" onClick={doCancel}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}