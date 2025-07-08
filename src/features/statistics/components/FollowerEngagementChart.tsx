import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import ChartWrapper from './ChartWrapper';

interface FollowerEngagementDataPoint {
  name: string;
  avgLikes: number;
  avgComments: number;
  postsAnalyzed?: number;
}

interface FollowerEngagementChartProps {
  data: FollowerEngagementDataPoint[];
}

const FollowerEngagementChart: React.FC<FollowerEngagementChartProps> = ({
  data,
}) => {
  return (
    <ChartWrapper
      title="Follower Engagement Insights"
      chartDataExists={data.length > 0}
      height={300}
      noDataMessage="No follower engagement data."
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
          <YAxis yAxisId="left" orientation="left" allowDecimals={false} />
          {/* Optional: Secondary Y-axis for postsAnalyzed if scales differ greatly
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" allowDecimals={false} />
          */}
          <Tooltip
            formatter={(value: number, name: string) => [
              value.toFixed(1),
              name,
            ]}
            labelFormatter={(label: string) => `Tier: ${label}`}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="avgLikes"
            name="Avg Likes/Post"
            fill="#575181"
            barSize={15}
          />
          <Bar
            yAxisId="left"
            dataKey="avgComments"
            name="Avg Comments/Post"
            fill="#03799e"
            barSize={15}
          />
          {/* Optional: Bar for postsAnalyzed on a secondary axis
            <Bar yAxisId="right" dataKey="postsAnalyzed" name="Posts Analyzed" fill="#ffc658" barSize={15} />
          */}
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default FollowerEngagementChart;
