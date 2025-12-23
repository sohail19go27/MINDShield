const axios = require('axios')

async function generateAISummary(data) {
  // data: { distractionText, gratitudeText, selfLearningText }
  const key = process.env.OPENAI_API_KEY
  const combined = `Distraction: ${data.distractionText || ''}\nGratitude: ${data.gratitudeText || ''}\nSelfLearning: ${data.selfLearningText || ''}`
  const prompt = `Read the user's combined reflection and generate a concise 2-3 sentence summary that highlights focus, emotional state, and one actionable insight. Keep it empathetic and specific.\n\n${combined}`

  function localFallbackSummary(d) {
    const distraction = (d.distractionText || '').trim()
    const gratitude = (d.gratitudeText || '').trim()
    const learn = (d.selfLearningText || '').trim()

    const parts = []
    if (distraction) {
      // shorten distraction to first sentence or 12 words
      const short = distraction.split(/[.\n]/)[0].split(' ').slice(0, 12).join(' ')
      parts.push(`You noticed: ${short}${short.endsWith('.') ? '' : '.'}`)
    }
    if (gratitude) parts.push(`You expressed gratitude for ${gratitude.split(/[.\n]/)[0]}.`)
    if (learn) parts.push(`You learned: ${learn.split(/[.\n]/)[0]}.`)

    // Actionable insight: if distraction mentions phone/social suggests a digital curfew, else suggest a short routine
    let action = 'Try a short, screen-free wind-down before bed to protect focus.'
    const lower = distraction.toLowerCase()
    if (lower.includes('phone') || lower.includes('social') || lower.includes('instagram') || lower.includes('tiktok') || lower.includes('youtube')) {
      action = 'Consider a digital curfew (phone off 30–60 minutes before bed) to improve clarity.'
    } else if (lower.includes('stress') || lower.includes('anxiety')) {
      action = 'Try a 5–10 minute breathing exercise when you notice stress.'
    }

    const summary = (parts.length ? parts.join(' ') + ' ' : '') + action
    return summary
  }

  if (!key) {
    console.warn('OPENAI_API_KEY not set; using local fallback summary')
    return localFallbackSummary(data)
  }

  try {
    const resp = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.6
    }, {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    })

    const text = resp?.data?.choices?.[0]?.message?.content || ''
    return (text || '').trim()
  } catch (err) {
    console.error('OpenAI request failed', err?.response?.data || err.message || err)
    // Fall back to local summarizer if OpenAI call fails
    return localFallbackSummary(data)
  }
}

module.exports = { generateAISummary }
