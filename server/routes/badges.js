const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Badge = require('../models/Badge');
const Priority = require('../models/Priority');
const Session = require('../models/Session');

// Get user's badges
router.get('/', auth, async (req, res) => {
  try {
    const badges = await Badge.find({ userId: req.userId }).populate('priorityId', 'title');
    // normalize priorityId to string and include priorityTitle
    const out = badges.map(b => ({
      _id: b._id,
      userId: b.userId,
      priorityId: b.priorityId ? (b.priorityId._id ? String(b.priorityId._id) : String(b.priorityId)) : null,
      priorityTitle: b.priorityId && b.priorityId.title ? b.priorityId.title : undefined,
      type: b.type,
      level: b.level,
      name: b.name,
      description: b.description,
      earnedAt: b.earnedAt
    }));
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Calculate and award badges (called after sessions end)
router.post('/calculate', auth, async (req, res) => {
  try {
    const { priorityId } = req.body;
    
    // Get priority details
    const priority = await Priority.findOne({ _id: priorityId, userId: req.userId });
    if (!priority) {
      return res.status(404).json({ msg: 'Priority not found' });
    }

    // Get total sessions and streaks
    const sessions = await Session.find({ 
      userId: req.userId,
      priorityId: priorityId 
    });

    // Calculate metrics
    // sessions store durationMinutes; compute total minutes
    const totalMinutes = sessions.reduce((acc, session) => acc + (session.durationMinutes || 0), 0);
    const streakDays = calculateStreakDays(sessions);
    
    // Award badges based on metrics
    const newBadges = [];
    
    // Streak badges
  if (streakDays >= 30) newBadges.push(createBadge(req.userId, priorityId, 'streak', 5, '30-Day Master'));
  else if (streakDays >= 21) newBadges.push(createBadge(req.userId, priorityId, 'streak', 4, '21-Day Champion'));
  else if (streakDays >= 14) newBadges.push(createBadge(req.userId, priorityId, 'streak', 3, '2-Week Warrior'));
  else if (streakDays >= 7) newBadges.push(createBadge(req.userId, priorityId, 'streak', 2, 'Week Achiever'));
  else if (streakDays >= 3) newBadges.push(createBadge(req.userId, priorityId, 'streak', 1, 'Getting Started'));

    // Time badges (in hours)
  const totalHours = Math.floor(totalMinutes / 60);
    if (totalHours >= 100) newBadges.push(createBadge(req.user.id, priorityId, 'time', 5, 'Century Club'));
    else if (totalHours >= 50) newBadges.push(createBadge(req.user.id, priorityId, 'time', 4, '50-Hour Expert'));
    else if (totalHours >= 25) newBadges.push(createBadge(req.user.id, priorityId, 'time', 3, 'Quarter Century'));
    else if (totalHours >= 10) newBadges.push(createBadge(req.user.id, priorityId, 'time', 2, 'Double Digits'));
    else if (totalHours >= 5) newBadges.push(createBadge(req.user.id, priorityId, 'time', 1, '5-Hour Focus'));

    // Save new badges
    await Badge.insertMany(newBadges);

    res.json(newBadges);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

function calculateStreakDays(sessions) {
  if (!sessions.length) return 0;
  
  // Sort sessions by date using startAt
  const sessionDates = sessions.map(s => new Date(s.startAt).toDateString());
  const uniqueDates = [...new Set(sessionDates)].map(d => new Date(d));
  uniqueDates.sort((a, b) => b - a);

  // Calculate current streak
  let streak = 1;
  let currentDate = uniqueDates[0];

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    
    if (uniqueDates[i].toDateString() === prevDate.toDateString()) {
      streak++;
      currentDate = uniqueDates[i];
    } else {
      break;
    }
  }

  return streak;
}

function createBadge(userId, priorityId, type, level, name) {
  return new Badge({
    userId,
    priorityId,
    type,
    level,
    name,
    description: `Earned the ${name} badge for your dedication!`
  });
}

module.exports = router;