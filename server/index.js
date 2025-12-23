const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const {
  limiter,
  sessionLimiter,
  pointsLimiter,
  badgesLimiter,
  speedLimiter
} = require('./middleware/rateLimiter');
const activityLogger = require('./middleware/activityLogger');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Security middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : true
}));
app.use(express.json({ limit: '1mb' }));
app.use(speedLimiter);
app.use(limiter);
app.use(activityLogger);

// Connect to MongoDB (robust handling for malformed URIs)
const MONGO_URI_RAW = process.env.MONGO_URI || 'mongodb://localhost:27017/mindshield';

function sanitizeMongoUri(uri) {
  try {
    const idx = uri.indexOf('://')
    if (idx === -1) return uri
    const prefix = uri.slice(0, idx + 3)
    const rest = uri.slice(idx + 3)
    const atIdx = rest.indexOf('@')
    if (atIdx === -1) return uri
    const creds = rest.slice(0, atIdx)
    const hostRest = rest.slice(atIdx + 1)
    if (!creds.includes(':')) return uri
    const [user, pass] = creds.split(':')
    const safeCreds = `${encodeURIComponent(user)}:${encodeURIComponent(pass)}`
    return prefix + safeCreds + '@' + hostRest
  } catch (e) {
    return uri
  }
}

;(async () => {
  const uri = sanitizeMongoUri(MONGO_URI_RAW)
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error('Mongo connection error', err)
    console.error(
      'MongoDB connection failed. If your MONGO_URI contains special characters in the username/password, URL-encode them (use encodeURIComponent). Example: mongodb+srv://'+
      "" + encodeURIComponent('user') + ':' + encodeURIComponent('p@ssw0rd') + "@cluster0..."
    )

    // Try fallback to local MongoDB (useful in dev when cloud SRV lookup fails)
    const localUri = 'mongodb://localhost:27017/mindshield'
    try {
      console.log('Attempting fallback to local MongoDB at', localUri)
      await mongoose.connect(localUri, { useNewUrlParser: true, useUnifiedTopology: true })
      console.log('Connected to local MongoDB fallback')
      return
    } catch (localErr) {
      console.error('Local MongoDB fallback failed', localErr)
      console.error('Continuing without DB connection; routes will still run but data persistence will be disabled until the DB is fixed.')
    }
  }
})()

// Import routes
const sectionsRouter = require('./routes/sections');
const authRouter = require('./routes/auth');
const prioritiesRouter = require('./routes/priorities');
const sessionsRouter = require('./routes/sessions');
const badgesRouter = require('./routes/badges');
const pointsRouter = require('./routes/points');
const analyticsRouter = require('./routes/analytics');
const distractionRouter = require('./routes/distraction');
const reflectionsRouter = require('./routes/reflections');
const remindersRouter = require('./routes/reminders');
const distractionJournalRouter = require('./routes/distractionJournal');
const mindClarityRouter = require('./routes/mindClarity');
const habitsRouter = require('./routes/habits');

// Apply routes with rate limits where needed
app.use('/api/sessions', sessionLimiter, sessionsRouter);
app.use('/api/badges', badgesLimiter, badgesRouter);
app.use('/api/priorities', pointsLimiter, prioritiesRouter);
app.use('/api/points', pointsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/auth', authRouter);
app.use('/api/sections', sectionsRouter);
app.use('/api/distraction', distractionRouter);
app.use('/api/reflections', reflectionsRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/distractionjournal', distractionJournalRouter);
app.use('/api/mindclarity', mindClarityRouter);
app.use('/api/habits', habitsRouter);

app.listen(port, () => console.log(`Server listening on ${port}`));
