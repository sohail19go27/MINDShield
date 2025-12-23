const mongoose = require('mongoose')

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  priorityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Priority', index: true },
  startAt: { type: Date, default: Date.now },
  endAt: { type: Date },
  durationMinutes: { type: Number },
  pointsAwarded: { type: Number, default: 0 }
})

module.exports = mongoose.model('Session', SessionSchema)
