import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Notifications as NotificationsIcon,
  Report as ReportIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  Alert,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React, { useState } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Adjust path as needed
import { useNotifications } from './useNotifications';

// Types matching your existing notification system
export interface NotificationPayload {
  message: string;
  [key: string]: any;
}

export interface ReportResolvedPayload extends NotificationPayload {
  reportId: number;
  resolvedAt: string;
}

export interface Notification<T = NotificationPayload> {
  id: string;
  userId: string;
  type: string;
  payload: T;
  isRead: boolean;
  isDelivered: boolean;
  createdAt: string;
  updatedAt: string;
}

// Helper function to format notification messages
const formatNotificationMessage = (
  notif: Notification<NotificationPayload>,
) => {
  const message = notif?.payload?.message || '';

  // Handle report resolved notifications
  if (message.includes('report') && message.includes('resolved')) {
    const reportPattern =
      /Your report regarding\s*[""']([^""']+)[""']\s*(has been\s*.+)$/i;
    const reportMatch = message.match(reportPattern);
    if (reportMatch) {
      const reportedName = reportMatch[1].trim();
      const restOfMessage = reportMatch[2].trim();
      return `Report regarding "${reportedName}" ${restOfMessage}`;
    }
  }

  // Handle user action notifications
  const actionPatterns = [
    {
      regex: /^([^.\s]+(?:\s+[^.\s]+)*?)(\s+liked your (?:post|artwork))/,
      action: 'liked your post',
    },
    {
      regex:
        /^([^.\s]+(?:\s+[^.\s]+)*?)(\s+commented on your (?:post|artwork))/,
      action: 'commented on your post',
    },
    {
      regex:
        /^([^.\s]+(?:\s+[^.\s]+)*?)(\s+(?:followed you|started following you))/,
      action: 'followed you',
    },
    {
      regex:
        /^([^.\s]+(?:\s+[^.\s]+)*?)(\s+published (?:new|a new) (?:post|artwork))/,
      action: 'published new content',
    },
  ];

  for (const pattern of actionPatterns) {
    const match = message.match(pattern.regex);
    if (match && match[1]) {
      const userName = match[1].trim().replace(/^"|"$/g, '');
      return `${userName} ${pattern.action}`;
    }
  }

  return message;
};

// Helper function to get notification icon
const getNotificationIcon = (notificationType: string) => {
  switch (notificationType.toLowerCase()) {
    case 'report_resolved':
    case 'report-resolved':
      return (
        <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />
      );
    case 'warning':
      return <WarningIcon fontSize="small" sx={{ color: 'warning.main' }} />;
    case 'artwork_liked':
    case 'artwork_commented':
    case 'user_followed':
      return <InfoIcon fontSize="small" sx={{ color: 'info.main' }} />;
    default:
      return <ReportIcon fontSize="small" sx={{ color: 'primary.main' }} />;
  }
};

// Helper function to format time ago
const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
};

interface AdminNotificationUIProps {
  // Optional props for customization
  maxHeight?: number;
  showMarkAllRead?: boolean;
}

const AdminNotificationUI: React.FC<AdminNotificationUIProps> = ({
  maxHeight = 400,
  showMarkAllRead = true,
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState<
    string | null
  >(null);

  const {
    notifications,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refetch,
  } = useNotifications(user?.id || '');

  const unreadCount = notifications.filter(
    (n: { isRead: any }) => !n.isRead,
  ).length;
  const isOpen = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedNotificationId(null);
  };

  const handleNotificationClick = async (
    notification: Notification<NotificationPayload>,
  ) => {
    if (!notification.isRead) {
      setSelectedNotificationId(notification.id);
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      } finally {
        setSelectedNotificationId(null);
      }
    }

    handleNotificationNavigation(notification, navigate);
  };

  const handleNotificationNavigation = (
    notification: Notification<NotificationPayload>,
    navigate: NavigateFunction,
  ) => {
    if (notification.type === 'report_created') {
      navigate(`/reports`, {
        state: {
          report_id: notification.payload.report.id,
        },
      });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{
            position: 'relative',
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.white, 0.1),
            },
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                minWidth: '18px',
                height: '18px',
              },
            }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Chip
                  label={unreadCount}
                  size="small"
                  color="primary"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Refresh">
                <IconButton
                  size="small"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <InfoIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              {showMarkAllRead && unreadCount > 0 && (
                <Tooltip title="Mark all as read">
                  <IconButton size="small" onClick={handleMarkAllRead}>
                    <MarkEmailReadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>

        {/* Error State */}
        {error && (
          <Box sx={{ p: 2 }}>
            <Alert
              severity="error"
              action={
                <IconButton size="small" onClick={handleRefresh}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              }
            >
              {error}
            </Alert>
          </Box>
        )}

        {/* Loading State */}
        {isLoading && notifications.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Notifications List */}
        <Box sx={{ maxHeight, overflow: 'auto' }}>
          {notifications.length === 0 && !isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
              <NotificationsIcon
                sx={{
                  fontSize: 48,
                  color: 'text.disabled',
                  mb: 1,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                No notifications yet
              </Typography>
              <Typography variant="caption" color="text.disabled">
                You're all caught up!
              </Typography>
            </Box>
          ) : (
            <List sx={{ py: 0 }}>
              {notifications.map((notification, index) =>
                [
                  <ListItemButton
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      backgroundColor: notification.isRead
                        ? 'transparent'
                        : alpha(theme.palette.primary.main, 0.05),
                      borderLeft: notification.isRead
                        ? 'none'
                        : `3px solid ${theme.palette.primary.main}`,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: 'black',
                      },
                      position: 'relative',
                    }}
                    disabled={selectedNotificationId === notification.id}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {selectedNotificationId === notification.id ? (
                        <CircularProgress size={20} />
                      ) : (
                        getNotificationIcon(notification.type)
                      )}
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: notification.isRead ? 400 : 600,
                            lineHeight: 1.4,
                          }}
                        >
                          {formatNotificationMessage(notification)}
                        </Typography>
                      }
                      secondary={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {formatTimeAgo(notification.createdAt)}
                          </Typography>
                          {!notification.isRead && (
                            <Chip
                              label="New"
                              size="small"
                              color="primary"
                              sx={{
                                height: 16,
                                fontSize: '0.65rem',
                                '& .MuiChip-label': { px: 0.5 },
                              }}
                            />
                          )}
                        </Box>
                      }
                    />

                    {!notification.isRead && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          ml: 1,
                        }}
                      />
                    )}
                  </ListItemButton>,

                  index < notifications.length - 1 ? (
                    <Divider
                      key={`divider-${notification.id}`}
                      component="li"
                    />
                  ) : null,
                ].filter(Boolean),
              )}
            </List>
          )}
        </Box>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button
                fullWidth
                size="small"
                onClick={handleClose}
                sx={{ textTransform: 'none' }}
              >
                Close
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default AdminNotificationUI;
