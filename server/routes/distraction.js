const express = require('express')
const router = express.Router()

// POST /api/analyzeDistraction
router.post('/analyzeDistraction', async (req, res) => {
  try {
    const { habit = '', trigger = '', triggerDetail = '', emotionalIntensity = 3, smallStep = '', replacement = '' } = req.body || {}

    // Basic sentiment based on emotionalIntensity (1-5)
    let sentiment = 'neutral'
    if (Number(emotionalIntensity) <= 2) sentiment = 'positive'
    else if (Number(emotionalIntensity) >= 4) sentiment = 'negative'

    // Keyword extraction: simple tokenization and match against known keywords
    const text = [habit, trigger, triggerDetail, smallStep, replacement].join(' ').toLowerCase()
    const known = [
      'phone', 'social media', 'reels', 'instagram', 'tiktok', 'youtube', 'sleep', 'bed', 'procrastination', 'boredom', 'stress', 'anxiety', 'loneliness', 'work', 'notifications', 'gaming', 'email'
    ]
    const keywords = []
    for (const k of known) {
      if (text.includes(k) && !keywords.includes(k)) keywords.push(k)
    }

    // Determine habits to remove: if user mentions phone, social media, late-night, scrolling
    const habits_to_remove = []
    if (text.match(/phone|reel|instagram|tiktok|social media|notifications/)) {
      habits_to_remove.push('Late-night phone use (reduce screen time)')
    }
    if (text.match(/procrastin|gaming/)) habits_to_remove.push('Mindless gaming / procrastination')
    if (text.match(/snacking|sugar/)) habits_to_remove.push('Late-night snacking')

    // Determine habits to add based on replacement or smallStep or fallback suggestions
    const habits_to_add = []
    if (replacement && replacement.trim()) habits_to_add.push(replacement.trim())
    if (smallStep && smallStep.toLowerCase().includes('turn off')) habits_to_add.push('Digital curfew (phone off)')
    // fallback suggestions
    if (habits_to_add.length === 0) {
      if (text.includes('sleep') || text.includes('bed')) habits_to_add.push('Wind-down routine: reading, light stretching, no screens 1 hr before bed')
      if (text.includes('boredom') || text.includes('loneliness')) habits_to_add.push('Short social check-ins or scheduled walk')
      if (text.includes('stress') || text.includes('anxiety')) habits_to_add.push('5–10min breathing or mini-meditation')
    }

    // Routine suggestion: build from detected keywords and replacement
    const suggestions = []
    if (habits_to_remove.length) suggestions.push('Remove: ' + habits_to_remove[0])
    if (habits_to_add.length) suggestions.push('Add: ' + habits_to_add[0])
    if (smallStep) suggestions.push('Today: ' + smallStep)
    if (suggestions.length === 0) suggestions.push('Try a 10-minute screen-free routine before bed; swap scrolling with reading.')

    const routine_suggestion = suggestions.join('; ')

    return res.json({
      sentiment,
      keywords,
      habits_to_remove,
      habits_to_add,
      routine_suggestion
    })
  } catch (err) {
    console.error('analyzeDistraction error', err)
    return res.status(500).json({ error: 'Failed to analyze' })
  }
})

module.exports = router
