export function exportToCSV(bookings, filename = 'salonsync-appointments') {
  if (!bookings || bookings.length === 0) return;

  const headers = ['Customer', 'Email', 'Service', 'Date', 'Time', 'Status', 'Revenue'];

  const rows = bookings.map(b => [
    b.user?.name || '',
    b.user?.email || '',
    b.service || '',
    b.date || '',
    b.time || '',
    b.status || '',
    (b.status === 'Paid' || b.status === 'Completed') ? `$${b.price}` : '$0',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `${filename}-${date}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}