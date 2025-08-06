import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  useTheme,
} from '@mui/material';
import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer } from 'recharts';
import { StripeIncomeCardProps } from '../statistics.types';
import { StripeLogo } from './StripeLogo';

export const StripeIncomeCard: React.FC<StripeIncomeCardProps> = ({
  totalIncome,
  currency = 'USD',
  period,
  stripeDashboardUrl,
  dailyData,
}) => {
  const theme = useTheme();

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
        borderColor: 'divider',
        backgroundColor: 'background.paper',
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
                  <stop
                    offset="5%"
                    stopColor={theme.palette.primary.main}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={theme.palette.primary.light}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke={theme.palette.divider}
                horizontal={false}
              />

              <Area
                type="monotone"
                dataKey="amount"
                stroke={theme.palette.primary.main}
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
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  Income
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    mb: 2,
                  }}
                >
                  {period}
                </Typography>
                <Typography
                  variant="h5"
                  component="p"
                  sx={{
                    fontWeight: 500,
                    color: 'text.primary',
                  }}
                >
                  {formattedIncome}
                </Typography>
              </div>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  color: 'primary.main',
                  '& svg': {
                    fill: 'currentColor',
                    width: '100%',
                    height: '100%',
                  },
                }}
              >
                <StripeLogo />
              </Box>
            </div>
            <div className="flex items-center mt-6">
              <Typography
                variant="body2"
                component="span"
                sx={{
                  fontWeight: 600,
                  color: 'primary.main',
                }}
              >
                View more
              </Typography>
              <ArrowForwardIcon
                sx={{
                  ml: 0.5,
                  fontSize: '1rem',
                  color: 'primary.main',
                }}
              />
            </div>
          </CardContent>
        </div>
      </CardActionArea>
    </Card>
  );
};
