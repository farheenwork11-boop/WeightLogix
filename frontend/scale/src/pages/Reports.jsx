import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api, { extractErr } from "@/services/api";
import { useAuth } from "@/context/AuthContext";


const PERIODS = [
  { key: "last7", label: "Last 7 Days" },
  { key: "last30", label: "Last 30 Days" },
  { key: "this_month", label: "This Month" },
  { key: "last_month", label: "Last Month" },
  { key: "this_year", label: "This Year" },
];

const fmtNum = (n) => {
  const x = Number(n || 0);
  return Number.isFinite(x) ? x.toLocaleString() : "0";
};

const fmtMoneyPKR = (n) => `PKR ${fmtNum(n)}`;
const fmtWeight = (kg) => `${fmtNum(kg)} kg`;
const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

const Reports = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role || "Operator";
  const allowed = role === "Admin" || role === "Manager";

  const [period, setPeriod] = useState("last30");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [dash, setDash] = useState(null);

  const load = async () => {
    if (!allowed) return;
    setErr("");
    setLoading(true);
    try {
      const res = await api.get(`/reports/dashboard/?period=${period}`);
      setDash(res.data || null);
    } catch (e) {
      setErr(extractErr(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const onBranchChanged = () => load();
    window.addEventListener("branch-changed", onBranchChanged);
    return () => window.removeEventListener("branch-changed", onBranchChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, allowed]);

  const cards = useMemo(() => {
    const totalWeight = dash?.total_weight ?? 0;
    const totalSlips = dash?.total_slips ?? 0;
    const revenue = dash?.revenue_est ?? 0;

    // trends (simple): compare last point vs first point in 7-day series
    const series = dash?.weight_trend_last_7_days || [];
    const first = series[0]?.total_weight ?? 0;
    const last = series[series.length - 1]?.total_weight ?? 0;
    const pct = first ? (((last - first) / first) * 100).toFixed(1) : "0.0";
    const weightTrend = `${Number(pct) >= 0 ? "+" : ""}${pct}%`;

    return [
      {
        title: "Total Weight",
        value: fmtWeight(totalWeight),
        change: weightTrend,
        color: "bg-primary/10 text-primary border-primary/20",
      },
      {
        title: "Total Slips",
        value: fmtNum(totalSlips),
        change: "+0%",
        color: "bg-success/10 text-success border-success/20",
      },
      {
        title: "Revenue (Est)",
        value: fmtMoneyPKR(revenue),
        change: "+0%",
        color: "bg-warning/10 text-warning border-warning/20",
      },
    ];
  }, [dash]);

  // build bars from API series (7 points)
  const bars = useMemo(() => {
    const series = dash?.weight_trend_last_7_days || [];
    const max = Math.max(1, ...series.map((x) => Number(x.total_weight || 0)));
    return series.map((x) => ({
      label: String(x.date || "").slice(5), // MM-DD
      value: Number(x.total_weight || 0),
      heightPct: Math.max(6, Math.round((Number(x.total_weight || 0) / max) * 100)),
    }));
  }, [dash]);

  const topCustomers = dash?.top_customers || [];

  const exportDailyPDF = async () => {
    try {
      setErr("");
      const res = await api.get("/reports/export/daily.pdf", { responseType: "blob" });
      downloadBlob(res.data, "daily-summary.pdf");
    } catch (e) {
      setErr(extractErr(e));
    }
  };

  if (!allowed) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-dark">Reports & Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Reports are available for Admin/Manager only.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-auto min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Reports & Analytics</h1>
          <p className="text-sm text-slate-500">Generate insights and export data.</p>
        </div>

        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-dark hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            {PERIODS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>

          <button
            onClick={exportDailyPDF}
            className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover flex items-center gap-2 shadow-md shadow-primary/30 transition-all"
          >
            <span className="material-icons-outlined text-lg">download</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {[
          { name: "Daily Summary", path: "/reports/daily" },
          { name: "Customer Report", path: "/reports/customers" },
          { name: "Vehicle Report", path: "/reports/vehicles" },
          { name: "Product Summary", path: "/reports/products" },
          { name: "Financial Report", path: "/reports/financial" },
        ].map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              location.pathname === item.path
                ? "bg-primary text-white shadow-md shadow-primary/30"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary hover:border-primary/50"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {err && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-red-600">
          {err}
        </div>
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {(loading ? [1, 2, 3] : cards).map((stat, i) => {
          if (loading) {
            return (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
                <div className="h-4 w-28 bg-slate-100 rounded mb-3" />
                <div className="h-7 w-36 bg-slate-100 rounded" />
              </div>
            );
          }
          return (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold text-dark">{stat.value}</h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${stat.color}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-x-auto">
        {/* Weight Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[300px] flex flex-col">
          <h3 className="text-lg font-bold text-dark mb-6">Weight Trend (Last 7 Days)</h3>

          <div className="flex-1 flex items-end justify-between gap-2 px-4 border-b border-slate-200 pb-2">
            {(bars.length ? bars : Array.from({ length: 7 }, () => ({ heightPct: 6, value: 0, label: "" }))).map(
              (b, i) => (
                <div key={i} className="flex flex-col items-center gap-2 group w-full">
                  <div
                    className="w-full bg-primary/20 rounded-t-lg relative transition-all duration-500 group-hover:bg-primary"
                    style={{ height: `${b.heightPct}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-sm">
                      {fmtNum(b.value)} kg
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{b.label || `Day ${i + 1}`}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-dark mb-4">Top Customers</h3>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left min-w-max">
              <thead className="text-xs text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-right">Slips</th>
                  <th className="py-3 px-4 text-right">Total Weight</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {(topCustomers.length ? topCustomers : []).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-dark">{row.name || "Walk-in"}</td>
                    <td className="py-3 px-4 text-right text-slate-600">{fmtNum(row.slips)}</td>
                    <td className="py-3 px-4 text-right font-bold text-dark">{fmtWeight(row.total_weight)}</td>
                  </tr>
                ))}

                {!loading && topCustomers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 px-4 text-sm text-slate-500">
                      No data found for selected period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Reports;
