const axios = require('axios')

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

async function analyzeReflection(reflectionText) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set')
  }

  const prompt = `Analyze the user's reflection below and suggest:\n- 2 habits or routines they should ADD to improve clarity or focus.\n- 2 habits or behaviors they should REMOVE to reduce chaos.\nFormat the response as JSON exactly like this:\n{ "habitsToAdd": ["..."], "habitsToRemove": ["..."], "summary": "..." }\nReflection:\n${reflectionText}`

  try {
    const resp = await axios.post(OPENAI_URL, {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.2
    }, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 20000
    })

    const text = resp?.data?.choices?.[0]?.message?.content || ''
    // Attempt to extract JSON portion from model output
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        const parsed = JSON.parse(match[0])
        return parsed
      } catch (e) {
        // fallthrough to return summary
      }
    }

    // If parsing failed, return the text as summary
    return { habitsToAdd: [], habitsToRemove: [], summary: text }
  } catch (err) {
    console.error('OpenAI request failed', err?.response?.data || err.message || err)
    throw err
  }
}

module.exports = { analyzeReflection }
