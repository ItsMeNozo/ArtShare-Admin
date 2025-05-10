// src/router.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./lib/ProtectedRoute";
import LoginPage from "./features/auth/components/login";
import Dashboard from "./pages/Dashboard";
// TODO: Import other pages when ready
// import Users from './pages/Users';
// import Posts from './pages/Posts';
// import Comments from './pages/Comments';
// import Reports from './pages/Reports';
// import Categories from './pages/Categories';
// import Statistics from './pages/Statistics';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />, // Always redirect from / to /dashboard
  },
  {
    path: "/dashboard", // This is your main protected dashboard route
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  // TODO: Add protected routes for the following paths when components are ready
  // {
  //   path: '/users',
  //   element: (
  //     <ProtectedRoute>
  //       <Users />
  //     </ProtectedRoute>
  //   ),
  // },
  // {
  //   path: '/posts',
  //   element: (
  //     <ProtectedRoute>
  //       <Posts />
  //     </ProtectedRoute>
  //   ),
  // },
  // {
  //   path: '/comments',
  //   element: (
  //     <ProtectedRoute>
  //       <Comments />
  //     </ProtectedRoute>
  //   ),
  // },
  // {
  //   path: '/reports',
  //   element: (
  //     <ProtectedRoute>
  //       <Reports />
  //     </ProtectedRoute>
  //   ),
  // },
  // {
  //   path: '/categories',
  //   element: (
  //     <ProtectedRoute>
  //       <Categories />
  //     </ProtectedRoute>
  //   ),
  // },
  // {
  //   path: '/statistics',
  //   element: (
  //     <ProtectedRoute>
  //       <Statistics />
  //     </ProtectedRoute>
  //   ),
  // },
]);
