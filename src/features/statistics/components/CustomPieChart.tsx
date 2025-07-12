import { Box, Paper, Typography } from '@mui/material';
import React from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { PieChartDataItem } from '../statistics.types';

interface CustomPieChartProps {
  data: PieChartDataItem[];
  title: string;
  colors: string[];
  height?: number;
  outerRadius?: number;
  showLegend?: boolean;
  legendLayout?: 'horizontal' | 'vertical';
  legendAlign?: 'left' | 'center' | 'right';
  legendVerticalAlign?: 'top' | 'middle' | 'bottom';
}

const CustomPieChart: React.FC<CustomPieChartProps> = ({
  data,
  title,
  colors,
  height = 200, // Default height
  outerRadius = 60,
  showLegend = true,
  legendLayout = 'vertical',
  legendAlign = 'right',
  legendVerticalAlign = 'middle',
}) => {
  return (
    <Paper elevation={2} className="p-4 h-full flex flex-col">
      <Typography
        variant="subtitle1"
        align="center"
        gutterBottom
        className="font-semibold"
      >
        {title}
      </Typography>
      {data.length > 0 ? (
        <Box sx={{ height, width: '100%' }} className="flex-grow">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={outerRadius}
                labelLine={false}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              {showLegend && (
                <Legend
                  layout={legendLayout}
                  align={legendAlign}
                  verticalAlign={legendVerticalAlign}
                  wrapperStyle={{ fontSize: '12px' }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Typography variant="body2" align="center" className="m-auto">
          No data for {title}
        </Typography>
      )}
    </Paper>
  );
};

export default CustomPieChart;
