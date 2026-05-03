import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";

import Layout from "./components/layout/Layout";
import DashboardLayout from "./components/layout/DashboardLayout";

import Home from "./pages/Home";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Roadmap from "./pages/Roadmap";
import Careers from "./pages/Careers";

import Dashboard from "./pages/Dashboard";
import CreateSlip from "./pages/CreateSlip";
import SlipsHistory from "./pages/SlipsHistory";
import Customers from "./pages/Customers";
import Vehicles from "./pages/Vehicles";
import Materials from "./pages/Materials";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Reports from "./pages/Reports";
import Devices from "./pages/Devices";
import Branches from "./pages/Branches";
import UsersRoles from "./pages/UsersRoles";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import LiveChat from "./pages/LiveChat";
import CompanyProfile from "./pages/CompanyProfile";

import DailySummary from "./pages/reports/DailySummary";
import CustomerReport from "./pages/reports/CustomerReport";
import VehicleReport from "./pages/reports/VehicleReport";
import ProductSummary from "./pages/reports/ProductSummary";
import FinancialReport from "./pages/reports/FinancialReport";

import { useAuth } from "./context/AuthContext";

/** ✅ Simple 404 page */
const NotFound = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
    <h1 className="text-2xl font-bold">404</h1>
    <p className="text-sm text-slate-500">Page not found.</p>
  </div>
);

/** ✅ Protect route: must be logged in */
const RequireAuth = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-slate-500">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

/** ✅ Role based guard (nested) */
const RequireRole = ({ allow = [] }) => {
  const { user } = useAuth();
  const role = user?.role || "Operator";

  if (!allow.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

/** ✅ If already logged in, don’t show /auth */
const RedirectIfAuthed = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return children;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* ---------- Public Website ---------- */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/features" element={<Layout><Features /></Layout>} />
        <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
        <Route path="/blog" element={<Layout><Blog /></Layout>} />
        <Route path="/blog/:id" element={<Layout><BlogDetail /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />
        <Route path="/terms" element={<Layout><TermsOfService /></Layout>} />
        <Route path="/roadmap" element={<Layout><Roadmap /></Layout>} />
        <Route path="/careers" element={<Layout><Careers /></Layout>} />

        {/* ---------- Auth ---------- */}
        <Route
          path="/auth"
          element={
            <RedirectIfAuthed>
              <Auth />
            </RedirectIfAuthed>
          }
        />

        {/* ---------- Dashboard (Protected Group) ---------- */}
        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-slip" element={<CreateSlip />} />
            <Route path="/slips" element={<SlipsHistory />} />

            <Route path="/customers" element={<Customers />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/materials" element={<Materials />} />

            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />

            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/daily" element={<DailySummary />} />
            <Route path="/reports/customers" element={<CustomerReport />} />
            <Route path="/reports/vehicles" element={<VehicleReport />} />
            <Route path="/reports/products" element={<ProductSummary />} />
            <Route path="/reports/financial" element={<FinancialReport />} />

            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/live-chat" element={<LiveChat />} />

            {/* ---------- Manager only (nested guards) ---------- */}
            <Route element={<RequireRole allow={["Manager"]} />}>
              <Route path="/devices" element={<Devices />} />
            </Route>

            <Route element={<RequireRole allow={["Manager"]} />}>
              <Route path="/branches" element={<Branches />} />
              <Route path="/users" element={<UsersRoles />} />
              <Route path="/company-profile" element={<CompanyProfile />} />
            </Route>
          </Route>
        </Route>

        {/* ---------- Redirects / 404 ---------- */}
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
