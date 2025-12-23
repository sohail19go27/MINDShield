const express = require('express')
const router = express.Router()
const DistractionJournal = require('../models/DistractionJournal')
const { generateAISummary } = require('../utils/ai')
const { predictBehavior } = require('../utils/mlClient')

// POST /api/distractionjournal
router.post('/', async (req, res) => {
  try {
    const payload = req.body || {}
    // Minimal validation / defaults
    const {
      userId,
      date,
      clarityRating,
      focusLevel,
      mood,
      sleepHours,
      productivity,
      stress,
      distractionText,
      gratitudeText,
      selfLearningText
    } = payload

    // Accept missing userId for now (dev); save initial doc
    const doc = new DistractionJournal({
      ...(userId ? { userId } : {}),
      date: date ? new Date(date) : new Date(),
      clarityRating,
      focusLevel,
      mood,
      sleepHours,
      productivity,
      stress: !!stress,
      distractionText,
      gratitudeText,
      selfLearningText
    })

    try {
      await doc.save()
    } catch (saveErr) {
      console.warn('Initial save failed, continuing without DB persist:', saveErr && saveErr.message ? saveErr.message : saveErr)
    }

    // Call AI summarizer (graceful fallback)
    let aiSummary = ''
    try {
      aiSummary = await generateAISummary({ distractionText, gratitudeText, selfLearningText })
      if (!aiSummary) aiSummary = 'AI summary unavailable'
    } catch (err) {
      console.error('AI summary failed', err.message || err)
      aiSummary = 'AI summary unavailable'
    }

    // Call ML service with numeric/coded data
    const moodMap = { calm: 0, happy: 1, stressed: 2, neutral: 3, sad: 4 }
    const moodEncoded = moodMap[mood] !== undefined ? moodMap[mood] : 3
    const mlInput = {
      clarityRating: Number(clarityRating) || 0,
      focusLevel: Number(focusLevel) || 0,
      moodEncoded,
      sleepHours: Number(sleepHours) || 0,
      productivity: Number(productivity) || 0,
      stress: stress ? 1 : 0
    }

    let mlPrediction = { predictedClarity: null, trend: 'unknown' }
    try {
      mlPrediction = await predictBehavior(mlInput)
      if (!mlPrediction || mlPrediction.predictedClarity === undefined) {
        mlPrediction = { predictedClarity: null, trend: 'unknown' }
      }
    } catch (err) {
      console.error('ML prediction failed', err.message || err)
      mlPrediction = { predictedClarity: null, trend: 'unknown' }
    }

    // Update doc with AI and ML results (attempt save; don't fail if DB is down)
    try {
      if (doc) {
        doc.aiSummary = aiSummary
        doc.mlPrediction = mlPrediction
        await doc.save()
      }
    } catch (saveErr) {
      console.warn('Final save failed, returning insight without DB persist:', saveErr && saveErr.message ? saveErr.message : saveErr)
    }

    return res.json({ aiSummary, mlPrediction, message: 'Insight generated successfully' })
  } catch (err) {
    console.error('distractionJournal error', err)
    return res.status(500).json({ error: 'Failed to save and analyze reflection' })
  }
})

module.exports = router
