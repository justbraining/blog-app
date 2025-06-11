const express = require('express');
const Subscription = require('../models/Subscription');
const router = express.Router();

// Subscribe to newsletter
router.post('/', async (req, res) => {
  const { email } = req.body;

  try {
    const existing = await Subscription.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: 'Email already subscribed' });
    }

    const sub = new Subscription({ email });
    await sub.save();
    res.status(201).json({ msg: 'Subscribed successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Subscription failed', error: err.message });
  }
});

// Get all subscribers (admin use)
router.get('/', async (req, res) => {
  try {
    const subscribers = await Subscription.find().sort({ subscribedAt: -1 });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ msg: 'Error retrieving subscriptions' });
  }
});

// Delete a subscription by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Subscription.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ msg: 'Subscription not found' });
    }
    res.json({ msg: 'Subscription deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Error deleting subscription', error: err.message });
  }
});

module.exports = router;
