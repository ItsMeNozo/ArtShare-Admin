import React, { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Grid,
  CircularProgress,
  Alert,
  Box,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { AxiosError } from 'axios';

import {
  AnalyticsData,
  CombinedTimePoint,
  PieChartDataItem,
} from './analytics.types';
import { COLORS, COLORS_POSTS } from './constants';

import CustomPieChart from './components/CustomPieChart';
import PlatformGrowthChart from './components/PlatformGrowthChart';
import PopularCategoriesSection from './components/PopularCategoriesSection';
import TimeToActionStats from './components/TimeToActionStats';
import api from '../../api/baseApi';
import {
  PopularCategory,
  PopularCategorySortBy,
  PopularCategories,
} from '../../types/analytics';
import PlanContentInsightsChart from './components/PlanContentInsightsChart';
import AiEngagementChart from './components/AiEngagementChart';
import ContentFunnelChart from './components/ContentFunnelChart';
import FollowerEngagementChart from './components/FollowerEngagementChart';
import PostsByCategoryChart from './components/PostsByCategoryChart';

const AdminAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({});
  const [popularCategoriesData, setPopularCategoriesData] = useState<
    PopularCategory[]
  >([]);
  const [popularCategoriesLimit, setPopularCategoriesLimit] =
    useState<number>(5);
  const [popularCategoriesSortBy, setPopularCategoriesSortBy] =
    useState<PopularCategorySortBy>('postCount');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingPopular, setLoadingPopular] = useState<boolean>(false);
  const [timeSeriesDays, setTimeSeriesDays] = useState<number>(30);

  const fetchData = async <T,>(endpoint: string): Promise<T> => {
    try {
      const response = await api.get<T>(`/analytics/${endpoint}`);
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError;
      const errorMessage =
        (axiosError.response?.data as any)?.message ||
        axiosError.message ||
        `Failed to fetch ${endpoint}`;
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          userStats,
          postStats,
          postsByCategoryData,
          platformWideStatsData,
          usersOverTimeData,
          postsOverTimeData,
        ] = await Promise.all([
          fetchData<AnalyticsData['userStats']>('overall-user-stats'),
          fetchData<AnalyticsData['postStats']>('overall-post-stats'),
          fetchData<AnalyticsData['postsByCategory']>('posts-by-category'),
          fetchData<AnalyticsData['platformWideStats']>('platform-wide-stats'),
          fetchData<AnalyticsData['usersOverTime']>(
            `users-over-time?days=${timeSeriesDays}`,
          ),
          fetchData<AnalyticsData['postsOverTime']>(
            `posts-over-time?days=${timeSeriesDays}`,
          ),
        ]);
        setAnalyticsData({
          userStats,
          postStats,
          postsByCategory: postsByCategoryData,
          platformWideStats: platformWideStatsData,
          usersOverTime: usersOverTimeData,
          postsOverTime: postsOverTimeData,
        });
      } catch (err: any) {
        setError(
          err.message ||
            'An unknown error occurred while fetching initial data',
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [timeSeriesDays]);

  useEffect(() => {
    const fetchPopularCategories = async () => {
      setLoadingPopular(true);
      try {
        const data = await fetchData<PopularCategories>(
          `popular-categories?limit=${popularCategoriesLimit}&sortBy=${popularCategoriesSortBy}`,
        );
        setPopularCategoriesData(data.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch popular categories');
        setPopularCategoriesData([]);
      } finally {
        setLoadingPopular(false);
      }
    };
    fetchPopularCategories();
  }, [popularCategoriesLimit, popularCategoriesSortBy]);

  const combinedGrowthChartData = useMemo((): CombinedTimePoint[] => {
    const usersMap = new Map<string, number>();
    analyticsData.usersOverTime?.data.forEach((p) =>
      usersMap.set(p.date, p.count),
    );
    const postsMap = new Map<string, number>();
    analyticsData.postsOverTime?.data.forEach((p) =>
      postsMap.set(p.date, p.count),
    );
    const allDates = new Set<string>([
      ...(analyticsData.usersOverTime?.data.map((d) => d.date) || []),
      ...(analyticsData.postsOverTime?.data.map((d) => d.date) || []),
    ]);
    const sortedDates = Array.from(allDates).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );
    return sortedDates.map((date) => ({
      date,
      users: usersMap.get(date),
      posts: postsMap.get(date),
    }));
  }, [analyticsData.usersOverTime, analyticsData.postsOverTime]);

  const overallUserChartData = useMemo((): PieChartDataItem[] => {
    if (!analyticsData.userStats) return [];
    return [
      { name: 'Onboarded', value: analyticsData.userStats.onboardedUsers },
      {
        name: 'Not Onboarded',
        value:
          analyticsData.userStats.totalUsers -
          analyticsData.userStats.onboardedUsers,
      },
    ].filter((item) => item.value > 0);
  }, [analyticsData.userStats]);

  const overallPostChartData = useMemo(() => {
    if (!analyticsData.postStats)
      return { publishedVsDraft: [], aiVsHuman: [] };
    return {
      publishedVsDraft: [
        { name: 'Published', value: analyticsData.postStats.publishedPosts },
        { name: 'Drafts', value: analyticsData.postStats.draftPosts },
      ].filter((item) => item.value > 0),
      aiVsHuman: [
        { name: 'AI Created', value: analyticsData.postStats.aiCreatedPosts },
        {
          name: 'Human Created',
          value:
            analyticsData.postStats.totalPosts -
            analyticsData.postStats.aiCreatedPosts,
        },
      ].filter((item) => item.value > 0),
    };
  }, [analyticsData.postStats]);

  const postsByCategoryChartData = useMemo(() => {
    return (
      analyticsData.postsByCategory?.data
        .slice(0, 10)
        .map((cat) => ({ name: cat.categoryName, posts: cat.postCount })) || []
    );
  }, [analyticsData.postsByCategory]);

  const popularCategoriesPieChartData = useMemo((): PieChartDataItem[] => {
    const data = popularCategoriesData.map((cat) => ({
      name: cat.categoryName,
      value:
        popularCategoriesSortBy === 'postCount'
          ? cat.postCount
          : cat.totalEngagementScore,
    }));
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    if (totalValue === 0) return data;
    return data.filter((item) => (item.value / totalValue) * 100 >= 0.1);
  }, [popularCategoriesData, popularCategoriesSortBy]);

  const contentFunnelChartData = useMemo(() => {
    if (!analyticsData.platformWideStats?.contentFunnel) return [];
    const funnel = analyticsData.platformWideStats.contentFunnel;
    return [
      { name: 'Posted', value: funnel.usersWhoPostedCount },
      { name: 'Viewed', value: funnel.postsWithViewsCount },
      { name: 'Engaged', value: funnel.postsWithEngagementCount },
    ].filter((item) => item.value > 0);
  }, [analyticsData.platformWideStats?.contentFunnel]);

  const aiEngagementChartData = useMemo(() => {
    if (!analyticsData.platformWideStats?.aiContentEngagement) return [];
    const ai = analyticsData.platformWideStats.aiContentEngagement;
    return [
      {
        metric: 'Avg Likes',
        aiValue: ai.averageLikes_AiPosts,
        humanValue: ai.averageLikes_NonAiPosts,
      },
      {
        metric: 'Avg Comments',
        aiValue: ai.averageComments_AiPosts,
        humanValue: ai.averageComments_NonAiPosts,
      },
    ].filter((item) => item.aiValue > 0 || item.humanValue > 0);
  }, [analyticsData.platformWideStats?.aiContentEngagement]);

  const followerEngagementChartData = useMemo(() => {
    if (!analyticsData.platformWideStats?.followerEngagementInsights) return [];
    return analyticsData.platformWideStats.followerEngagementInsights.map(
      (tier) => ({
        name: tier.tierDescription,
        avgLikes: tier.averageLikesPerPost,
        avgComments: tier.averageCommentsPerPost,
      }),
    );
  }, [analyticsData.platformWideStats?.followerEngagementInsights]);

  const planContentChartData = useMemo(() => {
    if (!analyticsData.platformWideStats?.planContentInsights) return [];
    return analyticsData.platformWideStats.planContentInsights.map((plan) => ({
      name: plan.planName,
      avgPostsPerUser: plan.averagePostsPerUserOnPlan,
      avgLikes: plan.averageLikesPerPostByUsersOnPlan,
      avgComments: plan.averageCommentsPerPostByUsersOnPlan,
    }));
  }, [analyticsData.platformWideStats?.planContentInsights]);

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !analyticsData.userStats) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Alert severity="error" className="w-full">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{ px: { xs: 1, md: 4 }, py: { xs: 2, md: 4 } }}
    >
      <Paper
        sx={{
          p: { xs: 1.5, sm: 2, md: 3 },
          m: { xs: 0.5, sm: 1, md: 2 },
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          className="mb-6 font-bold text-gray-800"
        >
          Analytics
        </Typography>

        {error && analyticsData.userStats && (
          <Alert severity="warning" className="w-full mb-4">
            Error fetching some data: {error}. Some charts might be incomplete.
          </Alert>
        )}

        {/* Overall Platform Stats Section */}
        <Box className="mb-8">
          <Typography
            variant="h6"
            component="h2"
            className="mb-6 font-semibold text-gray-700"
          >
            Overall Platform Stats
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <PlatformGrowthChart
                data={combinedGrowthChartData}
                timeSeriesDays={timeSeriesDays}
                onTimeSeriesDaysChange={setTimeSeriesDays}
                loading={loading}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CustomPieChart
                data={overallUserChartData}
                title="User Onboarding Status"
                colors={COLORS}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CustomPieChart
                data={overallPostChartData.publishedVsDraft}
                title="Posts | Published vs. Drafts"
                colors={COLORS_POSTS}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CustomPieChart
                data={overallPostChartData.aiVsHuman}
                title="Posts | AI vs. Human Created"
                colors={COLORS_POSTS.slice(2)}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Category Insights Section */}
        <Box className="mb-8">
          <Typography
            variant="h6"
            component="h2"
            className="mb-6 font-semibold text-gray-700"
          >
            Category Insights
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <PostsByCategoryChart data={postsByCategoryChartData} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <PopularCategoriesSection
                chartData={popularCategoriesPieChartData}
                limit={popularCategoriesLimit}
                sortBy={popularCategoriesSortBy}
                onLimitChange={setPopularCategoriesLimit}
                onSortByChange={setPopularCategoriesSortBy}
                loading={loadingPopular}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Detailed Platform Insights Section */}
        {analyticsData.platformWideStats && (
          <Box>
            <Typography
              variant="h6"
              component="h2"
              className="mb-6 font-semibold text-gray-700"
            >
              Detailed Platform Insights
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <ContentFunnelChart data={contentFunnelChartData} />
              </Grid>

              <Grid size={{ xs: 12, md: 6, lg: 5 }}>
                <AiEngagementChart data={aiEngagementChartData} />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <TimeToActionStats
                  avgHoursSignupToFirstPost={
                    analyticsData.platformWideStats.timeToAction
                      .avgHoursSignupToFirstPost ?? undefined
                  }
                  avgHoursPostToFirstInteraction={
                    analyticsData.platformWideStats.timeToAction
                      .avgHoursPostToFirstInteraction ?? undefined
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FollowerEngagementChart data={followerEngagementChartData} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <PlanContentInsightsChart data={planContentChartData} />
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AdminAnalyticsPage;
