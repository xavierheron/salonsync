const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { emails, sendEmail } = require('../utils/emailService');
const Service = require('../models/Service');

router.use(protect);

function validateBusinessHours(date, time) {
  const [y, m, d] = date.split('-').map(Number);
  const dayOfWeek = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay(); // 0 = Sunday
  if (dayOfWeek === 0) return 'We are closed on Sundays. Please choose another day.';
  if (time < '09:00' || time >= '17:00') return 'Appointments must be between 9:00 AM and 5:00 PM.';
  return null;
}

// ── GET /api/appointments/availability?date=YYYY-MM-DD ──
router.get('/availability', restrictTo('customer'), async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'Date is required' });
  try {
    const appointments = await Appointment.find({ date });
    res.json({ takenSlots: appointments.map(a => a.time) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/appointments ──
router.get('/', restrictTo('customer'), async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id }).sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/appointments ── (book)
router.post('/', restrictTo('customer'), async (req, res) => {
  const { service, date, time } = req.body;
  try {
    const serviceDoc = await Service.findOne({ name: service, isActive: true });
    if (!serviceDoc) return res.status(400).json({ message: 'Service not found or unavailable' });

    const hoursError = validateBusinessHours(date, time);
    if (hoursError) return res.status(400).json({ message: hoursError });

    const conflict = await Appointment.findOne({ date, time });
    if (conflict) return res.status(400).json({ message: 'This time slot is already booked. Please choose a different time.' });

    const appointment = await Appointment.create({ user: req.user._id, service, date, time, price: serviceDoc.price });
    sendEmail(emails.bookingConfirmation(req.user, appointment));
    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/appointments/:id/reschedule ──
router.put('/:id/reschedule', restrictTo('customer'), async (req, res) => {
  const { date, time } = req.body;
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, user: req.user._id });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.status === 'Completed') return res.status(400).json({ message: 'Cannot reschedule a completed appointment' });

    const hoursError = validateBusinessHours(date, time);
    if (hoursError) return res.status(400).json({ message: hoursError });

    const conflict = await Appointment.findOne({ date, time, _id: { $ne: appointment._id } });
    if (conflict) return res.status(400).json({ message: 'This time slot is already booked. Please choose a different time.' });

    appointment.date = date;
    appointment.time = time;
    appointment.status = 'Pending Payment';
    await appointment.save();
    sendEmail(emails.rescheduleConfirmation(req.user, appointment));
    res.json({ message: 'Appointment rescheduled successfully', appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/appointments/:id/pay ──
router.put('/:id/pay', restrictTo('customer'), async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, user: req.user._id });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.status !== 'Pending Payment') return res.status(400).json({ message: 'Appointment is already paid' });
    appointment.status = 'Paid';
    await appointment.save();
    sendEmail(emails.paymentConfirmation(req.user, appointment));
    res.json({ message: 'Payment successful', appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/appointments/:id ── (cancel)
router.delete('/:id', restrictTo('customer'), async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, user: req.user._id });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Jamaica is UTC-5; block cancellations within 24 hours of the appointment
    const apptDateTime = new Date(`${appointment.date}T${appointment.time}:00-05:00`);
    const hoursUntil = (apptDateTime - new Date()) / (1000 * 60 * 60);
    if (hoursUntil < 24) {
      return res.status(400).json({ message: 'Appointments cannot be cancelled within 24 hours of the scheduled time.' });
    }

    sendEmail(emails.cancellationConfirmation(req.user, appointment));
    await appointment.deleteOne();
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/appointments/:id/complete ── (staff/admin)
router.put('/:id/complete', restrictTo('staff', 'admin'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.status !== 'Paid') return res.status(400).json({ message: 'Appointment must be paid before marking complete' });
    appointment.status = 'Completed';
    await appointment.save();
    res.json({ message: 'Appointment marked as completed', appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
