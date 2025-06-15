import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Avatar,
  Typography,
  Card,
  CardContent,
  CardHeader,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Grid,
  Tooltip,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Badge,
  Alert,
} from "@mui/material";
import {
  AutoAwesome as AutoAwesomeIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Favorite as FavoriteIcon,
  Timeline as TimelineIcon,
  AspectRatio as AspectRatioIcon,
  Palette as PaletteIcon,
  ThumbUp as ThumbUpIcon,
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { format, subDays, isAfter, parseISO } from "date-fns";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../api/baseApi";

/* -------------------- 1. Theme & Constants -------------------- */
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0062d2" },
    secondary: { main: "#ef5350" },
    background: { default: "#f0f4f9", paper: "#ffffff" },
  },
  shape: { borderRadius: 16 },
  typography: { fontFamily: "Inter, sans-serif" },
});

const CHART_COLORS = [
  "#0062d2",
  "#29b6f6",
  "#66bb6a",
  "#ffa726",
  "#ef5350",
  "#ab47bc",
];
const COLORS_POSTS = ["#66bb6a", "#ffa726", "#29b6f6", "#ef5350"];

/* -------------------- 2. Type Definitions -------------------- */

// Combined type for all fetched data
type StatisticsData = {
  posts_by_ai?: { count: number }[];
  total_ai_images?: { count: number }[];
  token_usage?: { tokens: number }[];
  styles?: { key: string; count: number }[];
  aspectRatios?: { key: string; count: number }[];
  top_posts_by_ai?: {
    id: string;
    title: string;
    thumbnail_url: string;
    created_at: string;
    like_count: number;
  }[];
  trending_prompts?: string[];
};

type AnalyticsPlatformData = {
  userStats?: { totalUsers: number; onboardedUsers: number };
  postStats?: {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    aiCreatedPosts: number;
  };
  usersOverTime?: { data: { date: string; count: number }[] };
  postsOverTime?: { data: { date: string; count: number }[] };
};

type PieChartDataItem = { name: string; count: number };
type CombinedTimePoint = { date: string; users?: number; posts?: number };

/* -------------------- 3. Reusable Components -------------------- */

/**
 * SummaryTile – now accepts an optional `to` prop. If provided, the card becomes clickable
 * and navigates to the given route using react‑router‑dom's useNavigate.
 */
const SummaryTile = ({
  icon,
  label,
  value,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  to?: string;
}) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (to) navigate(to);
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        p: 3,
        textAlign: "center",
        height: "100%",
        cursor: to ? "pointer" : "default",
        "&:hover": to
          ? {
              boxShadow: 6,
            }
          : undefined,
      }}
    >
      <Avatar sx={{ mb: 1, bgcolor: "primary.main", mx: "auto" }}>
        {icon}
      </Avatar>
      <Typography variant="h5" fontWeight={700}>
        {value.toLocaleString()}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Card>
  );
};

/**
 * PieCard – chart card that can optionally navigate to a route when clicked.
 */
const PieCard = ({
  title,
  data,
  colors = CHART_COLORS,
  colorOffset = 0,
  to,
}: {
  title: string;
  data: PieChartDataItem[];
  colors?: string[];
  colorOffset?: number;
  to?: string;
}) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (to) navigate(to);
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        height: "100%",
        cursor: to ? "pointer" : "default",
        "&:hover": to ? { boxShadow: 6 } : undefined,
      }}
    >
      <CardHeader
        title={
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
        }
      />
      <CardContent>
        <Box sx={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <RechartsTooltip
                formatter={(_, __, p) => [
                  `${p.payload.count} items`,
                  p.payload.name,
                ]}
              />
              <Pie
                innerRadius={60}
                outerRadius={100}
                data={data}
                dataKey="count"
                nameKey="name"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                paddingAngle={data.length > 1 ? 3 : 0}
              >
                {data.map((e, i) => (
                  <Cell
                    key={e.name}
                    fill={colors[(i + colorOffset) % colors.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

const PlatformGrowthChart = ({
  data,
  onTimeChange,
  timeValue,
}: {
  data: CombinedTimePoint[];
  onTimeChange: (days: number) => void;
  timeValue: number;
}) => (
  <Card>
    <CardHeader
      title={
        <Typography variant="subtitle1" fontWeight={600}>
          Platform Growth
        </Typography>
      }
      action={
        <ToggleButtonGroup
          size="small"
          value={timeValue}
          exclusive
          onChange={(_, v) => v && onTimeChange(v)}
        >
          <ToggleButton value={30}>30 Days</ToggleButton>
          <ToggleButton value={90}>90 Days</ToggleButton>
        </ToggleButtonGroup>
      }
    />
    <CardContent>
      <Box sx={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(str) => format(parseISO(str), "MMM d")}
            />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="users"
              stroke={CHART_COLORS[0]}
              name="New Users"
            />
            <Line
              type="monotone"
              dataKey="posts"
              stroke={CHART_COLORS[1]}
              name="New Posts"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </CardContent>
  </Card>
);

/* -------------------- 4. Main Dashboard Page -------------------- */

export default function StatisticDashboardPage() {
  // State for original statistics data
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(
    null,
  );
  const [statsFilter, setStatsFilter] = useState<"all" | "last7">("all");

  // State for new analytics data
  const [analyticsData, setAnalyticsData] = useState<AnalyticsPlatformData>({});
  const [timeSeriesDays, setTimeSeriesDays] = useState<number>(30);

  // Combined loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all data in parallel
        const [
          statsRes,
          userStatsRes,
          postStatsRes,
          usersOverTimeRes,
          postsOverTimeRes,
        ] = await Promise.all([
          api.get("/statistics"),
          api.get("/analytics/overall-user-stats"),
          api.get("/analytics/overall-post-stats"),
          api.get(`/analytics/users-over-time?days=${timeSeriesDays}`),
          api.get(`/analytics/posts-over-time?days=${timeSeriesDays}`),
        ]);

        setStatisticsData(statsRes.data);
        setAnalyticsData({
          userStats: userStatsRes.data,
          postStats: postStatsRes.data,
          usersOverTime: usersOverTimeRes.data,
          postsOverTime: postsOverTimeRes.data,
        });
      } catch (err) {
        const axiosError = err as AxiosError;
        const errorMessage =
          (axiosError.response?.data as any)?.message ||
          axiosError.message ||
          "An error occurred while fetching dashboard data.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [timeSeriesDays]); // Re-fetch when time series duration changes

  // --- Data Processing (Memoization) ---
  const processedStats = useMemo(() => {
    if (!statisticsData) return {} as any;
    return {
      postsCount: statisticsData.posts_by_ai?.[0]?.count || 0,
      imagesCount: statisticsData.total_ai_images?.[0]?.count || 0,
      tokensCount: statisticsData.token_usage?.[0]?.tokens || 0,
      styles:
        statisticsData.styles?.map((d) => ({ name: d.key, count: d.count })) ||
        [],
      ratios:
        statisticsData.aspectRatios?.map((d) => ({
          name: d.key,
          count: d.count,
        })) || [],
      topPosts: (statisticsData.top_posts_by_ai || []).map((p) => ({
        ...p,
        originalDate: parseISO(p.created_at),
      })),
      prompts: (statisticsData.trending_prompts || []).map((t, i) => ({
        prompt: t,
        idx: i,
      })),
    } as const;
  }, [statisticsData]);

  const topPostsFiltered = useMemo(() => {
    if (!processedStats.topPosts) return [];
    const data = processedStats.topPosts;

    if (statsFilter === "all") {
      const filtered = data
        .sort(
          (a: { like_count: number }, b: { like_count: number }) =>
            b.like_count - a.like_count,
        )
        .slice(0, 5);

      return filtered;
    }
    const sevenDaysAgo = subDays(new Date(), 7);
    const filtered = data
      .filter((p: { originalDate: string | number | Date }) =>
        isAfter(p.originalDate, sevenDaysAgo),
      )
      .sort(
        (a: { like_count: number }, b: { like_count: number }) =>
          b.like_count - a.like_count,
      )
      .slice(0, 5);

    return filtered;
  }, [processedStats.topPosts, statsFilter]);

  // New memoized data for new charts
  const combinedGrowthChartData = useMemo((): CombinedTimePoint[] => {
    const usersMap = new Map<string, number>();
    analyticsData.usersOverTime?.data.forEach((p) =>
      usersMap.set(p.date, p.count),
    );
    const postsMap = new Map<string, number>();
    analyticsData.postsOverTime?.data.forEach((p) =>
      postsMap.set(p.date, p.count),
    );
    const allDates = new Set([
      ...(analyticsData.usersOverTime?.data.map((d) => d.date) || []),
      ...(analyticsData.postsOverTime?.data.map((d) => d.date) || []),
    ]);
    const sortedDates = Array.from(allDates).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );
    return sortedDates.map((date) => ({
      date,
      users: usersMap.get(date) ?? 0,
      posts: postsMap.get(date) ?? 0,
    }));
  }, [analyticsData.usersOverTime, analyticsData.postsOverTime]);

  const overallUserChartData = useMemo((): PieChartDataItem[] => {
    if (!analyticsData.userStats) return [];
    return [
      { name: "Onboarded", count: analyticsData.userStats.onboardedUsers },
      {
        name: "Not Onboarded",
        count:
          analyticsData.userStats.totalUsers -
          analyticsData.userStats.onboardedUsers,
      },
    ].filter((item) => item.count > 0);
  }, [analyticsData.userStats]);

  const overallPostChartData = useMemo(() => {
    if (!analyticsData.postStats)
      return { publishedVsDraft: [], aiVsHuman: [] } as any;
    return {
      publishedVsDraft: [
        { name: "Published", count: analyticsData.postStats.publishedPosts },
        { name: "Drafts", count: analyticsData.postStats.draftPosts },
      ].filter((item) => item.count > 0),
      aiVsHuman: [
        { name: "AI Created", count: analyticsData.postStats.aiCreatedPosts },
        {
          name: "Human Created",
          count:
            analyticsData.postStats.totalPosts -
            analyticsData.postStats.aiCreatedPosts,
        },
      ].filter((item) => item.count > 0),
    } as const;
  }, [analyticsData.postStats]);

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 6 }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" fontWeight={700}>
              Dashboard
            </Typography>
            <ToggleButtonGroup
              size="small"
              value={statsFilter}
              exclusive
              onChange={(_, v) => v && setStatsFilter(v)}
            >
              <ToggleButton value="all">All-time</ToggleButton>
              <ToggleButton value="last7">Last 7 Days</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* --- SECTION 1: Summary & Top Content (Existing Layout) --- */}
          <Grid container spacing={3} mb={4}>
            {/* Summary Tiles */}
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <SummaryTile
                icon={<AutoAwesomeIcon />}
                label="AI Posts"
                value={processedStats.postsCount ?? 0}
                to="/posts"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <SummaryTile
                icon={<AddPhotoAlternateIcon />}
                label="AI Images"
                value={processedStats.imagesCount ?? 0}
                to="/posts"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <SummaryTile
                icon={<TimelineIcon />}
                label="Tokens Used"
                value={processedStats.tokensCount ?? 0}
                to="/ai"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <SummaryTile
                icon={<FavoriteIcon />}
                label="Total Likes"
                value={
                  processedStats.topPosts?.reduce(
                    (s: any, p: { like_count: any }) => s + p.like_count,
                    0,
                  ) || 0
                }
                to="/posts"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <SummaryTile
                icon={<PaletteIcon />}
                label="Styles"
                value={(processedStats.styles ?? []).length}
                to="/categories"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <SummaryTile
                icon={<AspectRatioIcon />}
                label="Ratios"
                value={(processedStats.ratios ?? []).length}
                to="/posts"
              />
            </Grid>

            {/* Left Column */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Card>
                    <CardHeader
                      title={
                        <Typography variant="subtitle1" fontWeight={600}>
                          Top 5 AI Posts (
                          {statsFilter === "last7" ? "7 Days" : "All‑time"})
                        </Typography>
                      }
                    />
                    <CardContent>
                      {topPostsFiltered.length > 0 ? (
                        <ImageList
                          cols={6}
                          gap={12}
                          sx={{
                            height: 200,
                            "& .MuiImageListItem-root": {
                              position: "relative",
                            },
                            "& .MuiImageListItemBar-root": {
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                            },
                          }}
                        >
                          {topPostsFiltered.map(
                            (post: {
                              id: React.Key | null | undefined;
                              thumbnail_url: string | undefined;
                              title:
                                | string
                                | number
                                | bigint
                                | boolean
                                | React.ReactElement<
                                    unknown,
                                    string | React.JSXElementConstructor<any>
                                  >
                                | Iterable<React.ReactNode>
                                | Promise<
                                    | string
                                    | number
                                    | bigint
                                    | boolean
                                    | React.ReactPortal
                                    | React.ReactElement<
                                        unknown,
                                        | string
                                        | React.JSXElementConstructor<any>
                                      >
                                    | Iterable<React.ReactNode>
                                    | null
                                    | undefined
                                  >
                                | null
                                | undefined;
                              created_at: string;
                              like_count:
                                | string
                                | number
                                | bigint
                                | boolean
                                | React.ReactElement<
                                    unknown,
                                    string | React.JSXElementConstructor<any>
                                  >
                                | Iterable<React.ReactNode>
                                | React.ReactPortal
                                | Promise<
                                    | string
                                    | number
                                    | bigint
                                    | boolean
                                    | React.ReactPortal
                                    | React.ReactElement<
                                        unknown,
                                        | string
                                        | React.JSXElementConstructor<any>
                                      >
                                    | Iterable<React.ReactNode>
                                    | null
                                    | undefined
                                  >
                                | null
                                | undefined;
                            }) => {
                              return (
                                <ImageListItem
                                  key={post.id}
                                  sx={{
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    position: "relative",
                                    "& .MuiImageListItemBar-root": {
                                      background:
                                        "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0) 100%)",
                                      "& .MuiImageListItemBar-actionIcon": {
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                      },
                                    },
                                  }}
                                >
                                  <img
                                    src={post.thumbnail_url}
                                    alt={
                                      typeof post.title === "string"
                                        ? post.title
                                        : (post.title?.toString?.() ?? "")
                                    }
                                    loading="lazy"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                  <ImageListItemBar
                                    title={
                                      <Tooltip title={post.title}>
                                        <Typography
                                          variant="caption"
                                          noWrap
                                          sx={{ color: "#fff" }}
                                        >
                                          {post.title}
                                        </Typography>
                                      </Tooltip>
                                    }
                                    subtitle={
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "#fff" }}
                                      >
                                        {format(
                                          parseISO(post.created_at),
                                          "PP",
                                        )}
                                      </Typography>
                                    }
                                    actionIcon={
                                      <Box sx={{ position: "relative" }}>
                                        <Badge
                                          badgeContent={post.like_count}
                                          showZero
                                          sx={{
                                            mr: 1,
                                            "& .MuiBadge-badge": {
                                              fontSize: "0.8rem",
                                              minWidth: "24px",
                                              height: "24px",
                                              backgroundColor: "#ff1744",
                                              color: "#fff",
                                              fontWeight: "bold",
                                              border: "2px solid #fff",
                                              boxShadow:
                                                "0 2px 8px rgba(0,0,0,0.3)",
                                              zIndex: 10,
                                              transform:
                                                "scale(1) translate(50%, -50%)",
                                            },
                                          }}
                                        >
                                          <ThumbUpIcon
                                            sx={{
                                              color: "#fff",
                                              fontSize: 24,
                                              filter:
                                                "drop-shadow(2px 2px 4px rgba(0,0,0,0.8))",
                                            }}
                                          />
                                        </Badge>
                                      </Box>
                                    }
                                  />
                                </ImageListItem>
                              );
                            },
                          )}
                        </ImageList>
                      ) : (
                        <Box sx={{ textAlign: "center", py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No posts found for the selected time period.
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Card>
                    <CardHeader
                      title={
                        <Typography variant="subtitle1" fontWeight={600}>
                          Trending Prompts
                        </Typography>
                      }
                    />
                    <CardContent>
                      {(processedStats.prompts ?? [])
                        .slice(0, 5)
                        .map(
                          (p: {
                            idx: React.Key | null | undefined;
                            prompt:
                              | string
                              | number
                              | bigint
                              | boolean
                              | React.ReactElement<
                                  unknown,
                                  string | React.JSXElementConstructor<any>
                                >
                              | Iterable<React.ReactNode>
                              | React.ReactPortal
                              | Promise<
                                  | string
                                  | number
                                  | bigint
                                  | boolean
                                  | React.ReactPortal
                                  | React.ReactElement<
                                      unknown,
                                      string | React.JSXElementConstructor<any>
                                    >
                                  | Iterable<React.ReactNode>
                                  | null
                                  | undefined
                                >
                              | null
                              | undefined;
                          }) => (
                            <Typography
                              key={p.idx}
                              variant="body2"
                              gutterBottom
                            >
                              • {p.prompt}
                            </Typography>
                          ),
                        )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Right Column */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <PieCard
                    title="Usage by Style"
                    data={processedStats.styles ?? []}
                    to="/categories"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <PieCard
                    title="Usage by Aspect Ratio"
                    data={processedStats.ratios ?? []}
                    colorOffset={3}
                    to="/posts"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* --- SECTION 2: Platform Growth (New) --- */}
          <Box mb={4}>
            <PlatformGrowthChart
              data={combinedGrowthChartData}
              onTimeChange={setTimeSeriesDays}
              timeValue={timeSeriesDays}
            />
          </Box>

          {/* --- SECTION 3: Overall Platform Stats (New) --- */}
          <Box>
            <Typography variant="h5" fontWeight={700} mb={2}>
              Overall Platform Stats
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <PieCard
                  title="User Onboarding Status"
                  data={overallUserChartData}
                  colors={CHART_COLORS}
                  to="/users"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <PieCard
                  title="Posts: Published vs. Drafts"
                  data={overallPostChartData.publishedVsDraft}
                  colors={COLORS_POSTS}
                  to="/posts"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <PieCard
                  title="Posts: AI vs. Human"
                  data={overallPostChartData.aiVsHuman}
                  colors={COLORS_POSTS}
                  colorOffset={2}
                  to="/posts"
                />
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
