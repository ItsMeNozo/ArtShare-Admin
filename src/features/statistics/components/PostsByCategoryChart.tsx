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

interface PostsByCategoryDataPoint {
  name: string;
  posts: number;
}

interface PostsByCategoryChartProps {
  data: PostsByCategoryDataPoint[];
}

const PostsByCategoryChart: React.FC<PostsByCategoryChartProps> = ({
  data,
}) => {
  return (
    <ChartWrapper
      title="Posts by Category (Top 10)"
      chartDataExists={data.length > 0}
      height={350}
      noDataMessage="No category data for chart."
    >
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} />
          <YAxis
            dataKey="name"
            type="category"
            width={120}
            tick={{ fontSize: 11 }}
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="posts" fill="#575181" barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default PostsByCategoryChart;
