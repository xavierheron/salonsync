import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

function getNavLinks(role) {
  if (role === 'customer') return [
    { label: 'Dashboard', href: '#/customer' },
    { label: 'Book Appointment', href: '#/book' },
    { label: 'My Appointments', href: '#/appointments' },
    { label: 'Payments', href: '#/payments' },
    { label: 'Profile', href: '#/profile' },
    { label: 'Logout', action: 'logout' },
  ];
  if (role === 'staff') return [
    { label: 'Staff Dashboard', href: '#/staff' },
    { label: 'Profile', href: '#/profile' },
    { label: 'Logout', action: 'logout' },
  ];
  if (role === 'admin') return [
    { label: 'Admin Dashboard', href: '#/admin' },
    { label: 'Staff View', href: '#/staff' },
    { label: 'Manage Users', href: '#/users' },
    { label: 'Services', href: '#/services' },
    { label: 'Profile', href: '#/profile' },
    { label: 'Logout', action: 'logout' },
  ];
  return [];
}

const ROLE_COLORS = {
  customer: { background: 'rgba(91,141,238,0.12)', color: '#5b8dee' },
  staff: { background: 'rgba(76,175,125,0.12)', color: '#4caf7d' },
  admin: { background: 'rgba(201,168,76,0.12)', color: '#c9a84c' },
};

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileMsg, setProfileMsg] = useState(null);
  const [pwdMsg, setPwdMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    if (profileForm.name.trim().length < 3) {
      setProfileMsg({ type: 'error', text: 'Name must be at least 3 characters' });
      return;
    }
    setProfileLoading(true);
    try {
      const data = await api.updateProfile(profileForm);
      // Update auth context with new name/email
      login(data.user, localStorage.getItem('token'));
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    if (pwdForm.newPassword.length < 8) {
      setPwdMsg({ type: 'error', text: 'New password must be at least 8 characters' });
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setPwdLoading(true);
    try {
      await api.changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      setPwdMsg({ type: 'success', text: 'Password changed successfully' });
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.message });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div>
      <Navbar links={getNavLinks(user?.role)} />
      <div className="page" style={{ maxWidth: 640 }}>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account information</p>

        {/* Account Info Card */}
        <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'var(--gold-dim)', border: '2px solid var(--gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: 'var(--gold)',
            flexShrink: 0,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text)' }}>{user?.name}</div>
            <div style={{ color: 'var(--text2)', fontSize: '0.87rem', marginBottom: '0.4rem' }}>{user?.email}</div>
            <span style={{
              ...ROLE_COLORS[user?.role],
              padding: '2px 10px', borderRadius: '100px',
              fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
            }}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Update Profile */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.2rem' }}>Personal Information</h3>

          {profileMsg && (
            <div className={`alert ${profileMsg.type === 'error' ? 'alert-error' : 'alert-success'}`}>
              {profileMsg.type === 'error' ? '⚠' : '✓'} {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleProfileSave}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={profileForm.name}
                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="Enter your name" required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={profileForm.email}
                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="Enter your email" required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.2rem' }}>Change Password</h3>

          {pwdMsg && (
            <div className={`alert ${pwdMsg.type === 'error' ? 'alert-error' : 'alert-success'}`}>
              {pwdMsg.type === 'error' ? '⚠' : '✓'} {pwdMsg.text}
            </div>
          )}

          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>Current Password</label>
              <input type={showPasswords ? 'text' : 'password'}
                value={pwdForm.currentPassword}
                onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                placeholder="Enter current password" required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type={showPasswords ? 'text' : 'password'}
                value={pwdForm.newPassword}
                onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                placeholder="Minimum 8 characters" required />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type={showPasswords ? 'text' : 'password'}
                value={pwdForm.confirmPassword}
                onChange={e => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                placeholder="Re-enter new password" required />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <input type="checkbox" id="showPwd" checked={showPasswords}
                onChange={e => setShowPasswords(e.target.checked)}
                style={{ width: 'auto', cursor: 'pointer' }} />
              <label htmlFor="showPwd" style={{ fontSize: '0.85rem', color: 'var(--text2)', cursor: 'pointer', textTransform: 'none', letterSpacing: 'normal' }}>
                Show passwords
              </label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={pwdLoading}>
              {pwdLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}