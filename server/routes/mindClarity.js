const express = require('express')
const router = express.Router()
const { analyzeReflection } = require('../utils/openrouter')

// POST /api/mindclarity/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { answer1, answer2, answer3 } = req.body || {}
    const reflection = `Q1: ${answer1 || ''}\nQ2: ${answer2 || ''}\nQ3: ${answer3 || ''}`

    // Call OpenAI helper
    let aiResult
    try {
      aiResult = await analyzeReflection(reflection)
    } catch (err) {
      console.error('AI analyze failed, falling back to local heuristic', err.message || err)
      // Local heuristic fallback: simple keyword-based suggestions
      const text = reflection.toLowerCase()
      const habitsToAdd = []
      const habitsToRemove = []
      if (text.includes('phone') || text.includes('social') || text.includes('instagram') || text.includes('tiktok') || text.includes('youtube')) {
        habitsToRemove.push('Late-night phone/social scrolling')
        habitsToAdd.push('Digital curfew: no screens 1 hour before bed')
      }
      if (text.includes('procrast') || text.includes('gaming')) {
        habitsToRemove.push('Mindless gaming/procrastination')
        habitsToAdd.push('Schedule short focused work sprints (25-50 mins)')
      }
      if (habitsToAdd.length === 0) {
        habitsToAdd.push('Short morning planning routine (5–10 min)')
        habitsToAdd.push('Daily wind-down routine before sleep')
      }
      if (habitsToRemove.length === 0) {
        habitsToRemove.push('Unstructured multi-tasking')
        habitsToRemove.push('Late-night screen time')
      }
      aiResult = { habitsToAdd, habitsToRemove, summary: 'Fallback suggestions generated locally.' }
    }

    // Ensure structure
    const habitsToAdd = Array.isArray(aiResult.habitsToAdd) ? aiResult.habitsToAdd : (aiResult.habits_to_add || [])
    const habitsToRemove = Array.isArray(aiResult.habitsToRemove) ? aiResult.habitsToRemove : (aiResult.habits_to_remove || [])
    const summary = aiResult.summary || aiResult.msg || aiResult.description || ''

    return res.json({ habitsToAdd, habitsToRemove, summary })
  } catch (err) {
    console.error('mindClarity route error', err)
    return res.status(500).json({ error: 'Internal error' })
  }
})

module.exports = router
