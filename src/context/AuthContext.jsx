import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("aimart_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("aimart_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  function saveSession(nextUser, nextToken) {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem("aimart_token", nextToken);
    localStorage.setItem("aimart_user", JSON.stringify(nextUser));
  }

  async function login(credentials) {
    const data = await authApi.login(credentials);
    saveSession(data.user, data.token);
    return data.user;
  }

  async function register(payload) {
    const data = await authApi.register(payload);
    saveSession(data.user, data.token);
    return data.user;
  }

  function logout() {
    authApi.logout().catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem("aimart_token");
    localStorage.removeItem("aimart_user");
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token),
    isSeller: user?.role === "seller",
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
