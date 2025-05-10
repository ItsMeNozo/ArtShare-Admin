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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Initialize to true

  const attemptLoadUserFromToken = useCallback(
    async (isInitialLoad = false) => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setUser(null);
        if (isInitialLoad || isLoading) setIsLoading(false); // Only set loading false if it was true
        return;
      }

      if (!isLoading) setIsLoading(true); // Set loading if not already loading

      try {
        const userProfile = await getUserProfile();
        setUser(userProfile);
      } catch (error) {
        console.error("Failed to fetch user profile with stored token:", error);
        setUser(null);
        localStorage.removeItem("accessToken"); // Token is likely invalid or expired
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  ); // Dependency on isLoading to avoid redundant setIsLoading calls

  // Effect for initial load: check for an existing token and try to load user
  useEffect(() => {
    attemptLoadUserFromToken(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { access_token } = await apiSignIn(email, password);
      localStorage.setItem("accessToken", access_token);

      // After successful signIn and getting the token, fetch the user profile
      const userProfile = await getUserProfile();
      setUser(userProfile);
      // isAuthenticated will be true because user is now set
    } catch (error) {
      console.error("Login process failed:", error);
      localStorage.removeItem("accessToken"); // Clean up token on any part of login failure
      setUser(null); // Ensure user state is reset
      setIsLoading(false); // Explicitly set loading to false before re-throwing
      throw error; // Re-throw to allow UI to handle login error (e.g., display message)
    }
    // 'finally' is not strictly needed here if catch re-throws,
    // but if catch didn't re-throw, finally would be essential for setIsLoading(false)
    // For now, with throw in catch, this might be redundant, but safe.
    if (isLoading) setIsLoading(false);
  };

  const logout = async () => {
    // setIsLoading(true); // Optional: if logout process is slow or has visual loading state
    try {
      // Call backend signOut if it's an actual operation (e.g., invalidating token server-side)
      if (apiSignOut) {
        // Check if apiSignOut is a real function
        await apiSignOut();
      }
    } catch (error) {
      console.error(
        "API sign out failed (proceeding with local logout):",
        error,
      );
      // Usually, local logout should proceed even if server call fails
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
      // If you set setIsLoading(true) at the start of logout, set it to false here.
      // Otherwise, ensure it's false if user becomes null and it wasn't already processing something.
      if (isLoading) setIsLoading(false);
    }
  };

  // Effect to handle token changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "accessToken") {
        console.log(
          "accessToken changed in another tab/window. Reloading user.",
        );
        attemptLoadUserFromToken();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [attemptLoadUserFromToken]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: user !== null, user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
