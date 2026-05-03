// src/services/api.js
import axios from "axios";

// Dev: prefer same-origin "/api" so Vite proxies to Django (fewer browser/CORS issues).
// Set VITE_API_BASE_URL only if you intentionally bypass the proxy.
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "/api"
    : window?.location?.origin?.includes("localhost") ||
      window?.location?.origin?.includes("127.0.0.1")
      ? "http://127.0.0.1:8000/api"
      : "/api");

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const BRANCH_KEY = "current_branch_id";

const getAccess = () => localStorage.getItem(ACCESS_KEY);
const getRefresh = () => localStorage.getItem(REFRESH_KEY);

export const setTokens = ({ access, refresh }) => {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(BRANCH_KEY);
};

export const setCurrentBranchId = (branchId) => {
  const n = Number(branchId);
  if (Number.isFinite(n) && n > 0) localStorage.setItem(BRANCH_KEY, String(n));
  else localStorage.removeItem(BRANCH_KEY);
};

const getBranchId = () => {
  const v = localStorage.getItem(BRANCH_KEY);
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? String(n) : null;
};

// ✅ Auth endpoints where we MUST NOT send branch header
const isAuthEndpoint = (url = "") => {
  // normalize first (url can be full/relative)
  const u = String(url || "");
  const pathOnly = u.startsWith("http")
    ? u.replace(API_BASE, "")
    : u.startsWith("/")
    ? u
    : `/${u}`;

  return (
    pathOnly.startsWith("/accounts/login/") ||
    pathOnly.startsWith("/accounts/register/") ||
    pathOnly.startsWith("/accounts/token/refresh/")
  );
};

const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

// ✅ request interceptor (adds Bearer + X-Branch-Id reliably)
api.interceptors.request.use(
  (config) => {
    const token = getAccess();
    config.headers = config.headers || {};

    if (token) config.headers.Authorization = `Bearer ${token}`;

    // normalize url (sometimes "materials/", sometimes "/materials/", sometimes full url)
    const rawUrl = String(config?.url || "");
    const url = rawUrl.startsWith("http")
      ? rawUrl.replace(API_BASE, "")
      : rawUrl.startsWith("/")
      ? rawUrl
      : `/${rawUrl}`;

    // ✅ only add branch header for non-auth calls
    if (!isAuthEndpoint(url)) {
      const bid = getBranchId();
      if (bid) config.headers["X-Branch-Id"] = bid;
      // else: if not set, we intentionally don't send it (backend will 403 for admin create)
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let queue = [];

const runQueue = (err, token = null) => {
  queue.forEach((p) => (err ? p.reject(err) : p.resolve(token)));
  queue = [];
};

const refreshAccessToken = async () => {
  const refresh = getRefresh();
  if (!refresh) throw new Error("No refresh token found.");

  // ✅ absolute call to avoid branch header on refresh
  const res = await axios.post(`${API_BASE}/accounts/token/refresh/`, { refresh });
  const newAccess = res?.data?.access;
  if (!newAccess) throw new Error("Refresh failed: no access token returned.");

  setTokens({ access: newAccess });
  return newAccess;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error?.config;
    const status = error?.response?.status;

    if (status === 401 && original && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (token) => {
              original.headers = original.headers || {};
              original.headers.Authorization = `Bearer ${token}`;
              resolve(api(original));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        runQueue(null, newToken);

        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (e) {
        runQueue(e);
        clearTokens();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const extractErr = (e) => {
  const msg = String(e?.message || "");
  const code = e?.code;
  if (
    code === "ERR_NETWORK" ||
    msg === "Network Error" ||
    msg.includes("Network Error")
  ) {
    return import.meta.env.DEV
      ? "API server unreachable. Start the backend: cd backend && python manage.py runserver"
      : "Network error — check your connection or API server.";
  }

  const data = e?.response?.data;
  if (!data) return msg || "Server error";
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  
  // Handle field-specific errors
  const fieldKeys = Object.keys(data);
  if (fieldKeys.length > 0) {
    const firstField = fieldKeys[0];
    const fieldValue = data[firstField];
    if (Array.isArray(fieldValue)) {
      return `${firstField}: ${fieldValue[0]}`;
    }
    return `${firstField}: ${fieldValue}`;
  }
  
  return JSON.stringify(data);
};

export default api;
