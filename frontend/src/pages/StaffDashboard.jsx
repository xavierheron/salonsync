import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { formatDate, formatTime } from '../utils/helpers';

const STATUS_CLASS = {
  'Pending Payment': 'badge-pending',
  'Paid': 'badge-paid',
  'Completed': 'badge-completed',
};

export default function StaffDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    try {
      const params = {};
      if (filter) params.status = filter;
      if (search) params.search = search;
      const data = await api.getStaffAppointments(params);
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, filter]);

  const doMarkComplete = async () => {
    try {
      await api.markCompleted(confirm._id);
      setConfirm(null);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  // Admin can see both staff and admin views
  const navLinks = [
    { label: 'Staff Dashboard', href: '#/staff' },
    ...(user?.role === 'admin' ? [{ label: 'Admin Dashboard', href: '#/admin' }] : []),
    { label: 'Profile', href: '#/profile' },
    { label: 'Logout', action: 'logout' },
  ];

  return (
    <div>
      <Navbar links={navLinks} />
      <div className="page">
        <div className="dashboard-header">
          <div>
            <h1>Staff Dashboard</h1>
            <p>Manage all customer appointments</p>
          </div>
        </div>

        <div className="filters-row">
          <input className="search-input" placeholder="Search by customer or service..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Pending Payment">Pending Payment</option>
            <option value="Paid">Paid</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text2)' }}>Loading...</p>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No appointments found</h3>
            <p>Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer</th><th>Service</th><th>Date</th>
                  <th>Time</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td style={{ fontWeight: 500, color: 'var(--text)' }}>{b.user?.name}</td>
                    <td>{b.service}</td>
                    <td>{formatDate(b.date)}</td>
                    <td>{formatTime(b.time)}</td>
                    <td><span className={`badge ${STATUS_CLASS[b.status] || ''}`}>{b.status}</span></td>
                    <td>
                      {b.status === 'Paid' ? (
                        <button className="btn btn-success"
                          style={{ padding: '0.35rem 0.9rem', fontSize: '0.82rem' }}
                          onClick={() => setConfirm(b)}>Mark Completed</button>
                      ) : b.status === 'Completed' ? (
                        <span style={{ color: 'var(--green)', fontSize: '0.85rem' }}>✓ Done</span>
                      ) : (
                        <span style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>Awaiting payment</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Mark as Completed?</h3>
            <p style={{ color: 'var(--text2)', marginTop: '0.5rem' }}>
              Mark <strong>{confirm.user?.name}</strong>'s {confirm.service} as completed?
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn btn-success" onClick={doMarkComplete}>Mark Completed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}