const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET /api/points -> { total: Number, today: Number }
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('totalPoints todayPoints');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ total: user.totalPoints || 0, today: user.todayPoints || 0 });
  } catch (err) {
    console.error('Points route error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
