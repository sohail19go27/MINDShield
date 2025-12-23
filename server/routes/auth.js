const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret'

// POST /api/auth/register
router.post('/auth/register', async (req, res) =>{
  try{
    const { email, password, name } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ error: 'User already exists' })
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    const user = new User({ email, passwordHash, name })
    await user.save()
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } })
  } catch (err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/auth/login
router.post('/auth/login', async (req, res) =>{
  try{
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ error: 'Invalid credentials' })
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } })
  } catch (err){
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
