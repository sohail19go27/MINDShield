const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String },
  totalPoints: { type: Number, default: 0 },
  todayPoints: { type: Number, default: 0 },
  badges: { type: [String], default: [] }
}, { timestamps: true })

module.exports = mongoose.model('User', UserSchema)
