export const SERVICES = {
  Haircut: { label: 'Haircut', price: 20 },
  Styling: { label: 'Styling', price: 30 },
  Coloring: { label: 'Coloring', price: 50 },
};

export function getPrice(service) {
  for (const key in SERVICES) {
    if (service && service.includes(key)) return SERVICES[key].price;
  }
  return 0;
}

export function getBookings() {
  const raw = localStorage.getItem('salonBookings');
  const parsed = JSON.parse(raw);
  if (!parsed || Array.isArray(parsed)) return {};
  return parsed;
}

export function saveBookings(bookings) {
  localStorage.setItem('salonBookings', JSON.stringify(bookings));
}

export function getUsers() {
  return JSON.parse(localStorage.getItem('salonUsers')) || [];
}

export function getUserName(email) {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  return user ? user.name : email;
}

// ── Jamaica Timezone Helpers (America/Jamaica = UTC-5, no DST) ──
export function getNowInJamaica() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Jamaica' }));
}

export function getTodayInJamaica() {
  const now = getNowInJamaica();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCurrentTimeInJamaica() {
  const now = getNowInJamaica();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m)-1]} ${parseInt(d)}, ${y}`;
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2,'0')} ${ampm}`;
}

// Luhn algorithm for card validation
export function luhnCheck(num) {
  const digits = num.replace(/\s/g, '').split('').reverse().map(Number);
  const sum = digits.reduce((acc, d, i) => {
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    return acc + d;
  }, 0);
  return sum % 10 === 0;
}

export function getCardType(num) {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  return 'generic';
}