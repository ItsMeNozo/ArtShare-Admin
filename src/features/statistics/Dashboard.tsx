import React, {
  useState,
  useMemo,
  useEffect,
  createContext,
  useContext,
} from "react";
import {
  Box,
  Container,
  CssBaseline,
  ThemeProvider,
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
  IconButton,
  useTheme,
} from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import {
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import {
  AutoAwesome as AutoAwesomeIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Timeline as TimelineIcon,
  Article as ArticleIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from "@mui/icons-material";
import { format, subDays, isAfter, parseISO } from "date-fns";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../api/baseApi";
import { StripeData } from "./statistics.types";
import { StripeIncomeCard } from "./components/StripeIncomeCard";
import { useAuth } from "../../context/AuthContext";

/* ---------- Color-mode context ---------- */
const ColorModeContext = createContext<{ toggleColorMode: () => void }>({
  toggleColorMode: () => {},
});

/* ---------- Types ---------- */
type StatisticsData = {
  total_posts?: { count: number }[];
  total_ai_images?: { count: number }[];
  token_usage?: { count: number }[];
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

/* ============================================================= */
/*                       MAIN COMPONENT                          */
/* ============================================================= */
export default function StatisticDashboardPage() {
  /* ---------- Color-mode state ---------- */

  /* ---------- MUI theme ---------- */
  const theme = useTheme();

  /* ---------- Data state ---------- */
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(
    null,
  );
  const [statsFilter, setStatsFilter] = useState<"all" | "last7">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stripeData, setStripeData] = useState<StripeData | null>(null);
  const { user } = useAuth();

  const stripeDashboardUrl =
    import.meta.env.VITE_STRIPE_DASHBOARD_URL ||
    "https://dashboard.stripe.com/test/dashboard";

  /* ---------- Fetch ---------- */
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      const daysQuery = statsFilter === "last7" ? "?days=7" : "";
      try {
        const [statsRes, stripeRes] = await Promise.all([
          api.get(`/statistics${daysQuery}`),
          api.get(`/api/stripe/income-summary`),
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
    fetchAll();
  }, [statsFilter]);

  /* ---------- Derived ---------- */
  const processed = useMemo(() => {
    if (!statisticsData) return {} as any;
    console.log(statisticsData);
    return {
      postsCount: statisticsData.total_posts?.[0]?.count ?? 0,
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
    const data = processed.topPosts ?? [];
    if (statsFilter === "all") {
      return [...data].sort((a, b) => b.like_count - a.like_count).slice(0, 3);
    }
    const sevenDaysAgo = subDays(new Date(), 7);
    return data
      .filter((p: any) => isAfter(p.originalDate, sevenDaysAgo))
      .sort(
        (a: { like_count: number }, b: { like_count: number }) =>
          b.like_count - a.like_count,
      )
      .slice(0, 5);
  }, [processed.topPosts, statsFilter]);

  /* ---------- Loading / error ---------- */
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

  /* ------------------------------------------------------------- */
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DashboardContent
        processed={processed}
        statsFilter={statsFilter}
        setStatsFilter={setStatsFilter}
        topPostsFiltered={topPostsFiltered}
        stripeData={stripeData}
        stripeDashboardUrl={stripeDashboardUrl}
        userName={user?.username}
      />
    </ThemeProvider>
  );
}

/* ---------- Separate child so we can use useTheme easily ---------- */
function DashboardContent({
  processed,
  statsFilter,
  setStatsFilter,
  topPostsFiltered,
  stripeData,
  stripeDashboardUrl,
  userName,
}: any) {
  const theme = useTheme();
  const { toggleColorMode } = useContext(ColorModeContext);
  const navigate = useNavigate();
  return (
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
          <Typography variant="h4" fontWeight={700} mb={3} color="text.primary">
            Dashboard
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Dark / light switch */}
            <IconButton onClick={toggleColorMode} color="inherit">
              {theme.palette.mode === "dark" ? (
                <LightModeIcon />
              ) : (
                <DarkModeIcon />
              )}
            </IconButton>

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
        </Box>

        {/* Greeting */}
        <Typography
          variant="h6"
          mb={3}
          color="text.primary" // ✅ add this prop
        >
          Welcome back, {userName || "Admin"}
        </Typography>

        {/* Summary tiles */}
        <Grid container spacing={3} mb={4}>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <SummaryTile
              icon={<AutoAwesomeIcon />}
              label="Total Posts"
              value={processed.postsCount}
              to="/posts"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <SummaryTile
              icon={<ArticleIcon />}
              label="Total Blogs"
              value={processed.blogsCount}
              to="/blogs"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <SummaryTile
              icon={<AddPhotoAlternateIcon />}
              label="AI Images"
              value={processed.imagesCount}
              to="/posts/category=ai-posts"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <SummaryTile
              icon={<TimelineIcon />}
              label="Tokens Used"
              value={processed.tokensCount}
              to="/ai"
            />
          </Grid>

          {/* Stripe income card sits in the grid so it re-flows nicely */}
          {stripeData && (
            <Grid size={{ xs: 12, md: 4 }}>
              <StripeIncomeCard
                totalIncome={stripeData.totalIncome}
                period={stripeData.period}
                currency={stripeData.currency}
                dailyData={stripeData.dailyBreakdown}
                stripeDashboardUrl={stripeDashboardUrl}
              />
            </Grid>
          )}
        </Grid>

        {/* Reports & Top posts */}
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
                {processed.recentReports.length ? (
                  <List disablePadding>
                    {processed.recentReports.map((r: any) => (
                      <ListItem
                        key={r.id}
                        sx={{
                          px: 1.5,
                          py: 1,
                          borderRadius: 2,
                          "&:hover": {
                            bgcolor: "action.hover",
                            cursor: "pointer",
                          },
                        }}
                        onClick={() => navigate(`/reports`)} /* deep-link */
                      >
                        {/*  reporter avatar  */}
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: "primary.light" }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>

                        {/*  id and reason  */}
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {r.reporter_id}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              {r.reason}
                            </Typography>
                          }
                          sx={{ mr: 1 }}
                        />

                        {/*  status chip  */}
                        <Chip
                          label={r.status}
                          size="small"
                          color={r.status === "PENDING" ? "warning" : "success"}
                          variant="outlined"
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No reports
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
                  <Typography variant="subtitle1">Top 3 AI Posts</Typography>
                }
              />
              <CardContent>
                {topPostsFiltered.length ? (
                  <ImageList cols={3} gap={20} sx={{ m: 0 }}>
                    {topPostsFiltered.map((post: any) => (
                      <ImageListItem
                        key={post.id}
                        sx={{ cursor: "pointer" }}
                        onClick={() => navigate("/posts?category=ai-posts")}
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
                                  fontSize: "0.8rem",
                                  lineHeight: 1.4,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {post.title}
                              </Typography>
                            </Tooltip>
                          }
                          subtitle={
                            <Typography
                              variant="caption"
                              sx={{ color: "#fff", opacity: 0.85 }}
                            >
                              {format(parseISO(post.created_at), "MMM d")}
                            </Typography>
                          }
                          actionIcon={
                            <Box sx={{ mr: 1 }}>
                              <Badge
                                badgeContent={post.like_count}
                                sx={{
                                  "& .MuiBadge-badge": {
                                    backgroundColor: "#ff1744",
                                    color: "#fff",
                                    border: "1.5px solid #fff",
                                  },
                                }}
                              ></Badge>
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
  );
}
