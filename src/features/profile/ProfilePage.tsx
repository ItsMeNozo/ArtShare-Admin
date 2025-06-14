import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();

  if (!user) {
    return (
      <Paper
        sx={{
          p: 3,
          m: 2,
          backgroundColor:
            theme.palette.mode === 'dark'
              ? theme.palette.background.paper
              : '#ffffff',
        }}
      >
        <Typography variant="h5" component="h1" fontWeight="bold">
          Profile
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          No user information available.
        </Typography>
      </Paper>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Paper
      sx={{
        p: 3,
        m: 2,
        backgroundColor:
          theme.palette.mode === 'dark'
            ? theme.palette.background.paper
            : '#ffffff',
      }}
    >
      <Typography variant="h5" component="h1" fontWeight="bold" sx={{ mb: 3 }}>
        Profile Information
      </Typography>{' '}
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
              p: 3,
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? theme.palette.grey[800]
                  : theme.palette.grey[50],
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <Avatar
                src={user.profilePictureUrl || undefined}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                }}
              >
                {user.username ? user.username.charAt(0).toUpperCase() : 'A'}
              </Avatar>
              <Box>
                <Typography variant="h4" component="h2" sx={{ mb: 1 }}>
                  {user.fullName || user.username || 'Admin User'}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  @{user.username || 'admin'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {user.roles?.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      color={role === 'ADMIN' ? 'secondary' : 'default'}
                      icon={<AdminPanelSettingsIcon />}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>
        {/* Basic Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body1">
                    {user.fullName || 'Not provided'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Email Address
                  </Typography>
                  <Typography variant="body1">{user.email}</Typography>
                </Box>
              </Box>

              {user.birthday && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarTodayIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Birthday
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(user.birthday)}
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>{' '}
        {/* Account Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                Account Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  User ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {user.id}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Account Created
                </Typography>
                <Typography variant="body1">
                  {formatDate(user.createdAt)}
                </Typography>
              </Box>

              {user.updatedAt && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(user.updatedAt)}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Account Type
                </Typography>
                <Typography variant="body1">Administrator</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>{' '}
        {/* Bio Section (if available) */}
        {user.bio && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                  Bio
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1">{user.bio}</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}{' '}
        {/* Statistics (if available) */}
        {(user.followersCount !== undefined ||
          user.followingsCount !== undefined) && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                  Statistics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {user.followersCount !== undefined && (
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {user.followersCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Followers
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {user.followingsCount !== undefined && (
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {user.followingsCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Following
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default ProfilePage;
