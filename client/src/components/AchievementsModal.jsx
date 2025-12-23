import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Grid,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BadgeDisplay from './ui/BadgeDisplay';
import { useApp } from '../context/AppContext';

export default function AchievementsModal({ open, onClose }) {
  const { state } = useApp();
  const badges = state.badges || [];

  // Group badges by type
  const groupedBadges = badges.reduce((acc, badge) => {
    if (!acc[badge.type]) acc[badge.type] = [];
    acc[badge.type].push(badge);
    return acc;
  }, {});

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Achievements
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {Object.entries(groupedBadges).map(([type, badges]) => (
            <Grid item xs={12} key={type}>
              <Typography variant="h6" sx={{ mb: 2, textTransform: 'capitalize' }}>
                {type} Badges
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {badges
                  .sort((a, b) => b.level - a.level)
                  .map((badge) => (
                    <BadgeDisplay key={badge._id} badge={badge} />
                  ))}
              </Box>
              <Divider sx={{ mt: 2 }} />
            </Grid>
          ))}
          {Object.keys(groupedBadges).length === 0 && (
            <Grid item xs={12}>
              <Typography color="text.secondary" textAlign="center">
                No badges earned yet. Keep working on your priorities to earn badges!
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}