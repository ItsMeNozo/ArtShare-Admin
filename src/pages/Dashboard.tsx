import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  useTheme as useMuiTheme, // Use alias to avoid conflict
} from "@mui/material";
// Removed: AppBar, Drawer, styled components for layout, logo import, layout state (open, setOpen)
// Removed: useCustomTheme import here if layout-specific theme toggling is handled by AdminLayout

// Mock data for dashboard content (can come from props or context if needed)
const adminName = "Admin"; // Or get from AuthContext if AdminLayout doesn't pass it
const pendingPosts = 5;
const openReports = 3;

const DashboardPageContent: React.FC = () => {
  const muiTheme = useMuiTheme(); // Gets the theme from the CustomThemeProvider higher up

  // This function would ideally be passed down or handled differently if needed on this page
  // For now, let's assume navigation is handled by links or buttons that AdminLayout might provide context for
  const handleNavigateToManagement = () => {
    console.log(
      "Navigate to management - use useNavigate() if needed here or pass handler from AdminLayout",
    );
    // Example: navigate('/posts'); // if useNavigate is used directly here
  };

  return (
    <Box>
      {" "}
      {/* No need for display:flex, minHeight:100vh - AdminLayout handles this */}
      <Typography
        variant="h4"
        gutterBottom
        fontWeight={600}
        color="text.primary"
      >
        Welcome back, {adminName}!{" "}
        {/* Consider how adminName is passed or accessed */}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={4}>
        Here's an overview of your system activities.
      </Typography>
      <Grid container spacing={3}>
        {/* Action Center Card (Example from your code) */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          {" "}
          {/* Changed Grid 'size' prop to 'item xs/md/lg' */}
          <Card
            sx={{
              // Using palette.success from your theme for the Action Center as previously discussed
              background: `linear-gradient(135deg, ${muiTheme.palette.success.main} 0%, ${muiTheme.palette.success.dark} 100%)`,
              color: muiTheme.palette.success.contrastText, // Ensures text is readable
              height: "100%",
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              <Box>
                <Typography variant="h5" component="div" gutterBottom>
                  Action Center
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  You have{" "}
                  <Typography component="span" fontWeight="bold">
                    {pendingPosts + openReports}
                  </Typography>{" "}
                  items requiring your attention.
                </Typography>
              </Box>
              <Box>
                {pendingPosts > 0 && (
                  <>
                    <Typography variant="subtitle2">
                      {pendingPosts} Posts Awaiting Review
                    </Typography>
                    <LinearProgress
                      color="success" // This will use the success.contrastText for the bar if defined, or a light color
                      variant="determinate"
                      value={(pendingPosts / (pendingPosts + 5)) * 100} // Example value
                      sx={{
                        mb: 1,
                        height: 8,
                        borderRadius: 4,
                        // Ensure track is visible on the dark green
                        backgroundColor: "rgba(255,255,255,0.2)", // Semi-transparent white track
                        "& .MuiLinearProgress-bar": {
                          backgroundColor:
                            muiTheme.palette.success.contrastText, // White bar
                        },
                      }}
                    />
                  </>
                )}
                {openReports > 0 && (
                  <>
                    <Typography variant="subtitle2">
                      {openReports} Open Reports
                    </Typography>
                    <LinearProgress
                      color="success"
                      variant="determinate"
                      value={(openReports / (openReports + 2)) * 100} // Example value
                      sx={{
                        mb: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "rgba(255,255,255,0.2)",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor:
                            muiTheme.palette.success.contrastText,
                        },
                      }}
                    />
                  </>
                )}
              </Box>
              <Button
                variant="contained"
                onClick={handleNavigateToManagement}
                sx={{
                  mt: 2,
                  // Button on dark green card, make it stand out
                  backgroundColor: "rgba(255,255,255,0.15)", // Lighter, semi-transparent
                  color: muiTheme.palette.success.contrastText, // White text
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
                }}
              >
                Review Items
              </Button>
            </CardContent>
          </Card>
        </Grid>
        {/* Add other Grid items for your dashboard cards here */}
        {/* Example: Total Customers card (simplified) */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Customers
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                1,02,890
              </Typography>
              {/* ... more content, chart placeholder ... */}
            </CardContent>
          </Card>
        </Grid>
        {/* Example: Total Revenue card (simplified) */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                $56,562
              </Typography>
              {/* ... more content, chart placeholder ... */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Your Dashboard page component that router.tsx imports
const Dashboard: React.FC = () => {
  return <DashboardPageContent />;
};
export default Dashboard;
