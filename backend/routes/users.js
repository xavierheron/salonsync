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

// ── PATCH /api/users/:id/deactivate ── (toggle active status)
router.patch('/:id/deactivate', blockDemo,, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot deactivate an admin account' });

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
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete an admin account' });

    // Delete all their appointments too
    await Appointment.deleteMany({ user: user._id });
    await user.deleteOne();

    res.json({ message: 'User and their appointments deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;