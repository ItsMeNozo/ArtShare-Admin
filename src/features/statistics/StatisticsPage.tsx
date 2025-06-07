// AI Statistics Dashboard – Enhanced to 5 core charts with improved aesthetics
import React from "react";
import {
  Box,
  Grid,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Avatar,
  Typography,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Divider,
  Chip,
} from "@mui/material";
import {
  AutoAwesome as AutoAwesomeIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  ShowChart as ShowChartIcon,
  Palette as PaletteIcon,
  Favorite as FavoriteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon, // For potential future use or alternative views
} from "@mui/icons-material";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  PieChart,
  Pie,
  Cell,
  Sector,
  Label,
} from "recharts";

// Enhanced Light Theme
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1e88e5", light: "#6ab7ff", dark: "#005cb2" }, // A richer blue
    secondary: { main: "#ff4081", light: "#ff79b0", dark: "#c60055" }, // A vibrant pink
    background: { default: "#eef2f6", paper: "#ffffff" }, // Softer background
    text: { primary: "#333333", secondary: "#5f6368" },
    success: { main: "#2e7d32" }, // Green for positive growth
    error: { main: "#d32f2f" }, // Red for negative growth
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, color: "#1e88e5" },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 500, color: "#005cb2" },
    subtitle1: { color: "#5f6368" },
    body2: { color: "#333333" },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Softer card edges
          boxShadow: "0 4px 12px 0 rgba(0,0,0,0.08)", // Softer shadow
          transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 6px 16px 0 rgba(0,0,0,0.12)",
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        title: {
          fontSize: "1.25rem",
          fontWeight: 600,
        },
        avatar: {
          marginRight: "12px",
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 48,
          height: 48,
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40, // Adjust icon spacing in lists
        },
      },
    },
  },
});

// Enhanced Mock Data with previous values for growth calculation
const mockData = {
  summaryStats: {
    totalAiPosts: 12567,
    previousTotalAiPosts: 11800, // Added for growth calculation
    totalAiImages: 38750,
    previousTotalAiImages: 35500, // Added for growth calculation
  },
  postsOverTime: [
    { name: "Jan", posts: 650, images: 1200 },
    { name: "Feb", posts: 590, images: 1100 },
    { name: "Mar", posts: 800, images: 1500 },
    { name: "Apr", posts: 710, images: 1400 },
    { name: "May", posts: 550, images: 1000 },
    { name: "Jun", posts: 750, images: 1600 },
    { name: "Jul", posts: 950, images: 1800 },
    { name: "Aug", posts: 1020, images: 1950 }, // Added more data
    { name: "Sep", posts: 980, images: 1850 },
  ],
  topStyles: [
    { name: "Photorealistic", count: 5230, color: "#1e88e5" },
    { name: "Anime / Manga", count: 3890, color: "#ff4081" },
    { name: "Fantasy Art", count: 2500, color: "#4caf50" },
    { name: "Abstract", count: 1850, color: "#ff9800" },
    { name: "3D Render", count: 1520, color: "#9c27b0" },
  ],
  topAspectRatio: [
    { name: "1:1 (Square)", count: 4100, color: "#42a5f5" },
    { name: "16:9 (Widescreen)", count: 3200, color: "#66bb6a" },
    { name: "4:5 (Portrait)", count: 2850, color: "#ffa726" },
    { name: "2:3 (Classic)", count: 2100, color: "#ab47bc" },
    { name: "9:16 (Vertical)", count: 1750, color: "#ef5350" },
  ],
  topLikedPosts: [
    {
      id: "post1",
      title: "Futuristic city with neon lights",
      likes: 350,
      author: "UserA",
    },
    {
      id: "post2",
      title: "Mystical elf warrior portrait",
      likes: 290,
      author: "UserB",
    },
    {
      id: "post3",
      title: "Enchanted forest storybook style",
      likes: 270,
      author: "UserC",
    },
    {
      id: "post4",
      title: "Surreal emotion painting",
      likes: 220,
      author: "UserD",
    },
    {
      id: "post5",
      title: "Steampunk inventor in lab",
      likes: 200,
      author: "UserE",
    },
  ],
};

// Helper function to calculate percentage growth
const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0; // Avoid division by zero
  return parseFloat((((current - previous) / previous) * 100).toFixed(1));
};

type StatCardProps = {
  title: string;
  value: number;
  previousValue?: number;
  icon: React.ReactNode;
  unit?: string;
};

const StatCard = ({
  title,
  value,
  previousValue,
  icon,
  unit = "",
}: StatCardProps) => {
  const growth =
    previousValue !== undefined ? calculateGrowth(value, previousValue) : null;
  const growthColor =
    growth !== null
      ? growth >= 0
        ? "success.main"
        : "error.main"
      : "text.secondary";
  const GrowthIcon =
    growth !== null ? (growth >= 0 ? TrendingUpIcon : TrendingDownIcon) : null;

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
            <Avatar
              sx={{ bgcolor: "primary.light", mr: 2, color: "primary.dark" }}
            >
              {icon}
            </Avatar>
            <Typography variant="h6" color="text.secondary" fontWeight="medium">
              {title}
            </Typography>
          </Box>
          <Typography variant="h4" component="div" gutterBottom>
            {value.toLocaleString()}
            {unit && (
              <Typography
                variant="h6"
                component="span"
                color="text.secondary"
                sx={{ ml: 0.5 }}
              >
                {unit}
              </Typography>
            )}
          </Typography>
        </Box>
        {growth !== null && GrowthIcon && (
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <GrowthIcon
              sx={{ color: growthColor, mr: 0.5, fontSize: "1.2rem" }}
            />
            <Typography
              variant="subtitle2"
              sx={{ color: growthColor, fontWeight: "medium" }}
            >
              {growth > 0 ? "+" : ""}
              {growth}%
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 0.5 }}
            >
              vs previous period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

type ChartCardProps = {
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  action?: React.ReactNode; // Optional action button for card header
};

const ChartCard = ({ title, children, icon, action }: ChartCardProps) => (
  <Card sx={{ height: "100%" }}>
    <CardHeader
      avatar={
        <Avatar sx={{ bgcolor: "secondary.light", color: "secondary.dark" }}>
          {icon}
        </Avatar>
      }
      title={<Typography variant="h5">{title}</Typography>}
      action={action}
      sx={{ pb: 0, pt: 2, px: 2 }}
    />
    <CardContent
      sx={{
        height: "calc(100% - 72px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {" "}
      {/* Adjust height based on header */}
      {children}
    </CardContent>
  </Card>
);

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{ padding: "10px", background: "rgba(255, 255, 255, 0.9)" }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          {label}
        </Typography>
        {payload.map((pld: any, index: number) => (
          <Typography key={index} variant="body2" sx={{ color: pld.color }}>
            {`${pld.name}: ${pld.value.toLocaleString()}`}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

// Custom active shape for Pie Chart
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
        fill={fill}
        fontWeight="bold"
      >
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
      >{`${value.toLocaleString()} uses`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {`(Rate: ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

export default function StatisticDashboardPage() {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const totalStylesCount = mockData.topStyles.reduce(
    (sum, style) => sum + style.count,
    0,
  );
  const totalAspectRatioCount = mockData.topAspectRatio.reduce(
    (sum, ratio) => sum + ratio.count,
    0,
  );

  return (
    <ThemeProvider theme={lightTheme}>
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <CssBaseline />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {" "}
          {/* Changed to xl for more space */}
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ mb: 4, textAlign: "center", color: "primary.dark" }}
          >
            AI Creations Dashboard 🎨
          </Typography>
          <Grid container spacing={3.5}>
            {" "}
            {/* Increased spacing */}
            {/* Row 1: Stats Cards */}
            <Grid item xs={12} sm={6} md={3}>
              {" "}
              {/* Adjusted grid for 2 stat cards */}
              <StatCard
                title="Total AI Posts"
                value={mockData.summaryStats.totalAiPosts}
                previousValue={mockData.summaryStats.previousTotalAiPosts}
                icon={<AutoAwesomeIcon fontSize="large" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total AI Images"
                value={mockData.summaryStats.totalAiImages}
                previousValue={mockData.summaryStats.previousTotalAiImages}
                icon={<AddPhotoAlternateIcon fontSize="large" />}
              />
            </Grid>
            {/* Row 1 continued: AI Content Generated Over Time - Span 2 columns */}
            <Grid item xs={12} md={6}>
              <ChartCard
                title="AI Content Generated Over Time"
                icon={<ShowChartIcon />}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={mockData.postsOverTime}
                    margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                    <XAxis
                      dataKey="name"
                      tick={{
                        fill: lightTheme.palette.text.secondary,
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      tick={{
                        fill: lightTheme.palette.text.secondary,
                        fontSize: 12,
                      }}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: "14px", paddingTop: "10px" }}
                    />
                    <Bar
                      dataKey="posts"
                      barSize={20}
                      fill={lightTheme.palette.primary.main}
                      name="AI Posts"
                      radius={[4, 4, 0, 0]} // Rounded top corners for bars
                    />
                    <Line
                      type="monotone"
                      dataKey="images"
                      stroke={lightTheme.palette.secondary.main}
                      strokeWidth={2.5}
                      name="AI Images"
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
            {/* Row 2: Top Styles Ratio Chart and Top Liked Posts */}
            <Grid item xs={12} md={7} lg={7}>
              {" "}
              {/* Give more space to Pie Chart */}
              <ChartCard
                title="Top Styles Distribution"
                icon={<PieChartIcon />}
              >
                <Typography
                  variant="caption"
                  display="block"
                  align="center"
                  sx={{ mb: 1, color: "text.secondary" }}
                >
                  Total Styles Logged: {totalStylesCount.toLocaleString()}
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ fontSize: "12px", marginTop: "10px" }}
                    />
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={mockData.topStyles}
                      cx="50%"
                      cy="50%"
                      innerRadius="50%" // Make it a Donut chart
                      outerRadius="75%"
                      fill="#8884d8"
                      dataKey="count"
                      onMouseEnter={onPieEnter}
                      paddingAngle={2}
                    >
                      {mockData.topStyles.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || lightTheme.palette.primary.light}
                        />
                      ))}
                      <Label
                        value={`${((mockData.topStyles[activeIndex]?.count / totalStylesCount) * 100).toFixed(1)}%`}
                        position="center"
                        fill={
                          mockData.topStyles[activeIndex]?.color ||
                          lightTheme.palette.text.primary
                        }
                        fontSize="24px"
                        fontWeight="bold"
                      />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
            {/* Row 2: Top Styles Ratio Chart and Top Liked Posts */}
            <Grid item xs={12} md={7} lg={7}>
              {" "}
              {/* Give more space to Pie Chart */}
              <ChartCard
                title="Top Aspect Ratio Distribution"
                icon={<PieChartIcon />}
              >
                <Typography
                  variant="caption"
                  display="block"
                  align="center"
                  sx={{ mb: 1, color: "text.secondary" }}
                >
                  Total Styles Logged: {totalStylesCount.toLocaleString()}
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ fontSize: "12px", marginTop: "10px" }}
                    />
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={mockData.topAspectRatio}
                      cx="50%"
                      cy="50%"
                      innerRadius="50%" // Make it a Donut chart
                      outerRadius="75%"
                      fill="#8884d8"
                      dataKey="count"
                      onMouseEnter={onPieEnter}
                      paddingAngle={2}
                    >
                      {mockData.topStyles.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || lightTheme.palette.primary.light}
                        />
                      ))}
                      <Label
                        value={`${((mockData.topAspectRatio[activeIndex]?.count / totalAspectRatioCount) * 100).toFixed(1)}%`}
                        position="center"
                        fill={
                          mockData.topStyles[activeIndex]?.color ||
                          lightTheme.palette.text.primary
                        }
                        fontSize="24px"
                        fontWeight="bold"
                      />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
            <Grid item xs={12} md={5} lg={5}>
              {" "}
              {/* Adjusted grid size */}
              <ChartCard title="Top 5 Most Liked Posts" icon={<FavoriteIcon />}>
                <List dense sx={{ maxHeight: 380, overflow: "auto", pr: 1 }}>
                  {" "}
                  {/* Added maxHeight and scroll */}
                  {mockData.topLikedPosts.map((post, idx) => (
                    <React.Fragment key={post.id}>
                      <ListItem
                        sx={{
                          my: 0.5,
                          py: 1.5,
                          px: 1.5,
                          backgroundColor:
                            idx % 2 === 0 ? "action.hover" : "transparent",
                          borderRadius: 2,
                          "&:hover": {
                            backgroundColor: "primary.main",
                            color: "common.white",
                            "& .MuiTypography-root, & .MuiSvgIcon-root": {
                              color: "common.white",
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Avatar
                            sx={{
                              bgcolor: "secondary.light",
                              width: 32,
                              height: 32,
                              fontSize: "0.875rem",
                            }}
                          >
                            {idx + 1}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="subtitle1"
                              fontWeight="medium"
                              noWrap
                            >
                              {post.title}
                            </Typography>
                          }
                          secondary={
                            <Box
                              component="span"
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              <FavoriteIcon
                                sx={{
                                  fontSize: "1rem",
                                  color: "secondary.light",
                                  mr: 0.5,
                                }}
                              />
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                              >
                                {post.likes.toLocaleString()} likes
                              </Typography>
                              <Typography
                                component="span"
                                variant="caption"
                                color="text.secondary"
                                sx={{ ml: 1 }}
                              >
                                by {post.author}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {idx < mockData.topLikedPosts.length - 1 && (
                        <Divider variant="inset" component="li" />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </ChartCard>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
