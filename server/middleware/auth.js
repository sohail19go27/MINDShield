const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret'

module.exports = function(req, res, next){
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' })
  const parts = auth.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid Authorization header' })
  const token = parts[1]
  try{
    const payload = jwt.verify(token, JWT_SECRET)
    // support both `req.user.id` and legacy `req.userId`
    req.user = { id: payload.id }
    req.userId = payload.id
    next()
  } catch (err){
    return res.status(401).json({ error: 'Invalid token' })
  }
}
