import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import ChartWrapper from './ChartWrapper';
import { BarChartDataItem } from '../analytics.types';

interface ContentFunnelChartProps {
  data: BarChartDataItem[];
}

const ContentFunnelChart: React.FC<ContentFunnelChartProps> = ({ data }) => {
  return (
    <ChartWrapper
      title="Content Funnel"
      chartDataExists={data.length > 0}
      height={250}
      noDataMessage="No funnel data."
    >
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#04789e" name="Count" />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};
export default ContentFunnelChart;
