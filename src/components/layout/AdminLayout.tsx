import React from "react";

import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  ListSubheader,
  useTheme as useMuiTheme,
  AppBar as MuiAppBar,
  Drawer as MuiDrawer,
  Chip,
} from "@mui/material";
import app_logo from "/logo_admin.png";

import { alpha, styled } from "@mui/material/styles";
import type { CSSObject, Theme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group"; // For User Management
import ArticleIcon from "@mui/icons-material/Article"; // For Post Management
import CommentIcon from "@mui/icons-material/Comment"; // For Comment Management
import ReportIcon from "@mui/icons-material/Report"; // For Report Management
import CategoryIcon from "@mui/icons-material/Category"; // For Category Management
import BarChartIcon from "@mui/icons-material/BarChart"; // For Statistics
import ShowChartIcon from "@mui/icons-material/ShowChart";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

import { useCustomTheme } from "../../context/ThemeContext";

const drawerWidth = 260;

// --- Styled Components (Drawer, AppBar, etc. - UNCHANGED from your last version) ---
const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});
const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: { width: `calc(${theme.spacing(8)} + 1px)` },
});
const DrawerHeaderStyled = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));
const StyledAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open?: boolean }>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));
const StyledDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));
// --- END Styled Components ---

const adminName = "Jhon Taylor"; // Placeholder, use your actual admin name logic
const notificationCount = 5; // Example

const AdminLayout: React.FC = () => {
  const { mode: currentThemeMode, toggleColorMode } = useCustomTheme();
  const muiTheme = useMuiTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = React.useState(true);
  const [selectedItem, setSelectedItem] = React.useState("/");

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const handleListItemClick = (path: string) => {
    setSelectedItem(path);
    navigate(path);
  };

  // --- UPDATED sidebarItemsConfig based on your Use Case Diagram ---
  const sidebarItemsConfig = [
    // MAIN section
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/",
      section: "MAIN",
      badge: undefined,
    }, // Assuming '/' is your dashboard path

    // MANAGEMENT section
    {
      text: "User Management",
      icon: <GroupIcon />,
      path: "/users",
      section: "MANAGEMENT",
      badge: undefined,
    },
    {
      text: "Post Management",
      icon: <ArticleIcon />,
      path: "/posts",
      section: "MANAGEMENT",
      badge: undefined,
    },
    {
      text: "Comment Management",
      icon: <CommentIcon />,
      path: "/comments",
      section: "MANAGEMENT",
      badge: undefined,
    },
    {
      text: "Report Management",
      icon: <ReportIcon />,
      path: "/reports",
      section: "MANAGEMENT",
      badge: undefined,
    },
    {
      text: "Category Management",
      icon: <CategoryIcon />,
      path: "/categories",
      section: "MANAGEMENT",
      badge: undefined,
    },
    {
      text: "AI Management",
      icon: <BarChartIcon />,
      path: "/ai",
      section: "MANAGEMENT",
      badge: undefined,
    },
    {
      text: "Statistics",
      icon: <ShowChartIcon />,
      path: "/statistics",
      section: "MANAGEMENT",
      badge: undefined,
    },
  ];

  const mainMenuItems = sidebarItemsConfig.filter(
    (item) => item.section === "MAIN",
  );
  const managementItems = sidebarItemsConfig.filter(
    (item) => item.section === "MANAGEMENT",
  );
  // const pageItems = sidebarItemsConfig.filter(item => item.section === 'PAGES'); // Not used with this config

  React.useEffect(() => {
    const currentPath = location.pathname;
    let bestMatch = null;
    let longestMatchLength = 0;

    for (const item of sidebarItemsConfig) {
      if (currentPath.startsWith(item.path)) {
        if (item.path.length > longestMatchLength) {
          longestMatchLength = item.path.length;
          bestMatch = item;
        }
      }
    }
    if (bestMatch) {
      setSelectedItem(bestMatch.path);
    } else if (currentPath === "/") {
      // Handle exact match for dashboard
      setSelectedItem("/");
    }
  }, [location.pathname]);

  const renderSidebarSection = (
    items: typeof sidebarItemsConfig,
    sectionTitle?: string,
  ) => {
    const theme = useMuiTheme();

    return (
      <List
        subheader={
          open && sectionTitle ? (
            <ListSubheader
              component="div"
              sx={{
                bgcolor: "transparent",
                color: "text.secondary",
                lineHeight: "30px",
                ml: 1.5,
                fontWeight: "medium",
                fontSize: "0.75rem",
                textTransform: "uppercase",
              }}
            >
              {sectionTitle}
            </ListSubheader>
          ) : null
        }
      >
        {items.map((item) => {
          const isSelected = selectedItem === item.path;
          return (
            <ListItemButton
              key={item.text}
              selected={isSelected}
              onClick={() => handleListItemClick(item.path)}
              sx={{
                minHeight: 48,
                px: 2.5,
                mx: open ? 1.5 : 0.5,
                mb: 0.5,
                borderRadius: 1.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",

                // DEFAULT text/icon color

                // HOVER state
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.common.white, 0.08)
                      : alpha(theme.palette.common.black, 0.04),
                },

                // SELECTED state
                "&.Mui-selected": {
                  backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === "dark" ? 0.25 : 0.15,
                  ),
                  color: theme.palette.primary.main,
                },

                // SELECTED + HOVER
                "&.Mui-selected:hover": {
                  backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === "dark" ? 0.35 : 0.25,
                  ),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : "auto",
                  justifyContent: "center",
                  color: isSelected
                    ? theme.palette.primary.main
                    : theme.palette.action.disabled,
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ variant: "body2" }}
                sx={{
                  opacity: open ? 1 : 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              />

              {item.badge && open && (
                <Chip
                  label={item.badge}
                  size="small"
                  sx={{
                    ml: 1,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.common.white, 0.12)
                        : theme.palette.grey[200],
                    color: theme.palette.text.primary,
                    textTransform: "none",
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>
    );
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <StyledAppBar
        position="fixed"
        open={open}
        elevation={muiTheme.palette.mode === "dark" ? 1 : 2}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 2,
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>

          {!open && ( // Logo in AppBar when drawer is closed
            <Link
              to="/"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                color: "inherit",
              }}
            >
              <Box
                component="img"
                src={app_logo} // Your brown/yellow logo
                alt="Art Share Logo"
                sx={{ height: 28, width: "auto", mr: 1 }}
              />
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  fontWeight: "bold",
                  color: "#9575CD", // Light purple text color
                }}
              >
                ArtShare
              </Typography>
            </Link>
          )}
          {open && <Box sx={{ width: { xs: 0, sm: 150 } }} />}

          <Box sx={{ flexGrow: 1 }} />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, sm: 1, md: 1.5 },
            }}
          >
            <Tooltip title="Toggle Theme">
              <IconButton onClick={toggleColorMode} color="inherit">
                {currentThemeMode === "dark" ? (
                  <Brightness7Icon />
                ) : (
                  <Brightness4Icon />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={notificationCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Account Settings">
              <IconButton color="inherit" onClick={() => navigate("/settings")}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            <Box
              sx={{
                display: "flex", // Align items in a row
                alignItems: "center", // Vertically center them
                ml: 1, // Margin for the whole user block
                // Potentially add cursor: 'pointer' if you want to make this whole area clickable for a user menu
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "secondary.main", // Use theme color
                  // No margin needed here as parent Box handles spacing
                }}
              >
                {adminName.charAt(0).toUpperCase()}
              </Avatar>
              <Typography
                variant="subtitle2"
                noWrap
                component="div"
                sx={{
                  fontWeight: "medium",
                  ml: 1, // Margin between Avatar and Name (adjust as needed)
                  display: { xs: "none", md: "block" }, // Keep responsive display for the name
                }}
              >
                {adminName}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </StyledAppBar>

      <StyledDrawer variant="permanent" open={open}>
        <DrawerHeaderStyled sx={{ justifyContent: "space-between", px: 2.5 }}>
          {open && (
            <Link
              to="/"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                component="img"
                src={app_logo} // Your brown/yellow Art Share logo
                alt="Art Share Logo"
                sx={{ height: 32, width: "auto", mr: 1.5 }}
              />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: "bold",
                  color: "#9575CD", // Light purple text color
                }}
              >
                ArtShare
              </Typography>
            </Link>
          )}
          <IconButton
            onClick={open ? handleDrawerClose : handleDrawerOpen}
            sx={{
              // color: alpha("#FFFFFF", 0.7), // Base color for the button (icon inherits this)
              // "&:hover": {
              //   color: "#FFFFFF",        // Color on hover
              //   backgroundColor: alpha("#FFFFFF", 0.08) // Optional: subtle background on hover
              // },
              // More direct approach using theme context for consistency
              color:
                muiTheme.palette.mode === "dark"
                  ? alpha(muiTheme.palette.common.white, 0.7)
                  : alpha(muiTheme.palette.common.white, 0.8), // Slightly more opaque for light mode if sidebar is still dark
              "&:hover": {
                color: muiTheme.palette.common.white,
                backgroundColor: alpha(muiTheme.palette.common.white, 0.08),
              },
            }}
          >
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeaderStyled>
        <Divider />
        {renderSidebarSection(mainMenuItems, "MAIN")}
        <Divider sx={{ my: 1 }} />
        {renderSidebarSection(managementItems, "MANAGEMENT")}
        {/* Removed pageItems section as it's not in your new config */}
      </StyledDrawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, backgroundColor: "background.default" }}
      >
        <DrawerHeaderStyled />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
