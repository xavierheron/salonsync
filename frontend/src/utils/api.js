const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://salonsync-backend.onrender.com/api'
  : 'http://localhost:5000/api';

// ── Demo account check ──
export const DEMO_EMAILS = ['customer@demo.com', 'staff@demo.com', 'admin@demo.com'];
export const isDemo = (email) => DEMO_EMAILS.includes(email);

// ── Token helpers ──
export const getToken = () => localStorage.getItem('token');
export const setToken = (t) => localStorage.setItem('token', t);
export const removeToken = () => localStorage.removeItem('token');

// ── Base fetch with auth header ──
async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (res.status === 401) {
    removeToken();
    window.location.hash = '#/login';
    throw new Error('Session expired. Please log in again.');
  }
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

// ── Auth ──
export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),

  // Customer - Appointments
  getMyAppointments: () => request('/appointments'),
  bookAppointment: (body) => request('/appointments', { method: 'POST', body: JSON.stringify(body) }),
  rescheduleAppointment: (id, body) => request(`/appointments/${id}/reschedule`, { method: 'PUT', body: JSON.stringify(body) }),
  payAppointment: (id) => request(`/appointments/${id}/pay`, { method: 'PUT' }),
  cancelAppointment: (id) => request(`/appointments/${id}`, { method: 'DELETE' }),

  // Staff
  getStaffAppointments: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/staff/appointments${q ? '?' + q : ''}`);
  },
  markCompleted: (id) => request(`/appointments/${id}/complete`, { method: 'PUT' }),

  // Profile
  updateProfile: (body) => request('/profile', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body) => request('/profile/password', { method: 'PUT', body: JSON.stringify(body) }),

  // Services
  getServices: () => request('/services'),
  getAllServices: () => request('/services/all'),
  createService: (body) => request('/services', { method: 'POST', body: JSON.stringify(body) }),
  updateService: (id, body) => request('/services/' + id, { method: 'PUT', body: JSON.stringify(body) }),
  deleteService: (id) => request('/services/' + id, { method: 'DELETE' }),

  // Users (admin)
  getUsers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('/users' + (q ? '?' + q : ''));
  },
  createUser: (body) => request('/users', { method: 'POST', body: JSON.stringify(body) }),
  deactivateUser: (id) => request('/users/' + id + '/deactivate', { method: 'PATCH' }),
  deleteUser: (id) => request('/users/' + id, { method: 'DELETE' }),

  // Admin
  getAdminAppointments: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/appointments${q ? '?' + q : ''}`);
  },
  getAdminStats: () => request('/admin/stats'),
};