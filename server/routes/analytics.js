const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Session = require('../models/Session');

function calculatePoints(durationMinutes){
  if (!durationMinutes || durationMinutes < 30) return 0
  let points = 10
  const extra = Math.floor((durationMinutes - 30) / 30)
  points += extra * 5
  return points
}

// GET /api/analytics/priority/:id  -> mounted at /api/analytics/priority/:id
router.get('/priority/:id', auth, async (req, res) => {
  try {
    const priorityId = req.params.id;
    const userId = req.userId;

    // Get all sessions for this priority
    const sessions = await Session.find({ userId, priorityId }).sort({ startAt: -1 });

    // Calculate streak
    let currentStreak = 0;
    let lastDate = null;
    
    // compute streak by walking sessions grouped by day
    const seen = new Set()
    const days = []
    for (const s of sessions){
      const day = new Date(s.startAt).toDateString()
      if (!seen.has(day)){
        seen.add(day)
        days.push(day)
      }
    }
    // now count consecutive days from latest
    if (days.length > 0){
      currentStreak = 1
      for (let i=1;i<days.length;i++){
        const prev = new Date(days[i-1])
        const cur = new Date(days[i])
        const diff = Math.round((prev - cur) / (1000*60*60*24))
        if (diff === 1) currentStreak++
        else break
      }
    }

    // Calculate badge level
    let badge = 'None';
    if (currentStreak >= 60) badge = 'Iron Mind';
    else if (currentStreak >= 30) badge = 'Disciplined';
    else if (currentStreak >= 15) badge = 'Focused';
    else if (currentStreak >= 7) badge = 'Sprout';
    else if (currentStreak >= 1) badge = 'Bronze';

    // Calculate today's time spent
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(s => new Date(s.startAt).toDateString() === today);
    const todayTimeSpent = todaySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    // Calculate points for today by summing per-session points
    const points = todaySessions.reduce((acc, s) => acc + calculatePoints(s.durationMinutes || 0), 0);

    // Get historical data for charts (last 30 days)
    const last30Days = {}
    for (const s of sessions){
      const date = new Date(s.startAt).toDateString()
      last30Days[date] = (last30Days[date] || 0) + (s.durationMinutes || 0)
    }

    res.json({
      streak: currentStreak,
      badge,
      todayTimeSpent: todayTimeSpent / 60, // Convert to hours
      points,
      analytics: {
        progress: Math.min((todayTimeSpent / (2 * 60)) * 100, 100), // Based on 2 hour daily target
        dailyData: last30Days
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

// GET /api/analytics/summary -> per-priority summary for dashboards
router.get('/summary', auth, async (req, res) => {
  try {
    const Priority = require('../models/Priority')
    const Session = require('../models/Session')
    const priorities = await Priority.find({ userId: req.userId }).lean()

    const out = []
    for (const p of priorities){
      const sessions = await Session.find({ userId: req.userId, priorityId: p._id })
      const totalMinutes = sessions.reduce((acc,s)=> acc + (s.durationMinutes || 0), 0)
      const today = new Date().toDateString()
      const todayMinutes = sessions.filter(s=> new Date(s.startAt).toDateString() === today).reduce((acc,s)=> acc + (s.durationMinutes || 0), 0)
      const points = sessions.reduce((acc,s)=>{
        const mins = s.durationMinutes || 0
        if (mins < 30) return acc
        let pts = 10 + Math.floor((mins-30)/30)*5
        return acc + pts
      }, 0)
      // compute streak (simple consecutive days)
      const days = Array.from(new Set(sessions.map(s=> new Date(s.startAt).toDateString()))).sort((a,b)=> new Date(b) - new Date(a))
      let streak = 0
      if (days.length){
        streak = 1
        for (let i=1;i<days.length;i++){
          const prev = new Date(days[i-1])
          const cur = new Date(days[i])
          const diff = Math.round((prev - cur)/(1000*60*60*24))
          if (diff === 1) streak++
          else break
        }
      }

      out.push({ id: String(p._id), title: p.title, totalMinutes, todayMinutes, points, streak })
    }

    res.json({ priorities: out })
  } catch (err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})