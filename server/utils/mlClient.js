const axios = require('axios')

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001/predict'

async function predictBehavior(data) {
  // data should include numeric fields
  try {
    const resp = await axios.post(ML_SERVICE_URL, data, { timeout: 5000 })
    return resp.data
  } catch (err) {
    console.error('ML service call failed', err.message || err)
    return { predictedClarity: null, trend: 'unknown' }
  }
}

module.exports = { predictBehavior }
