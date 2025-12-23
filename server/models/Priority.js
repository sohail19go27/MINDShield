const mongoose = require('mongoose')

const PrioritySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  title: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date },
  progress: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  streakDays: { type: Number, default: 0 },
  badge: { type: String },
  todayTime: { type: Number, default: 0 }, // hours
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Priority', PrioritySchema)
