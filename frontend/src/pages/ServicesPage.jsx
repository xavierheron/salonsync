import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../utils/api';

const NAV = [
  { label: 'Admin Dashboard', href: '#/admin' },
  { label: 'Staff View', href: '#/staff' },
  { label: 'Manage Users', href: '#/users' },
  { label: 'Services', href: '#/services' },
  { label: 'Logout', action: 'logout' },
];

const EMPTY_FORM = { name: '', description: '', price: '', duration: '' };

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | { ...service }
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const load = async () => {
    try {
      const data = await api.getAllServices();
      setServices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setModal('add');
  };

  const openEdit = (service) => {
    setForm({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      isActive: service.isActive,
    });
    setFormError('');
    setModal(service);
  };

  const handleSave = async () => {
    setFormError('');
    if (!form.name.trim()) { setFormError('Service name is required'); return; }
    if (!form.price || form.price <= 0) { setFormError('Please enter a valid price'); return; }
    if (!form.duration || form.duration <= 0) { setFormError('Please enter a valid duration'); return; }
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.createService({
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          duration: Number(form.duration),
        });
      } else {
        await api.updateService(modal._id, {
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          duration: Number(form.duration),
          isActive: form.isActive,
        });
      }
      setModal(null);
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (service) => {
    try {
      await api.updateService(service._id, { isActive: !service.isActive });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteService(confirmDelete._id);
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
            <h1>Services & Pricing</h1>
            <p>Manage your salon services and prices</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Service</button>
        </div>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        {loading ? (
          <p style={{ color: 'var(--text2)' }}>Loading services...</p>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✂️</div>
            <h3>No services yet</h3>
            <p>Add your first service to get started</p>
            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={openAdd}>
              Add Service
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Description</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text)' }}>{s.name}</td>
                    <td style={{ color: 'var(--text2)' }}>{s.description || '—'}</td>
                    <td style={{ color: 'var(--text2)' }}>{s.duration} mins</td>
                    <td style={{ color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
                      ${s.price}
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 10px', borderRadius: '100px',
                        fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex',
                        alignItems: 'center', gap: 5,
                        background: s.isActive ? 'rgba(76,175,125,0.12)' : 'rgba(224,92,92,0.12)',
                        color: s.isActive ? 'var(--green)' : 'var(--red)',
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost"
                          style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem' }}
                          onClick={() => openEdit(s)}>Edit</button>
                        <button
                          className={s.isActive ? 'btn btn-ghost' : 'btn btn-success'}
                          style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem' }}
                          onClick={() => handleToggle(s)}>
                          {s.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button className="btn btn-danger"
                          style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem' }}
                          onClick={() => setConfirmDelete(s)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal !== null && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <h3>{modal === 'add' ? 'Add New Service' : 'Edit Service'}</h3>

            {formError && <div className="alert alert-error" style={{ marginTop: '1rem' }}>⚠ {formError}</div>}

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Service Name</label>
              <input type="text" placeholder="e.g. Haircut"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input type="text" placeholder="e.g. Cut & style"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Price ($)</label>
                <input type="number" placeholder="0" min="0"
                  value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Duration (mins)</label>
                <input type="number" placeholder="30" min="1"
                  value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
              </div>
            </div>

            {modal !== 'add' && (
              <div className="form-group">
                <label>Status</label>
                <select value={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(null)} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}
                style={{ minWidth: 100, justifyContent: 'center' }}>
                {saving ? 'Saving...' : modal === 'add' ? 'Add Service' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Delete Service?</h3>
            <p style={{ color: 'var(--text2)', marginTop: '0.5rem' }}>
              Are you sure you want to delete <strong>{confirmDelete.name}</strong>? This cannot be undone.
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