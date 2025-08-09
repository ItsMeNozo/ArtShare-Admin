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
              <YAxis
                yAxisId="left"
                allowDecimals={false}
                label={{
                  value: 'Total Users',
                  angle: -90,
                  position: 'insideLeft',
                  style: {
                    textAnchor: 'middle',
                    fill: '#794e7b',
                    fontWeight: 500,
                  },
                }}
                tick={{ fill: '#794e7b' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                allowDecimals={false}
                label={{
                  value: 'Total Posts',
                  angle: 90,
                  position: 'insideRight',
                  style: {
                    textAnchor: 'middle',
                    fill: '#0477a0',
                    fontWeight: 500,
                  },
                }}
                tick={{ fill: '#0477a0' }}
              />
              <Tooltip
                labelFormatter={(label) =>
                  format(parseISO(label), 'MMM d, yyyy')
                }
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number, name: string) => [
                  value.toLocaleString(),
                  name,
                ]}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                }}
                iconType="line"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="users"
                name="Total Users"
                stroke="#794e7b"
                strokeWidth={3}
                activeDot={{
                  r: 6,
                  fill: '#794e7b',
                  stroke: '#fff',
                  strokeWidth: 2,
                }}
                dot={{
                  fill: '#794e7b',
                  r: 4,
                  stroke: '#fff',
                  strokeWidth: 1,
                }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="posts"
                name="Total Posts"
                stroke="#0477a0"
                strokeWidth={3}
                activeDot={{
                  r: 6,
                  fill: '#0477a0',
                  stroke: '#fff',
                  strokeWidth: 2,
                }}
                dot={{
                  fill: '#0477a0',
                  r: 4,
                  stroke: '#fff',
                  strokeWidth: 1,
                }}
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
