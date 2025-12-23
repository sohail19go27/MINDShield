const express = require('express')
const router = express.Router()

// POST /api/habits/save
router.post('/save', async (req, res) => {
  try {
    const { userId, habitsToAdd = [], habitsToRemove = [] } = req.body || {}
    // Placeholder: Persisting habits would require a model and auth.
    // For now, echo back the payload and pretend it's saved.
    console.log('Saving habits for', userId, { habitsToAdd, habitsToRemove })
    return res.json({ ok: true, saved: { habitsToAdd, habitsToRemove } })
  } catch (err) {
    console.error('habits save error', err)
    return res.status(500).json({ error: 'Failed to save habits' })
  }
})

module.exports = router
