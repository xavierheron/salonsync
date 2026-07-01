const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { emails, sendEmail } = require('./emailService');

function getTomorrowInJamaica() {
  // Jamaica is UTC-5 with no DST
  const now = new Date();
  const jamaicaMs = now.getTime() - (5 * 60 * 60 * 1000);
  const jamaicaDate = new Date(jamaicaMs);
  jamaicaDate.setUTCDate(jamaicaDate.getUTCDate() + 1);
  const y = jamaicaDate.getUTCFullYear();
  const m = String(jamaicaDate.getUTCMonth() + 1).padStart(2, '0');
  const d = String(jamaicaDate.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function sendAppointmentReminders() {
  try {
    const tomorrow = getTomorrowInJamaica();
    const appointments = await Appointment.find({ date: tomorrow }).populate('user', 'name email');
    for (const appt of appointments) {
      if (appt.user) {
        sendEmail(emails.appointmentReminder(appt.user, appt));
      }
    }
    console.log(`⏰ Sent ${appointments.length} reminder(s) for ${tomorrow}`);
  } catch (err) {
    console.error('❌ Reminder job failed:', err.message);
  }
}

// Run daily at 9 AM Jamaica time (14:00 UTC)
function startScheduler() {
  cron.schedule('0 14 * * *', sendAppointmentReminders);
  console.log('⏰ Appointment reminder scheduler started (daily at 9 AM Jamaica time)');
}

module.exports = { startScheduler };
