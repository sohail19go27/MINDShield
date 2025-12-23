const express = require('express')
const router = express.Router()
const Section = require('../models/Section')
const Item = require('../models/Item')

// GET /api/sections
router.get('/sections', async (req, res) => {
  try {
    const sections = await Section.find().sort({createdAt: 1}).lean()
    res.json(sections)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/sections/:id
router.get('/sections/:id', async (req, res) => {
  try {
    const s = await Section.findOne({ id: req.params.id }).lean()
    if (!s) return res.status(404).json({ error: 'Not found' })
    res.json(s)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/sections/:id/items (requires auth) - returns items for the authenticated user
const auth = require('../middleware/auth')
router.get('/sections/:id/items', auth, async (req, res) => {
  try {
    const items = await Item.find({ sectionId: req.params.id, userId: req.userId }).sort({ createdAt: -1 }).lean()
    res.json(items)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/sections/:id/items
router.post('/sections/:id/items', auth, async (req, res) => {
  try {
    const { text, dueDate } = req.body
    if (!text) return res.status(400).json({ error: 'text is required' })
    const section = await Section.findOne({ id: req.params.id })
    if (!section) return res.status(404).json({ error: 'Section not found' })
    const itemData = { sectionId: req.params.id, text }
    if (dueDate) itemData.dueDate = new Date(dueDate)
    itemData.userId = req.userId
    const item = new Item(itemData)
    await item.save()
    res.status(201).json(item)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/items/:itemId
router.put('/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params
    const { text, dueDate, completed } = req.body
    const update = {}
    if (text !== undefined) update.text = text
    if (dueDate !== undefined) update.dueDate = dueDate ? new Date(dueDate) : null
    if (completed !== undefined) update.completed = completed
    const item = await Item.findByIdAndUpdate(itemId, update, { new: true })
    if (!item) return res.status(404).json({ error: 'Item not found' })
    res.json(item)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE /api/items/:itemId
router.delete('/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params
    const item = await Item.findByIdAndDelete(itemId)
    if (!item) return res.status(404).json({ error: 'Item not found' })
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
