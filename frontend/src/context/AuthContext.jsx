import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getMe, logout as apiLogout } from "../services/api.js";
const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      let cached = null;
      try {
        cached = JSON.parse(localStorage.getItem("userData") || "null");
      } catch {
        cached = null;
      }

      // Optimistically show the cached profile so the UI doesn't flash, then
      // let the server decide: cookies are the source of truth, not localStorage.
      if (cached) {
        setUser(cached);
        setIsAuthenticated(true);
      }

      try {
        const { user: verified } = await getMe(Boolean(cached));
        localStorage.setItem("userData", JSON.stringify(verified));
        setUser(verified);
        setIsAuthenticated(true);
      } catch {
        // No valid session — drop any stale cached profile so ProtectedRoute
        // redirects and role-gated UI doesn't trust client-side data.
        localStorage.removeItem("userData");
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // When a token refresh fails, api.js dispatches "auth-expired". Clear
  // client auth state so ProtectedRoute redirects to /login.
  useEffect(() => {
    const handleAuthExpired = () => {
      localStorage.removeItem("userData");
      setIsAuthenticated(false);
      setUser(null);
    };

    window.addEventListener("auth-expired", handleAuthExpired);
    return () => window.removeEventListener("auth-expired", handleAuthExpired);
  }, []);

  const login = useCallback((userData) => {
    localStorage.setItem("userData", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Without this GSI keeps the previous account selected, so the next
      // Google sign-in can resolve silently instead of prompting.
      window.google?.accounts?.id?.disableAutoSelect();
      localStorage.removeItem("userData");
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      login,
      logout,
      loading,
    }),
    [isAuthenticated, user, login, logout, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
