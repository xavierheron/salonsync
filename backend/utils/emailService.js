const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, mo, d] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(mo)-1]} ${parseInt(d)}, ${y}`;
}

function baseTemplate(title, bodyContent) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#0e0e0f;font-family:'DM Sans',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e0e0f;padding:40px 20px;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#151517;border:1px solid #2a2a2e;border-radius:16px;overflow:hidden;max-width:560px;width:100%;">
            
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#1a1a2e,#0f3460);padding:32px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.2);">
                <h1 style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:400;color:#c9a84c;letter-spacing:0.06em;">SalonSync</h1>
                <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.5);">Smart POS & Appointment Management</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px;">
                ${bodyContent}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #2a2a2e;text-align:center;">
                <p style="margin:0;font-size:12px;color:#6b6560;">© 2026 SalonSync. All rights reserved.</p>
                <p style="margin:4px 0 0;font-size:12px;color:#6b6560;">Jamaica</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

function appointmentCard(appointment) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:10px;margin:20px 0;">
      <tr>
        <td style="padding:20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#a09a92;">Service</td>
              <td style="padding:6px 0;font-size:13px;color:#f0ede8;text-align:right;font-weight:600;">${appointment.service}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#a09a92;">Date</td>
              <td style="padding:6px 0;font-size:13px;color:#f0ede8;text-align:right;">${formatDate(appointment.date)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#a09a92;">Time</td>
              <td style="padding:6px 0;font-size:13px;color:#f0ede8;text-align:right;">${formatTime(appointment.time)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#a09a92;">Amount Due</td>
              <td style="padding:6px 0;font-size:18px;color:#c9a84c;text-align:right;font-family:Georgia,serif;">$${appointment.price}.00</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

// ── Email Templates ──

const emails = {

  bookingConfirmation: (user, appointment) => ({
    to: user.email,
    subject: '✅ Appointment Confirmed — SalonSync',
    html: baseTemplate('Appointment Confirmed', `
      <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;font-weight:400;color:#f0ede8;">
        Appointment Booked!
      </h2>
      <p style="margin:0 0 4px;font-size:14px;color:#a09a92;">Hi ${user.name},</p>
      <p style="margin:0;font-size:14px;color:#a09a92;">
        Your appointment has been booked successfully. Please complete your payment to confirm your slot.
      </p>
      ${appointmentCard(appointment)}
      <p style="margin:0;font-size:13px;color:#a09a92;">
        Please make your payment through the SalonSync payments page to secure your appointment.
      </p>
    `),
  }),

  rescheduleConfirmation: (user, appointment) => ({
    to: user.email,
    subject: '📅 Appointment Rescheduled — SalonSync',
    html: baseTemplate('Appointment Rescheduled', `
      <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;font-weight:400;color:#f0ede8;">
        Appointment Rescheduled
      </h2>
      <p style="margin:0 0 4px;font-size:14px;color:#a09a92;">Hi ${user.name},</p>
      <p style="margin:0;font-size:14px;color:#a09a92;">
        Your appointment has been rescheduled to the new date and time below.
      </p>
      ${appointmentCard(appointment)}
      <p style="margin:0;font-size:13px;color:#a09a92;">
        Note: Rescheduling has reset your payment status. Please complete payment again to secure your new slot.
      </p>
    `),
  }),

  cancellationConfirmation: (user, appointment) => ({
    to: user.email,
    subject: '❌ Appointment Cancelled — SalonSync',
    html: baseTemplate('Appointment Cancelled', `
      <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;font-weight:400;color:#f0ede8;">
        Appointment Cancelled
      </h2>
      <p style="margin:0 0 4px;font-size:14px;color:#a09a92;">Hi ${user.name},</p>
      <p style="margin:0;font-size:14px;color:#a09a92;">
        Your appointment has been cancelled as requested.
      </p>
      ${appointmentCard(appointment)}
      <p style="margin:0;font-size:13px;color:#a09a92;">
        We hope to see you again soon. You can book a new appointment anytime through SalonSync.
      </p>
    `),
  }),

  appointmentReminder: (user, appointment) => ({
    to: user.email,
    subject: '⏰ Reminder: Your appointment is tomorrow — SalonSync',
    html: baseTemplate('Appointment Reminder', `
      <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;font-weight:400;color:#f0ede8;">
        See You Tomorrow!
      </h2>
      <p style="margin:0 0 4px;font-size:14px;color:#a09a92;">Hi ${user.name},</p>
      <p style="margin:0;font-size:14px;color:#a09a92;">
        This is a friendly reminder that you have an appointment scheduled for tomorrow.
      </p>
      ${appointmentCard(appointment)}
      <p style="margin:0;font-size:13px;color:#a09a92;">
        Please arrive a few minutes early. If you need to cancel, please do so more than 24 hours in advance.
      </p>
    `),
  }),

  passwordReset: (user, resetUrl) => ({
    to: user.email,
    subject: '🔑 Password Reset Request — SalonSync',
    html: baseTemplate('Password Reset', `
      <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;font-weight:400;color:#f0ede8;">
        Reset Your Password
      </h2>
      <p style="margin:0 0 4px;font-size:14px;color:#a09a92;">Hi ${user.name},</p>
      <p style="margin:0 0 20px;font-size:14px;color:#a09a92;">
        We received a request to reset your password. Click the button below to set a new one.
        This link expires in 1 hour.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:10px 0 24px;">
            <a href="${resetUrl}" style="display:inline-block;background:#c9a84c;color:#0e0e0f;text-decoration:none;font-weight:700;font-size:14px;padding:14px 32px;border-radius:8px;letter-spacing:0.04em;">
              Reset Password
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:12px;color:#6b6560;">
        If you did not request a password reset, you can safely ignore this email.
        Your password will not change.
      </p>
    `),
  }),

  paymentConfirmation: (user, appointment) => ({
    to: user.email,
    subject: '💳 Payment Confirmed — SalonSync',
    html: baseTemplate('Payment Confirmed', `
      <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;font-weight:400;color:#f0ede8;">
        Payment Received!
      </h2>
      <p style="margin:0 0 4px;font-size:14px;color:#a09a92;">Hi ${user.name},</p>
      <p style="margin:0;font-size:14px;color:#a09a92;">
        Your payment has been received and your appointment is fully confirmed.
      </p>
      ${appointmentCard(appointment)}
      <p style="margin:0;font-size:13px;color:#a09a92;">
        We look forward to seeing you. Please arrive a few minutes early.
      </p>
    `),
  }),

};

// ── Send function ──
async function sendEmail(template) {
  try {
    await transporter.sendMail({
      from: `"SalonSync" <${process.env.EMAIL_USER}>`,
      to: template.to,
      subject: template.subject,
      html: template.html,
    });
    console.log(`📧 Email sent to ${template.to}`);
  } catch (err) {
    console.error('❌ Email failed:', err.message);
    // Don't throw — email failure shouldn't break the main action
  }
}

module.exports = { emails, sendEmail };