import React, {
  useState,
  useMemo,
  useEffect,
  createContext,
  useContext,
} from 'react';
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
  IconButton,
  useTheme,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Favorite as FavoriteIcon,
  Timeline as TimelineIcon,
  AspectRatio as AspectRatioIcon,
  Palette as PaletteIcon,
  ThumbUp as ThumbUpIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { format, subDays, isAfter, parseISO } from 'date-fns';
import api from '../../api/baseApi';

/* ----------  Color-mode context  ---------- */
const ColorModeContext = createContext<{ toggleColorMode: () => void }>({
  toggleColorMode: () => {},
});

/* ----------  Static chart colors  ---------- */
const CHART_COLORS = [
  '#0062d2',
  '#29b6f6',
  '#66bb6a',
  '#ffa726',
  '#ef5350',
  '#ab47bc',
];

/* ----------  Helpers  ---------- */
const useFilteredData = <T extends Record<string, any>>(
  data: T[] | undefined,
  filter: 'all' | 'last7',
  dateKey = 'originalDate',
) =>
  useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (filter === 'all') return data;
    const start = subDays(new Date(), 7);
    return data.filter((d) => isAfter(d[dateKey], start));
  }, [data, filter, dateKey]);

/* ----------  Tiny reusable widgets  ---------- */
const TimeToggle = ({
  value,
  onChange,
}: {
  value: 'all' | 'last7';
  onChange: (v: 'all' | 'last7') => void;
}) => (
  <ToggleButtonGroup
    size="small"
    value={value}
    exclusive
    onChange={(_, v) => v && onChange(v)}
  >
    <ToggleButton value="all">All</ToggleButton>
    <ToggleButton value="last7">Last 7 Days</ToggleButton>
  </ToggleButtonGroup>
);

const SummaryTile = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) => (
  <Card sx={{ p: 3, textAlign: 'center' }}>
    <Avatar sx={{ mb: 1, bgcolor: 'primary.main', mx: 'auto' }}>{icon}</Avatar>
    <Typography variant="h5" fontWeight={700}>
      {value.toLocaleString()}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Card>
);

const PieCard = ({
  title,
  data,
  colorOffset = 0,
}: {
  title: string;
  data: { name: string; count: number }[];
  colorOffset?: number;
}) => (
  <Card sx={{ height: '100%' }}>
    <CardHeader title={<Typography variant="subtitle1">{title}</Typography>} />
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
              label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
              paddingAngle={3}
            >
              {data.map((e, i) => (
                <Cell
                  key={e.name}
                  fill={CHART_COLORS[(i + colorOffset) % CHART_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </CardContent>
  </Card>
);

/* ----------  Types  ---------- */
type AnalyticsData = {
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

/* ============================================================= */
/*                         MAIN COMPONENT                        */
/* ============================================================= */
export default function StatisticDashboardPage() {
  /* ----- theme mode state ----- */

  const theme = useTheme();

  /* ----- analytics state ----- */
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'last7'>('all');

  /* ----- fetch whenever filter changes ----- */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const daysQuery = filter === 'last7' ? '?days=7' : '';
        const { data } = await api.get(`/statistics${daysQuery}`);
        setAnalytics(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filter]);

  /* ----- derive numbers ----- */
  const processed = useMemo(() => {
    if (!analytics) return {};
    const single = (key: keyof AnalyticsData) => {
      const item = analytics[key]?.[0];
      return typeof item === 'object' && item !== null && 'count' in item
        ? (item as { count: number }).count
        : 0;
    };
    return {
      postsCount: single('posts_by_ai'),
      imagesCount: single('total_ai_images'),
      tokensCount: analytics.token_usage?.[0]?.tokens || 0,
      styles:
        analytics.styles?.map((d) => ({ name: d.key, count: d.count })) || [],
      ratios:
        analytics.aspectRatios?.map((d) => ({ name: d.key, count: d.count })) ||
        [],
      topPosts: (analytics.top_posts_by_ai || []).map((p) => ({
        ...p,
        originalDate: parseISO(p.created_at),
      })),
      prompts: (analytics.trending_prompts || []).slice(0, 5),
    };
  }, [analytics]);

  const topPostsFiltered = useFilteredData(processed.topPosts, filter)
    .sort((a, b) => b.like_count - a.like_count)
    .slice(0, 5);

  /* ----- loading ----- */
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

  /* ---------- render ---------- */
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PageContent
        processed={processed}
        filter={filter}
        setFilter={setFilter}
        topPostsFiltered={topPostsFiltered}
      />
    </ThemeProvider>
  );
}

/* ----------  Page split into a child to access theme easily ---------- */
function PageContent({
  processed,
  filter,
  setFilter,
  topPostsFiltered,
}: {
  processed: any;
  filter: 'all' | 'last7';
  setFilter: (v: 'all' | 'last7') => void;
  topPostsFiltered: any[];
}) {
  const theme = useTheme();
  const { toggleColorMode } = useContext(ColorModeContext);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4" fontWeight={700}>
            AI Statistics Dashboard
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* dark / light toggle */}
            <IconButton onClick={toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? (
                <LightModeIcon />
              ) : (
                <DarkModeIcon />
              )}
            </IconButton>

            {/* time-range toggle */}
            <TimeToggle value={filter} onChange={setFilter} />
          </Box>
        </Box>

        {/* Summary Tiles */}
        <Grid container spacing={3} mb={3}>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <SummaryTile
              icon={<AutoAwesomeIcon />}
              label="AI Posts"
              value={processed.postsCount}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <SummaryTile
              icon={<AddPhotoAlternateIcon />}
              label="AI Images"
              value={processed.imagesCount}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <SummaryTile
              icon={<TimelineIcon />}
              label="Tokens"
              value={processed.tokensCount}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <SummaryTile
              icon={<FavoriteIcon />}
              label="Total Likes"
              value={
                processed.topPosts?.reduce(
                  (s: number, p: any) => s + p.like_count,
                  0,
                ) || 0
              }
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <SummaryTile
              icon={<PaletteIcon />}
              label="Styles"
              value={(processed.styles ?? []).length}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <SummaryTile
              icon={<AspectRatioIcon />}
              label="Ratios"
              value={(processed.ratios ?? []).length}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Left side */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title={
                  <Typography variant="subtitle1">
                    Top 5 AI Posts ({filter === 'last7' ? '7 Days' : 'All-time'}
                    )
                  </Typography>
                }
              />
              <CardContent>
                {topPostsFiltered.length ? (
                  <ImageList cols={3} gap={20} sx={{ m: 0, height: 350 }}>
                    {topPostsFiltered.map((post) => (
                      <ImageListItem key={post.id}>
                        <img
                          src={post.thumbnail_url}
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
                                  WebkitLineClamp: 2,
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
                              sx={{ color: '#fff' }}
                            >
                              {format(parseISO(post.created_at), 'MMM d')}
                            </Typography>
                          }
                          actionIcon={
                            <Badge
                              badgeContent={post.like_count}
                              sx={{
                                mr: 1,
                                '& .MuiBadge-badge': {
                                  backgroundColor: '#ff1744',
                                  color: '#fff',
                                  border: '2px solid #fff',
                                },
                              }}
                            >
                              <ThumbUpIcon sx={{ color: '#fff' }} />
                            </Badge>
                          }
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No posts for this period.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Trending prompts */}
            <Card>
              <CardHeader
                title={
                  <Typography variant="subtitle1">Trending Prompts</Typography>
                }
              />
              <CardContent>
                {processed.prompts.length ? (
                  processed.prompts.map((p: string, i: number) => (
                    <Typography key={i} variant="body2" gutterBottom>
                      • {p}
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No data.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right side */}
          <Grid
            size={{ xs: 12, md: 4 }}
            container
            spacing={3}
            direction="column"
          >
            <Grid size={{ xs: 12 }}>
              <PieCard title="Usage by Style" data={processed.styles ?? []} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <PieCard
                title="Usage by Aspect Ratio"
                data={processed.ratios ?? []}
                colorOffset={3}
              />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
