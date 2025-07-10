import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import {
  signIn as apiSignIn,
  signOut as apiSignOut,
} from "../features/auth/api/auth-api"; // Adjust the import path as needed
import type { User } from "../types/user";
import { getUserProfile } from "../api/get-user-profile";

interface AuthCtx {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean; // This is the primary loading state for auth status
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Initial auth check is loading

  const attemptLoadUserFromToken = useCallback(
    async (isInitialLoad = false) => {
      // console.log('Attempting to load user from token. Initial load:', isInitialLoad);
      if (!isInitialLoad && !isLoading) {
        // Only set loading if it's not an initial load and not already loading
        setIsLoading(true);
      }

      const token = localStorage.getItem("accessToken");

      if (!token) {
        // console.log('No token found.');
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const userProfile = await getUserProfile();
        setUser(userProfile);
      } catch (error) {
        console.error(
          "AuthContext: Failed to fetch user profile with stored token:",
          error,
        );
        setUser(null);
        localStorage.removeItem("accessToken"); // Token is likely invalid or expired
      } finally {
        // console.log('Finished attemptLoadUserFromToken, setting isLoading to false.');
        setIsLoading(false);
      }
    },
    [isLoading],
  ); // Removed isLoading from deps here, let's see. Or keep it.
  // The main goal is to ensure setIsLoading(true) is called appropriately at the start
  // of an async auth operation and setIsLoading(false) at the end.

  useEffect(() => {
    // console.log('AuthProvider mounted. Starting initial token load.');
    setIsLoading(true); // Explicitly set loading true for the initial check
    attemptLoadUserFromToken(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount for initial auth check

  const login = async (email: string, password: string) => {
    // console.log('Login called.');
    setIsLoading(true); // Indicate an auth operation is in progress
    try {
      const { accessToken } = await apiSignIn(email, password);
      localStorage.setItem("accessToken", accessToken);

      // console.log('Signed in, fetching profile with new token.');
      const userProfile = await getUserProfile(); // This also needs to complete
      // console.log('Profile fetched after login:', userProfile);
      setUser(userProfile);
      // setIsLoading(false); // Set loading false AFTER user is set
    } catch (error) {
      console.error("AuthContext: Login process failed:", error);
      localStorage.removeItem("accessToken");
      setUser(null);
      // setIsLoading(false); // Set loading false in catch too
      throw error; // Re-throw so LoginPage can handle it
    } finally {
      // console.log('Login finished, setting isLoading to false.');
      setIsLoading(false); // Ensure isLoading is false after login attempt
    }
  };

  const logout = async () => {
    // console.log('Logout called.');
    // setIsLoading(true); // Optional: if apiSignOut is slow
    try {
      if (apiSignOut) {
        await apiSignOut();
      }
    } catch (error) {
      console.error("AuthContext: API sign out failed:", error);
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
      // console.log('Logout finished, user set to null.');
      setIsLoading(false); // Ensure loading is false if it was set true
    }
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "accessToken") {
        // console.log('AuthContext: accessToken changed in another tab/window. Reloading user.');
        // No need to set loading true here if attemptLoadUserFromToken handles it
        attemptLoadUserFromToken();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [attemptLoadUserFromToken]);

  // console.log('AuthProvider rendering. isLoading:', isLoading, 'User:', user);
  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!user, user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook remains the same
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
