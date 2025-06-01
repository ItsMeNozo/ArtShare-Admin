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

interface AiEngagementDataPoint {
  metric: string;
  aiValue: number;
  humanValue: number;
}

interface AiEngagementChartProps {
  data: AiEngagementDataPoint[];
}

const AiEngagementChart: React.FC<AiEngagementChartProps> = ({ data }) => {
  return (
    <ChartWrapper
      title="AI vs Human Post Engagement (Averages)"
      chartDataExists={data.length > 0}
      height={250}
      noDataMessage="No AI engagement data."
    >
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(value: number) => value.toFixed(1)} />
          <Legend />
          <Bar
            dataKey="aiValue"
            name="AI Created"
            fill="#565080"
            barSize={20}
          />
          <Bar
            dataKey="humanValue"
            name="Human Created"
            fill="#04789e"
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default AiEngagementChart;
