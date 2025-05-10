import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { USER_ROLES } from "../../constants/roles";
interface ProtectedRouteProps {
  children: React.ReactNode;
  // Optional: if you want to specify roles required for this route
  // requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children /*, requiredRoles */,
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // You can render a global loading spinner or a simple div
    return <div>Loading authentication status...</div>;
  }

  if (!isAuthenticated || !user) {
    // User is not authenticated, redirect to login page.
    // Pass the current location so we can redirect back after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check: Ensure user has the 'admin' role for this admin-specific protected route
  // The original snippet specifically checked for 'admin'
  if (!user.roles || !user.roles.includes(USER_ROLES.ADMIN)) {
    // User is authenticated but does not have the required 'admin' role.
    // You could redirect to an "Access Denied" page or back to login/home.
    console.warn(
      `User ${user.email} does not have 'admin' role. Access denied.`,
    );
    return <Navigate to="/access-denied" replace />; // Or <Navigate to="/login" replace />;
  }

  // If you had `requiredRoles` prop:
  // if (requiredRoles && !requiredRoles.some(role => user.roles.includes(role))) {
  //   return <Navigate to="/access-denied" replace />;
  // }

  return <>{children}</>;
};

export default ProtectedRoute;
