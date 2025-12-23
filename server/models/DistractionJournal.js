const mongoose = require('mongoose')

const DistractionJournalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: () => new Date(), required: true },
  clarityRating: { type: Number, min: 1, max: 10, required: true },
  focusLevel: { type: Number, min: 1, max: 10, required: true },
  mood: { type: String, enum: ['calm','happy','stressed','neutral','sad'], required: true },
  sleepHours: { type: Number, required: true },
  productivity: { type: Number, min: 1, max: 10, required: true },
  stress: { type: Boolean, default: false },
  distractionText: { type: String, default: '' },
  gratitudeText: { type: String, default: '' },
  selfLearningText: { type: String, default: '' },
  aiSummary: { type: String, default: '' },
  mlPrediction: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: () => new Date() }
})

module.exports = mongoose.model('DistractionJournal', DistractionJournalSchema)
