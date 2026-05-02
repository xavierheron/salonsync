import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';

import HomePage from './pages/HomePage';
import HowItWorksPage from './pages/HowItWorksPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import BookAppointment from './pages/BookAppointment';
import AppointmentsPage from './pages/AppointmentsPage';
import PaymentsPage from './pages/PaymentsPage';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UsersPage from './pages/UsersPage';
import ServicesPage from './pages/ServicesPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

export function AppRouter() {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const { user } = useAuth();

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const requireAuth = (roles, component) => {
    if (!user) { window.location.hash = '#/login'; return null; }
    const allowed = Array.isArray(roles) ? roles : [roles];
    if (!allowed.includes(user.role)) { window.location.hash = '#/login'; return null; }
    return component;
  };

  switch (route) {
    case '#/':
    case '#/home':
    case '':           return <HomePage />;
    case '#/how-it-works': return <HowItWorksPage />;
    case '#/login':    return <LoginPage />;
    case '#/register': return <RegisterPage />;
    case '#/customer': return requireAuth('customer', <CustomerDashboard />);
    case '#/book':     return requireAuth('customer', <BookAppointment />);
    case '#/appointments': return requireAuth('customer', <AppointmentsPage />);
    case '#/payments': return requireAuth('customer', <PaymentsPage />);
    case '#/staff':    return requireAuth(['staff', 'admin'], <StaffDashboard />);  // admin can view staff
    case '#/admin':    return requireAuth('admin', <AdminDashboard />);
    case '#/users':    return requireAuth('admin', <UsersPage />);
    case '#/services':  return requireAuth('admin', <ServicesPage />);
    case '#/profile':   return requireAuth(['customer','staff','admin'], <ProfilePage />);
    default:           return <NotFoundPage />;
  }
}