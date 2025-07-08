import React from 'react';
import { Paper, Typography } from '@mui/material';
import StatCard from './StatCard';

interface TimeToActionStatsProps {
  avgHoursSignupToFirstPost?: number;
  avgHoursPostToFirstInteraction?: number;
}

const TimeToActionStats: React.FC<TimeToActionStatsProps> = ({
  avgHoursSignupToFirstPost,
  avgHoursPostToFirstInteraction,
}) => {
  return (
    <Paper elevation={2} className="p-4 h-full flex flex-col justify-center">
      <Typography
        variant="subtitle1"
        component="h3"
        gutterBottom
        className="font-semibold text-center"
      >
        Time to Action
      </Typography>
      <StatCard
        title="Avg. Signup to 1st Post (hrs)"
        value={avgHoursSignupToFirstPost?.toFixed(1)}
        sx={{ boxShadow: 'none', mb: 2, border: 'none' }}
      />
      <StatCard
        title="Avg. Post to 1st Interaction (hrs)"
        value={avgHoursPostToFirstInteraction?.toFixed(1)}
        sx={{ boxShadow: 'none', border: 'none' }}
      />
    </Paper>
  );
};

export default TimeToActionStats;
