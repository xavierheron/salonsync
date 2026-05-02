import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api, isDemo } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { label: 'Admin Dashboard', href: '#/admin' },
  { label: 'Staff View', href: '#/staff' },
  { label: 'Manage Users', href: '#/users' },
  { label: 'Logout', action: 'logout' },
];

const ROLE_CLASS = {
  customer: { background: 'rgba(91,141,238,0.12)', color: '#5b8dee' },
  staff: { background: 'rgba(76,175,125,0.12)', color: '#4caf7d' },
  admin: { background: 'rgba(201,168,76,0.12)', color: '#c9a84c' },
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);
  const { user } = useAuth();
  const demo = isDemo(user?.email);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const data = await api.getUsers(params);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, roleFilter]);

  const handleDeactivate = async () => {
    try {
      await api.deactivateUser(confirmDeactivate._id);
      setConfirmDeactivate(null);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteUser(confirmDelete._id);
      setConfirmDelete(null);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <Navbar links={NAV} />
      <div className="page">
        <div className="dashboard-header">
          <div>
            <h1>Manage Users</h1>
            <p>View, deactivate or delete user accounts</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="stat-card" style={{ minWidth: 120, padding: '0.8rem 1.2rem' }}>
              <div className="stat-label">Total Users</div>
              <div className="stat-value" style={{ fontSize: '1.8rem' }}>{users.length}</div>
            </div>
            <div className="stat-card" style={{ minWidth: 120, padding: '0.8rem 1.2rem' }}>
              <div className="stat-label">Active</div>
              <div className="stat-value" style={{ fontSize: '1.8rem', color: 'var(--green)' }}>
                {users.filter(u => u.isActive).length}
              </div>
            </div>
            <div className="stat-card" style={{ minWidth: 120, padding: '0.8rem 1.2rem' }}>
              <div className="stat-label">Inactive</div>
              <div className="stat-value" style={{ fontSize: '1.8rem', color: 'var(--red)' }}>
                {users.filter(u => !u.isActive).length}
              </div>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <div className="filters-row">
          <input className="search-input" placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text2)' }}>Loading users...</p>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No users found</h3>
            <p>Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Appointments</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 500, color: 'var(--text)' }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span style={{
                        ...ROLE_CLASS[u.role],
                        padding: '3px 10px', borderRadius: '100px',
                        fontSize: '0.78rem', fontWeight: 600,
                        display: 'inline-block', textTransform: 'capitalize'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text2)' }}>{u.appointmentCount}</td>
                    <td>
                      <span style={{
                        padding: '3px 10px', borderRadius: '100px',
                        fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex',
                        alignItems: 'center', gap: 5,
                        background: u.isActive ? 'rgba(76,175,125,0.12)' : 'rgba(224,92,92,0.12)',
                        color: u.isActive ? 'var(--green)' : 'var(--red)',
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {u.role !== 'admin' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className={u.isActive ? 'btn btn-ghost' : 'btn btn-success'}
                            style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem' }}
                            disabled={demo}
                        onClick={() => !demo && setConfirmDeactivate(u)}>
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button className="btn btn-danger"
                            style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem' }}
                            disabled={demo}
                          onClick={() => !demo && setConfirmDelete(u)}>
                            Delete
                          </button>
                        </div>
                      )}
                      {u.role === 'admin' && (
                        <span style={{ color: 'var(--text3)', fontSize: '0.82rem' }}>Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deactivate Confirm Modal */}
      {confirmDeactivate && (
        <div className="modal-overlay" onClick={() => setConfirmDeactivate(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>{confirmDeactivate.isActive ? 'Deactivate' : 'Activate'} Account?</h3>
            <p style={{ color: 'var(--text2)', marginTop: '0.5rem' }}>
              {confirmDeactivate.isActive
                ? `Deactivating ${confirmDeactivate.name}'s account will prevent them from logging in.`
                : `Activating ${confirmDeactivate.name}'s account will restore their access.`
              }
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmDeactivate(null)}>Cancel</button>
              <button
                className={confirmDeactivate.isActive ? 'btn btn-danger' : 'btn btn-success'}
                onClick={handleDeactivate}>
                {confirmDeactivate.isActive ? 'Yes, Deactivate' : 'Yes, Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Delete Account?</h3>
            <p style={{ color: 'var(--text2)', marginTop: '0.5rem' }}>
              This will permanently delete <strong>{confirmDelete.name}</strong>'s account
              and all <strong>{confirmDelete.appointmentCount}</strong> of their appointments.
              This cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}