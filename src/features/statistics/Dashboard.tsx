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
import { format, subDays, isAfter, parseISO } from "date-fns";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../api/baseApi";
import { StripeData } from "./statistics.types";
import { StripeIncomeCard } from "./components/StripeIncomeCard";

/* -------------------- 1. Theme -------------------- */
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

/* -------------------- 2. Type Definitions -------------------- */

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

/* -------------------- 3. Reusable Components -------------------- */

/**
 * SummaryTile – small stat card that can optionally navigate to a route when clicked.
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
        "&:hover": to ? { boxShadow: 6 } : undefined,
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

/* -------------------- 4. Main Dashboard Page -------------------- */

export default function StatisticDashboardPage() {
  /* ----- State ----- */
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(
    null,
  );
  const [statsFilter, setStatsFilter] = useState<"all" | "last7">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stripeData, setStripeData] = useState<StripeData | null>(null);

  const stripeDashboardUrl =
    import.meta.env.VITE_STRIPE_DASHBOARD_URL ||
    "https://dashboard.stripe.com/test/dashboard";

  /* ----- Data Fetching ----- */
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, stripeRes] = await Promise.all([
          api.get("/statistics"),
          api.get("/api/stripe/income-summary"),
        ]);

        setStatisticsData(statsRes.data);
        setStripeData(stripeRes.data);
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
  }, []);

  /* ----- Data Processing ----- */
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
    } as const;
  }, [statisticsData]);

  const topPostsFiltered = useMemo(() => {
    if (!processedStats.topPosts) return [];
    const data = processedStats.topPosts;

    if (statsFilter === "all") {
      return data
        .sort(
          (a: { like_count: number }, b: { like_count: number }) =>
            b.like_count - a.like_count,
        )
        .slice(0, 5);
    }

    const sevenDaysAgo = subDays(new Date(), 7);
    return data
      .filter((p: { originalDate: string | number | Date }) =>
        isAfter(p.originalDate, sevenDaysAgo),
      )
      .sort(
        (a: { like_count: number }, b: { like_count: number }) =>
          b.like_count - a.like_count,
      )
      .slice(0, 5);
  }, [processedStats.topPosts, statsFilter]);

  /* ----- Render States ----- */
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

  /* ----- UI ----- */
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 6 }}>
        <Container maxWidth="xl">
          {/* Header */}
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
              <ToggleButton value="all">All‑time</ToggleButton>
              <ToggleButton value="last7">Last 7 Days</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Summary & Top Content */}
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

            {/* Top 5 AI Posts */}
            <Grid size={{ xs: 12, lg: 8 }}>
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
                    <ImageList cols={6} gap={12} sx={{ height: 200 }}>
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
                                    string | React.JSXElementConstructor<any>
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
                                    string | React.JSXElementConstructor<any>
                                  >
                                | Iterable<React.ReactNode>
                                | null
                                | undefined
                              >
                            | null
                            | undefined;
                        }) => (
                          <ImageListItem
                            key={post.id}
                            sx={{
                              borderRadius: 2,
                              overflow: "hidden",
                              position: "relative",
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
                                  {format(parseISO(post.created_at), "PP")}
                                </Typography>
                              }
                              actionIcon={
                                <Badge
                                  badgeContent={post.like_count}
                                  showZero
                                  sx={{
                                    mr: 1,
                                    "& .MuiBadge-badge": {
                                      fontSize: "0.8rem",
                                      minWidth: 24,
                                      height: 24,
                                      backgroundColor: "#ff1744",
                                      color: "#fff",
                                      fontWeight: "bold",
                                      border: "2px solid #fff",
                                    },
                                  }}
                                >
                                  <ThumbUpIcon
                                    sx={{ color: "#fff", fontSize: 24 }}
                                  />
                                </Badge>
                              }
                            />
                          </ImageListItem>
                        ),
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
          </Grid>

          {/* Stripe Income */}
          {stripeData && (
            <StripeIncomeCard
              totalIncome={stripeData.totalIncome}
              period={stripeData.period}
              currency={stripeData.currency}
              dailyData={stripeData.dailyBreakdown}
              stripeDashboardUrl={stripeDashboardUrl}
            />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}
