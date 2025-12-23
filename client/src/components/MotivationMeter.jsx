import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useApp } from '../context/AppContext';

function calculateMotivationScore(priority, sessions, badges) {
  // Base score starts at 50
  let score = 50;
  
  // Calculate recent activity (last 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
  const recentSessions = sessions.filter(s => s.startTime && new Date(s.startTime) >= sevenDaysAgo);
  
  // Add points for recent activity (up to 20 points)
  const activityScore = Math.min(20, recentSessions.length * 4);
  score += activityScore;
  
  // Add points for streaks (up to 15 points)
  // compute streak days from sessions if not provided
  const streakDays = (() => {
    if (!sessions || sessions.length === 0) return 0;
    const dates = sessions
      .map(s => s.startTime ? new Date(s.startTime).toDateString() : null)
      .filter(Boolean);
    const unique = [...new Set(dates)].map(d => new Date(d));
    unique.sort((a, b) => b - a);
    let streak = 0;
    if (unique.length === 0) return 0;
    streak = 1;
    let currentDate = unique[0];
    for (let i = 1; i < unique.length; i++) {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 1);
      if (unique[i].toDateString() === prev.toDateString()) {
        streak++;
        currentDate = unique[i];
      } else break;
    }
    return streak;
  })();
  const streakScore = Math.min(15, streakDays);
  score += streakScore;
  
  // Add points for badges (up to 15 points)
  const priorityBadges = badges.filter(b => String(b.priorityId) === String(priority._id));
  const badgeScore = Math.min(15, priorityBadges.length * 3);
  score += badgeScore;
  
  return Math.min(100, Math.max(0, score));
}

function getMotivationColor(score) {
  if (score >= 80) return '#4CAF50'; // Green
  if (score >= 60) return '#2196F3'; // Blue
  if (score >= 40) return '#FFC107'; // Yellow
  if (score >= 20) return '#FF9800'; // Orange
  return '#F44336'; // Red
}

export default function MotivationMeter({ priorityId }) {
  const { state } = useApp();
  const priority = state.priorities.find(p => p._id === priorityId);
  const relevantSessions = state.sessions.filter(s => s.priorityId === priorityId);
  
  const motivationScore = useMemo(() => {
    if (!priority) return 0;
    return calculateMotivationScore(priority, relevantSessions, state.badges || []);
  }, [priority, relevantSessions, state.badges]);

  const color = getMotivationColor(motivationScore);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={2}
    >
      <Typography variant="h6" gutterBottom>
        Motivation Meter
      </Typography>
      
      <Box position="relative" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress
          variant="determinate"
          value={motivationScore}
          size={120}
          thickness={4}
          sx={{
            color,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
              transition: 'all 0.5s ease-in-out',
            },
          }}
        />
        <Box
          position="absolute"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Typography
            variant="h4"
            component="div"
            color="text.primary"
            sx={{ fontWeight: 'bold' }}
          >
            {Math.round(motivationScore)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {motivationScore >= 80 ? 'Excellent!' :
             motivationScore >= 60 ? 'Good' :
             motivationScore >= 40 ? 'Okay' :
             motivationScore >= 20 ? 'Need Push' :
             'Low'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}