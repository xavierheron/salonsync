const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect, restrictTo('admin'));

// ── GET /api/admin/appointments ──
router.get('/appointments', async (req, res) => {
  try {
    const { status, search, dateFrom, dateTo } = req.query;

    let query = {};
    if (status) query.status = status;

    // Date range filter
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = dateFrom;
      if (dateTo) query.date.$lte = dateTo;
    }

    let appointments = await Appointment.find(query)
      .populate('user', 'name email')
      .sort({ date: -1, time: -1 });

    // Search filter
    if (search) {
      const s = search.toLowerCase();
      appointments = appointments.filter(a =>
        a.user?.name.toLowerCase().includes(s) ||
        a.service.toLowerCase().includes(s)
      );
    }

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admin/stats ──
router.get('/stats', async (req, res) => {
  try {
    const all = await Appointment.find();

    const stats = {
      total: all.length,
      paid: all.filter(a => a.status === 'Paid').length,
      completed: all.filter(a => a.status === 'Completed').length,
      revenue: all
        .filter(a => a.status === 'Paid' || a.status === 'Completed')
        .reduce((sum, a) => sum + a.price, 0),
      revenueByStatus: {
        pending: all.filter(a => a.status === 'Pending Payment').reduce((s, a) => s + a.price, 0),
        paid: all.filter(a => a.status === 'Paid').reduce((s, a) => s + a.price, 0),
        completed: all.filter(a => a.status === 'Completed').reduce((s, a) => s + a.price, 0),
      }
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admin/staff-appointments ──
router.get('/staff-appointments', async (req, res) => {
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
        a.user?.name.toLowerCase().includes(s) ||
        a.service.toLowerCase().includes(s)
      );
    }

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;