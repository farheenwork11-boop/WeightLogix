// src/components/layout/DashboardLayout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Link, Outlet } from "react-router-dom";

// ✅ If you have Vite alias "@" configured, keep these.
// Otherwise change to:
// import api, { extractErr } from "../../services/api";
// import { useAuth } from "../../context/AuthContext";
import api, { extractErr } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const BRANCH_KEY = "current_branch_id";

const DashboardLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // backend roles: Manager, Operator
  const role = user?.role || "Operator";
  const uiRole = role; // UI label
  const canPickBranch = role === "Manager";
  const forcedBranchId = user?.branch_id ?? null;

  // user display
  const fullName = useMemo(() => {
    const n = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
    return n || user?.username || "User";
  }, [user]);

  const initials = useMemo(() => {
    const s = (fullName || "").trim();
    const parts = s.split(" ").filter(Boolean);
    const a = (parts[0]?.[0] || "").toUpperCase();
    const b = (parts[1]?.[0] || "").toUpperCase();
    return (a + b) || a || "U";
  }, [fullName]);

  // branches list
  const [branches, setBranches] = useState([]);
  const [err, setErr] = useState("");

  // selected branch id (Manager only, Operator uses assigned branch)
  const [branchId, setBranchId] = useState(() => {
    const raw = localStorage.getItem(BRANCH_KEY);
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  });

  // Ensure localStorage branch_id sync
  useEffect(() => {
    if (role === "Operator") {
      // operator: forced to their assigned branch
      if (forcedBranchId) {
        localStorage.setItem(BRANCH_KEY, String(forcedBranchId));
        setBranchId(forcedBranchId);
      } else {
        localStorage.removeItem(BRANCH_KEY);
        setBranchId(null);
      }
    } else {
      // manager: keep selected
      if (branchId) localStorage.setItem(BRANCH_KEY, String(branchId));
      else localStorage.removeItem(BRANCH_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, forcedBranchId]);

  // ✅ load branches for ALL roles (backend filters itself)
  const loadBranches = async () => {
    setErr("");
    try {
      const res = await api.get("/branches/");
      const list = res?.data?.results || res?.data || [];
      setBranches(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(extractErr(e));
    }
  };

  useEffect(() => {
    loadBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, forcedBranchId]);

  // Keep manager flow smooth: if no branch is selected, auto-pick first active branch.
  useEffect(() => {
    if (!canPickBranch) return;
    if (branchId) return;
    if (!Array.isArray(branches) || branches.length === 0) return;

    const firstBranchId = Number(branches[0]?.id);
    if (!Number.isFinite(firstBranchId) || firstBranchId <= 0) return;

    setBranchId(firstBranchId);
    localStorage.setItem(BRANCH_KEY, String(firstBranchId));
    window.dispatchEvent(new Event("branch-changed"));
  }, [canPickBranch, branchId, branches]);

  const currentBranchName = useMemo(() => {
    if (role === "Operator") {
      const found = branches.find((b) => Number(b.id) === Number(forcedBranchId));
      return found?.name || (forcedBranchId ? `Branch #${forcedBranchId}` : "No Branch");
    }
    if (!branchId) return "All Branches";
    const b = branches.find((x) => Number(x.id) === Number(branchId));
    return b?.name || `Branch #${branchId}`;
  }, [role, branchId, branches, forcedBranchId]);

  // Links (based on backend roles)
  const allLinks = useMemo(
    () => [
      { name: "Dashboard", path: "/dashboard", icon: "dashboard", roles: ["Manager", "Operator"] },
      { name: "Create Slip", path: "/create-slip", icon: "add_circle", roles: ["Manager", "Operator"] },
      { name: "Slips History", path: "/slips", icon: "receipt_long", roles: ["Manager", "Operator"] },

      { name: "Customers", path: "/customers", icon: "group", roles: ["Manager", "Operator"] },
      { name: "Vehicles", path: "/vehicles", icon: "local_shipping", roles: ["Manager", "Operator"] },
      { name: "Materials", path: "/materials", icon: "category", roles: ["Manager", "Operator"] },
      { name: "Reports", path: "/reports", icon: "pie_chart", roles: ["Manager", "Operator"] },

      { name: "Branches", path: "/branches", icon: "store", roles: ["Manager", "Operator"] },
      { name: "Company Profile", path: "/company-profile", icon: "business", roles: ["Manager"] },
      { name: "Devices", path: "/devices", icon: "scale", roles: ["Manager", "Operator"] },
      { name: "Users & Roles", path: "/users", icon: "manage_accounts", roles: ["Manager", "Operator"] },
    ],
    []
  );

  const secondaryLinks = useMemo(
    () => [
      { name: "Settings", path: "/settings", icon: "settings", roles: ["Manager", "Operator"] },
      { name: "Help & Support", path: "/help", icon: "help", roles: ["Manager", "Operator"] },
    ],
    []
  );

  const sidebarLinks = useMemo(() => allLinks.filter((l) => l.roles.includes(role)), [allLinks, role]);
  const footerLinks = useMemo(() => secondaryLinks.filter((l) => l.roles.includes(role)), [secondaryLinks, role]);

  const getPageTitle = () => {
    const currentPath = location.pathname;
    const link = [...allLinks, ...secondaryLinks].find((l) => l.path === currentPath);
    return link ? link.name : "Dashboard";
  };

  // ✅ Manager: on branch change => store + fire event to reload pages
  const onBranchChange = (e) => {
    const v = e.target.value;

    if (v === "__all__") {
      setBranchId(null);
      localStorage.removeItem(BRANCH_KEY);
      window.dispatchEvent(new Event("branch-changed"));
      return;
    }

    const n = Number(v);
    if (Number.isFinite(n) && n > 0) {
      setBranchId(n);
      localStorage.setItem(BRANCH_KEY, String(n));
      window.dispatchEvent(new Event("branch-changed"));
    }
  };

  return (
    <div className="flex h-screen bg-bg-light font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-dark/50 z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full w-64 bg-primary text-white transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } flex flex-col shadow-2xl border-r border-[#060E1A]`}
      >
        {/* Logo Header */}
        <div className="h-20 flex items-center px-6 mb-2">
          <Link to="/" className="flex items-center gap-3 group w-full">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white font-bold text-base shadow-lg ring-2 ring-white/20 group-hover:bg-white/25 group-hover:scale-105 group-hover:ring-white/30 transition-all duration-300">
              SM
            </div>
            <div className="flex-1">
              <span className="text-lg font-bold tracking-tight block leading-none text-white drop-shadow-sm">
                WEIGHTLOGIX
              </span>
              <span className="text-[9px] text-white/50 uppercase tracking-[0.2em] font-bold block mt-1.5">
                Management System
              </span>
            </div>
          </Link>
        </div>

        {/* Menu Section */}
        <div className="flex-1 overflow-y-auto py-5 px-3 custom-scrollbar flex flex-col gap-6">
          <div>
            <div className="mb-3 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] px-3 flex items-center gap-2">
              <span className="w-4 h-px bg-white/20" />
              <span>Main Menu</span>
            </div>

            <nav className="space-y-1.5">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group relative overflow-hidden ${
                    location.pathname === link.path
                      ? "bg-white text-primary shadow-xl shadow-black/10 scale-[1.02]"
                      : "text-white/75 hover:bg-white/15 hover:text-white hover:translate-x-1"
                  }`}
                >
                  {location.pathname === link.path && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-white/90 -z-10" />
                  )}
                  <span
                    className={`material-icons-outlined text-[21px] transition-all duration-300 ${
                      location.pathname === link.path
                        ? "text-primary"
                        : "text-white/70 group-hover:text-white group-hover:scale-110"
                    }`}
                  >
                    {link.icon}
                  </span>
                  <span className="whitespace-nowrap flex-1">{link.name}</span>
                  {location.pathname === link.path && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <div className="mb-3 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] px-3 flex items-center gap-2">
              <span className="w-4 h-px bg-white/20" />
              <span>System</span>
            </div>

            <nav className="space-y-1.5">
              {footerLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group relative overflow-hidden ${
                    location.pathname === link.path
                      ? "bg-white text-primary shadow-xl shadow-black/10 scale-[1.02]"
                      : "text-white/75 hover:bg-white/15 hover:text-white hover:translate-x-1"
                  }`}
                >
                  {location.pathname === link.path && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-white/90 -z-10" />
                  )}
                  <span
                    className={`material-icons-outlined text-[21px] transition-all duration-300 ${
                      location.pathname === link.path
                        ? "text-primary"
                        : "text-white/70 group-hover:text-white group-hover:scale-110"
                    }`}
                  >
                    {link.icon}
                  </span>
                  <span className="whitespace-nowrap flex-1">{link.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* error display */}
          {err && (
            <div className="mx-3 text-[11px] text-white/70 bg-white/10 border border-white/10 rounded-xl p-3">
              {err}
            </div>
          )}

          <button
            onClick={logout}
            className="mx-3 mt-auto flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold text-white/85 hover:bg-white/15 transition-all"
          >
            <span className="material-icons-outlined text-[20px]">logout</span>
            Logout
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-3">
          <Link
            to="/profile"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/15 transition-all duration-300 group border border-transparent hover:border-white/25 hover:shadow-lg"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-sm flex items-center justify-center font-bold text-sm shadow-lg ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300 text-white">
              {initials}
            </div>
            <div className="overflow-hidden flex-1">
              <h4 className="text-sm font-bold text-white transition-colors truncate">{fullName}</h4>
              <p className="text-[10px] text-white/50 group-hover:text-white/70 truncate uppercase tracking-wider font-bold transition-colors">
                {uiRole}
              </p>
            </div>
            <span className="material-icons-outlined text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 text-lg">
              chevron_right
            </span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-4 lg:px-8 shadow-sm z-30 sticky top-0 backdrop-blur-sm bg-white/95">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2.5 text-slate-500 hover:bg-primary/5 hover:text-primary rounded-xl transition-all"
            >
              <span className="material-icons-outlined">menu</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent hidden sm:block">{getPageTitle()}</h1>
              <p className="text-xs text-slate-500 hidden sm:block font-medium mt-0.5">
                Welcome back, operations are running smoothly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Branch Selector - Premium */}
            <div className="hidden md:flex items-center gap-2.5 bg-gradient-to-r from-slate-50 to-white px-4 py-2.5 rounded-xl border border-slate-200 hover:border-primary/40 transition-all cursor-pointer group relative hover:shadow-lg hover:shadow-primary/5">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <span className="material-icons-outlined text-primary text-base group-hover:scale-110 transition-transform">
                  store
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500 font-bold uppercase leading-none tracking-wider">Branch</span>

                <select
                  value={role === "Manager" ? (branchId ? String(branchId) : "__all__") : String(forcedBranchId || "")}
                  onChange={onBranchChange}
                  disabled={!canPickBranch}
                  className="bg-transparent text-sm font-bold text-dark focus:outline-none cursor-pointer appearance-none pr-5 -ml-1 mt-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%230B3362'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right center',
                    backgroundSize: '1.1rem'
                  }}
                >
                  {canPickBranch ? (
                    <>
                      <option value="__all__">All Branches</option>
                      {branches.map((b) => (
                        <option key={b.id} value={String(b.id)}>
                          {b.name || `Branch #${b.id}`}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value={String(forcedBranchId || "")}>{currentBranchName}</option>
                  )}
                </select>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            <button className="p-2.5 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
              <span className="material-icons-outlined text-[22px]">search</span>
            </button>

            <Link
              to="/notifications"
              className="relative p-2.5 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all group"
            >
              <span className="material-icons-outlined text-[22px] group-hover:scale-110 transition-transform">notifications</span>
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
            </Link>

            <Link
              to="/create-slip"
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all transform hover:-translate-y-0.5"
            >
              <span className="material-icons-outlined text-lg">add_circle</span>
              <span>New Slip</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth bg-bg-light">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
