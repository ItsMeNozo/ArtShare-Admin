// src/lib/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Adjust path
import { USER_ROLES } from "../constants/roles";
import { CircularProgress } from "@mui/material";
import Box from "@mui/material/Box";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Destructure all relevant values from useAuth
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // console.log(
  //   "[PROTECTED] Rendering. isLoading:", isLoading,
  //   "isAuthenticated:", isAuthenticated,
  //   "User:", user ? user.email : "null"
  // );

  // 1. Handle Loading State FIRST
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh", // Take full viewport height
          width: "100vw", // Take full viewport width
          position: "fixed", // Or 'absolute' if within a specific container
          top: 0,
          left: 0,
          backgroundColor: "background.default", // Optional: match app background
          zIndex: 9999, // Ensure it's on top
        }}
      >
        <CircularProgress />
        {/* Optional: Add a message */}
        {/* <Typography sx={{ ml: 2 }}>Loading session...</Typography> */}
      </Box>
    );
  }

  // 2. Handle Not Authenticated AFTER loading is false
  if (!isAuthenticated) {
    // Or you can use `!user` directly
    // console.log(
    //   "[PROTECTED] Not authenticated (isLoading is false). Redirecting to /login. Current location:",
    //   location.pathname
    // );
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Handle Role-Based Authorization (if user is authenticated)
  // This check assumes 'user' is not null because isAuthenticated is true
  if (!user || !user.roles || !user.roles.includes(USER_ROLES.ADMIN)) {
    // console.log(
    //   `[PROTECTED] User ${user?.email} is authenticated but not an ADMIN. Redirecting. Roles:`,
    //   user?.roles
    // );
    // User is authenticated but does not have the required 'admin' role.
    return (
      <Navigate
        to="/login"
        state={{ from: location, error: "access_denied" }}
        replace
      />
    ); // Or an /access-denied page
  }

  // console.log("[PROTECTED] Authenticated and authorized. Rendering children.");
  return <>{children}</>;
};

export default ProtectedRoute;
