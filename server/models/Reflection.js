const mongoose = require('mongoose')

const ReflectionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  answers: {
    whatMakeDayBetter: { type: String },
    preSleepHappiness: { type: String },
    moralLessons: { type: String },
    planTomorrow: { type: String },
    gratitude: { type: String }
  },
  retentionDays: { type: Number, default: 3 },
  createdAt: { type: Date, default: Date.now },
  expireAt: { type: Date, default: null }
})

// TTL index to auto-delete documents when expireAt is reached
ReflectionSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model('Reflection', ReflectionSchema)
