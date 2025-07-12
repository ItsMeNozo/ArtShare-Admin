import {
  Box,
  FormControl,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CombinedTimePoint } from '../statistics.types';

interface PlatformGrowthChartProps {
  data: CombinedTimePoint[];
  timeSeriesDays: number;
  onTimeSeriesDaysChange: (days: number) => void;
  loading: boolean;
}

const PlatformGrowthChart: React.FC<PlatformGrowthChartProps> = ({
  data,
  timeSeriesDays,
  onTimeSeriesDaysChange,
  loading,
}) => {
  return (
    <Paper elevation={2} className="p-4 h-full flex flex-col w-full">
      <Box className="flex justify-between items-center mb-4">
        <Typography
          variant="subtitle1"
          component="h2"
          className="font-semibold text-gray-700"
        >
          Platform Growth Over Time
        </Typography>
        <Box className="flex flex-col items-end">
          <Typography
            variant="caption"
            component="label"
            htmlFor="timeseries-days-select-growth"
            sx={{ mb: 0.5, color: 'text.secondary' }}
          >
            Period
          </Typography>
          <FormControl size="small" sx={{ minWidth: 140 }} variant="outlined">
            <Select
              id="timeseries-days-select-growth"
              value={timeSeriesDays}
              onChange={(e: SelectChangeEvent<number>) =>
                onTimeSeriesDaysChange(e.target.value as number)
              }
            >
              <MenuItem value={7}>Last 7 Days</MenuItem>
              <MenuItem value={30}>Last 30 Days</MenuItem>
              <MenuItem value={90}>Last 90 Days</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      {data.length > 0 ? (
        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(tick) => format(parseISO(tick), 'MMM d')}
              />
              <YAxis yAxisId="left" allowDecimals={false} />
              <YAxis
                yAxisId="right"
                orientation="right"
                allowDecimals={false}
              />
              <Tooltip
                labelFormatter={(label) =>
                  format(parseISO(label), 'MMM d, yyyy')
                }
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="users"
                name="Total Users"
                stroke="#794e7b"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="posts"
                name="Total Posts"
                stroke="#0477a0"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      ) : !loading ? (
        <Typography className="text-center py-10">
          No growth data available for the selected period.
        </Typography>
      ) : null}
    </Paper>
  );
};

export default PlatformGrowthChart;
