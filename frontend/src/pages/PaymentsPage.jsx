import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../utils/api';
import { formatDate, formatTime, luhnCheck, getCardType } from '../utils/helpers';
import './payments.css';

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

function formatCardNumber(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(val) {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

function CardIcon({ type }) {
  if (type === 'visa') return <span style={{ color: '#1a1f71', fontWeight: 800, fontFamily: 'sans-serif', fontSize: '1rem' }}>VISA</span>;
  if (type === 'mastercard') return <span style={{ fontSize: '1.2rem' }}>🔴🟡</span>;
  if (type === 'amex') return <span style={{ color: '#2E77BC', fontWeight: 700, fontSize: '0.85rem' }}>AMEX</span>;
  return <span style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>💳</span>;
}

function PaymentModal({ booking, onClose, onSuccess }) {
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [flipped, setFlipped] = useState(false);
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const cardType = getCardType(card.number);

  const validate = () => {
    const errs = {};
    const raw = card.number.replace(/\s/g, '');
    if (raw.length < 16) errs.number = 'Enter a valid 16-digit card number';
    else if (!luhnCheck(raw)) errs.number = 'Invalid card number';
    if (!card.name.trim()) errs.name = 'Cardholder name required';
    const [m, y] = (card.expiry || '').split('/');
    const now = new Date();
    const expMonth = parseInt(m, 10);
    const expYear = 2000 + parseInt(y, 10);
    if (!m || !y || expMonth < 1 || expMonth > 12 || expYear < now.getFullYear() ||
      (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
      errs.expiry = 'Invalid or expired date';
    }
    if (card.cvv.length < 3) errs.cvv = 'Invalid CVV';
    return errs;
  };

  const handlePay = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setProcessing(true);
    try {
      await api.payAppointment(booking._id);
      onSuccess();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box payment-modal" onClick={e => e.stopPropagation()}>
        <h3>Complete Payment</h3>
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {booking.service} — {formatDate(booking.date)} at {formatTime(booking.time)}
        </p>

        <div className={`card-preview ${flipped ? 'flipped' : ''}`}>
          <div className="card-front">
            <div className="card-front-top">
              <div className="card-chip">
                <div className="chip-line" /><div className="chip-line" /><div className="chip-line" />
              </div>
              <CardIcon type={cardType} />
            </div>
            <div className="card-number-display">
              {(card.number || '•••• •••• •••• ••••').padEnd(19, '•').slice(0, 19)}
            </div>
            <div className="card-bottom">
              <div>
                <div className="card-label">Card Holder</div>
                <div className="card-value">{card.name || 'YOUR NAME'}</div>
              </div>
              <div>
                <div className="card-label">Expires</div>
                <div className="card-value">{card.expiry || 'MM/YY'}</div>
              </div>
              <div>
                <div className="card-label">Amount</div>
                <div className="card-value" style={{ color: 'var(--gold)' }}>${booking.price}</div>
              </div>
            </div>
          </div>
          <div className="card-back">
            <div className="mag-strip" />
            <div className="cvv-area">
              <div className="cvv-label">CVV</div>
              <div className="cvv-box">{card.cvv ? '•'.repeat(card.cvv.length) : '•••'}</div>
            </div>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label>Card Number</label>
          <input type="text" placeholder="1234 5678 9012 3456"
            value={card.number}
            onChange={e => setCard({ ...card, number: formatCardNumber(e.target.value) })}
            maxLength={19} inputMode="numeric" />
          {errors.number && <span className="form-error">{errors.number}</span>}
        </div>

        <div className="form-group">
          <label>Cardholder Name</label>
          <input type="text" placeholder="Name as on card"
            value={card.name}
            onChange={e => setCard({ ...card, name: e.target.value.toUpperCase() })} />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Expiry Date</label>
            <input type="text" placeholder="MM/YY"
              value={card.expiry}
              onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
              maxLength={5} inputMode="numeric" />
            {errors.expiry && <span className="form-error">{errors.expiry}</span>}
          </div>
          <div className="form-group">
            <label>CVV</label>
            <input type="text" placeholder="•••"
              value={card.cvv}
              onFocus={() => setFlipped(true)}
              onBlur={() => setFlipped(false)}
              onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              maxLength={4} inputMode="numeric" />
            {errors.cvv && <span className="form-error">{errors.cvv}</span>}
          </div>
        </div>

        <div style={{ background: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 'var(--radius)', padding: '0.8rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>Total Due</span>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: 'var(--gold)' }}>${booking.price}.00</span>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={processing}>Cancel</button>
          <button className="btn btn-primary" onClick={handlePay} disabled={processing}
            style={{ minWidth: 140, justifyContent: 'center' }}>
            {processing ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span className="spinner" /> Processing...</span> : `Pay $${booking.price}.00`}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text3)' }}>
          🔒 Secured. Card details are for demo purposes only and are not stored.
        </p>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const load = async () => {
    try {
      const data = await api.getMyAppointments();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSuccess = () => {
    setPayModal(null);
    setSuccessMsg(true);
    load();
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div>
      <Navbar links={NAV} />
      <div className="page">
        <h1 className="page-title">Payments</h1>
        <p className="page-subtitle">View and pay for your appointments</p>

        {successMsg && <div className="alert alert-success">✓ Payment successful! Your appointment is now confirmed.</div>}

        {loading ? (
          <p style={{ color: 'var(--text2)' }}>Loading...</p>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <h3>No appointments found</h3>
            <p>Book an appointment first to make a payment</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Service</th><th>Date</th><th>Time</th>
                  <th>Amount</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td style={{ fontWeight: 500, color: 'var(--text)' }}>{b.service}</td>
                    <td>{formatDate(b.date)}</td>
                    <td>{formatTime(b.time)}</td>
                    <td style={{ color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>
                      ${b.price}
                    </td>
                    <td><span className={`badge ${STATUS_CLASS[b.status] || ''}`}>{b.status}</span></td>
                    <td>
                      {b.status === 'Pending Payment' ? (
                        <button className="btn btn-primary"
                          style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                          onClick={() => setPayModal(b)}>Pay Now</button>
                      ) : (
                        <span style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>
                          {b.status === 'Completed' ? '✓ Completed' : '✓ Paid'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {payModal && (
        <PaymentModal booking={payModal} onClose={() => setPayModal(null)} onSuccess={handleSuccess} />
      )}
    </div>
  );
}