const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  priorityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Priority',
    required: true
  },
  type: {
    type: String,
    enum: ['streak', 'time', 'points'],
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  earnedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for quick lookups
badgeSchema.index({ userId: 1, priorityId: 1, type: 1 });

module.exports = mongoose.model('Badge', badgeSchema);