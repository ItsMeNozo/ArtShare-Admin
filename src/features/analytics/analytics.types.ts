import {
  OverallUserStats,
  OverallPostStats,
  PostsByCategory,
  PlatformWideStats,
  TimeSeriesData,
} from "../../types/analytics";

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
