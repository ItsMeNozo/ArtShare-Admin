import React from 'react';

import {
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  AppBar as MuiAppBar,
  Drawer as MuiDrawer,
  Toolbar,
  Tooltip,
  Typography,
  useTheme as useMuiTheme,
} from '@mui/material';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import app_logo from '/logo_admin.png';

import ArticleIcon from '@mui/icons-material/Article'; // For Post Management
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group'; // For User Management
import MenuIcon from '@mui/icons-material/Menu';
import type { CSSObject, Theme } from '@mui/material/styles';
import { alpha, styled } from '@mui/material/styles';

import BarChartIcon from '@mui/icons-material/BarChart'; // For Statistics
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import CategoryIcon from '@mui/icons-material/Category'; // For Category Management
import LogoutIcon from '@mui/icons-material/Logout';
import ReportIcon from '@mui/icons-material/Report'; // For Report Management
import ShowChartIcon from '@mui/icons-material/ShowChart';

import { Person } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useCustomTheme } from '../../context/ThemeContext';
import AdminNotificationUI from '../../features/notifications/AdminNotificationUI';

const drawerWidth = 260;

// Styled Components (unchanged)
const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: { width: `calc(${theme.spacing(8)} + 1px)` },
});
const DrawerHeaderStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const StyledAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open?: boolean }>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const StyledDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

const AdminLayout: React.FC = () => {
  const { mode: currentThemeMode, toggleColorMode } = useCustomTheme();
  const { user, logout } = useAuth();
  const muiTheme = useMuiTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = React.useState(true);
  const [selectedItem, setSelectedItem] = React.useState('/');
  const [userMenuAnchorEl, setUserMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const handleListItemClick = (path: string) => {
    setSelectedItem(path);
    navigate(path);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to login for security
      navigate('/login', { replace: true });
    }
    handleUserMenuClose();
  };

  // Get admin name from user context or fallback
  const adminName = user?.username || user?.fullName || 'Admin User';

  const sidebarItemsConfig = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
      section: 'MAIN',
      badge: undefined,
    },
    {
      text: 'User Management',
      icon: <GroupIcon />,
      path: '/users',
      section: 'MANAGEMENT',
      badge: undefined,
    },
    {
      text: 'Post Management',
      icon: <ArticleIcon />,
      path: '/posts',
      section: 'MANAGEMENT',
      badge: undefined,
    },
    {
      text: 'Blog Management',
      icon: <ArticleIcon />,
      path: '/blogs',
      section: 'MANAGEMENT',
      badge: undefined,
    },
    {
      text: 'Report Management',
      icon: <ReportIcon />,
      path: '/reports',
      section: 'MANAGEMENT',
      badge: undefined,
    },
    {
      text: 'Category Management',
      icon: <CategoryIcon />,
      path: '/categories',
      section: 'MANAGEMENT',
      badge: undefined,
    },
    {
      text: 'AI Statistics',
      icon: <BarChartIcon />,
      path: '/ai',
      section: 'MANAGEMENT',
      badge: undefined,
    },
    // {
    //   text: 'Statistics',
    //   icon: <ShowChartIcon />,
    //   path: '/statistics',
    //   section: 'MANAGEMENT',
    //   badge: undefined,
    // },
    {
      text: 'Analytics',
      icon: <ShowChartIcon />,
      path: '/statistics',
      section: 'MANAGEMENT',
      badge: undefined,
    },
  ];

  const mainMenuItems = sidebarItemsConfig.filter(
    (item) => item.section === 'MAIN',
  );
  const managementItems = sidebarItemsConfig.filter(
    (item) => item.section === 'MANAGEMENT',
  );

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
    } else if (currentPath === '/') {
      // Handle exact match for dashboard
      setSelectedItem('/');
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
                bgcolor: 'transparent',
                color: 'text.secondary',
                lineHeight: '30px',
                ml: 1.5,
                fontWeight: 'medium',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
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
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',

                // DEFAULT text/icon color

                // HOVER state
                '&:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.common.white, 0.08)
                      : alpha(theme.palette.common.black, 0.04),
                },

                // SELECTED state
                '&.Mui-selected': {
                  backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === 'dark' ? 0.25 : 0.15,
                  ),
                  color: theme.palette.primary.main,
                },

                // SELECTED + HOVER
                '&.Mui-selected:hover': {
                  backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === 'dark' ? 0.35 : 0.25,
                  ),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                  color: isSelected
                    ? theme.palette.primary.main
                    : theme.palette.action.disabled,
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ variant: 'body2' }}
                sx={{
                  opacity: open ? 1 : 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              />

              {item.badge && open && (
                <Chip
                  label={item.badge}
                  size="small"
                  sx={{
                    ml: 1,
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.common.white, 0.12)
                        : theme.palette.grey[200],
                    color: theme.palette.text.primary,
                    textTransform: 'none',
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
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <StyledAppBar
        position="fixed"
        open={open}
        elevation={muiTheme.palette.mode === 'dark' ? 1 : 2}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 2,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>

          {!open && (
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                color: 'inherit',
              }}
            >
              <Box
                component="img"
                src={app_logo}
                alt="Art Share Logo"
                sx={{ height: 28, width: 'auto', mr: 1 }}
              />
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  fontWeight: 'bold',
                  color: '#9575CD', // Light purple text color
                }}
              >
                ArtShare
              </Typography>
            </Link>
          )}
          {open && <Box sx={{ width: { xs: 0, sm: 150 } }} />}

          <Box sx={{ flexGrow: 1 }} />

          {/* Updated notification section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.5, sm: 1, md: 1.5 },
            }}
          >
            <Tooltip title="Toggle Theme">
              <IconButton onClick={toggleColorMode} color="inherit">
                {currentThemeMode === 'dark' ? (
                  <Brightness7Icon />
                ) : (
                  <Brightness4Icon />
                )}
              </IconButton>
            </Tooltip>

            {/* New Notification UI Component */}
            <AdminNotificationUI />

            <Box
              sx={{
                display: 'flex', // Align items in a row
                alignItems: 'center', // Vertically center them
                ml: 1, // Margin for the whole user block
                cursor: 'pointer', // Make it clickable
              }}
              onClick={handleUserMenuOpen}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'secondary.main', // Use theme color
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
                  fontWeight: 'medium',
                  ml: 1, // Margin between Avatar and Name (adjust as needed)
                  display: { xs: 'none', md: 'block' }, // Keep responsive display for the name
                }}
              >
                {adminName}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchorEl}
        open={Boolean(userMenuAnchorEl)}
        onClose={handleUserMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {adminName.charAt(0).toUpperCase()}
            </Avatar>
          </ListItemAvatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {adminName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || 'admin@artshare.com'}
            </Typography>
          </Box>
        </MenuItem>
        <Divider />

        <MenuItem
          onClick={() => {
            navigate('/profile');
            handleUserMenuClose();
          }}
        >
          <ListItemIcon>
            <Person
              fontSize="small"
              sx={{
                color:
                  muiTheme.palette.mode === 'dark'
                    ? 'text.primary'
                    : 'text.secondary',
              }}
            />
          </ListItemIcon>
          Profile
        </MenuItem>
        <Divider />

        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>

      <StyledDrawer variant="permanent" open={open}>
        <DrawerHeaderStyled sx={{ justifyContent: 'space-between', px: 2.5 }}>
          {open && (
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box
                component="img"
                src={app_logo}
                alt="Art Share Logo"
                sx={{ height: 32, width: 'auto', mr: 1.5 }}
              />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 'bold',
                  color: '#9575CD', // Light purple text color
                }}
              >
                ArtShare
              </Typography>
            </Link>
          )}
          <IconButton
            onClick={open ? handleDrawerClose : handleDrawerOpen}
            sx={{
              color:
                muiTheme.palette.mode === 'dark'
                  ? alpha(muiTheme.palette.common.white, 0.7)
                  : alpha(muiTheme.palette.common.white, 0.8), // Slightly more opaque for light mode if sidebar is still dark
              '&:hover': {
                color: muiTheme.palette.common.white,
                backgroundColor: alpha(muiTheme.palette.common.white, 0.08),
              },
            }}
          >
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeaderStyled>
        <Divider />
        {renderSidebarSection(mainMenuItems, 'MAIN')}
        <Divider sx={{ my: 1 }} />
        {renderSidebarSection(managementItems, 'MANAGEMENT')}
        {/* Removed pageItems section as it's not in your new config */}
      </StyledDrawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, backgroundColor: 'background.default' }}
      >
        <DrawerHeaderStyled />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
