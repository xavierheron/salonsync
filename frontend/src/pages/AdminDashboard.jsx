import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../utils/api';
import { formatDate, formatTime } from '../utils/helpers';
import { Bar } from 'react-chartjs-2';
import { exportToCSV } from '../utils/exportCSV';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const STATUS_CLASS = {
  'Pending Payment': 'badge-pending',
  'Paid': 'badge-paid',
  'Completed': 'badge-completed',
};

const NAV = [
  { label: 'Admin Dashboard', href: '#/admin' },
  { label: 'Staff View', href: '#/staff' },
  { label: 'Manage Users', href: '#/users' },
  { label: 'Services', href: '#/services' },
  { label: 'Profile', href: '#/profile' },
  { label: 'Logout', action: 'logout' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [dateError, setDateError] = useState('');

  const load = async () => {
    setDateError('');
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setDateError('Start date cannot be after end date');
      return;
    }
    try {
      const [statsData, apptData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminAppointments({ search, status: filter, dateFrom, dateTo }),
      ]);
      setStats(statsData);
      setBookings(apptData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, filter, dateFrom, dateTo]);

  const clearDateRange = () => {
    setDateFrom('');
    setDateTo('');
  };

  const chartData = {
    labels: ['Pending', 'Paid', 'Completed'],
    datasets: [{
      label: 'Revenue ($)',
      data: stats ? [
        stats.revenueByStatus.pending,
        stats.revenueByStatus.paid,
        stats.revenueByStatus.completed,
      ] : [0, 0, 0],
      backgroundColor: ['rgba(232,175,38,0.5)', 'rgba(76,175,125,0.5)', 'rgba(91,141,238,0.5)'],
      borderColor: ['#e8af26', '#4caf7d', '#5b8dee'],
      borderWidth: 2, borderRadius: 8,
    }],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `$${ctx.raw}` } } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b6560', font: { family: 'DM Sans', size: 12 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b6560', callback: v => `$${v}`, font: { family: 'DM Sans', size: 12 } } },
    },
  };

  return (
    <div>
      <Navbar links={NAV} />
      <div className="page">
        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Full business overview and analytics</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-label">Total Appointments</div>
            <div className="stat-value">{stats?.total ?? '—'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💳</div>
            <div className="stat-label">Paid</div>
            <div className="stat-value">{stats?.paid ?? '—'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-label">Completed</div>
            <div className="stat-value">{stats?.completed ?? '—'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value" style={{ fontSize: '1.8rem' }}>${stats?.revenue ?? '0'}</div>
          </div>
        </div>

        <div className="chart-container" style={{ marginBottom: '2rem' }}>
          <div className="chart-title">Revenue by Status</div>
          <div style={{ height: 220 }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <h2 style={{ fontSize: '1.3rem' }}>All Appointments</h2>
          <button
            className='btn btn-ghost'
            style={{ fontSize: '0.85rem', gap: '0.5rem' }}
            onClick={() => exportToCSV(bookings)}
            disabled={bookings.length === 0}
          >
            ⬇ Export CSV
          </button>
        </div>

        {/* Filters */}
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

        {/* Date Range Row */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
              From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              style={{
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '0.6rem 0.8rem',
                color: 'var(--text)', fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.87rem', outline: 'none', cursor: 'pointer',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
              To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              style={{
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '0.6rem 0.8rem',
                color: 'var(--text)', fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.87rem', outline: 'none', cursor: 'pointer',
              }}
            />
          </div>
          {(dateFrom || dateTo) && (
            <button className="btn btn-ghost"
              style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
              onClick={clearDateRange}>
              Clear Dates
            </button>
          )}
          {(dateFrom || dateTo) && !dateError && (
            <span style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>
              Showing {bookings.length} result{bookings.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {dateError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>⚠ {dateError}</div>}

        {loading ? (
          <p style={{ color: 'var(--text2)' }}>Loading...</p>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No appointments found</h3>
            <p>Try adjusting your filters or date range</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer</th><th>Service</th><th>Date</th>
                  <th>Time</th><th>Status</th><th>Revenue</th>
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
                    <td style={{ color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
                      {b.status === 'Paid' || b.status === 'Completed' ? `$${b.price}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}