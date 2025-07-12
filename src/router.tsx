import { createBrowserRouter, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './features/auth/components/login';
import BlogManagementPage from './features/blogs/BlogManagementPage';
import CategoryManagementPage from './features/categories/CategoryManagementPage';
import PostManagementPage from './features/posts';
import ProfilePage from './features/profile/ProfilePage';
import ReportManagementPage from './features/reports/ReportManagementPage';
import StatisticsPage from './features/statistics';
import StatisticDashboardPage from './features/statistics/AIStatistics';
import Dashboard from './features/statistics/Dashboard';
import UserManagementPage from './features/users';
import ProtectedRoute from './lib/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    // This path will now be the parent for all admin routes
    path: '/', // Or you could use a more specific base like "/admin" if you prefer
    element: (
      <ProtectedRoute>
        <AdminLayout /> {/* AdminLayout is now protected */}
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> }, // For path: '/admin'
      { path: 'categories', element: <CategoryManagementPage /> },
      { path: 'posts', element: <PostManagementPage /> },
      { path: 'users', element: <UserManagementPage /> },
      { path: 'statistics', element: <StatisticsPage /> },
      { path: 'reports', element: <ReportManagementPage /> },
      { path: 'ai', element: <StatisticDashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'blogs', element: <BlogManagementPage /> },
    ],
  },
  {
    // Catch-all or redirect for paths not matching login or admin layout
    // This can be a 404 page or redirect to dashboard if authenticated, login if not.
    // For simplicity, if you want to always go to /dashboard if not /login:
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
