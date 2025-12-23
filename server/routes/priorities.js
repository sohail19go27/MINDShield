const express = require('express')
const router = express.Router()
const Priority = require('../models/Priority')
const auth = require('../middleware/auth')

// GET /api/priorities - list user's priorities
router.get('/priorities', auth, async (req, res) => {
  try {
    const list = await Priority.find({ userId: req.userId }).sort({ createdAt: -1 }).lean()
    res.json(list)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/priorities - create new priority (max 3 active)
router.post('/priorities', auth, async (req, res) => {
  try {
    const { title, description, deadline } = req.body
    if (!title) return res.status(400).json({ error: 'title is required' })

    const activeCount = await Priority.countDocuments({ userId: req.userId, active: true })
    if (activeCount >= 3) return res.status(400).json({ error: 'Max 3 active priorities allowed' })

    const p = new Priority({ userId: req.userId, title, description, deadline: deadline ? new Date(deadline) : undefined })
    await p.save()
    res.status(201).json(p)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// PATCH /api/priorities/:id - update or mark complete
router.patch('/priorities/:id', auth, async (req, res) => {
  try {
    const update = {}
    const { title, description, deadline, active, progress, notes } = req.body
    if (title !== undefined) update.title = title
    if (description !== undefined) update.description = description
    if (deadline !== undefined) update.deadline = deadline ? new Date(deadline) : null
    if (active !== undefined) update.active = active
    if (progress !== undefined) update.progress = progress
    if (notes !== undefined) update.notes = notes

    const p = await Priority.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, update, { new: true })
    if (!p) return res.status(404).json({ error: 'Priority not found' })
    res.json(p)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
