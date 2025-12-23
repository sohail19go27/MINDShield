const mongoose = require('mongoose')

const ItemSchema = new mongoose.Schema({
  sectionId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  dueDate: { type: Date },
  completed: { type: Boolean, default: false }
})

module.exports = mongoose.model('Item', ItemSchema)
