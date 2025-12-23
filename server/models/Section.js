const mongoose = require('mongoose')

const SectionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String }
}, { timestamps: true })

module.exports = mongoose.model('Section', SectionSchema)
