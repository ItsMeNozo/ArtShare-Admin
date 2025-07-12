import {
  OverallPostStats,
  OverallUserStats,
  PlatformWideStats,
  PostsByCategory,
  TimeSeriesData,
} from '../../types/analytics';

export interface AnalyticsData {
  userStats?: OverallUserStats;
  postStats?: OverallPostStats;
  postsByCategory?: PostsByCategory;
  platformWideStats?: PlatformWideStats;
  usersOverTime?: TimeSeriesData;
  postsOverTime?: TimeSeriesData;
}

export interface CombinedTimePoint {
  date: string;
  users?: number;
  posts?: number;
}

export interface PieChartDataItem {
  name: string;
  value: number;
}

export interface BarChartDataItem {
  name: string;
  [key: string]: any;
}

export interface StripeData {
  totalIncome: number;
  period: string;
  currency: string;
  dailyBreakdown: { date: string; amount: number }[];
}

export interface DailyData {
  date: string;
  amount: number;
}

export interface StripeIncomeCardProps {
  totalIncome: number;
  currency?: string;
  period: string;
  stripeDashboardUrl: string;
  dailyData: DailyData[];
}
