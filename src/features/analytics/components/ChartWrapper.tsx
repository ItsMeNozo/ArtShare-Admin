import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

interface ChartWrapperProps {
  title: string;
  children: React.ReactNode;
  chartDataExists: boolean;
  noDataMessage?: string;
  height?: number | string;
  titleVariant?: 'h6' | 'subtitle1' | 'subtitle2';
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  children,
  chartDataExists,
  noDataMessage = 'No data available for this chart.',
  height = 300,
  titleVariant = 'subtitle1',
}) => {
  return (
    <Paper elevation={2} className="p-4 h-full flex flex-col">
      <Typography
        variant={titleVariant}
        component="h3"
        gutterBottom
        className="font-semibold text-center text-gray-700"
      >
        {title}
      </Typography>
      {chartDataExists ? (
        <Box sx={{ height, width: '100%' }} className="flex-grow">
          {children}
        </Box>
      ) : (
        <Typography variant="body2" className="text-center py-10 m-auto">
          {noDataMessage}
        </Typography>
      )}
    </Paper>
  );
};

export default ChartWrapper;
