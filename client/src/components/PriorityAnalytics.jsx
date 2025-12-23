import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { useApp } from '../context/AppContext';

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric' 
  }).format(new Date(date));
}

function aggregateSessionData(sessions) {
  const dailyData = sessions.reduce((acc, session) => {
    const date = new Date(session.startTime).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        date,
        timeSpent: 0,
        points: 0,
        sessions: 0
      };
    }
    acc[date].timeSpent += session.duration / (60 * 60 * 1000); // Convert to hours
    acc[date].points += session.pointsAwarded;
    acc[date].sessions += 1;
    return acc;
  }, {});

  return Object.values(dailyData)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(day => ({
      ...day,
      date: formatDate(day.date)
    }));
}

export default function PriorityAnalytics({ priorityId }) {
  const { state } = useApp();
  const priority = state.priorities.find(p => p._id === priorityId);
  const sessions = state.sessions.filter(s => s.priorityId === priorityId);
  const data = aggregateSessionData(sessions);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Daily Time Spent
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis unit="hrs" />
                  <Tooltip />
                  <Bar dataKey="timeSpent" fill="#8884d8" name="Hours" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Points Earned
            </Typography>
            <Box height={250}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="points" 
                    stroke="#82ca9d" 
                    name="Points"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Session Frequency
            </Typography>
            <Box height={250}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="sessions" 
                    fill="#ffc658" 
                    stroke="#ffc658" 
                    name="Sessions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}