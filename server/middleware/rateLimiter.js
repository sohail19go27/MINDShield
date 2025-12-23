const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Basic rate limiter setup
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Specific limiters for different endpoints
const sessionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60 // 60 requests per minute
});

const pointsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30 // 30 requests per minute
});

const badgesLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10 // 10 requests per minute
});

// Speed limiter - slows down responses after too many requests
// express-slow-down v2 requires delayMs to be a function for the old linear behavior
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // allow 100 requests per 15 minutes, then...
  delayMs: () => 500, // begin adding 500ms of delay per request
  validate: { delayMs: false } // silence deprecation warning
});

module.exports = {
  limiter,
  sessionLimiter,
  pointsLimiter,
  badgesLimiter,
  speedLimiter
};