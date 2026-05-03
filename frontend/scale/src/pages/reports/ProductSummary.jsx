import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api, { extractErr } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const PERIODS = [
  { key: "last30", label: "Last 30 Days" },
  { key: "this_month", label: "This Month" },
  { key: "last_month", label: "Last Month" },
  { key: "this_year", label: "This Year" },
  { key: "last7", label: "Last 7 Days" },
];

const fmtNum = (n) => {
  const x = Number(n || 0);
  return Number.isFinite(x) ? x.toLocaleString() : "0";
};

const fmtKg = (kg) => `${fmtNum(kg)} kg`;

const fmtDT = (dt) => {
  if (!dt) return "";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return String(dt);
  }
};

const VehicleReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role || "Operator";
  const allowed = role === "Admin" || role === "Manager";

  const [period, setPeriod] = useState("last30");
  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);

  const load = async () => {
    if (!allowed) return;
    setErr("");
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("period", period);
      if (q.trim()) qs.set("q", q.trim());

      const res = await api.get(`/reports/vehicles/?${qs.toString()}`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(extractErr(e));
      setRows([]);
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
  }, [period]);

  if (!allowed) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-dark">Vehicle Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Reports are available for Admin/Manager only.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-auto min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Vehicle Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Vehicle efficiency and haulage analytics.</p>
        </div>

        <div className="flex gap-2">
          <span className="relative">
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search no. plate..."
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:ring-1 focus:ring-primary h-full"
            />
          </span>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-bold text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            {PERIODS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>

          <button
            onClick={load}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover flex items-center gap-2 shadow-sm shadow-primary/30 transition-all"
          >
            <span className="material-icons-outlined text-lg">filter_alt</span>
            Apply
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
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-red-600">{err}</div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left min-w-max">
          <thead className="text-xs text-gray-500 dark:text-slate-400 uppercase font-semibold bg-gray-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-4">Vehicle No.</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 text-center">Trips</th>
              <th className="px-6 py-4 text-right">Avg Weight</th>
              <th className="px-6 py-4 text-right">Total Haulage</th>
              <th className="px-6 py-4">Last Visit</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
            {loading && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-sm text-slate-500">
                  Loading...
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((row, i) => (
                <tr key={row.vehicle_id ?? i} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-dark dark:text-white">{row.reg || "—"}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{row.vehicle_type || ""}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-bold">
                      {fmtNum(row.trips)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600 dark:text-slate-400">{fmtKg(row.avg_weight)}</td>
                  <td className="px-6 py-4 text-right font-bold text-dark dark:text-slate-200">{fmtKg(row.total_weight)}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{fmtDT(row.last_visit)}</td>
                </tr>
              ))}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-sm text-slate-500">
                  No data found for selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehicleReport;
