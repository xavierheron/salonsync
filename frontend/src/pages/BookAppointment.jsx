import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../utils/api';
import { getTodayInJamaica, getNowInJamaica } from '../utils/helpers';

const NAV = [
  { label: 'Dashboard', href: '#/customer' },
  { label: 'Book Appointment', href: '#/book' },
  { label: 'My Appointments', href: '#/appointments' },
  { label: 'Payments', href: '#/payments' },
  { label: 'Profile', href: '#/profile' },
  { label: 'Logout', action: 'logout' },
];

export default function BookAppointment() {
  const today = getTodayInJamaica();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ service: '', date: '', time: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await api.getServices();
        setServices(data);
      } catch (err) {
        setError('Failed to load services. Please try again.');
      } finally {
        setServicesLoading(false);
      }
    };
    loadServices();
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectService = (svc) => {
    setSelectedService(svc);
    setForm({ ...form, service: svc.name });
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.service) { setError('Please select a service'); return; }
    if (!form.date || !form.time) { setError('Please select a date and time'); return; }
    const selectedDate = new Date(form.date + 'T00:00:00');
    const now = getNowInJamaica(); now.setHours(0, 0, 0, 0);
    if (selectedDate < now) { setError('Cannot book a date in the past'); return; }
    setLoading(true);
    try {
      await api.bookAppointment(form);
      setSuccess(true);
      setTimeout(() => window.location.hash = '#/appointments', 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar links={NAV} />
      <div className="page" style={{ maxWidth: 560 }}>
        <h1 className="page-title">Book an Appointment</h1>
        <p className="page-subtitle">Choose your service and preferred time</p>

        {error && <div className="alert alert-error">⚠ {error}</div>}
        {success && <div className="alert alert-success">✓ Appointment booked! Redirecting...</div>}

        <form onSubmit={handleSubmit}>

          {/* Service Selector */}
          <div className="form-group" style={{ position: 'relative' }} ref={dropdownRef}>
            <label>Service</label>

            {/* Trigger field */}
            <div
              onClick={() => !servicesLoading && setOpen(o => !o)}
              style={{
                background: 'var(--bg3)',
                border: `1px solid ${open ? 'var(--gold)' : 'var(--border)'}`,
                boxShadow: open ? '0 0 0 3px var(--gold-dim)' : 'none',
                borderRadius: 'var(--radius)',
                padding: '0.8rem 2.5rem 0.8rem 1rem',
                cursor: servicesLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s',
                position: 'relative',
                userSelect: 'none',
              }}
            >
              {servicesLoading ? (
                <span style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>Loading services...</span>
              ) : selectedService ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '1rem' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{selectedService.name}</span>
                    <span style={{ color: 'var(--text3)', fontSize: '0.82rem', marginLeft: '0.5rem' }}>
                      {selectedService.duration} mins
                    </span>
                  </div>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: 'var(--gold)' }}>
                    ${selectedService.price}
                  </span>
                </div>
              ) : (
                <span style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>Select a service</span>
              )}

              {/* Chevron */}
              <span style={{
                position: 'absolute', right: '1rem',
                color: 'var(--text3)', fontSize: '0.7rem',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}>▼</span>
            </div>

            {/* Service Cards Panel */}
            {open && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0, right: 0,
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                zIndex: 50,
                overflow: 'hidden',
                animation: 'slideUp 0.18s ease',
              }}>
                {services.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text2)', fontSize: '0.9rem' }}>
                    No services available
                  </div>
                ) : (
                  services.map((s, i) => (
                    <div
                      key={s._id}
                      onClick={() => handleSelectService(s)}
                      style={{
                        padding: '1rem 1.2rem',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: i < services.length - 1 ? '1px solid var(--border)' : 'none',
                        background: selectedService?._id === s._id ? 'var(--gold-dim)' : 'transparent',
                        borderLeft: selectedService?._id === s._id ? '3px solid var(--gold)' : '3px solid transparent',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        if (selectedService?._id !== s._id) {
                          e.currentTarget.style.background = 'var(--bg3)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (selectedService?._id !== s._id) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.15rem' }}>
                          {s.name}
                          {selectedService?._id === s._id && (
                            <span style={{ marginLeft: '0.5rem', color: 'var(--gold)', fontSize: '0.8rem' }}>✓</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>
                          {s.description} • {s.duration} mins
                        </div>
                      </div>
                      <div style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: '1.3rem',
                        color: 'var(--gold)',
                        flexShrink: 0,
                        marginLeft: '1rem',
                      }}>
                        ${s.price}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected Service Detail */}
          {selectedService && (
            <div style={{
              background: 'var(--gold-dim)',
              border: '1px solid rgba(201,168,76,0.25)',
              borderRadius: 'var(--radius)',
              padding: '0.9rem 1.2rem',
              marginBottom: '1.2rem',
              marginTop: '-0.4rem',
              fontSize: '0.85rem',
              color: 'var(--text2)',
            }}>
              📋 {selectedService.description} · {selectedService.duration} minute session · <span style={{ color: 'var(--gold)' }}>${selectedService.price}.00</span>
            </div>
          )}

          <div className="form-group">
            <label>Date</label>
            <input type="date" required min={today}
              value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Time</label>
            <input type="time" required
              value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
          </div>

          <button type="submit" className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            disabled={!form.service || loading || success || servicesLoading}>
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}