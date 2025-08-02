import {
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Article as ArticleIcon,
  AutoAwesome as AutoAwesomeIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Person as PersonIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Grid,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ThemeProvider,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { AxiosError } from 'axios';
import { format, isAfter, parseISO, subDays } from 'date-fns';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/baseApi';
import { useAuth } from '../../contexts/AuthContext';
import { StripeIncomeCard } from './components/StripeIncomeCard';
import { StripeData } from './statistics.types';

/* ---------- Color-mode context ---------- */
const ColorModeContext = createContext<{ toggleColorMode: () => void }>({
  toggleColorMode: () => {},
});

/* ---------- Types ---------- */
type StatisticsData = {
  totalPosts?: { count: number }[];
  totalAiImages?: { count: number }[];
  tokenUsage?: { count: number }[];
  styles?: { key: string; count: number }[];
  aspectRatios?: { key: string; count: number }[];
  totalBlogs?: { count: number }[];
  recent3Reports?: { id: string; title: string; createdAt: string }[];
  topPostsByAi?: {
    id: string;
    title: string;
    thumbnailUrl: string;
    createdAt: string;
    likeCount: number;
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
        textAlign: 'center',
        height: '100%',
        cursor: to ? 'pointer' : 'default',
        '&:hover': to ? { boxShadow: 6 } : undefined,
      }}
    >
      <Avatar sx={{ mb: 1, bgcolor: 'primary.main', mx: 'auto' }}>
        {icon}
      </Avatar>
      <Typography variant="h5" fontWeight={700}>
        {typeof value === 'number' ? value.toLocaleString() : value}
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
  const [statsFilter, setStatsFilter] = useState<'all' | 'last7'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stripeData, setStripeData] = useState<StripeData | null>(null);
  const { user } = useAuth();

  const stripeDashboardUrl =
    import.meta.env.VITE_STRIPE_DASHBOARD_URL ||
    'https://dashboard.stripe.com/test/dashboard';

  /* ---------- Fetch ---------- */
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      const daysQuery = statsFilter === 'last7' ? '?days=7' : '';
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
            'Error fetching dashboard data.',
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
      postsCount: statisticsData.totalPosts?.[0]?.count ?? 0,
      blogsCount: statisticsData.totalBlogs?.[0]?.count ?? 0,
      imagesCount: statisticsData.totalAiImages?.[0]?.count ?? 0,
      tokensCount: statisticsData.tokenUsage?.[0]?.count ?? 0,
      styles:
        statisticsData.styles?.map((d) => ({ name: d.key, count: d.count })) ??
        [],
      ratios:
        statisticsData.aspectRatios?.map((d) => ({
          name: d.key,
          count: d.count,
        })) ?? [],
      recentReports: statisticsData.recent3Reports ?? [],
      topPosts: (statisticsData.topPostsByAi ?? []).map((p) => ({
        ...p,
        originalDate: parseISO(p.createdAt),
      })),
    } as const;
  }, [statisticsData]);

  const topPostsFiltered = useMemo(() => {
    const data = processed.topPosts ?? [];
    if (statsFilter === 'all') {
      return [...data].sort((a, b) => b.likeCount - a.likeCount).slice(0, 3);
    }
    const sevenDaysAgo = subDays(new Date(), 7);
    return data
      .filter((p: any) => isAfter(p.originalDate, sevenDaysAgo))
      .sort(
        (a: { likeCount: number }, b: { likeCount: number }) =>
          b.likeCount - a.likeCount,
      )
      .slice(0, 5);
  }, [processed.topPosts, statsFilter]);

  /* ---------- Loading / error ---------- */
  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
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
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="xl">
        {/* Header & filter */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography variant="h4" fontWeight={700} mb={3} color="text.primary">
            Dashboard
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Dark / light switch */}
            <IconButton onClick={toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? (
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
          Welcome back, {userName || 'Admin'}
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
              to="/posts?ai_created=true"
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
          <Grid size={{ xs: 12, md: 4 }} sx={{ height: 'fit-content' }}>
            <Card sx={{ height: '100%' }}>
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
                          '&:hover': {
                            bgcolor: 'action.hover',
                            cursor: 'pointer',
                          },
                        }}
                        onClick={() => {
                          navigate('/reports', {
                            state: {
                              report_id: r.id,
                            },
                          });
                        }}
                      >
                        {/*  reporter avatar  */}
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>

                        {/*  id and reason  */}
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {r?.username || r?.reporter_id || 'No username'}
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
                          color={r.status === 'PENDING' ? 'warning' : 'success'}
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
                  <Button
                    onClick={() => {
                      navigate('/reports');
                    }}
                  >
                    See all
                  </Button>
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
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate('/posts?ai_created=true')}
                      >
                        <img
                          src={post.thumbnailUrl}
                          alt={post.title}
                          loading="lazy"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        <ImageListItemBar
                          title={
                            <Tooltip title={post.title}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#fff',
                                  fontSize: '0.8rem',
                                  lineHeight: 1.4,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {post.title}
                              </Typography>
                            </Tooltip>
                          }
                          subtitle={
                            <Typography
                              variant="caption"
                              sx={{ color: '#fff', opacity: 0.85 }}
                            >
                              {format(parseISO(post.createdAt), 'MMM d')}
                            </Typography>
                          }
                          actionIcon={
                            <Box sx={{ mr: 1 }}>
                              <Badge
                                badgeContent={post.likeCount}
                                sx={{
                                  '& .MuiBadge-badge': {
                                    backgroundColor: '#ff1744',
                                    color: '#fff',
                                    border: '1.5px solid #fff',
                                  },
                                }}
                              >
                                <ThumbUpIcon
                                  sx={{
                                    color: '#fff',
                                    fontSize: '1.2rem',
                                    mt: '8px',
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
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No posts found for the selected time period.
                    </Typography>
                  </Box>
                )}

                <Box mt={2} textAlign="right">
                  <Button
                    onClick={() => {
                      navigate('/posts?ai_created=true');
                    }}
                  >
                    See all
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
