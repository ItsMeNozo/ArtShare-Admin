import { Box, CircularProgress } from '@mui/material';
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './lib/ProtectedRoute';

const LoginPage = lazy(() => import('./features/auth/components/login'));
const BlogManagementPage = lazy(
  () => import('./features/blogs/BlogManagementPage'),
);
const CategoryManagementPage = lazy(
  () => import('./features/categories/CategoryManagementPage'),
);
const PostManagementPage = lazy(() => import('./features/posts'));
const ProfilePage = lazy(() => import('./features/profile/ProfilePage'));
const ReportManagementPage = lazy(
  () => import('./features/reports/ReportManagementPage'),
);
const StatisticsPage = lazy(() => import('./features/statistics'));
const StatisticDashboardPage = lazy(
  () => import('./features/statistics/AIStatistics'),
);
const Dashboard = lazy(() => import('./features/statistics/Dashboard'));
const UserManagementPage = lazy(() => import('./features/users'));

const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
    }}
  >
    <CircularProgress />
  </Box>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'categories',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CategoryManagementPage />
          </Suspense>
        ),
      },
      {
        path: 'posts',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PostManagementPage />
          </Suspense>
        ),
      },
      {
        path: 'users',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <UserManagementPage />
          </Suspense>
        ),
      },
      {
        path: 'statistics',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <StatisticsPage />
          </Suspense>
        ),
      },
      {
        path: 'reports',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ReportManagementPage />
          </Suspense>
        ),
      },
      {
        path: 'ai',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <StatisticDashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProfilePage />
          </Suspense>
        ),
      },
      {
        path: 'blogs',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <BlogManagementPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
