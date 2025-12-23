import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid, Paper, Typography, Stack } from '@mui/material';
import PriorityAnalytics from '../components/PriorityAnalytics';
import MotivationMeter from '../components/MotivationMeter';
import BadgeDisplay from '../components/ui/BadgeDisplay';
import { useApp } from '../context/AppContext';

export default function PriorityDetail() {
  const { id } = useParams();
  const { state } = useApp();
  const priority = state.priorities.find(p => p._id === id);
  const priorityBadges = (state.badges || []).filter(b => b.priorityId === id);

  if (!priority) {
    return (
      <Box p={3}>
        <Typography>Priority not found</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              {priority.title}
            </Typography>
            {priority.notes && (
              <Typography color="text.secondary" paragraph>
                {priority.notes}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <PriorityAnalytics priorityId={id} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Paper sx={{ p: 2 }}>
              <MotivationMeter priorityId={id} />
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Earned Badges
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {priorityBadges.length > 0 ? (
                  priorityBadges.map(badge => (
                    <BadgeDisplay key={badge._id} badge={badge} />
                  ))
                ) : (
                  <Typography color="text.secondary">
                    No badges earned yet
                  </Typography>
                )}
              </Box>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}