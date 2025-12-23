const express = require('express')
const router = express.Router()
const Session = require('../models/Session')
const Priority = require('../models/Priority')
const User = require('../models/User')
const auth = require('../middleware/auth')

function calculatePoints(durationMinutes){
  if (!durationMinutes || durationMinutes < 30) return 0
  let points = 10
  const extra = Math.floor((durationMinutes - 30) / 30)
  points += extra * 5
  return points
}

// POST /api/sessions/start -> { priorityId }
router.post('/sessions/start', auth, async (req, res) => {
  try {
    const { priorityId } = req.body
    const s = new Session({ userId: req.userId, priorityId })
    await s.save()
    res.status(201).json(s)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/sessions -> list user's sessions
router.get('/sessions', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.userId }).sort({ startAt: -1 }).populate('priorityId', 'title');
    // normalize fields for client
    const out = sessions.map(s => ({
      _id: s._id,
      priorityId: s.priorityId ? (s.priorityId._id ? String(s.priorityId._id) : String(s.priorityId)) : null,
      priorityTitle: s.priorityId && s.priorityId.title ? s.priorityId.title : undefined,
      startTime: s.startAt,
      endTime: s.endAt,
      durationMinutes: s.durationMinutes,
      duration: s.durationMinutes ? s.durationMinutes * 60000 : undefined,
      pointsAwarded: s.pointsAwarded || 0
    }));
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/sessions/stop -> { sessionId }
router.post('/sessions/stop', auth, async (req, res) => {
  try {
    const { sessionId } = req.body
    const s = await Session.findOne({ _id: sessionId, userId: req.userId })
    if (!s) return res.status(404).json({ error: 'Session not found' })
    if (s.endAt) return res.status(400).json({ error: 'Session already stopped' })

    s.endAt = new Date()
    const durationMs = s.endAt - s.startAt
    const durationMinutes = Math.max(0, Math.round(durationMs / 60000))
    s.durationMinutes = durationMinutes
    const points = calculatePoints(durationMinutes)
    s.pointsAwarded = points
    await s.save()

    // update user's points (add fields to user model if missing)
    try {
      await User.findByIdAndUpdate(req.userId, { $inc: { totalPoints: points, todayPoints: points } }, { upsert: false })
    } catch (e){
      // ignore if user model doesn't have fields yet
    }

    // also add to priority today's time (hours)
    if (s.priorityId){
      const hours = durationMinutes / 60
      await Priority.findByIdAndUpdate(s.priorityId, { $inc: { todayTime: hours } })
      
      // Calculate and award badges
      try {
        await fetch(`${req.protocol}://${req.get('host')}/api/badges/calculate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': req.headers.authorization
          },
          body: JSON.stringify({ priorityId: s.priorityId })
        });
      } catch (error) {
        console.error('Error calculating badges:', error);
      }
    }

    res.json({ session: s, points })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
