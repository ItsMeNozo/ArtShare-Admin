import React from 'react';
import { Card, CardContent, Typography, CardActionArea } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { StripeLogo } from './StripeLogo';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer } from 'recharts';
import { StripeIncomeCardProps } from '../statistics.types';

export const StripeIncomeCard: React.FC<StripeIncomeCardProps> = ({
  totalIncome,
  currency = 'USD',
  period,
  stripeDashboardUrl,
  dailyData,
}) => {
  const formattedIncome = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(totalIncome);

  return (
    <Card
      className="w-full max-w-sm rounded-xl shadow-lg transition-shadow hover:shadow-2xl overflow-hidden"
      sx={{
        border: '1px solid',
        borderColor: 'grey.300',
        transition: (theme) =>
          theme.transitions.create(['box-shadow', 'border-color']),
        '&:hover': { borderColor: 'primary.main' },
      }}
    >
      {/* The ActionArea now needs a relative position to contain the absolute chart */}
      <CardActionArea
        component="a"
        href={stripeDashboardUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-4 relative"
      >
        {/* --- Background Chart --- */}
        <div className="absolute inset-0 z-0 opacity-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={dailyData}
              margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#635BFF" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#847EFF" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#d1d1d1" horizontal={false} />

              <Area
                type="monotone"
                dataKey="amount"
                stroke="#635BFF"
                strokeWidth={2}
                fill="url(#chartGradient)"
                dot={false}
                isAnimationActive={true}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* --- Foreground Content --- */}
        <div className="relative z-10">
          <CardContent className="p-0">
            <div className="flex justify-between items-start">
              <div>
                <Typography
                  variant="h6"
                  component="div"
                  className="font-semibold text-mountain-800"
                >
                  Income
                </Typography>
                <Typography variant="body2" className="text-mountain-500 mb-4">
                  {period}
                </Typography>
                <Typography
                  variant="h5"
                  component="p"
                  className="font-medium text-mountain-900"
                >
                  {formattedIncome}
                </Typography>
              </div>
              <StripeLogo className="w-12 h-12 fill-indigo-600" />
            </div>
            <div className="flex items-center mt-6 text-indigo-600">
              <Typography
                variant="body2"
                component="span"
                className="font-semibold"
              >
                View more
              </Typography>
              <ArrowForwardIcon className="ml-1" style={{ fontSize: '1rem' }} />
            </div>
          </CardContent>
        </div>
      </CardActionArea>
    </Card>
  );
};
