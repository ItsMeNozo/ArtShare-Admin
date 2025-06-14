import React, { useState, useMemo, useEffect } from 'react';
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
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Favorite as FavoriteIcon,
  Timeline as TimelineIcon,
  AspectRatio as AspectRatioIcon,
  Palette as PaletteIcon,
  ThumbUp as ThumbUpIcon,
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

/* -------------------- 1. Theme -------------------- */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0062d2' },
    background: { default: '#f0f4f9', paper: '#ffffff' },
  },
  shape: { borderRadius: 16 },
  typography: { fontFamily: 'Inter, sans-serif' },
});

const CHART_COLORS = [
  '#0062d2',
  '#29b6f6',
  '#66bb6a',
  '#ffa726',
  '#ef5350',
  '#ab47bc',
];

/** @typedef {"all"|"last7"} TimeFilter */

const useFilteredData = <T extends { [key: string]: any } = any>(
  data: T[] | undefined,
  filter: unknown,
  dateKey = 'originalDate',
) =>
  useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (filter === 'all') return data;
    const start = subDays(new Date(), 7);
    return data.filter((d) => isAfter(d[dateKey], start));
  }, [data, filter, dateKey]);

type TimeToggleProps = {
  value: 'all' | 'last7';
  onChange: (value: 'all' | 'last7') => void;
};

const TimeToggle = ({ value, onChange }: TimeToggleProps) => (
  <ToggleButtonGroup
    size="small"
    value={value}
    exclusive
    onChange={(_, v) => v && onChange(v)}
  >
    <ToggleButton value="all">All</ToggleButton>
    <ToggleButton value="last7">Last 7 Days</ToggleButton>
  </ToggleButtonGroup>
);

type SummaryTileProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
};

const SummaryTile = ({ icon, label, value }: SummaryTileProps) => (
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

type PieCardProps = {
  title: string;
  data: { name: string; count: number }[];
  colorOffset?: number;
};

const PieCard = ({ title, data, colorOffset = 0 }: PieCardProps) => (
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
    [key: string]: any;
  }[];
  trending_prompts?: string[];
  [key: string]: any;
};

export default function StatisticDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'last7'>('all');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/statistics');
        setAnalytics(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const processed = useMemo(() => {
    if (!analytics) return {};
    const now = new Date();
    const nowStr = format(now, 'yyyy-MM-dd');

    const single = (key: string) => [
      { count: analytics[key]?.[0]?.count || 0, date: nowStr },
    ];

    return {
      postsCount: single('posts_by_ai')[0].count,
      imagesCount: single('total_ai_images')[0].count,
      tokensCount: single('token_usage')[0].count,
      styles:
        analytics.styles?.map((d) => ({ name: d.key, count: d.count })) || [],
      ratios:
        analytics.aspectRatios?.map((d) => ({ name: d.key, count: d.count })) ||
        [],
      topPosts: (analytics.top_posts_by_ai || []).map((p) => ({
        ...p,
        originalDate: parseISO(p.created_at),
      })),
      prompts: (analytics.trending_prompts || []).map((t, i) => ({
        prompt: t,
        idx: i,
      })),
    };
  }, [analytics]);

  const topPostsFiltered = useFilteredData(processed.topPosts, filter)
    .sort((a, b) => b.like_count - a.like_count)
    .slice(0, 5);

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
            <TimeToggle value={filter} onChange={setFilter} />
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
                  processed.topPosts?.reduce((s, p) => s + p.like_count, 0) || 0
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
            {/* Left – Top Posts & Prompts */}
            <Grid size={{ xs: 12, md: 8 }}>
              {/* Top Posts Gallery */}
              <Card sx={{ mb: 3 }}>
                <CardHeader
                  title={
                    <Typography variant="subtitle1">
                      Top 5 AI Posts (
                      {filter === 'last7' ? '7 Days' : 'All‑time'})
                    </Typography>
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
                        '& .MuiImageListItem-root': {
                          position: 'relative',
                          borderRadius: 2,
                          overflow: 'hidden',
                        },
                        '& .MuiImageListItemBar-root': {
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background:
                            'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0) 100%)',
                          paddingRight: '65px !important', // More space for like button
                          paddingLeft: '12px !important',
                          paddingTop: '12px !important',
                          paddingBottom: '12px !important',
                          minHeight: '80px', // More height for text
                          '& .MuiImageListItemBar-actionIcon': {
                            position: 'absolute',
                            top: 8,
                            right: 12,
                          },
                          '& .MuiImageListItemBar-titleWrap': {
                            paddingRight: '65px !important',
                            paddingLeft: '0 !important',
                            paddingTop: '4px !important',
                          },
                        },
                      }}
                    >
                      {topPostsFiltered.map((post) => (
                        <ImageListItem
                          key={post.id}
                          sx={{
                            position: 'relative',
                          }}
                        >
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
                                    fontSize: '0.8rem', // Slightly larger text
                                    lineHeight: 1.4,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3, // Allow up to 3 lines
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxHeight: '3.6em', // Space for 3 lines
                                    wordBreak: 'break-word',
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
                                  color: '#fff',
                                  fontSize: '0.7rem',
                                  opacity: 0.9,
                                  marginTop: '2px',
                                }}
                              >
                                {format(parseISO(post.created_at), 'MMM d')}
                              </Typography>
                            }
                            actionIcon={
                              <Box sx={{ position: 'relative' }}>
                                <Badge
                                  badgeContent={post.like_count}
                                  showZero
                                  sx={{
                                    mr: 0.5,
                                    '& .MuiBadge-badge': {
                                      fontSize: '0.7rem', // Smaller badge text
                                      minWidth: '20px',
                                      height: '20px',
                                      backgroundColor: '#ff1744',
                                      color: '#fff',
                                      fontWeight: 'bold',
                                      border: '1.5px solid #fff',
                                      boxShadow: '0 1px 6px rgba(0,0,0,0.4)',
                                      zIndex: 10,
                                      transform:
                                        'scale(1) translate(50%, -50%)',
                                    },
                                  }}
                                >
                                  <ThumbUpIcon
                                    sx={{
                                      color: '#fff',
                                      fontSize: 18, // Smaller icon
                                      filter:
                                        'drop-shadow(1px 1px 3px rgba(0,0,0,0.8))',
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
                </CardContent>
              </Card>

              {/* Trending Prompts List */}
              <Card>
                <CardHeader
                  title={
                    <Typography variant="subtitle1">
                      Trending Prompts
                    </Typography>
                  }
                />
                <CardContent>
                  {(processed.prompts ?? []).slice(0, 5).map((p) => (
                    <Typography key={p.idx} variant="body2" gutterBottom>
                      • {p.prompt}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Right – Pie Charts */}
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
                  data={processed.ratios || []}
                  colorOffset={3}
                />
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
