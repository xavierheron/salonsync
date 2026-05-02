const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All staff routes require login + staff or admin role
router.use(protect, restrictTo('staff', 'admin'));

// ── GET /api/staff/appointments ── (all appointments for staff view)
router.get('/appointments', async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = {};
    if (status) query.status = status;

    let appointments = await Appointment.find(query)
      .populate('user', 'name email')
      .sort({ date: 1, time: 1 });

    if (search) {
      const s = search.toLowerCase();
      appointments = appointments.filter(a =>
        a.user.name.toLowerCase().includes(s) ||
        a.service.toLowerCase().includes(s)
      );
    }

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
