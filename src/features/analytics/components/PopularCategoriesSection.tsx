import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Paper,
  Typography,
  Box,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import { PieChartDataItem } from '../analytics.types';
import { COLORS } from '../constants';
import { PopularCategorySortBy } from '../../../types/analytics';

interface PopularCategoriesSectionProps {
  chartData: PieChartDataItem[];
  limit: number;
  sortBy: PopularCategorySortBy;
  onLimitChange: (limit: number) => void;
  onSortByChange: (sortBy: PopularCategorySortBy) => void;
  loading: boolean;
}

const PopularCategoriesSection: React.FC<PopularCategoriesSectionProps> = ({
  chartData,
  limit,
  sortBy,
  onLimitChange,
  onSortByChange,
  loading,
}) => {
  return (
    <Paper elevation={2} className="p-4 h-full flex flex-col">
      <Typography
        variant="h6"
        component="h3"
        gutterBottom
        className="font-semibold text-gray-700 text-center"
      >
        Popular Categories
      </Typography>

      <Box className="flex space-x-4 my-2 justify-center items-end">
        <Box className="flex flex-col">
          <Typography
            variant="caption"
            component="label"
            htmlFor="popular-limit-select"
            sx={{
              mb: 0.5,
              color: 'text.secondary',
              textAlign: 'left',
              width: '100%',
            }}
          >
            Limit
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }} variant="outlined">
            <Select
              id="popular-limit-select"
              value={limit}
              onChange={(e: SelectChangeEvent<number>) =>
                onLimitChange(e.target.value as number)
              }
            >
              <MenuItem value={3}>3</MenuItem>
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box className="flex flex-col">
          <Typography
            variant="caption"
            component="label"
            htmlFor="popular-sortby-select"
            sx={{
              mb: 0.5,
              color: 'text.secondary',
              textAlign: 'left',
              width: '100%',
            }}
          >
            Sort By
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }} variant="outlined">
            <Select
              id="popular-sortby-select"
              value={sortBy}
              onChange={(e: SelectChangeEvent<PopularCategorySortBy>) =>
                onSortByChange(e.target.value as PopularCategorySortBy)
              }
            >
              <MenuItem value="postCount">Post Count</MenuItem>
              <MenuItem value="engagement">Engagement</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {loading ? (
        <Box className="flex justify-center items-center flex-grow pt-4">
          <CircularProgress size={30} />
        </Box>
      ) : chartData.length > 0 ? (
        <Box sx={{ height: 300, width: '100%' }} className="flex-grow mt-2">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  sortBy === 'engagement' ? value.toFixed(1) : value
                }
              />
              <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Typography className="text-center py-10 flex-grow flex justify-center items-center">
          No popular category data for current filter.
        </Typography>
      )}
    </Paper>
  );
};

export default PopularCategoriesSection;
