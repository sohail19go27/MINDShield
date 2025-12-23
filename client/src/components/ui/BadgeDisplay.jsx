import React from 'react';
import { Box, Typography, Tooltip, Card } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const badgeColors = {
  1: '#CD7F32', // Bronze
  2: '#C0C0C0', // Silver
  3: '#FFD700', // Gold
  4: '#B9F2FF', // Diamond
  5: '#E5E4E2'  // Platinum
};

export default function BadgeDisplay({ badge }) {
  return (
    <Tooltip title={badge.description || badge.name}>
      <Card 
        sx={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          p: 1,
          m: 0.5,
          backgroundColor: 'background.paper',
          border: `2px solid ${badgeColors[badge.level]}`
        }}
      >
        <EmojiEventsIcon sx={{ color: badgeColors[badge.level] }} />
        <Box>
          <Typography variant="subtitle2" noWrap>
            {badge.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Level {badge.level}
          </Typography>
        </Box>
      </Card>
    </Tooltip>
  );
}