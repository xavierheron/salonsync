const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const DEMO_EMAILS = ['customer@demo.com', 'staff@demo.com', 'admin@demo.com'];

router.use(protect, restrictTo('admin'));

// ── GET /api/users ── (all users)
router.get('/', async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = {};
    if (role) query.role = role;

    let users = await User.find(query).select('-password').sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      users = users.filter(u =>
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s)
      );
    }

    // Add appointment count to each user
    const usersWithStats = await Promise.all(users.map(async (u) => {
      const appointments = await Appointment.countDocuments({ user: u._id });
      return { ...u.toObject(), appointmentCount: appointments };
    }));

    res.json(usersWithStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Demo protection middleware for destructive actions ──
const blockDemo = (req, res, next) => {
  if (DEMO_EMAILS.includes(req.user.email)) {
    return res.status(403).json({ message: 'This action is disabled for demo accounts.' });
  }
  next();
};

// ── POST /api/users ── (admin - create user)
router.post('/', blockDemo, async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are all required' });
    }
    if (!['customer', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be customer, staff, or admin' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'An account with that email already exists' });
    }
    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      message: 'User created successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/users/:id/deactivate ── (toggle active status)
router.patch('/:id/deactivate', blockDemo, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: 'You cannot deactivate your own account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `Account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/users/:id ── (delete user and their appointments)
router.delete('/:id', blockDemo, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: 'You cannot delete your own account' });
    }

    // Delete all their appointments too
    await Appointment.deleteMany({ user: user._id });
    await user.deleteOne();

    res.json({ message: 'User and their appointments deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;