const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const Priority = require('../models/Priority')
const Reflection = require('../models/Reflection')
const auth = require('../middleware/auth')

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret'

// Get active reminders based on priorities, habits, and reflections
// Debug route to check data
// Test login endpoint for development
router.post('/test-login', async (req, res) => {
  try {
    const testUserId = req.body.userId;
    if (!testUserId) {
      return res.status(400).json({ error: 'Missing userId in request body' });
    }
    
    const token = jwt.sign({ id: testUserId }, JWT_SECRET);
    res.json({ token });
  } catch (error) {
    console.error('Test login error:', error);
    res.status(500).json({ error: 'Test login failed' });
  }
});

router.get('/debug', auth, async (req, res) => {
  try {
    const priorities = await Priority.find({ userId: req.user.id }).limit(10)
    const reflections = await Reflection.find({ userId: req.user.id }).limit(10)
    
    res.json({
      userId: req.user.id,
      prioritiesCount: priorities.length,
      reflectionsCount: reflections.length,
      priorities: priorities.map(p => ({ id: p._id, title: p.title, status: p.status })),
      reflections: reflections.map(r => ({ id: r._id, hasLessons: !!r.answers.moralLessons }))
    })
  } catch (error) {
    console.error('Debug route error:', error)
    res.status(500).json({ message: 'Error in debug route' })
  }
})

router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching reminders for user:', req.user.id)
    const reminders = []
    const now = new Date()
    const today = now.toISOString().slice(0, 10)

    // 1. Priority Reminders
    const priorities = await Priority.find({
      userId: req.user.id,
      status: 'active'
    })

    // Check pending priorities
    const pendingPriorities = priorities.filter(p => !p.completed)
    if (pendingPriorities.length > 0) {
      pendingPriorities.slice(0, 3).forEach(priority => {
        reminders.push({
          id: `pr_pending_${priority._id}`,
          type: 'priority',
          category: 'pending',
          text: `One of your top priorities is still pending — you can handle "${priority.title}"!`,
          source: priority._id,
          createdAt: now,
          priority: 'high'
        })
      })
    }

    // Check priorities nearing deadline
    const upcomingDeadlines = priorities.filter(p => {
      if (!p.deadline) return false
      const daysUntilDeadline = Math.ceil((new Date(p.deadline) - now) / (1000 * 60 * 60 * 24))
      return daysUntilDeadline <= 3 && daysUntilDeadline > 0
    })

    upcomingDeadlines.forEach(priority => {
      const daysLeft = Math.ceil((new Date(priority.deadline) - now) / (1000 * 60 * 60 * 24))
      reminders.push({
        id: `pr_deadline_${priority._id}`,
        type: 'priority',
        category: 'deadline',
        text: `⚠️ "${priority.title}" deadline is in ${daysLeft} day${daysLeft > 1 ? 's' : ''}!`,
        source: priority._id,
        createdAt: now,
        priority: 'high'
      })
    })

    // 2. Habit Streak Reminders
    priorities.forEach(priority => {
      // Calculate current streak
      const dailyMinutes = priority.dailyMinutes || {}
      let streak = 0
      let lastDate = new Date(today)
      
      while (true) {
        const dateKey = lastDate.toISOString().slice(0, 10)
        const minutes = dailyMinutes[dateKey] || 0
        if (minutes >= 30) {
          streak++
          lastDate.setDate(lastDate.getDate() - 1)
        } else break
      }

      // Send reminder for maintaining streaks
      if (streak >= 7) {
        const minutesToday = dailyMinutes[today] || 0
        if (minutesToday < 30) {
          reminders.push({
            id: `streak_${priority._id}`,
            type: 'streak',
            category: 'maintain',
            text: `Keep your ${streak}-day streak alive for "${priority.title}"! Only ${30 - minutesToday} minutes needed today.`,
            source: priority._id,
            createdAt: now,
            priority: 'medium'
          })
        }
      }

      // Notify about achievement unlocks
      const streakAchievements = [
        { days: 60, badge: '🦾 Iron Mind', level: 'gold' },
        { days: 30, badge: '💎 Disciplined', level: 'silver' },
        { days: 15, badge: '🔥 Focused', level: 'bronze' },
        { days: 7, badge: '🌱 Sprout', level: 'starter' }
      ]

      const newAchievement = streakAchievements.find(a => streak === a.days)
      if (newAchievement) {
        reminders.push({
          id: `achievement_${priority._id}_${streak}`,
          type: 'achievement',
          category: 'unlock',
          text: `🎉 Congratulations! You've earned the ${newAchievement.badge} badge for "${priority.title}" with a ${streak}-day streak!`,
          source: priority._id,
          createdAt: now,
          priority: 'high'
        })
      }
    })

    // 3. Reflection Reminders
    const latestReflection = await Reflection.findOne({
      userId: req.user.id,
      createdAt: { 
        $gte: new Date(now.setHours(0,0,0,0)),
        $lt: new Date(now.setHours(23,59,59,999))
      }
    }).sort({ createdAt: -1 })

    // Remind about daily reflection if not done
    if (!latestReflection && now.getHours() >= 20) { // After 8 PM
      reminders.push({
        id: 'reflection_daily',
        type: 'reflection',
        category: 'daily',
        text: "Don't forget your daily reflection - take a moment to review your day and learnings.",
        createdAt: now,
        priority: 'medium'
      })
    }

    // Surface previous day's reflection for motivation
    const yesterdayReflection = await Reflection.findOne({
      userId: req.user.id,
      createdAt: {
        $gte: new Date(now.setDate(now.getDate() - 1)).setHours(0,0,0,0),
        $lt: new Date(now.setDate(now.getDate() - 1)).setHours(23,59,59,999)
      }
    })

    if (yesterdayReflection?.answers?.moralLessons) {
      reminders.push({
        id: `reflection_motivation_${yesterdayReflection._id}`,
        type: 'reflection',
        category: 'motivation',
        text: `Yesterday's insight: "${yesterdayReflection.answers.moralLessons}" - Keep this lesson in mind today.`,
        source: yesterdayReflection._id,
        createdAt: now,
        priority: 'low'
      })
    }

    // Sort reminders by priority and recency
    const priorityValues = { high: 3, medium: 2, low: 1 }
    reminders.sort((a, b) => {
      const priorityDiff = priorityValues[b.priority || 'low'] - priorityValues[a.priority || 'low']
      if (priorityDiff !== 0) return priorityDiff
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

    res.json(reminders)
  } catch (error) {
    console.error('Error getting reminders:', error)
    res.status(500).json({ message: 'Error getting reminders' })
  }
})

module.exports = router