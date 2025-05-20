import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./lib/ProtectedRoute";
import LoginPage from "./features/auth/components/login";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./components/layout/AdminLayout";
import CategoryManagementPage from "./features/categories/CategoryManagementPage";
import UserManagementPage from "./features/users";
// TODO: Import other pages when ready
// import Users from './pages/Users';
// import Posts from './pages/Posts';
// import Comments from './pages/Comments';
// import Reports from './pages/Reports';
// import Categories from './pages/Categories';
// import Statistics from './pages/Statistics';

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  { path: "categories", element: <CategoryManagementPage /> },
  { path: "users", element: <UserManagementPage /> },
  {
    // This path will now be the parent for all admin routes
    path: "/", // Or you could use a more specific base like "/admin" if you prefer
    element: (
      <ProtectedRoute>
        <AdminLayout /> {/* AdminLayout is now protected */}
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> }, // For path: '/admin'
      // { path: "users", element: <UserManagementPage /> },
      // { path: "posts", element: <PostManagementPage /> },
      // { path: "comments", element: <CommentManagementPage /> },
      // { path: "reports", element: <ReportManagementPage /> },
      // { path: "statistics", element: <StatisticsPage /> },
      // { path: "settings", element: <SettingsPage />}, // For top-bar settings icon
    ],
  },
  {
    // Catch-all or redirect for paths not matching login or admin layout
    // This can be a 404 page or redirect to dashboard if authenticated, login if not.
    // For simplicity, if you want to always go to /dashboard if not /login:
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
