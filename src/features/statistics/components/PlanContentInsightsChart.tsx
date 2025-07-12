import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartWrapper from './ChartWrapper';

interface PlanContentDataPoint {
  name: string;
  avgPostsPerUser: number;
  avgLikes: number;
  avgComments: number;
}

interface PlanContentInsightsChartProps {
  data: PlanContentDataPoint[];
}

const PlanContentInsightsChart: React.FC<PlanContentInsightsChartProps> = ({
  data,
}) => {
  return (
    <ChartWrapper
      title="Plan Content Insights"
      chartDataExists={data.length > 0}
      height={300}
      noDataMessage="No plan content data."
    >
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, left: -10, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-20}
            textAnchor="end"
            interval={0}
            tick={{ fontSize: 10 }}
            height={50}
          />
          <YAxis allowDecimals={false} />
          <Tooltip
            formatter={(value: number, name: string) => [
              value.toFixed(1),
              name,
            ]}
            labelFormatter={(label: string) => `Plan: ${label}`}
          />
          <Legend />
          <Bar
            dataKey="avgPostsPerUser"
            name="Avg Posts/User"
            fill="#575181"
            barSize={15}
          />
          <Bar
            dataKey="avgLikes"
            name="Avg Likes/Post"
            fill="#03799e"
            barSize={15}
          />
          <Bar
            dataKey="avgComments"
            name="Avg Comments/Post"
            fill="#fbae30"
            barSize={15}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default PlanContentInsightsChart;
