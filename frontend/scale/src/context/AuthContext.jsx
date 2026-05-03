// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { clearTokens, setTokens } from "@/services/api";

const AuthContext = createContext(null);

const ACCESS_KEY = "access_token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // Load current user (on refresh)
  // ✅ Only call /me if token exists
  // -----------------------------
  const loadMe = async () => {
    const access = localStorage.getItem(ACCESS_KEY);

    // ✅ no token => user null, stop loading
    if (!access) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const res = await api.get("/accounts/me/");
      setUser(res.data);
      return res.data;
    } catch {
      // token invalid/expired
      setUser(null);
      clearTokens();
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------
  // Login (email + password)
  // -----------------------------
  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await api.post("/accounts/login/", { email, password });

      const { access, refresh } = res.data || {};
      if (!access) {
        // ✅ IMPORTANT: if backend didn't return tokens, treat as fail
        throw new Error("Login failed: no access token returned.");
      }

      setTokens({ access, refresh });

      // ✅ now load profile
      const me = await loadMe();

      if (!me) {
        throw new Error("Login successful but profile could not be loaded.");
      }

      return me;
    } catch (e) {
      // ✅ cleanup on any login failure
      clearTokens();
      setUser(null);
      setLoading(false);
      throw e;
    }
  };

  // -----------------------------
  // Logout
  // -----------------------------
  const logout = () => {
    clearTokens();
    setUser(null);
    setLoading(false);
  };

  // -----------------------------
  // Helpers
  // -----------------------------
  const isAuthenticated = !!user;
  const role = user?.role || "Operator";
  const branchId = user?.branch_id ?? null;

  const isManager = role === "Manager";
  const isOperator = role === "Operator";

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,

      // actions
      login,
      logout,
      loadMe,

      // helpers
      isAuthenticated,
      role,
      branchId,
      isManager,
      isOperator,
    }),
    [user, loading, login, logout, loadMe, isAuthenticated, role, branchId, isManager, isOperator]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}

      {loading && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="text-sm font-semibold text-slate-600">Loading...</div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

// -----------------------------
// Hook
// -----------------------------
export const useAuth = () => {
  // eslint-disable-next-line react-refresh/only-export-components
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
