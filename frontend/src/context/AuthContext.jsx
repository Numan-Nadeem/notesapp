import { createContext, useContext, useState, useEffect } from "react";
import { logout as apiLogout } from "../services/api.js";
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
      try {
        const userData = localStorage.getItem("userData");
        if (userData) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log("Not authenticated", error);
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

  const login = (userData) => {
    localStorage.setItem("userData", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("userData");
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
