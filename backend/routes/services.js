const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// ── GET /api/services ── (public - anyone can view active services)
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ name: 1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/services/all ── (admin - includes inactive)
router.get('/all', protect, restrictTo('admin'), async (req, res) => {
  try {
    const services = await Service.find().sort({ name: 1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/services ── (admin - create service)
router.post('/', protect, restrictTo('admin'), blockDemo, async (req, res) => {
  const { name, description, price, duration } = req.body;
  try {
    const existing = await Service.findOne({ name });
    if (existing) return res.status(400).json({ message: 'A service with that name already exists' });
    const service = await Service.create({ name, description, price, duration });
    res.status(201).json({ message: 'Service created successfully', service });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/services/:id ── (admin - update service)
router.put('/:id', protect, restrictTo('admin'), blockDemo, async (req, res) => {
  const { name, description, price, duration, isActive } = req.body;
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (name) service.name = name;
    if (description !== undefined) service.description = description;
    if (price !== undefined) service.price = price;
    if (duration !== undefined) service.duration = duration;
    if (isActive !== undefined) service.isActive = isActive;
    await service.save();
    res.json({ message: 'Service updated successfully', service });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const DEMO_EMAILS = ['customer@demo.com', 'staff@demo.com', 'admin@demo.com'];
const blockDemo = (req, res, next) => {
  if (DEMO_EMAILS.includes(req.user.email)) {
    return res.status(403).json({ message: 'This action is disabled for demo accounts.' });
  }
  next();
};

// ── DELETE /api/services/:id ── (admin - delete service)
router.delete('/:id', protect, restrictTo('admin'), blockDemo, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    await service.deleteOne();
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;