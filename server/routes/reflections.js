const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Reflection = require('../models/Reflection')

// Helper: clamp retention days between 1 and 14
function clampRetention(n){
  const v = Number(n) || 3
  if (v < 1) return 1
  if (v > 14) return 14
  return Math.floor(v)
}

// POST /api/reflections - create a new reflection
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user && req.user.id
    const {
      whatMakeDayBetter = '',
      preSleepHappiness = '',
      moralLessons = '',
      planTomorrow = '',
      gratitude = '',
      retentionDays
    } = req.body || {}

    const days = clampRetention(retentionDays)
    const createdAt = new Date()
    const expireAt = new Date(createdAt.getTime() + days * 24 * 60 * 60 * 1000)

    const r = new Reflection({
      userId,
      answers: { whatMakeDayBetter, preSleepHappiness, moralLessons, planTomorrow, gratitude },
      retentionDays: days,
      createdAt,
      expireAt
    })

    await r.save()
    return res.json({ ok: true, id: r._id, expireAt })
  } catch (err) {
    console.error('reflections POST error', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/reflections - list recent reflections for user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user && req.user.id
    // return last 30 entries (not expired) sorted desc
    const list = await Reflection.find({ userId }).sort({ createdAt: -1 }).limit(30).lean()
    return res.json({ reflections: list })
  } catch (err) {
    console.error('reflections GET error', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// PATCH /api/reflections/:id - update retentionDays (1..14) and recompute expireAt
router.patch('/:id', auth, async (req, res) => {
  try {
    const userId = req.user && req.user.id
    const id = req.params.id
    const { retentionDays } = req.body || {}
    const days = clampRetention(retentionDays)

  const ref = await Reflection.findById(id)
    if (!ref) return res.status(404).json({ error: 'Reflection not found' })
  if (String(ref.userId) !== String(userId)) return res.status(403).json({ error: 'Forbidden' })

    // Recalculate expireAt based on original createdAt so retentionDays describes lifetime from creation
    const expireAt = new Date(new Date(ref.createdAt).getTime() + days * 24 * 60 * 60 * 1000)
    ref.retentionDays = days
    ref.expireAt = expireAt
    await ref.save()

    return res.json({ ok: true, id: ref._id, retentionDays: ref.retentionDays, expireAt: ref.expireAt })
  } catch (err) {
    console.error('reflections PATCH error', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
