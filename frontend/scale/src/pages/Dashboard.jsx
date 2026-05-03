// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { extractErr } from "@/services/api";
import { useAuth } from "@/context/AuthContext";


const fmtInt = (n) => {
  const x = Number(n || 0);
  return Number.isFinite(x) ? x.toLocaleString() : "0";
};

const fmtKg = (kg) => `${fmtInt(kg)} kg`;

const trendBadgeClass = (txt = "") => {
  const t = String(txt);
  const isGood = t.includes("+") || t === "Online" || t === "OK";
  return isGood
    ? "bg-success/10 text-success border border-success/20"
    : "bg-warning/10 text-warning border border-warning/20";
};

const statusPill = (status) => {
  const s = String(status || "");
  if (s === "Completed") return "bg-success/10 text-success border border-success/20";
  if (s === "In Process" || s === "Pending") return "bg-primary/10 text-primary border border-primary/20";
  return "bg-error/10 text-error border border-error/20";
};

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role || "Operator";

  // backend restricts dashboard to Admin/Manager
  const allowed = role === "Admin" || role === "Manager";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState({ days: 7, series: [] });
  const [recent, setRecent] = useState({ results: [] });
  const [scales, setScales] = useState({ results: [] });

  const [days, setDays] = useState(7);

  const loadAll = async (daysArg = days) => {
    if (!allowed) return;

    setErr("");
    setLoading(true);

    try {
      const [a, b, c, d] = await Promise.all([
        api.get("/dashboard/summary/"),
        api.get(`/dashboard/weekly-activity/?days=${daysArg}`),
        api.get("/dashboard/recent-slips/?limit=5"),
        api.get("/dashboard/scales/"),
      ]);

      setSummary(a.data || null);
      setWeekly(b.data || { days: daysArg, series: [] });
      setRecent(c.data || { results: [] });
      setScales(d.data || { results: [] });
    } catch (e) {
      setErr(extractErr(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll(days);

    const onBranchChanged = () => loadAll(days);
    window.addEventListener("branch-changed", onBranchChanged);
    return () => window.removeEventListener("branch-changed", onBranchChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, allowed]);

  const weeklyBars = useMemo(() => {
    const series = weekly?.series || [];
    const max = Math.max(1, ...series.map((x) => Number(x.count || 0)));
    return series.map((x) => ({
      ...x,
      // make bars not too tiny
      heightPct: Math.max(6, Math.round((Number(x.count || 0) / max) * 100)),
    }));
  }, [weekly]);

  const quickStats = useMemo(() => {
    if (!summary) return [];

    const totalWeighInsToday = fmtInt(summary.weigh_ins_today);
    const activeScales = `${fmtInt(summary.active_scales)}/${fmtInt(summary.total_scales)}`;
    const pendingSlips = fmtInt(summary.pending_slips);

    // total weight 24h in kg (backend returns kg int)
    const totalWeight24h = `${fmtInt(summary.total_weight_24h_kg)} kg`;

    const weighinsTrend = `${summary.weighins_trend_pct >= 0 ? "+" : ""}${summary.weighins_trend_pct}%`;
    const weightTrend = `${summary.weight_trend_pct >= 0 ? "+" : ""}${summary.weight_trend_pct}%`;

    return [
      {
        title: "Total Weigh-ins Today",
        value: totalWeighInsToday,
        icon: "scale",
        trend: weighinsTrend,
        color: "text-primary",
        bg: "bg-primary/10",
      },
      {
        title: "Active Scales",
        value: activeScales,
        icon: "speed",
        trend: summary.scales_status || "Offline",
        color: "text-success",
        bg: "bg-success/10",
      },
      {
        title: "Pending Slips",
        value: pendingSlips,
        icon: "pending_actions",
        trend: summary.pending_label || "OK",
        color: "text-warning",
        bg: "bg-warning/10",
      },
      {
        title: "Total Weight (24h)",
        value: totalWeight24h,
        icon: "fitness_center",
        trend: weightTrend,
        color: "text-purple-600",
        bg: "bg-purple-50",
      },
    ];
  }, [summary]);

  if (!allowed) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-dark">Dashboard</h3>
        <p className="text-sm text-slate-500 mt-1">
          Dashboard access is available for Admin/Manager only.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-dark">Quick Actions</h3>
          <span className="text-xs text-slate-500 font-medium">Frequently used operations</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/create-slip"
            className="flex flex-col justify-between rounded-xl p-5 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                <span className="material-icons-outlined text-xl">add_circle</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-bold text-dark tracking-tight">New Slip</h3>
              <p className="text-xs font-medium text-slate-500 mt-1">Create weigh slip</p>
            </div>
          </Link>

          <Link
            to="/customers"
            className="flex flex-col justify-between rounded-xl p-5 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-lg bg-success/10 text-success group-hover:scale-105 transition-transform">
                <span className="material-icons-outlined text-xl">person_add</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-bold text-dark tracking-tight">Add Customer</h3>
              <p className="text-xs font-medium text-slate-500 mt-1">Register client</p>
            </div>
          </Link>

          <Link
            to="/vehicles"
            className="flex flex-col justify-between rounded-xl p-5 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-lg bg-warning/10 text-warning group-hover:scale-105 transition-transform">
                <span className="material-icons-outlined text-xl">local_shipping</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-bold text-dark tracking-tight">Add Vehicle</h3>
              <p className="text-xs font-medium text-slate-500 mt-1">Register vehicle</p>
            </div>
          </Link>

          <Link
            to="/reports"
            className="flex flex-col justify-between rounded-xl p-5 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
                <span className="material-icons-outlined text-xl">assessment</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-bold text-dark tracking-tight">View Reports</h3>
              <p className="text-xs font-medium text-slate-500 mt-1">Analytics & data</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Errors */}
      {err && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-sm text-error">
          {err}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(loading ? [1, 2, 3, 4] : quickStats).map((stat, index) => {
          if (loading) {
            return (
              <div
                key={index}
                className="rounded-xl p-5 bg-white border border-slate-200 shadow-sm animate-pulse"
              >
                <div className="h-8 w-8 rounded-lg bg-slate-100" />
                <div className="mt-4 h-6 w-24 bg-slate-100 rounded" />
                <div className="mt-2 h-3 w-40 bg-slate-100 rounded" />
              </div>
            );
          }

          return (
            <div
              key={index}
              className="flex flex-col justify-between rounded-xl p-5 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color} group-hover:scale-105 transition-transform`}>
                  <span className="material-icons-outlined text-xl">{stat.icon}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${trendBadgeClass(stat.trend)}`}>
                  {stat.trend}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-dark tracking-tight">{stat.value}</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Weekly Activity */}
          <div className="rounded-xl p-6 bg-white border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h3 className="text-lg font-bold text-dark">Weekly Activity</h3>
                <p className="text-xs text-slate-500">Weigh-ins over the last {days} days</p>
              </div>

              <select
                value={String(days)}
                onChange={(e) => setDays(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer text-slate-700"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="365">This Year</option>
              </select>
            </div>

            <div className="w-full h-[220px] flex items-end justify-between gap-2 px-2 pb-2">
              {(weeklyBars.length ? weeklyBars : Array.from({ length: days }, (_, i) => ({ label: `Day ${i + 1}`, count: 0, heightPct: 6 }))).map(
                (x, i) => (
                  <div key={i} className="relative group flex-1 flex flex-col justify-end items-center gap-2 h-full">
                    <div
                      className="w-full bg-primary/10 rounded-t-lg transition-all duration-500 group-hover:bg-primary"
                      style={{ height: `${x.heightPct}%` }}
                    />
                    <span className="text-xs text-slate-400 font-medium">{x.label || `Day ${i + 1}`}</span>
                    <div className="absolute -top-8 bg-dark text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {fmtInt(x.count)} Slips
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* AI Insights (still placeholder – no endpoint in your code) */}
          <div className="rounded-xl bg-white border-2 border-primary shadow-sm p-5">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2.5 bg-primary/10 text-primary rounded-lg shrink-0">
                  <span className="material-icons-outlined text-lg">auto_awesome</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm text-primary">AI Insights</h3>
                    <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">
                      Beta
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    (Optional) AI insights endpoint abhi implement nahi hai — jab aap ready ho, main is panel ko API se connect kar dunga.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <button className="flex-1 md:flex-none px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-xs font-semibold transition-colors border border-transparent hover:border-slate-300">
                  Dismiss
                </button>
                <button className="flex-1 md:flex-none px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover text-xs font-semibold transition-all shadow-sm hover:shadow-md hover:shadow-primary/30">
                  Schedule Fix
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Live Scale Monitor */}
          <div className="rounded-xl p-5 bg-white border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-dark mb-4">Live Scale Monitor</h3>

            <div className="flex flex-col gap-2.5">
              {(scales?.results?.length ? scales.results : []).map((s) => {
                const st = String(s.status || "Offline");
                const isOk = st === "Online" || st === "Active";
                return (
                  <div
                    key={s.id}
                    className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg bg-white shadow-sm ${isOk ? "text-success" : "text-error"}`}>
                        <span className="material-icons-outlined text-base">{isOk ? "rss_feed" : "error_outline"}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-dark">{s.name || `Scale #${s.id}`}</p>
                        <p className="text-xs text-slate-500">{st}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-dark">
                      {s.weight_kg == null ? "--" : fmtKg(s.weight_kg)}
                    </span>
                  </div>
                );
              })}

              {!loading && (!scales?.results || scales.results.length === 0) && (
                <div className="text-xs text-slate-500">No scales found for this branch.</div>
              )}
            </div>
          </div>

          {/* Premium Upgrade (UI only) */}
          <div className="rounded-xl p-5 border border-warning/30 bg-warning/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-warning/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
            <h3 className="font-bold text-dark mb-2 relative z-10 text-sm">Premium Features</h3>
            <p className="text-xs text-slate-600 mb-3 relative z-10">
              Unlock unlimited weighing and advanced analytics.
            </p>
            <button className="w-full py-2 bg-warning text-white font-bold rounded-lg text-xs hover:bg-warning/90 transition-colors relative z-10">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-dark">Recent Activity</h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest weight slip transactions</p>
          </div>
          <Link to="/slips" className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1">
            View All History
            <span className="material-icons-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3">Slip ID</th>
                <th className="px-6 py-3">Vehicle</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Weight</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {(recent?.results || []).map((row) => {
                const slipId = row.display_id || `#SL-${row.serial_no || row.id}`;
                const vehicle = row.vehicle_reg || "--";
                const customer = row.customer_name || row.party_name || "--";
                const weight = row.net_weight == null ? "--" : fmtKg(row.net_weight);

                // simple "time" string
                const timeVal = row.created_at ? new Date(row.created_at).toLocaleString() : "";

                // map backend status -> UI labels
                const statusLabel =
                  row.status === "Completed" ? "Completed" :
                  row.status === "Pending" ? "In Process" :
                  row.status || "Unknown";

                return (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-3 font-bold text-dark">{slipId}</td>
                    <td className="px-6 py-3 font-medium text-slate-700">{vehicle}</td>
                    <td className="px-6 py-3 text-slate-600">{customer}</td>
                    <td className="px-6 py-3 font-medium text-dark">{weight}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full border ${statusPill(statusLabel)}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500">{timeVal}</td>
                    <td className="px-6 py-3 text-right">
                      <button className="text-slate-400 hover:text-primary transition-colors p-1">
                        <span className="material-icons-outlined text-lg">more_vert</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {!loading && (!recent?.results || recent.results.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-6 text-sm text-slate-500">
                    No recent slips found for this branch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
