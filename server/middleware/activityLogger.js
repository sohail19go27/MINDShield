const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

function logActivity(type, data) {
  const logEntry = {
    timestamp: new Date(),
    type,
    ...data
  };

  const logFile = path.join(logsDir, `${type}-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}

const activityLogger = (req, res, next) => {
  // Store the original json method
  const originalJson = res.json;

  // Override json method
  res.json = function(data) {
    // Log specific activities
    if (req.path.includes('/sessions')) {
      logActivity('session', {
        userId: req.user?.id,
        method: req.method,
        path: req.path,
        body: req.method === 'POST' ? req.body : undefined
      });
    }
    
    if (req.path.includes('/badges')) {
      logActivity('badge', {
        userId: req.user?.id,
        method: req.method,
        path: req.path,
        badgeData: data
      });
    }

    if (data && data.points) {
      logActivity('points', {
        userId: req.user?.id,
        method: req.method,
        path: req.path,
        points: data.points
      });
    }

    // Call the original json method
    return originalJson.call(this, data);
  };

  next();
};

module.exports = activityLogger;