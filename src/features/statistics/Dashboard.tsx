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
  Link,
  Stack,
} from "@mui/material";
import {
  AutoAwesome as AutoAwesomeIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Favorite as FavoriteIcon,
  Timeline as TimelineIcon,
  AspectRatio as AspectRatioIcon,
  Palette as PaletteIcon,
  ThumbUp as ThumbUpIcon,
  MonetizationOn as MonetizationOnIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";
import { format, subDays, isAfter, parseISO } from "date-fns";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../api/baseApi";
import { StripeData } from "./statistics.types";
import { StripeIncomeCard } from "./components/StripeIncomeCard";
import { useAuth } from "../../context/AuthContext";

/* ---------- Theme ---------- */
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

/* ---------- Types ---------- */
type StatisticsData = {
  posts_by_ai?: { count: number }[];
  total_ai_images?: { count: number }[];
  token_usage?: { count: number }[]; // changed from { tokens: number }[] to { count: number }[]
  styles?: { key: string; count: number }[];
  aspectRatios?: { key: string; count: number }[];
  total_blogs?: { count: number }[];
  recent_3_reports?: { id: string; title: string; created_at: string }[];
  top_posts_by_ai?: {
    id: string;
    title: string;
    thumbnail_url: string;
    created_at: string;
    like_count: number;
  }[];
};

/* ---------- Re-usable tile ---------- */
const SummaryTile = ({
  icon,
  label,
  value,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  to?: string;
}) => {
  const navigate = useNavigate();
  return (
    <Card
      onClick={to ? () => navigate(to) : undefined}
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
        {typeof value === "number" ? value.toLocaleString() : value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Card>
  );
};

/* ---------- Main component ---------- */
export default function StatisticDashboardPage() {
  /* --- State --- */
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(
    null,
  );
  const [statsFilter, setStatsFilter] = useState<"all" | "last7">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stripeData, setStripeData] = useState<StripeData | null>(null);
  const { user } = useAuth();
  /* --- Admin name (replace with your auth logic) --- */
  const adminName = "Admin"; // e.g. authContext.user?.fullName

  const stripeDashboardUrl =
    import.meta.env.VITE_STRIPE_DASHBOARD_URL ||
    "https://dashboard.stripe.com/test/dashboard";

  /* --- Fetch --- */
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      const daysQuery = statsFilter === "last7" ? "?days=7" : "";
      try {
        const [statsRes, stripeRes] = await Promise.all([
          api.get(`/statistics${daysQuery}`),
          api.get(`/api/stripe/income-summary${daysQuery}`),
        ]);
        setStatisticsData(statsRes.data);
        setStripeData(stripeRes.data);
      } catch (err) {
        const axiosError = err as AxiosError;
        setError(
          (axiosError.response?.data as any)?.message ||
            axiosError.message ||
            "Error fetching dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [statsFilter]);

  /* --- Derived --- */
  const processedStats = useMemo(() => {
    if (!statisticsData) return {} as any;
    return {
      postsCount: statisticsData.posts_by_ai?.[0]?.count ?? 0,
      blogsCount: statisticsData.total_blogs?.[0]?.count ?? 0,
      imagesCount: statisticsData.total_ai_images?.[0]?.count ?? 0,
      tokensCount: statisticsData.token_usage?.[0]?.count ?? 0,
      styles:
        statisticsData.styles?.map((d) => ({ name: d.key, count: d.count })) ??
        [],
      ratios:
        statisticsData.aspectRatios?.map((d) => ({
          name: d.key,
          count: d.count,
        })) ?? [],
      recentReports: statisticsData.recent_3_reports ?? [],
      topPosts: (statisticsData.top_posts_by_ai ?? []).map((p) => ({
        ...p,
        originalDate: parseISO(p.created_at),
      })),
    } as const;
  }, [statisticsData]);

  const topPostsFiltered = useMemo(() => {
    const data = processedStats.topPosts ?? [];
    if (statsFilter === "all") {
      return [...data].sort((a, b) => b.like_count - a.like_count).slice(0, 5);
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

  /* --- Loading / error --- */
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

  /* ---------- UI ---------- */
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 6 }}>
        <Container maxWidth="xl">
          {/* Header & filter */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
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

          {/* Greeting */}
          <Typography variant="h6" mb={3}>
            Welcome back, {user?.username}
          </Typography>

          {/* Summary tiles */}
          <Grid container spacing={3} mb={4}>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <SummaryTile
                icon={<AutoAwesomeIcon />}
                label="AI Posts"
                value={processedStats.postsCount}
                to="/posts"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <SummaryTile
                icon={<ArticleIcon />}
                label="Blogs"
                value={processedStats.blogsCount}
                to="/blogs"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <SummaryTile
                icon={<AddPhotoAlternateIcon />}
                label="AI Images"
                value={processedStats.imagesCount}
                to="/posts"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <SummaryTile
                icon={<TimelineIcon />}
                label="Tokens Used"
                value={processedStats.tokensCount}
                to="/ai"
              />
            </Grid>
            {/* Stripe income card */}
            {stripeData && (
              <StripeIncomeCard
                totalIncome={stripeData.totalIncome}
                period={stripeData.period}
                currency={stripeData.currency}
                dailyData={stripeData.dailyBreakdown}
                stripeDashboardUrl={stripeDashboardUrl}
              />
            )}
          </Grid>

          {/* Reports & Top posts row */}
          <Grid container spacing={3}>
            {/* Recent reports */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: "100%" }}>
                <CardHeader
                  title={
                    <Typography fontWeight={600}>
                      Recent reports to action
                    </Typography>
                  }
                />
                <CardContent>
                  {processedStats.recentReports.length ? (
                    <Stack spacing={2}>
                      {processedStats.recentReports.map((r: any) => (
                        <Link
                          key={r.id}
                          underline="none"
                          href={`/reports/`}
                          variant="body2"
                          sx={{
                            p: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            display: "block",
                            "&:hover": { bgcolor: "action.hover" },
                          }}
                        >
                          {r.title}
                        </Link>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No recent reports found.
                    </Typography>
                  )}

                  <Box mt={2} textAlign="right">
                    <Link href="/reports" underline="hover">
                      See all
                    </Link>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Top posts */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ mb: 3 }}>
                <CardHeader
                  title={
                    <Typography variant="subtitle1">Top 5 AI Posts</Typography>
                  }
                />
                <CardContent>
                  {topPostsFiltered.length > 0 ? (
                    <ImageList
                      cols={3}
                      gap={20}
                      sx={{
                        m: 0,
                        height: 350, // Increased height
                        "& .MuiImageListItem-root": {
                          position: "relative",
                          borderRadius: 2,
                          overflow: "hidden",
                        },
                        "& .MuiImageListItemBar-root": {
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0) 100%)",
                          paddingRight: "65px !important", // More space for like button
                          paddingLeft: "12px !important",
                          paddingTop: "12px !important",
                          paddingBottom: "12px !important",
                          minHeight: "80px", // More height for text
                          "& .MuiImageListItemBar-actionIcon": {
                            position: "absolute",
                            top: 8,
                            right: 12,
                          },
                          "& .MuiImageListItemBar-titleWrap": {
                            paddingRight: "65px !important",
                            paddingLeft: "0 !important",
                            paddingTop: "4px !important",
                          },
                        },
                      }}
                    >
                      {topPostsFiltered.map((post: any) => (
                        <ImageListItem
                          key={post.id}
                          sx={{
                            position: "relative",
                          }}
                        >
                          <img
                            src={post.thumbnail_url}
                            alt={post.title}
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
                                  sx={{
                                    color: "#fff",
                                    fontSize: "0.8rem", // Slightly larger text
                                    lineHeight: 1.4,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 3, // Allow up to 3 lines
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxHeight: "3.6em", // Space for 3 lines
                                    wordBreak: "break-word",
                                    fontWeight: 500,
                                  }}
                                >
                                  {post.title}
                                </Typography>
                              </Tooltip>
                            }
                            subtitle={
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#fff",
                                  fontSize: "0.7rem",
                                  opacity: 0.9,
                                  marginTop: "2px",
                                }}
                              >
                                {format(parseISO(post.created_at), "MMM d")}
                              </Typography>
                            }
                            actionIcon={
                              <Box sx={{ position: "relative" }}>
                                <Badge
                                  badgeContent={post.like_count}
                                  showZero
                                  sx={{
                                    mr: 0.5,
                                    "& .MuiBadge-badge": {
                                      fontSize: "0.7rem", // Smaller badge text
                                      minWidth: "20px",
                                      height: "20px",
                                      backgroundColor: "#ff1744",
                                      color: "#fff",
                                      fontWeight: "bold",
                                      border: "1.5px solid #fff",
                                      boxShadow: "0 1px 6px rgba(0,0,0,0.4)",
                                      zIndex: 10,
                                      transform:
                                        "scale(1) translate(50%, -50%)",
                                    },
                                  }}
                                >
                                  <ThumbUpIcon
                                    sx={{
                                      color: "#fff",
                                      fontSize: 18, // Smaller icon
                                      filter:
                                        "drop-shadow(1px 1px 3px rgba(0,0,0,0.8))",
                                    }}
                                  />
                                </Badge>
                              </Box>
                            }
                          />
                        </ImageListItem>
                      ))}
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
        </Container>
      </Box>
    </ThemeProvider>
  );
}
